"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { defaultMeasurements, getDefaultTarget } from "@/lib/activity-definitions";

interface SmartGoalSuggestion {
  goalType: string;
  targetValue: number;
  measurementUnit: string;
  description: string;
}

interface SmartGoalSuggestionsProps {
  onSelectGoal: (suggestion: {
    goalType: string;
    targetValue: number;
    measurementUnit: string;
  }) => void;
}

export function SmartGoalSuggestions({ onSelectGoal }: SmartGoalSuggestionsProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  // Create a list of smart suggestions
  const suggestions: SmartGoalSuggestion[] = [
    {
      goalType: 'walking',
      targetValue: 10000,
      measurementUnit: 'step',
      description: 'Walk 10,000 steps daily for better cardiovascular health'
    },
    {
      goalType: 'water',
      targetValue: 8,
      measurementUnit: 'glass',
      description: 'Drink 8 glasses of water daily for proper hydration'
    },
    {
      goalType: 'sleep',
      targetValue: 8,
      measurementUnit: 'hour',
      description: 'Sleep 8 hours daily for better recovery and cognitive function'
    },
    {
      goalType: 'meditation',
      targetValue: 10,
      measurementUnit: 'minute',
      description: 'Meditate for 10 minutes daily to reduce stress and improve focus'
    },
    {
      goalType: 'running',
      targetValue: 5,
      measurementUnit: 'km',
      description: 'Run 5km three times a week to improve cardio fitness'
    }
  ];
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-2">Try one of these popular goals:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant={selectedIndex === index ? "default" : "outline"}
            className="justify-start h-auto py-3 px-4"
            onClick={() => {
              setSelectedIndex(index);
              onSelectGoal({
                goalType: suggestion.goalType,
                targetValue: suggestion.targetValue,
                measurementUnit: suggestion.measurementUnit
              });
            }}
          >
            <div className="text-left">
              <div className="font-medium">{suggestion.goalType.charAt(0).toUpperCase() + suggestion.goalType.slice(1)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {suggestion.description}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
} 