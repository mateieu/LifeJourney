"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ApiErrorBoundary({
  children,
  fallback = (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="text-red-500">Unable to load data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>We encountered an error while fetching your data. Please try again.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </CardContent>
    </Card>
  )
}) {
  const [hasError, setHasError] = useState(false);
  
  // Use in components with try/catch
  const handleApiError = (error: any) => {
    console.error("API Error:", error);
    setHasError(true);
  };
  
  if (hasError) {
    return fallback;
  }
  
  return children;
} 