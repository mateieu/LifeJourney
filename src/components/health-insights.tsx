"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";

export function HealthInsights() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Insights</CardTitle>
        <CardDescription>Personalized health recommendations</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-10">
        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-center text-muted-foreground">
          Health insights are being developed.
          <br />
          Soon you'll receive personalized recommendations based on your data!
        </p>
      </CardContent>
    </Card>
  );
} 