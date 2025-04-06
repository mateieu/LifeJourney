"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

export function GoalProgress() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Goal Progress</CardTitle>
        <CardDescription>Track your progress towards health goals</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-10">
        <Target className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-center text-muted-foreground">
          Goal progress tracking is being developed.
          <br />
          Soon you'll be able to see detailed progress towards your health targets!
        </p>
      </CardContent>
    </Card>
  );
} 