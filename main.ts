#!/usr/bin/env node

/**
 * Heartbeat Monitoring System
 * 
 * A service is expected to send a heartbeat every fixed interval.
 * If it misses three heartbeats in a row, the system triggers an alert.
 */

import * as fs from 'fs';
import * as path from 'path';

// Types
interface HeartbeatEvent {
  service: string;
  timestamp: string;
}

interface Alert {
  service: string;
  alert_at: string;
}

interface MonitorConfig {
  expected_interval_seconds: number;
  allowed_misses: number;
}

class HeartbeatMonitor {
  private config: MonitorConfig;

  constructor(config: MonitorConfig) {
    this.config = config;
  }

  /**
   * Validates and parses a heartbeat event
   * Gracefully handles malformed events without crashing
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
  private analyzeService(events: HeartbeatEvent[]): Alert[] {
    if (events.length === 0) return [];

    const service = events[0].service;
    const alerts: Alert[] = [];
    let consecutiveMisses = 0;

    // Start from the first heartbeat
    let currentTime = new Date(events[0].timestamp);
    let eventIndex = 0;

    while (eventIndex < events.length) {
      const expectedTime = new Date(currentTime.getTime() + this.config.expected_interval_seconds * 1000);
      const nextEvent = eventIndex + 1 < events.length ? events[eventIndex + 1] : null;

      if (nextEvent && new Date(nextEvent.timestamp) <= expectedTime) {
        // Heartbeat received on time or early
        consecutiveMisses = 0;
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
          break; // Stop checking once alert is triggered
        }
        
        currentTime = expectedTime;
      }
    }

    return alerts;
  }

  /**
   * Main processing function
   * 1. Sorts the events per service, chronologically
   * 2. Tracks expected heartbeat times based on the given interval
   * 3. Triggers an alert if a service misses allowed_misses expected heartbeats in a row
   */
  processHeartbeats(rawEvents: any[]): Alert[] {
    const validEvents: HeartbeatEvent[] = [];
    let malformedCount = 0;

    // Validate and filter events - gracefully skip malformed ones
    rawEvents.forEach(event => {
      const validEvent = this.validateEvent(event);
      if (validEvent) {
        validEvents.push(validEvent);
      } else {
        malformedCount++;
      }
    });

    if (malformedCount > 0) {
      console.warn(`Skipped ${malformedCount} malformed events`);
    }

    // Group and sort events by service
    const serviceEvents = this.groupAndSortEvents(validEvents);

    // Analyze each service and collect alerts
    const allAlerts: Alert[] = [];
    serviceEvents.forEach((events, service) => {
      const alerts = this.analyzeService(events);
      allAlerts.push(...alerts);
    });

    return allAlerts;
  }
}

/**
 * Main function to run the heartbeat monitor
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Usage: node main.js <heartbeats.json> <expected_interval_seconds> <allowed_misses>');
    process.exit(1);
  }

  const [filePath, intervalStr, missesStr] = args;
  const expected_interval_seconds = parseInt(intervalStr);
  const allowed_misses = parseInt(missesStr);

  if (isNaN(expected_interval_seconds) || isNaN(allowed_misses)) {
    console.error('Expected interval and allowed misses must be numbers');
    process.exit(1);
  }

  try {
    // Read and parse heartbeat events from file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const events = JSON.parse(fileContent);

    if (!Array.isArray(events)) {
      console.error('JSON file must contain an array of heartbeat events');
      process.exit(1);
    }

    // Process heartbeats
    const monitor = new HeartbeatMonitor({ expected_interval_seconds, allowed_misses });
    const alerts = monitor.processHeartbeats(events);

    // Output results
    console.log(JSON.stringify(alerts, null, 2));

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('An unknown error occurred');
    }
    process.exit(1);
  }
}

// Export for testing
export { HeartbeatMonitor, HeartbeatEvent, Alert, MonitorConfig };

// Run main function if this file is executed directly
if (require.main === module) {
  main();
}