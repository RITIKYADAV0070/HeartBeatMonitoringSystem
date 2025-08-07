import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/types/heartbeat';
import { AlertTriangle, Clock } from 'lucide-react';

interface AlertsPanelProps {
  alerts: Alert[];
}

export const AlertsPanel = ({ alerts }: AlertsPanelProps) => {
  if (alerts.length === 0) {
    return (
      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Active Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No alerts detected</p>
            <p className="text-sm">All services are healthy</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-destructive/30 shadow-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          Active Alerts
          <Badge variant="destructive" className="ml-auto">
            {alerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20"
            >
              <div>
                <div className="font-medium text-foreground">{alert.service}</div>
                <div className="text-sm text-muted-foreground">
                  Service has missed too many heartbeats
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-destructive">
                  Alert triggered
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(alert.alert_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};