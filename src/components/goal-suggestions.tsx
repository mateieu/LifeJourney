"use client";

import { Lightbulb, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GoalSuggestion {
  type: string;
  value: number;
  unit: string;
  description: string;
  icon?: React.ReactNode;
}

interface GoalSuggestionsProps {
  onSelectGoal: (suggestion: GoalSuggestion) => void;
}

export function GoalSuggestions({ onSelectGoal }: GoalSuggestionsProps) {
  // Default suggestions for first-time users
  const suggestions: GoalSuggestion[] = [
    {
      type: "walking",
      value: 10000,
      unit: "steps",
      description: "The popular daily step goal recommended by health experts",
    },
    {
      type: "water",
      value: 8,
      unit: "glasses",
      description: "Stay hydrated with 8 glasses of water per day",
    },
    {
      type: "sleep",
      value: 8,
      unit: "hours",
      description: "Get enough rest with 8 hours of sleep each night",
    },
    {
      type: "meditation",
      value: 10,
      unit: "minutes",
      description: "Reduce stress with just 10 minutes of daily meditation",
    },
    {
      type: "running",
      value: 5,
      unit: "km",
      description: "Build endurance with a 5K running goal",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <h3 className="font-medium">Popular Goal Suggestions</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {suggestions.map((suggestion, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col h-full">
                <h4 className="font-medium capitalize">{suggestion.type}</h4>
                <p className="text-sm text-muted-foreground mt-1 mb-3 flex-grow">
                  {suggestion.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline">
                    <span className="text-lg font-bold">{suggestion.value}</span>
                    <span className="ml-1 text-sm text-muted-foreground">{suggestion.unit}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onSelectGoal(suggestion)}
                  >
                    <Target className="h-3.5 w-3.5 mr-1" />
                    Use
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 