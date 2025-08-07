import { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileJson } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (data: any[]) => void;
}

export const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Handle both single objects and arrays
        const events = Array.isArray(data) ? data : [data];
        onFileUpload(events);
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        alert('Error parsing JSON file. Please check the format.');
      }
    };
    reader.readAsText(file);
  }, [onFileUpload]);

  return (
    <Card className="border-border/50 shadow-card">
      <CardContent className="p-6">
        <div className="text-center">
          <FileJson className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload Heartbeat Data</h3>
          <p className="text-muted-foreground mb-4">
            Upload a JSON file containing heartbeat events
          </p>
          
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Choose JSON File
            </Button>
          </div>
          
          <div className="mt-4 text-xs text-muted-foreground text-left">
            <p className="font-medium mb-1">Expected format:</p>
            <code className="block bg-muted/50 p-2 rounded text-xs">
              {`[
  { "service": "email", "timestamp": "2025-08-04T10:00:00Z" },
  { "service": "api", "timestamp": "2025-08-04T10:01:00Z" }
]`}
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};