"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, AlertCircle, Settings2 } from "lucide-react";

export default function AdminPage() {
  const [updating, setUpdating] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    stats?: any;
  } | null>(null);

  const handleUpdateSchema = async () => {
    setUpdating(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/update-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Error updating schema: ' + (error instanceof Error ? error.message : String(error))
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Database Schema Management</CardTitle>
            <CardDescription>
              Update database schema to support measurement units and user preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This will add necessary columns to the database tables for measurement units
                and create the user_preferences table if it doesn't exist.
              </p>

              {result && (
                <Alert variant={result.success ? "default" : "destructive"}>
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                  </div>
                  <AlertDescription>
                    {result.message}
                    {result.stats && (
                      <div className="mt-2 text-xs">
                        <div>Activities updated: {result.stats.activitiesUpdated}</div>
                        <div>Goals updated: {result.stats.goalsUpdated}</div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleUpdateSchema}
                disabled={updating}
                className="w-full"
              >
                {updating ? (
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 animate-spin" />
                    Updating Schema...
                  </div>
                ) : (
                  "Update Database Schema"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 