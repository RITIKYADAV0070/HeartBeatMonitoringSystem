# Heartbeat Monitoring System
https://heart-beat-monitoring-system.vercel.app/

A simple heartbeat monitoring system that tracks service heartbeats and triggers alerts when services miss consecutive heartbeat intervals.

## Overview

This system monitors services that are expected to send heartbeats at fixed intervals. If a service misses a configurable number of consecutive heartbeats (default: 3), the system triggers an alert.

## Features

- **Chronological Processing**: Automatically sorts heartbeat events per service chronologically
- **Configurable Intervals**: Set custom expected heartbeat intervals
- **Configurable Alert Thresholds**: Set how many consecutive misses trigger an alert
- **Malformed Event Handling**: Gracefully skips malformed events without crashing
- **Multiple Service Support**: Monitors multiple services simultaneously

## Requirements

- Node.js (version 14 or higher)
- npm or yarn

## Setup Instructions

1. **Clone or download the project files**
   ```bash
   # If you have the files, navigate to the project directory
   cd heartbeat-monitor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install TypeScript globally (if not already installed)**
   ```bash
   npm install -g typescript ts-node
   ```

## Running the Main Solution

### Command Line Usage

```bash
npx ts-node main.ts <heartbeats.json> <expected_interval_seconds> <allowed_misses>
```

### Parameters

- `<heartbeats.json>`: Path to JSON file containing heartbeat events
- `<expected_interval_seconds>`: Expected interval between heartbeats (in seconds)
- `<allowed_misses>`: Number of consecutive misses before triggering an alert

### Example

```bash
npx ts-node main.ts sample_heartbeats.json 60 3
```

This command will:
- Read heartbeat events from `sample_heartbeats.json`
- Expect heartbeats every 60 seconds
- Trigger alerts after 3 consecutive misses

### Input Format

The JSON file should contain an array of heartbeat events:

```json
[
  { "service": "email", "timestamp": "2025-08-04T10:00:00Z" },
  { "service": "email", "timestamp": "2025-08-04T10:01:00Z" },
  { "service": "api", "timestamp": "2025-08-04T10:00:00Z" }
]
```

### Output Format

The system outputs alerts in JSON format:

```json
[
  { "service": "email", "alert_at": "2025-08-04T10:06:00Z" }
]
```

## Running Test Cases

### Install Test Dependencies

```bash
npm install --save-dev jest @types/jest ts-jest
```

### Run All Tests

```bash
npm test
```

### Run Specific Test Categories

```bash
# Run only alert tests
npm test -- --testNamePattern="Working Alert"

# Run only malformed event tests
npm test -- --testNamePattern="Malformed Events"
```

### Test Coverage

The test suite includes all required test cases:

1. **Working Alert Case**: Service misses 3 consecutive heartbeats → triggers alert
2. **Near-Miss Case**: Service misses only 2 consecutive heartbeats → no alert
3. **Unordered Input**: Heartbeat events arrive out of chronological order → handled correctly
4. **Malformed Events**: Missing fields, invalid timestamps → gracefully skipped

## Implementation Details

### Core Algorithm

1. **Validation**: Filter out malformed events (missing fields, invalid timestamps)
2. **Grouping**: Group events by service name
3. **Sorting**: Sort each service's events chronologically
4. **Analysis**: For each service:
   - Track expected heartbeat times based on interval
   - Count consecutive misses
   - Trigger alert when consecutive misses reach threshold

### Error Handling

- **Malformed Events**: Logged and skipped, processing continues
- **Invalid Files**: Clear error messages with exit codes
- **Missing Parameters**: Usage instructions displayed

### Edge Cases Handled

- Empty input arrays
- Single heartbeat events
- Services with no heartbeats
- Out-of-order timestamps
- Various malformed event formats

## Project Structure

```
heartbeat-monitor/
├── main.ts              # Main implementation
├── main.test.ts         # Test suite
├── README.md           # This file
├── package.json        # Dependencies and scripts
└── sample_heartbeats.json  # Example input file
```

## Example Usage

### Create a sample heartbeat file

```bash
echo '[
  { "service": "email", "timestamp": "2025-08-04T10:00:00Z" },
  { "service": "email", "timestamp": "2025-08-04T10:01:00Z" },
  { "service": "email", "timestamp": "2025-08-04T10:02:00Z" }
]' > sample_heartbeats.json
```

### Run the monitor

```bash
npx ts-node main.ts sample_heartbeats.json 60 3
```

### Expected output

```json
[
  { "service": "email", "alert_at": "2025-08-04T10:06:00Z" }
]
```

This indicates that the email service missed heartbeats at 10:03, 10:04, and 10:05, triggering an alert at 10:06.

## Development

### Code Style

- TypeScript with strict typing
- Clear variable and function names
- Comprehensive error handling
- Extensive documentation

### Testing Philosophy

- Unit tests for all core functionality
- Edge case coverage
- Clear test descriptions
- Isolated test cases

## Troubleshooting

### Common Issues

1. **"ts-node not found"**
   ```bash
   npm install -g ts-node typescript
   ```

2. **"Cannot find module"**
   ```bash
   npm install
   ```

3. **Test failures**
   ```bash
   # Ensure jest is installed
   npm install --save-dev jest @types/jest ts-jest
   
   # Initialize jest config if needed
   npx ts-jest config:init
   ```

### Support

For issues or questions, please check:
1. Node.js version (should be 14+)
2. All dependencies are installed
3. Input file format matches expected structure
4. Parameter types are correct (numbers for intervals and misses)
