import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ServiceStatus } from '@/types/heartbeat';
import { Heart, AlertTriangle, XCircle } from 'lucide-react';

interface ServiceCardProps {
  status: ServiceStatus;
}

export const ServiceCard = ({ status }: ServiceCardProps) => {
  const getStatusIcon = () => {
    switch (status.status) {
      case 'healthy':
        return <Heart className="w-5 h-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Heart className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'healthy':
        return 'bg-success/20 text-success border-success/30';
      case 'warning':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'critical':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  return (
    <Card className="border-border/50 shadow-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <h3 className="font-semibold text-lg">{status.service}</h3>
          </div>
          <Badge variant="outline" className={getStatusColor()}>
            {status.status}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          {status.lastHeartbeat && (
            <div>
              <span className="text-foreground">Last heartbeat:</span>{' '}
              {new Date(status.lastHeartbeat).toLocaleString()}
            </div>
          )}
          
          <div>
            <span className="text-foreground">Consecutive misses:</span>{' '}
            <span className={status.consecutiveMisses > 0 ? 'text-warning' : 'text-success'}>
              {status.consecutiveMisses}
            </span>
          </div>
          
          {status.nextExpected && (
            <div>
              <span className="text-foreground">Next expected:</span>{' '}
              {new Date(status.nextExpected).toLocaleString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};