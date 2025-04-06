import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { runMeasurementUnitsMigration } from '@/utils/db-migration-helper';

export function RunMeasurementMigration() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    success: boolean;
    error?: string;
  }>(null);
  
  const handleRunMigration = async () => {
    setLoading(true);
    
    try {
      const migrationResult = await runMeasurementUnitsMigration();
      setResult(migrationResult);
    } catch (error) {
      setResult({
        success: false,
        error: error.message || 'Unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Measurement Units Migration</h2>
      <p className="text-sm text-muted-foreground">
        This will update the database schema to support measurement units. 
        Only run this if you are an administrator and understand the implications.
      </p>
      
      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          <AlertTitle>
            {result.success ? "Migration Successful" : "Migration Failed"}
          </AlertTitle>
          <AlertDescription>
            {result.success 
              ? "The database schema has been updated to support measurement units."
              : `Error: ${result.error || "Unknown error"}`}
          </AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={handleRunMigration} 
        disabled={loading}
        variant="outline"
      >
        {loading ? "Running Migration..." : "Run Migration"}
      </Button>
    </div>
  );
} 