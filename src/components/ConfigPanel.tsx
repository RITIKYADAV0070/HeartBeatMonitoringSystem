import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MonitorConfig } from '@/types/heartbeat';

interface ConfigPanelProps {
  config: MonitorConfig;
  onConfigChange: (config: MonitorConfig) => void;
}

export const ConfigPanel = ({ config, onConfigChange }: ConfigPanelProps) => {
  return (
    <Card className="border-border/50 shadow-card">
      <CardHeader>
        <CardTitle className="text-lg">Monitor Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="interval">Expected Interval (seconds)</Label>
          <Input
            id="interval"
            type="number"
            value={config.expected_interval_seconds}
            onChange={(e) => onConfigChange({
              ...config,
              expected_interval_seconds: parseInt(e.target.value) || 60
            })}
            min="1"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            How often heartbeats are expected
          </p>
        </div>
        
        <div>
          <Label htmlFor="misses">Allowed Misses</Label>
          <Input
            id="misses"
            type="number"
            value={config.allowed_misses}
            onChange={(e) => onConfigChange({
              ...config,
              allowed_misses: parseInt(e.target.value) || 3
            })}
            min="1"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Consecutive misses before alert
          </p>
        </div>
      </CardContent>
    </Card>
  );
};