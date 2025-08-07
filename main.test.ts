/**
 * Test Cases for Heartbeat Monitoring System
 * 
 * Required test cases:
 * - A working alert case
 * - A "near-miss" case (only 2 missed → no alert)
 * - Unordered input (checks whether solution can handle heartbeat events that don't arrive in chronological order)
 * - At least 1 malformed event (missing fields or invalid timestamp)
 */

import { HeartbeatMonitor, HeartbeatEvent, Alert } from './main';

describe('HeartbeatMonitor', () => {
  const defaultConfig = {
    expected_interval_seconds: 60,
    allowed_misses: 3
  };

  let monitor: HeartbeatMonitor;

  beforeEach(() => {
    monitor = new HeartbeatMonitor(defaultConfig);
  });

  describe('Working Alert Case', () => {
    test('should trigger alert when service misses 3 consecutive heartbeats', () => {
      const events = [
        { service: "email", timestamp: "2025-08-04T10:00:00Z" },
        { service: "email", timestamp: "2025-08-04T10:01:00Z" },
        { service: "email", timestamp: "2025-08-04T10:02:00Z" },
        // Missing: 10:03, 10:04, 10:05 - should trigger alert at 10:06
      ];

      const alerts = monitor.processHeartbeats(events);
      
      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toEqual({
        service: "email",
        alert_at: "2025-08-04T10:06:00Z"
      });
    });

    test('should trigger multiple alerts for different services', () => {
      const events = [
        { service: "email", timestamp: "2025-08-04T10:00:00Z" },
        { service: "api", timestamp: "2025-08-04T10:00:00Z" },
        { service: "email", timestamp: "2025-08-04T10:01:00Z" },
        { service: "api", timestamp: "2025-08-04T10:01:00Z" },
        // Both services miss subsequent heartbeats
      ];

      const alerts = monitor.processHeartbeats(events);
      
      expect(alerts).toHaveLength(2);
      expect(alerts.some(alert => alert.service === "email")).toBe(true);
      expect(alerts.some(alert => alert.service === "api")).toBe(true);
    });
  });

  describe('Near-Miss Case', () => {
    test('should NOT trigger alert when service misses only 2 consecutive heartbeats', () => {
      const events = [
        { service: "api", timestamp: "2025-08-04T10:00:00Z" },
        { service: "api", timestamp: "2025-08-04T10:01:00Z" },
        // Missing: 10:02, 10:03 (only 2 misses)
        { service: "api", timestamp: "2025-08-04T10:04:00Z" },
      ];

      const alerts = monitor.processHeartbeats(events);
      
      expect(alerts).toHaveLength(0);
    });

    test('should reset consecutive miss count when heartbeat is received', () => {
      const events = [
        { service: "db", timestamp: "2025-08-04T10:00:00Z" },
        // Miss 2 heartbeats: 10:01, 10:02
        { service: "db", timestamp: "2025-08-04T10:03:00Z" }, // Reset count
        // Miss 2 more: 10:04, 10:05
        { service: "db", timestamp: "2025-08-04T10:06:00Z" }, // Reset again
      ];

      const alerts = monitor.processHeartbeats(events);
      
      expect(alerts).toHaveLength(0);
    });
  });

  describe('Unordered Input', () => {
    test('should handle heartbeat events that arrive out of chronological order', () => {
      const events = [
        { service: "db", timestamp: "2025-08-04T10:02:00Z" },  // Out of order
        { service: "db", timestamp: "2025-08-04T10:00:00Z" },  // Should be first
        { service: "db", timestamp: "2025-08-04T10:04:00Z" },  // Out of order
        { service: "db", timestamp: "2025-08-04T10:01:00Z" },  // Should be second
        { service: "db", timestamp: "2025-08-04T10:03:00Z" },  // Should be third
      ];

      const alerts = monitor.processHeartbeats(events);
      
      // All heartbeats are present when sorted, so no alerts
      expect(alerts).toHaveLength(0);
    });

    test('should properly detect misses even with unordered input', () => {
      const events = [
        { service: "cache", timestamp: "2025-08-04T10:05:00Z" }, // Way out of order
        { service: "cache", timestamp: "2025-08-04T10:00:00Z" },
        { service: "cache", timestamp: "2025-08-04T10:01:00Z" },
        // Missing heartbeats when sorted: 10:02, 10:03, 10:04
        // Next expected would be 10:02, then 10:03, then 10:04, triggering alert at 10:05
        // But we have 10:05, so let's make it miss more
      ];

      // Actually, let's create a clearer test case
      const clearer_events = [
        { service: "cache", timestamp: "2025-08-04T10:02:00Z" }, // Out of order
        { service: "cache", timestamp: "2025-08-04T10:00:00Z" },
        { service: "cache", timestamp: "2025-08-04T10:01:00Z" },
        // When sorted: 10:00, 10:01, 10:02
        // Missing: 10:03, 10:04, 10:05 - should alert at 10:06
      ];

      const alerts = monitor.processHeartbeats(clearer_events);
      
      expect(alerts).toHaveLength(1);
      expect(alerts[0].alert_at).toBe("2025-08-04T10:06:00Z");
    });
  });

  describe('Malformed Events', () => {
    test('should gracefully skip malformed events without crashing', () => {
      const events = [
        { service: "cache", timestamp: "2025-08-04T10:00:00Z" }, // Valid
        { service: "cache" }, // Missing timestamp
        { timestamp: "2025-08-04T10:01:00Z" }, // Missing service
        { service: "cache", timestamp: "invalid-date" }, // Invalid timestamp
        null, // Null event
        "invalid", // Non-object event
        {}, // Empty object
        { service: "cache", timestamp: "2025-08-04T10:01:00Z" }, // Valid
      ];

      // Should not crash and should process valid events
      expect(() => {
        const alerts = monitor.processHeartbeats(events);
        expect(Array.isArray(alerts)).toBe(true);
      }).not.toThrow();
    });

    test('should process valid events even when mixed with malformed ones', () => {
      const events = [
        { service: "test", timestamp: "2025-08-04T10:00:00Z" }, // Valid
        { service: "test" }, // Malformed - missing timestamp
        { service: "test", timestamp: "2025-08-04T10:01:00Z" }, // Valid
        { timestamp: "2025-08-04T10:02:00Z" }, // Malformed - missing service
        { service: "test", timestamp: "invalid" }, // Malformed - invalid date
        // Missing subsequent heartbeats should trigger alert
      ];

      const alerts = monitor.processHeartbeats(events);
      
      // Should have processed the 2 valid events and detected missing heartbeats
      expect(alerts).toHaveLength(1);
      expect(alerts[0].service).toBe("test");
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty input', () => {
      const alerts = monitor.processHeartbeats([]);
      expect(alerts).toHaveLength(0);
    });

    test('should handle single heartbeat', () => {
      const events = [
        { service: "single", timestamp: "2025-08-04T10:00:00Z" }
      ];
      
      const alerts = monitor.processHeartbeats(events);
      expect(alerts).toHaveLength(1); // Should alert for missing subsequent heartbeats
    });

    test('should handle different interval configurations', () => {
      const customMonitor = new HeartbeatMonitor({
        expected_interval_seconds: 30, // 30 second intervals
        allowed_misses: 2 // Only allow 2 misses
      });

      const events = [
        { service: "custom", timestamp: "2025-08-04T10:00:00Z" },
        { service: "custom", timestamp: "2025-08-04T10:00:30Z" },
        // Missing: 10:01:00, 10:01:30 - should trigger alert at 10:02:00
      ];

      const alerts = customMonitor.processHeartbeats(events);
      
      expect(alerts).toHaveLength(1);
      expect(alerts[0].alert_at).toBe("2025-08-04T10:02:00Z");
    });
  });
});