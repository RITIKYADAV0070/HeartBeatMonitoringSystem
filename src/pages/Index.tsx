import { useState } from 'react';
import { HeartbeatMonitor } from '@/lib/heartbeatMonitor';
import { MonitorConfig, ProcessedResult } from '@/types/heartbeat';
import { FileUpload } from '@/components/FileUpload';
import { ConfigPanel } from '@/components/ConfigPanel';
import { ServiceCard } from '@/components/ServiceCard';
import { AlertsPanel } from '@/components/AlertsPanel';
import { TestCases } from '@/components/TestCases';
import { StatsPanel } from '@/components/StatsPanel';
import { Activity, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [config, setConfig] = useState<MonitorConfig>({
    expected_interval_seconds: 60,
    allowed_misses: 3
  });
  
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [currentTest, setCurrentTest] = useState<string>();
  const { toast } = useToast();

  const handleFileUpload = (data: any[]) => {
    processData(data);
    setCurrentTest(undefined);
    toast({
      title: "File uploaded",
      description: `Processing ${data.length} events...`,
    });
  };

  const handleTestRun = (data: any[], testName: string) => {
    processData(data);
    setCurrentTest(testName);
    toast({
      title: "Test case running",
      description: testName,
    });
  };

  const processData = (data: any[]) => {
    const monitor = new HeartbeatMonitor(config);
    const processedResult = monitor.processHeartbeats(data);
    setResult(processedResult);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
                <Activity className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Heartbeat Monitor
                </h1>
                <p className="text-muted-foreground">
                  Real-time service health monitoring system
                </p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="w-4 h-4 text-primary animate-pulse" />
              Monitoring active
            </div>
          </div>

          <StatsPanel result={result} testName={currentTest} />
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            <FileUpload onFileUpload={handleFileUpload} />
            <ConfigPanel config={config} onConfigChange={setConfig} />
            <TestCases onRunTest={handleTestRun} />
          </div>

          {/* Middle Column - Services */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Service Status
              </h2>
              {result?.serviceStatuses && result.serviceStatuses.length > 0 ? (
                <div className="space-y-4">
                  {result.serviceStatuses.map((status, index) => (
                    <ServiceCard key={index} status={status} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No services monitored yet</p>
                  <p className="text-sm">Upload heartbeat data or run a test case</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Alerts */}
          <div>
            <AlertsPanel alerts={result?.alerts || []} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;