export interface HeartbeatEvent {
  service: string;
  timestamp: string;
}

export interface Alert {
  service: string;
  alert_at: string;
}

export interface ServiceStatus {
  service: string;
  status: 'healthy' | 'warning' | 'critical';
  lastHeartbeat?: string;
  consecutiveMisses: number;
  nextExpected?: string;
}

export interface MonitorConfig {
  expected_interval_seconds: number;
  allowed_misses: number;
}

export interface ProcessedResult {
  alerts: Alert[];
  serviceStatuses: ServiceStatus[];
  malformedEvents: number;
  totalEvents: number;
}