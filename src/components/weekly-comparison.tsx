import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tables } from '@/types/supabase';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { Activity } from "@/lib/streak-utils"; // Import the Activity type

type Activity = Tables<"health_activities"> & {
  notes?: string | null;
  created_at?: string;
  updated_at?: string | null;
  completed_at: string;
};

interface WeeklyComparisonProps {
  activities: any[]; // Use any to avoid type issues
}

export function WeeklyComparison({ activities }: WeeklyComparisonProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  
  // Get activity types from data
  const activityTypes = ['all', ...Array.from(new Set(activities.map(a => a.activity_type)))];
  
  // Get activities for current and previous week
  const today = new Date();
  const lastWeekStart = startOfWeek(subDays(today, 7));
  const lastWeekEnd = endOfWeek(subDays(today, 7));
  const thisWeekStart = startOfWeek(today);
  
  const filterByDateRange = (start: Date, end: Date, type?: string) => {
    return activities.filter(activity => {
      if (!activity.completed_at) return false;
      const activityDate = new Date(activity.completed_at);
      const matchesDateRange = activityDate >= start && activityDate <= end;
      const matchesType = type === 'all' || !type || activity.activity_type === type;
      return matchesDateRange && matchesType;
    });
  };
  
  const lastWeekActivities = filterByDateRange(lastWeekStart, lastWeekEnd, selectedType !== 'all' ? selectedType : undefined);
  const thisWeekActivities = filterByDateRange(thisWeekStart, today, selectedType !== 'all' ? selectedType : undefined);
  
  // Calculate metrics for comparison
  const getComparisonData = () => {
    const metrics = [
      {
        name: 'Activities Logged',
        thisWeek: thisWeekActivities.length,
        lastWeek: lastWeekActivities.length,
      },
      {
        name: 'Active Days',
        thisWeek: new Set(thisWeekActivities
          .filter(a => a.completed_at)
          .map(a => new Date(a.completed_at as string).toISOString().split('T')[0])
        ).size,
        lastWeek: new Set(lastWeekActivities
          .filter(a => a.completed_at)
          .map(a => new Date(a.completed_at as string).toISOString().split('T')[0])
        ).size,
      }
    ];
    
    // Add specific metrics for certain activity types
    if (selectedType === 'walking' || selectedType === 'all') {
      const walkingThisWeek = thisWeekActivities
        .filter(a => a.activity_type === 'walking')
        .reduce((sum, a) => sum + a.value, 0);
      
      const walkingLastWeek = lastWeekActivities
        .filter(a => a.activity_type === 'walking')
        .reduce((sum, a) => sum + a.value, 0);
      
      metrics.push({
        name: 'Steps Walked',
        thisWeek: Math.round(walkingThisWeek),
        lastWeek: Math.round(walkingLastWeek),
      });
    }
    
    if (selectedType === 'meditation' || selectedType === 'all') {
      const meditationThisWeek = thisWeekActivities
        .filter(a => a.activity_type === 'meditation')
        .reduce((sum, a) => sum + a.value, 0);
      
      const meditationLastWeek = lastWeekActivities
        .filter(a => a.activity_type === 'meditation')
        .reduce((sum, a) => sum + a.value, 0);
      
      metrics.push({
        name: 'Meditation Minutes',
        thisWeek: Math.round(meditationThisWeek),
        lastWeek: Math.round(meditationLastWeek),
      });
    }
    
    return metrics;
  };
  
  const comparisonData = getComparisonData();
  
  // Calculate percentage difference for each metric
  const calculateDifference = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };
  
  // Get icon based on trend
  const getTrendIcon = (diff: number) => {
    if (diff > 5) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (diff < -5) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-orange-500" />;
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            Weekly Comparison
          </CardTitle>
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Activity Type" />
            </SelectTrigger>
            <SelectContent>
              {activityTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type === 'all' ? 'All Activities' : type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground mb-4">
          Comparing this week ({format(thisWeekStart, 'MMM d')} - {format(today, 'MMM d')}) 
          with last week ({format(lastWeekStart, 'MMM d')} - {format(lastWeekEnd, 'MMM d')})
        </div>
        
        <div className="space-y-4">
          {comparisonData.map((metric, index) => {
            const diff = calculateDifference(metric.thisWeek, metric.lastWeek);
            const formattedDiff = diff.toFixed(0);
            const isPositive = diff > 0;
            
            return (
              <div key={index} className="grid grid-cols-3 items-center gap-2">
                <div className="font-medium">{metric.name}</div>
                <div className="text-right">{metric.thisWeek}</div>
                <div className={`flex items-center justify-end gap-1 ${
                  isPositive ? 'text-green-500' : diff < 0 ? 'text-red-500' : 'text-orange-500'
                }`}>
                  {getTrendIcon(diff)}
                  <span>{isPositive ? '+' : ''}{formattedDiff}%</span>
                </div>
              </div>
            );
          })}
        </div>
        
        {comparisonData.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            No data available for comparison
          </div>
        )}
      </CardContent>
    </Card>
  );
} 