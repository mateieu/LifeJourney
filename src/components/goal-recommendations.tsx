"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, ChevronRight } from "lucide-react";
import { getDefaultUnit, formatMeasurement, getUnitById, convertMeasurement } from "@/lib/measurements";
import { Tables } from "@/types/supabase";
import { 
  defaultMeasurements, 
  getDefaultTarget, 
  getUnitLabel 
} from "@/lib/activity-definitions";
import { useMeasurementPreferences } from '@/hooks/use-measurement-preferences';

// Adjust the type to match HealthActivity from the progress page
interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  value: number;
  measurement_unit?: string;
  completed_at: string;
  notes?: string | null;
}

interface GoalRecommendation {
  type: string;
  value: number;
  unit: string;
  reason: string;
}

interface GoalRecommendationsProps {
  activities: Activity[];
  onAddGoal: (recommendation: GoalRecommendation) => void;
}

export function GoalRecommendations({ activities, onAddGoal }: GoalRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<GoalRecommendation[]>([]);
  const { getPreferredUnit } = useMeasurementPreferences();

  useEffect(() => {
    if (activities.length === 0) return;

    const newRecommendations: GoalRecommendation[] = [];
    
    // Find most frequent activity
    const activityCounts: Record<string, number> = {};
    activities.forEach(activity => {
      const type = activity.activity_type;
      activityCounts[type] = (activityCounts[type] || 0) + 1;
    });
    
    const mostFrequentActivity = Object.entries(activityCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([type]) => type)[0];
    
    if (mostFrequentActivity) {
      // Find average value for this activity
      const relevantActivities = activities.filter(a => a.activity_type === mostFrequentActivity);
      let totalValue = 0;
      let activityUnitFromData = "";
      
      relevantActivities.forEach(activity => {
        totalValue += activity.value || 0;
        if (!activityUnitFromData && activity.measurement_unit) {
          activityUnitFromData = activity.measurement_unit;
        }
      });
      
      const averageValue = totalValue / relevantActivities.length;
      // Get a reasonable default target based on the activity type and average value
      const targetValue = Math.round(averageValue * 1.2); // 20% more than the average
      
      const preferredUnit = getPreferredUnit(mostFrequentActivity);
      
      newRecommendations.push({
        type: mostFrequentActivity,
        value: targetValue,
        unit: preferredUnit || getDefaultUnit(mostFrequentActivity),
        reason: 'Based on your most frequent activity'
      });
    }
    
    // Find recent activity with no goal
    const recentActivityTypes = new Set(activities.slice(0, 5).map(a => a.activity_type));
    recentActivityTypes.forEach(type => {
      if (type !== mostFrequentActivity) {
        // Use a reasonable default value for each activity type
        const targetValue = getDefaultTargetValue(type);
        newRecommendations.push({
          type,
          value: targetValue,
          unit: getDefaultUnit(type),
          reason: 'Based on your recent activity'
        });
      }
    });
    
    setRecommendations(newRecommendations.slice(0, 3)); // Limit to top 3 recommendations
  }, [activities, getPreferredUnit]);

  if (recommendations.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Goals</CardTitle>
        <CardDescription>
          Smart goal suggestions based on your activity patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium capitalize">{recommendation.type.replace('_', ' ')}</div>
                  <div className="text-sm text-muted-foreground">
                    {`Target: ${recommendation.value} ${recommendation.unit}`}
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onAddGoal(recommendation)}
                className="gap-1"
              >
                Add <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get reasonable default targets for different activity types
function getDefaultTargetValue(activityType: string): number {
  switch(activityType) {
    case 'walking': return 10000; // steps
    case 'running': return 5; // km
    case 'cycling': return 20; // km
    case 'swimming': return 1000; // meters
    case 'yoga': return 30; // minutes
    case 'meditation': return 20; // minutes
    case 'strength': return 45; // minutes
    case 'water': return 8; // glasses
    case 'sleep': return 8; // hours
    default: return 10;
  }
} 