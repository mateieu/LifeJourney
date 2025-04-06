"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";

export function StreakChallenges() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Streak Challenges</CardTitle>
        <CardDescription>Keep your healthy habits going strong</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-10">
        <Flame className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-center text-muted-foreground">
          Streak challenges are being developed.
          <br />
          Soon you'll be able to track your daily streaks and earn rewards!
        </p>
      </CardContent>
    </Card>
  );
} 