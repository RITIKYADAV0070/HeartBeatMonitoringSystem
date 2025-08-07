import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateTestData } from '@/lib/heartbeatMonitor';
import { Play, CheckCircle, AlertTriangle, Shuffle, AlertCircle } from 'lucide-react';

interface TestCasesProps {
  onRunTest: (data: any[], testName: string) => void;
}

export const TestCases = ({ onRunTest }: TestCasesProps) => {
  const testData = generateTestData();

  const testCases = [
    {
      name: 'Working Alert Case',
      description: 'Service misses 3 heartbeats and triggers alert',
      data: testData.workingAlert,
      icon: <AlertCircle className="w-4 h-4" />,
      variant: 'destructive' as const,
      expected: 'Should trigger alert at 10:06:00Z'
    },
    {
      name: 'Near-Miss Case',
      description: 'Service misses only 2 heartbeats (no alert)',
      data: testData.nearMiss,
      icon: <AlertTriangle className="w-4 h-4" />,
      variant: 'secondary' as const,
      expected: 'Should show warning but no alert'
    },
    {
      name: 'Unordered Input',
      description: 'Heartbeats arrive out of chronological order',
      data: testData.unordered,
      icon: <Shuffle className="w-4 h-4" />,
      variant: 'outline' as const,
      expected: 'Should handle reordering correctly'
    },
    {
      name: 'Malformed Events',
      description: 'Contains invalid and missing data',
      data: testData.malformed,
      icon: <CheckCircle className="w-4 h-4" />,
      variant: 'secondary' as const,
      expected: 'Should skip malformed events gracefully'
    }
  ];

  return (
    <Card className="border-border/50 shadow-card">
      <CardHeader>
        <CardTitle className="text-lg">Built-in Test Cases</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {testCases.map((testCase, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {testCase.icon}
                  <h4 className="font-medium">{testCase.name}</h4>
                  <Badge variant={testCase.variant} className="text-xs">
                    {testCase.data.length} events
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {testCase.description}
                </p>
                <p className="text-xs text-muted-foreground/80">
                  Expected: {testCase.expected}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRunTest(testCase.data, testCase.name)}
                className="ml-4"
              >
                <Play className="w-3 h-3 mr-1" />
                Run Test
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 rounded-lg bg-muted/20 border border-border/30">
          <h4 className="font-medium mb-2 text-sm">Test Configuration</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• Expected interval: 60 seconds</div>
            <div>• Allowed misses: 3 consecutive</div>
            <div>• Base timestamp: 2025-08-04T10:00:00Z</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};