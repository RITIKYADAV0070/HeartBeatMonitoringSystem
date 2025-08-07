import { Card, CardContent } from '@/components/ui/card';
import { ProcessedResult } from '@/types/heartbeat';
import { BarChart3, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface StatsPanelProps {
  result: ProcessedResult | null;
  testName?: string;
}

export const StatsPanel = ({ result, testName }: StatsPanelProps) => {
  if (!result) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/50 shadow-card">
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-muted/50 rounded-full mx-auto mb-2 animate-pulse" />
              <div className="h-6 bg-muted/50 rounded mb-1 animate-pulse" />
              <div className="h-4 bg-muted/30 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const healthyServices = result.serviceStatuses.filter(s => s.status === 'healthy').length;
  const warningServices = result.serviceStatuses.filter(s => s.status === 'warning').length;
  const criticalServices = result.serviceStatuses.filter(s => s.status === 'critical').length;

  const stats = [
    {
      label: 'Total Events',
      value: result.totalEvents,
      icon: <BarChart3 className="w-5 h-5 text-primary" />,
      color: 'text-primary'
    },
    {
      label: 'Active Alerts',
      value: result.alerts.length,
      icon: <AlertTriangle className="w-5 h-5 text-destructive" />,
      color: 'text-destructive'
    },
    {
      label: 'Healthy Services',
      value: healthyServices,
      icon: <CheckCircle className="w-5 h-5 text-success" />,
      color: 'text-success'
    },
    {
      label: 'Malformed Events',
      value: result.malformedEvents,
      icon: <XCircle className="w-5 h-5 text-warning" />,
      color: 'text-warning'
    }
  ];

  return (
    <div className="space-y-4">
      {testName && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Running test: {testName}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border/50 shadow-card">
            <CardContent className="p-4 text-center">
              <div className="mb-2">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};