"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function ErrorBoundary({ 
  children,
  fallback = (
    <div className="flex flex-col items-center justify-center p-6 text-center rounded-md border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
      <p className="text-red-600 dark:text-red-400 mb-4">Something went wrong</p>
      <Button 
        variant="outline" 
        onClick={() => window.location.reload()}
      >
        Try again
      </Button>
    </div>
  )
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error("Caught error:", event.error);
      setHasError(true);
      event.preventDefault();
    };

    window.addEventListener("error", errorHandler);
    
    return () => {
      window.removeEventListener("error", errorHandler);
    };
  }, []);

  if (hasError) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
} 