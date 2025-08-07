import { HeartbeatEvent, Alert, ServiceStatus, MonitorConfig, ProcessedResult } from '@/types/heartbeat';

export class HeartbeatMonitor {
  private config: MonitorConfig;

  constructor(config: MonitorConfig) {
    this.config = config;
  }

  /**
   * Validates and parses a heartbeat event
   */
  private validateEvent(event: any): HeartbeatEvent | null {
    try {
      if (!event || typeof event !== 'object') return null;
      if (!event.service || typeof event.service !== 'string') return null;
      if (!event.timestamp || typeof event.timestamp !== 'string') return null;
      
      // Validate timestamp format
      const date = new Date(event.timestamp);
      if (isNaN(date.getTime())) return null;
      
      return {
        service: event.service,
        timestamp: event.timestamp
      };
    } catch {
      return null;
    }
  }

  /**
   * Groups events by service and sorts them chronologically
   */
  private groupAndSortEvents(events: HeartbeatEvent[]): Map<string, HeartbeatEvent[]> {
    const serviceEvents = new Map<string, HeartbeatEvent[]>();
    
    events.forEach(event => {
      if (!serviceEvents.has(event.service)) {
        serviceEvents.set(event.service, []);
      }
      serviceEvents.get(event.service)!.push(event);
    });

    // Sort each service's events chronologically
    serviceEvents.forEach(events => {
      events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    });

    return serviceEvents;
  }

  /**
   * Analyzes a service's heartbeats and detects missed intervals
   */
  private analyzeService(events: HeartbeatEvent[]): { alerts: Alert[], status: ServiceStatus } {
    if (events.length === 0) {
      return {
        alerts: [],
        status: {
          service: '',
          status: 'critical',
          consecutiveMisses: 0
        }
      };
    }

    const service = events[0].service;
    const alerts: Alert[] = [];
    let consecutiveMisses = 0;
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Start from the first heartbeat
    let currentTime = new Date(events[0].timestamp);
    let eventIndex = 0;
    let lastHeartbeat = events[0].timestamp;

    while (eventIndex < events.length) {
      const expectedTime = new Date(currentTime.getTime() + this.config.expected_interval_seconds * 1000);
      const nextEvent = eventIndex + 1 < events.length ? events[eventIndex + 1] : null;

      if (nextEvent && new Date(nextEvent.timestamp) <= expectedTime) {
        // Heartbeat received on time or early
        consecutiveMisses = 0;
        lastHeartbeat = nextEvent.timestamp;
        currentTime = new Date(nextEvent.timestamp);
        eventIndex++;
      } else {
        // Missed heartbeat
        consecutiveMisses++;
        
        if (consecutiveMisses >= this.config.allowed_misses) {
          alerts.push({
            service,
            alert_at: expectedTime.toISOString()
          });
          status = 'critical';
          break;
        } else if (consecutiveMisses >= 2) {
          status = 'warning';
        }
        
        currentTime = expectedTime;
      }
    }

    return {
      alerts,
      status: {
        service,
        status,
        lastHeartbeat,
        consecutiveMisses,
        nextExpected: new Date(currentTime.getTime() + this.config.expected_interval_seconds * 1000).toISOString()
      }
    };
  }

  /**
   * Main processing function
   */
  processHeartbeats(rawEvents: any[]): ProcessedResult {
    const validEvents: HeartbeatEvent[] = [];
    let malformedEvents = 0;

    // Validate and filter events
    rawEvents.forEach(event => {
      const validEvent = this.validateEvent(event);
      if (validEvent) {
        validEvents.push(validEvent);
      } else {
        malformedEvents++;
      }
    });

    // Group and sort events by service
    const serviceEvents = this.groupAndSortEvents(validEvents);

    // Analyze each service
    const allAlerts: Alert[] = [];
    const serviceStatuses: ServiceStatus[] = [];

    serviceEvents.forEach((events, service) => {
      const { alerts, status } = this.analyzeService(events);
      allAlerts.push(...alerts);
      serviceStatuses.push(status);
    });

    return {
      alerts: allAlerts,
      serviceStatuses,
      malformedEvents,
      totalEvents: rawEvents.length
    };
  }
}

// Test data generators
export const generateTestData = () => {
  const baseTime = new Date('2025-08-04T10:00:00Z');
  
  return {
    workingAlert: [
      { service: "email", timestamp: "2025-08-04T10:00:00Z" },
      { service: "email", timestamp: "2025-08-04T10:01:00Z" },
      { service: "email", timestamp: "2025-08-04T10:02:00Z" },
      // Missing: 10:03, 10:04, 10:05 - should trigger alert at 10:06
    ],
    
    nearMiss: [
      { service: "api", timestamp: "2025-08-04T10:00:00Z" },
      { service: "api", timestamp: "2025-08-04T10:01:00Z" },
      // Missing: 10:02, 10:03 (only 2 misses)
      { service: "api", timestamp: "2025-08-04T10:04:00Z" },
    ],
    
    unordered: [
      { service: "db", timestamp: "2025-08-04T10:02:00Z" },
      { service: "db", timestamp: "2025-08-04T10:00:00Z" }, // Out of order
      { service: "db", timestamp: "2025-08-04T10:01:00Z" },
      { service: "db", timestamp: "2025-08-04T10:03:00Z" },
    ],
    
    malformed: [
      { service: "cache", timestamp: "2025-08-04T10:00:00Z" },
      { service: "cache" }, // Missing timestamp
      { timestamp: "2025-08-04T10:01:00Z" }, // Missing service
      { service: "cache", timestamp: "invalid-date" }, // Invalid timestamp
      { service: "cache", timestamp: "2025-08-04T10:02:00Z" },
    ]
  };
};