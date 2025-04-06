"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "./ActivityCard"; 
import { PlusCircle } from "lucide-react";

interface ActivitySectionProps {
  activities: any[];
  onLogActivity: () => void;
}

export function ActivitySection({ activities, onLogActivity }: ActivitySectionProps) {
  const [groupedActivities, setGroupedActivities] = useState<Record<string, any[]>>({});
  
  // Group activities by date
  useEffect(() => {
    const grouped = activities.reduce((acc, activity) => {
      const date = format(new Date(activity.completed_at), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(activity);
      return acc;
    }, {} as Record<string, any[]>);
    
    setGroupedActivities(grouped);
  }, [activities]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recent Activities</h2>
        <Button onClick={onLogActivity} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Log Activity
        </Button>
      </div>
      
      {Object.keys(groupedActivities).length > 0 ? (
        Object.entries(groupedActivities)
          .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
          .map(([date, dateActivities], groupIndex) => (
            <div key={date} className="space-y-3">
              <h3 className="font-medium">
                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {dateActivities.map((activity, index) => (
                  <ActivityCard 
                    key={activity.id} 
                    activity={activity} 
                    delay={(groupIndex * 5 + index) * 50} 
                  />
                ))}
              </div>
            </div>
          ))
      ) : (
        <Card>
          <CardContent className="py-10 flex flex-col items-center text-center">
            <p className="text-muted-foreground mb-4">No activities logged yet</p>
            <Button onClick={onLogActivity}>Log Your First Activity</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 