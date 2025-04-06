"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";

export function DashboardSummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard Summary</CardTitle>
        <CardDescription>Your health at a glance</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-10">
        <BarChart className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-center text-muted-foreground">
          Dashboard summary is being developed.
          <br />
          Soon you'll see a comprehensive overview of your health metrics!
        </p>
      </CardContent>
    </Card>
  );
} 