"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { DashboardNavbar } from "@/components/dashboard-navbar";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import { Tables } from "@/types/supabase";
import { User } from '@supabase/supabase-js';
import { 
  BarChart as BarChartIcon, 
  LineChart, 
  PieChart, 
  Calendar,
  Trophy,
  Activity,
  Target,
  RefreshCw,
  PlusCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LogActivityForm } from "@/app/dashboard/activities/log-activity-form";
import { AddGoalForm } from "@/app/dashboard/goals/add-goal-form";
import { Button } from "@/components/ui/button";
import { GoalAchievementModal } from "@/components/goal-achievement-modal";
import { GoalRecommendations } from "@/components/goal-recommendations";
import { StreakChallenge } from "@/components/streak-challenge";
import { HealthInsights } from "@/components/health-insights";
import { WeeklyComparison } from "@/components/weekly-comparison";
import { ShareIcon } from "lucide-react";
import { SmartGoalSuggestions } from "@/components/smart-goal-suggestions";
import { MeasurementUnitSelector } from "@/components/measurement-unit-selector";
import { 
  convertMeasurement, 
  getFormattedMeasurement, 
  getEquivalentMeasurements,
  getAllowedUnits,
  MEASUREMENT_UNITS
} from "@/lib/measurements";
import { useMeasurementPreferences } from "@/hooks/use-measurement-preferences";
import { ActivityCard } from './ActivityCard';

type Activity = Tables<"health_activities"> & {
  notes?: string | null;
  created_at?: string;
  updated_at?: string | null;
  completed_at: string;
};
type Goal = Tables<"health_goals"> & {
  measurement_unit?: string;
};
type Streak = Tables<"health_streaks">;

interface MeasurementOption {
  value: string;
  label: string;
  conversionFactor?: number; // For converting between units (e.g., km to miles)
}

interface ActivityMeasurements {
  [key: string]: MeasurementOption[];
}

// Add this mapping of activity types to their measurement options
const activityMeasurements: ActivityMeasurements = {
  walking: [
    { value: 'steps', label: 'Steps' },
    { value: 'km', label: 'Kilometers', conversionFactor: 1 },
    { value: 'miles', label: 'Miles', conversionFactor: 1.60934 } // 1 mile = 1.60934 km
  ],
  running: [
    { value: 'km', label: 'Kilometers', conversionFactor: 1 },
    { value: 'miles', label: 'Miles', conversionFactor: 1.60934 },
    { value: 'minutes', label: 'Minutes' }
  ],
  cycling: [
    { value: 'km', label: 'Kilometers', conversionFactor: 1 },
    { value: 'miles', label: 'Miles', conversionFactor: 1.60934 },
    { value: 'minutes', label: 'Minutes' }
  ],
  swimming: [
    { value: 'meters', label: 'Meters', conversionFactor: 1 },
    { value: 'km', label: 'Kilometers', conversionFactor: 1000 },
    { value: 'yards', label: 'Yards', conversionFactor: 0.9144 }, // 1 yard = 0.9144 meters
    { value: 'minutes', label: 'Minutes' }
  ],
  yoga: [
    { value: 'minutes', label: 'Minutes', conversionFactor: 1 },
    { value: 'hours', label: 'Hours', conversionFactor: 60 }
  ],
  meditation: [
    { value: 'minutes', label: 'Minutes', conversionFactor: 1 },
    { value: 'hours', label: 'Hours', conversionFactor: 60 }
  ],
  strength: [
    { value: 'minutes', label: 'Minutes', conversionFactor: 1 },
    { value: 'hours', label: 'Hours', conversionFactor: 60 },
    { value: 'sets', label: 'Sets' }
  ],
  water: [
    { value: 'glasses', label: 'Glasses' },
    { value: 'ml', label: 'Milliliters' },
    { value: 'oz', label: 'Ounces' }
  ],
  sleep: [
    { value: 'hours', label: 'Hours', conversionFactor: 1 },
    { value: 'minutes', label: 'Minutes', conversionFactor: 1/60 }
  ]
};

// Default measurement unit for each activity type
const defaultMeasurements: {[key: string]: string} = {
  walking: 'steps',
  running: 'km',
  cycling: 'km',
  swimming: 'meters',
  yoga: 'minutes',
  meditation: 'minutes',
  strength: 'minutes',
  water: 'glasses',
  sleep: 'hours'
};

interface HealthActivity {
  id: string;
  user_id: string;
  activity_type: string;
  value: number;
  completed_at: string;
  measurement_unit?: string; // Add this field
}

interface ActivityStats {
  totalActivities: number;
  activityDistribution: Record<string, number>;
  recentActivities: HealthActivity[];
}

// Create a custom hook for staggered animations
function useStaggeredAnimation(itemCount: number, baseDelay: number = 200): number[] {
  const [delays, setDelays] = useState<number[]>([]);
  
  useEffect(() => {
    const newDelays = Array.from({ length: itemCount }).map((_, i) => baseDelay * i);
    setDelays(newDelays);
  }, [itemCount, baseDelay]);
  
  return delays;
}

// Update Progress component to show different colors based on progress
const AnimatedProgressBar = ({ 
  value, 
  total, 
  animate = true,
  delay = 0 
}: { 
  value: number | null, 
  total: number | null, 
  animate?: boolean,
  delay?: number 
}) => {
  const safeValue = value ?? 0;
  const safeTotal = total ?? 1;
  
  const [progress, setProgress] = useState(animate ? 0 : (safeValue / safeTotal) * 100);
  
  useEffect(() => {
    if (!animate) {
      setProgress((safeValue / safeTotal) * 100);
      return;
    }
    
    // Start from 0
    setProgress(0);
    
    // Use staggered timeout for nicer visual effect
    const timer = setTimeout(() => {
      setProgress((safeValue / safeTotal) * 100);
    }, 300 + delay);
    
    return () => clearTimeout(timer);
  }, [safeValue, safeTotal, animate, delay]);
  
  // Get color class based on progress
  const getColorClass = () => {
    const percentage = (safeValue / safeTotal) * 100;
    if (percentage >= 100) return "bg-gradient-to-r from-green-400 to-green-600 h-2";
    if (percentage >= 75) return "bg-gradient-to-r from-blue-400 to-primary h-2";
    if (percentage >= 50) return "bg-gradient-to-r from-cyan-400 to-blue-500 h-2";
    if (percentage >= 25) return "bg-gradient-to-r from-amber-400 to-amber-600 h-2";
    return "bg-gradient-to-r from-red-400 to-red-600 h-2";
  };
  
  const cappedProgress = progress > 100 ? 100 : progress;
  
  return (
    <div className="w-full space-y-1">
      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
        <div 
          className={`${getColorClass()} transition-all duration-700 ease-out rounded-full`}
          style={{ width: `${cappedProgress}%` }}
          data-testid="animated-progress"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{safeValue}</span>
        <span>{safeTotal}</span>
      </div>
    </div>
  );
};

// Create a skeleton loader component for goal cards
const GoalCardSkeleton = () => (
  <div className="p-4 border rounded-lg space-y-3">
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-2 w-full" />
    <div className="flex justify-between">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  </div>
);

// Create a skeleton loader for activity cards
const ActivityCardSkeleton = () => (
  <div className="p-4 border rounded-lg space-y-3">
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-2 w-full" />
    <div className="flex justify-between">
      <Skeleton className="h-4 w-1/5" />
      <Skeleton className="h-4 w-1/5" />
    </div>
  </div>
);

export default function ProgressPage({ defaultTab = 'overview' }: { defaultTab?: string }) {
  // Add state for the user
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<HealthActivity[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState<boolean>(false);
  const [initialGoalValues, setInitialGoalValues] = useState<{
    goalType?: string;
    targetValue?: number;
    measurementUnit?: string;
  }>({});
  
  // Always call hooks at the top level, with a fallback for empty arrays
  // This ensures the hook is called the same number of times on every render
  const goalDelays = useStaggeredAnimation(goals.length || 0);
  const activityDelays = useStaggeredAnimation(activities.length || 0);
  const streakDelays = useStaggeredAnimation(streaks.length || 0);

  // Add state to track user's preferred units for viewing
  const [viewPreferences, setViewPreferences] = useState<{[key: string]: string}>({});

  // Load user preferences for measurement units from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('measurementPreferences');
    if (savedPreferences) {
      try {
        setViewPreferences(JSON.parse(savedPreferences));
      } catch (e) {
        console.error('Error loading measurement preferences:', e);
      }
    }
  }, []);

  // Save preferences when they change
  useEffect(() => {
    if (Object.keys(viewPreferences).length > 0) {
      localStorage.setItem('measurementPreferences', JSON.stringify(viewPreferences));
    }
  }, [viewPreferences]);

  // ⚠️ IMPORTANT: We're moving these two state declarations here to fix the hook ordering issue
  // These were defined later in the component, causing inconsistent hook calls
  const [selectedUnits, setSelectedUnits] = useState<{[key: string]: string}>({});
  const { 
    preferences,
    getPreferredUnit, 
    setPreference, 
    convertToPreferred 
  } = useMeasurementPreferences();

  const fetchActivities = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError(new Error('User not authenticated'));
        return { error: new Error('User not authenticated') };
      }

      const { data, error: activitiesError } = await supabase
        .from('health_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (activitiesError) throw activitiesError;

      if (!data || data.length === 0) {
        setError(new Error('No activities found'));
        return { error: new Error('No activities found') };
      }

      return { data };
    } catch (err) {
      console.error("Error in data loading:", err);
      setError(err as Error);
      return { error: err as Error };
    }
  }, []);

  const fetchGoals = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError(new Error('User not authenticated'));
        return { error: new Error('User not authenticated') };
      }

      const { data, error: goalsError } = await supabase
        .from('health_goals')
        .select('*')
        .eq('user_id', user.id);

      if (goalsError) throw goalsError;

      if (!data || data.length === 0) {
        setError(new Error('No goals found'));
        return { error: new Error('No goals found') };
      }

      return { data };
    } catch (err) {
      console.error("Error in data loading:", err);
      setError(err as Error);
      return { error: err as Error };
    }
  }, []);

  const fetchStreaks = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError(new Error('User not authenticated'));
        return { error: new Error('User not authenticated') };
      }

      const { data, error: streaksError } = await supabase
        .from('health_streaks')
        .select('*')
        .eq('user_id', user.id);

      if (streaksError) throw streaksError;

      if (!data || data.length === 0) {
        setError(new Error('No streaks found'));
        return { error: new Error('No streaks found') };
      }

      return { data };
    } catch (err) {
      console.error("Error in data loading:", err);
      setError(err as Error);
      return { error: err as Error };
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null); // Clear any previous errors when retrying
      
      try {
        // Create a single Promise.all to handle all data fetching
        const [activitiesResult, goalsResult, streaksResult] = await Promise.all([
          fetchActivities(),
          fetchGoals(),
          fetchStreaks()
        ]);

        // Check if any of the requests failed
        if (activitiesResult.error || goalsResult.error || streaksResult.error) {
          const errorObject = activitiesResult.error || goalsResult.error || streaksResult.error;
          console.error("Error fetching data:", errorObject);
          if (errorObject) {
            setError(errorObject as Error);
          }
        } else {
          // Process the data only if all requests succeeded
          setActivities(activitiesResult.data || []);
          setGoals(goalsResult.data || []);
          setStreaks(streaksResult.data || []);
          calculateStats();
        }
      } catch (err) {
        console.error("Error in data loading:", err);
        setError(err as Error);
      } finally {
        // Always set loading to false, even if there's an error
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchActivities, fetchGoals, fetchStreaks, retryCount, refreshCounter]);

  const calculateStats = useCallback((): ActivityStats => {
    const totalActivities = activities.length;
    const activityDistribution = activities.reduce((acc, activity) => {
      acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const recentActivities = activities.slice(0, 5);

    return {
      totalActivities,
      activityDistribution,
      recentActivities
    };
  }, [activities]);

  // Calculate progress percentages for all goals
  const goalProgress = goals.map(goal => {
    const progress = goal.current_value && goal.target_value
      ? Math.min((goal.current_value / goal.target_value) * 100, 100)
      : 0;
    return {
      ...goal,
      progress
    };
  });

  // Get top streaks
  const topStreaks = [...streaks].sort((a, b) => 
    (b.current_streak || 0) - (a.current_streak || 0)
  ).slice(0, 3);

  // Add skeleton loaders for a better loading experience
  const ContentSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-card h-32 opacity-50" />
        ))}
      </div>
      <div className="rounded-xl border bg-card h-64 opacity-50" />
      <div className="rounded-xl border bg-card h-64 opacity-50" />
    </div>
  );

  // State for showing achievement modal
  const [achievedGoal, setAchievedGoal] = useState<Goal | null>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  // Effect to check for newly completed goals
  useEffect(() => {
    // Find goals that just hit 100%
    const newlyCompletedGoal = goals.find(goal => 
      goal.status === 'active' && 
      goal.current_value && 
      goal.target_value && 
      goal.current_value >= goal.target_value
    );
    
    if (newlyCompletedGoal) {
      setAchievedGoal(newlyCompletedGoal);
      setShowAchievementModal(true);
      
      // Mark the goal as completed
      updateGoalStatus(newlyCompletedGoal.id, 'completed');
    }
  }, [goals]);

  // Function to update goal status
  const updateGoalStatus = async (goalId: string, status: string) => {
    const supabase = createClient();
    
    // Optimistic update
    const updatedGoals = goals.map(goal => 
      goal.id === goalId ? { ...goal, status } : goal
    );
    setGoals(updatedGoals);
    
    // Server update
    try {
      await supabase
        .from('health_goals')
        .update({ status })
        .eq('id', goalId);
    } catch (error) {
      console.error("Error updating goal status:", error);
      // Revert on failure
      setGoals(goals);
    }
  };

  // Function to handle sharing achievement
  const handleShareAchievement = () => {
    if (!achievedGoal) return;
    
    // Create share message
    const shareText = `I just achieved my ${achievedGoal.goal_type} goal of ${achievedGoal.target_value} ${achievedGoal.measurement_unit || defaultMeasurements[achievedGoal.goal_type] || 'units'} on LifeJourney!`;
    
    // Use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'Goal Achievement',
        text: shareText,
        url: window.location.href
      }).catch(err => {
        console.log('Error sharing:', err);
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Achievement copied to clipboard! Share it with your friends.');
    }
  };

  // Add a useEffect to fetch the user
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    fetchUser();
  }, []);

  if (isLoading) {
    return (
      <SubscriptionCheck>
        <DashboardNavbar user={user} />
        <main className="w-full">
          <div className="container mx-auto px-4 py-8 space-y-8">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Progress Dashboard</h1>
                <p className="text-muted-foreground mt-1">View insights and analytics about your health journey</p>
              </div>
              <button 
                onClick={() => setRefreshCounter(prev => prev + 1)}
                className="p-2 rounded-full hover:bg-muted/50"
                aria-label="Refresh data"
                data-testid="refresh-button"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </header>
            <div 
              className="flex items-center justify-center py-10" 
              data-testid="loading-container"
            >
              <div 
                className="flex flex-col items-center justify-center p-8 space-y-4"
                data-testid="loading-indicator"
              >
                <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <p className="text-muted-foreground text-sm">Loading your progress data...</p>
              </div>
            </div>
            <ContentSkeleton />
          </div>
        </main>
      </SubscriptionCheck>
    );
  }

  if (error) {
    return (
      <SubscriptionCheck>
        <DashboardNavbar user={user} />
        <main className="w-full">
          <div className="container mx-auto px-4 py-8 space-y-8">
            <header>
              <h1 className="text-3xl font-bold">Progress Dashboard</h1>
              <p className="text-muted-foreground mt-1">View insights and analytics about your health journey</p>
            </header>
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6 m-4">
              <div className="text-center" role="alert">
                <h3 className="font-bold text-red-500 text-lg mb-2">Error Loading Data</h3>
                <p data-testid="error-message" className="mb-4">
                  {error.message || 'An error occurred while loading your data'}
                </p>
                <button 
                  onClick={() => setRetryCount(prev => prev + 1)} 
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  data-testid="retry-button"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </main>
      </SubscriptionCheck>
    );
  }

  const stats = calculateStats();

  // Add function to update UI optimistically
  const addActivityOptimistically = (newActivity: HealthActivity) => {
    setActivities(prev => [newActivity, ...prev]);
  };

  const updateGoalOptimistically = (updatedGoal: Goal) => {
    setGoals(prev => prev.map(goal => 
      goal.id === updatedGoal.id ? updatedGoal : goal
    ));
  };

  // Format measurement unit for display
  function formatMeasurementUnit(unit: string): string {
    // Map abbreviated units to more readable forms
    const unitDisplayMap: {[key: string]: string} = {
      km: 'kilometers',
      ml: 'milliliters',
      oz: 'ounces'
    };
    
    return unitDisplayMap[unit] || unit;
  }

  // Add a utility function to get displayed value with the user's preferred unit
  const getDisplayValue = (value: number, activityType: string, originalUnit: string, preferredUnit?: string) => {
    // If no preference or same as original, return original value
    if (!preferredUnit || preferredUnit === originalUnit) {
      return value;
    }
    
    // Convert the value to the preferred unit
    return convertMeasurement(value, originalUnit, preferredUnit, activityType);
  };

  // Add a utility function to get the display text
  const getDisplayValueText = (value: number, activityType: string, originalUnit: string, preferredUnit?: string) => {
    const displayValueResult = getDisplayValue(value, activityType, originalUnit, preferredUnit);
    
    // Ensure we have a number value to format
    if (displayValueResult === null) {
      return `${value} ${originalUnit}`;
    }
    
    const unit = preferredUnit || originalUnit;
    
    // Format the number based on the unit type
    if (unit === 'steps' || unit === 'sets' || unit === 'glasses') {
      return `${Math.round(displayValueResult)} ${unit}`;
    } else if (unit === 'hours' || unit === 'minutes') {
      // For time, show one decimal place
      return `${displayValueResult.toFixed(1)} ${unit}`;
    } else {
      // For distances, show two decimal places
      return `${displayValueResult.toFixed(2)} ${unit}`;
    }
  };

  function ActivitiesTab({ activities }: { activities: HealthActivity[] }) {
    // Sort activities by date (most recent first)
    const sortedActivities = [...activities].sort(
      (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    );

    // Group activities by date
    const groupedActivities = sortedActivities.reduce((groups, activity) => {
      const date = new Date(activity.completed_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
      return groups;
    }, {} as Record<string, HealthActivity[]>);

    return (
      <div className="space-y-6">
        {Object.entries(groupedActivities).map(([date, dateActivities], groupIndex) => (
          <div key={date} className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">
              {new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dateActivities.map((activity, index) => (
                <ActivityCard 
                  key={activity.id} 
                  activity={activity} 
                  delay={(groupIndex * 3 + index) * 50} // Staggered animation
                />
              ))}
            </div>
          </div>
        ))}
        
        {Object.keys(groupedActivities).length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No activities logged yet.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setAddDialogOpen(true)}
            >
              Log Your First Activity
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <SubscriptionCheck>
      <DashboardNavbar user={user} />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Progress Dashboard</h1>
              <p className="text-muted-foreground mt-1">View insights and analytics about your health journey</p>
            </div>
            <button 
              onClick={() => setRefreshCounter(prev => prev + 1)}
              className="p-2 rounded-full hover:bg-muted/50"
              aria-label="Refresh data"
              data-testid="refresh-button"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </header>

          <div className="fixed bottom-8 right-8 flex flex-col gap-2">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/60 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <button 
                onClick={() => setGoalDialogOpen(true)} 
                className="relative bg-background text-foreground hover:bg-muted p-3 rounded-full shadow-lg flex items-center gap-2"
              >
                <Target className="h-5 w-5" />
                <span className="hidden group-hover:inline">Add Goal</span>
              </button>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/60 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <button 
                onClick={() => setAddDialogOpen(true)} 
                className="relative bg-background text-foreground hover:bg-muted p-3 rounded-full shadow-lg flex items-center gap-2"
              >
                <Activity className="h-5 w-5" />
                <span className="hidden group-hover:inline">Log Activity</span>
              </button>
            </div>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger 
                value="overview" 
                data-testid="overview-tab-trigger"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="goals" 
                data-testid="goals-tab-trigger"
              >
                Goals
              </TabsTrigger>
              <TabsTrigger 
                value="activities" 
                data-testid="activities-tab-trigger"
              >
                Activities
              </TabsTrigger>
            </TabsList>
            
            <TabsContent 
              value="overview" 
              id="overview-tab" 
              data-testid="overview-content"
              className="space-y-6"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Active Goals</CardTitle>
                    <CardDescription>Your ongoing health goals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {goals.filter(g => g.status === 'active').length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {Math.round(goals.filter(g => g.status === 'completed').length / (goals.length || 1) * 100)}% completion rate
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Activities Logged</CardTitle>
                    <CardDescription>Total activities tracked</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {stats.totalActivities}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Across {Object.keys(stats.activityDistribution).length} different types
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Longest Streak</CardTitle>
                    <CardDescription>Your best activity streak</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {streaks.reduce((max, streak) => Math.max(max, streak.longest_streak || 0), 0)} days
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {topStreaks[0]?.streak_type && `${topStreaks[0].streak_type} activity`}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Current Goal Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Goal Progress</CardTitle>
                  <CardDescription>Your active goals and their current progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {goalProgress
                      .filter(goal => goal.status === 'active')
                      .sort((a, b) => b.progress - a.progress)
                      .slice(0, 5)
                      .map((goal, index) => (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1)}</span>
                            <span>{Math.round(goal.progress)}%</span>
                          </div>
                          <AnimatedProgressBar 
                            value={goal.current_value ?? 0} 
                            total={goal.target_value ?? 1} 
                            animate={!isLoading} 
                            delay={goalDelays[index] || 0}
                          />
                        </div>
                      ))}
                    {goalProgress.filter(goal => goal.status === 'active').length === 0 && (
                      <div className="text-center py-6 text-muted-foreground">
                        No active goals. Create some goals to track your progress!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Streaks */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Streaks</CardTitle>
                  <CardDescription>Your most consistent activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topStreaks.map(streak => (
                      <div key={streak.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {streak.streak_type.charAt(0).toUpperCase() + streak.streak_type.slice(1)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {streak.current_streak} day current streak
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{streak.longest_streak} days</div>
                          <div className="text-sm text-muted-foreground">Longest</div>
                        </div>
                      </div>
                    ))}
                    {topStreaks.length === 0 && (
                      <div className="text-center py-6 text-muted-foreground">
                        No streaks yet. Start logging daily activities to build streaks!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Activity Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Trends</CardTitle>
                  <CardDescription>Your activity patterns over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Weekly activity distribution */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Weekly Frequency</h4>
                      <div className="grid grid-cols-7 gap-1 h-20">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                          // Calculate frequency for each day (example implementation)
                          const dayActivities = activities.filter(a => new Date(a.completed_at).getDay() === (i + 1) % 7).length;
                          const maxActivities = Math.max(1, ...Array(7).fill(0).map((_, i) => 
                            activities.filter(a => new Date(a.completed_at).getDay() === (i + 1) % 7).length
                          ));
                          const height = `${Math.max(10, (dayActivities / maxActivities) * 100)}%`;
                          
                          return (
                            <div key={day} className="flex flex-col items-center justify-end">
                              <div 
                                className="w-full bg-primary/80 rounded-sm" 
                                style={{ height }}
                              ></div>
                              <span className="text-xs mt-1">{day}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Top activities */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Most Frequent Activities</h4>
                      <div className="space-y-3">
                        {Object.entries(stats.activityDistribution)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 3)
                          .map(([type, count], index) => (
                            <div key={type} className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-full ${
                                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                  index === 1 ? 'bg-slate-100 text-slate-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  <Trophy className="h-4 w-4" />
                                </div>
                                <span>{capitalizeFirstLetter(type)}</span>
                              </div>
                              <span className="font-medium">{count} entries</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {streaks.length > 0 && (
                <StreakChallenge
                  streaks={streaks}
                  activities={activities}
                  onLogActivity={() => setAddDialogOpen(true)}
                />
              )}

              {activities.length > 0 && (
                <GoalRecommendations
                  activities={activities}
                  onAddGoal={(recommendation) => {
                    setGoalDialogOpen(true);
                    // Here you would pass the recommendation to the form
                    // Implementation would require adding state to store the recommendation
                  }}
                />
              )}

              <WeeklyComparison activities={activities} />

              {activities.length > 0 && goals.length > 0 && (
                <HealthInsights
                  activities={activities}
                  goals={goals}
                />
              )}
            </TabsContent>

            <TabsContent 
              value="goals" 
              id="goals-tab" 
              data-testid="goals-content"
              className="space-y-6"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle data-testid="goal-completion-title">Goal Completion</CardTitle>
                    <CardDescription>Overview of your health goals progress</CardDescription>
                  </div>
                  <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        <PlusCircle className="h-4 w-4" />
                        <span>Add Goal</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Goal</DialogTitle>
                        <DialogDescription>
                          Set a new health goal with your preferred measurement units.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <SmartGoalSuggestions 
                        onSelectGoal={({goalType, targetValue, measurementUnit}) => {
                          // This function will be passed to the AddGoalForm 
                          // to pre-fill the form with the selected suggestion
                          setInitialGoalValues({
                            goalType,
                            targetValue,
                            measurementUnit
                          });
                        }}
                      />
                      
                      <AddGoalForm 
                        initialValues={initialGoalValues}
                        onSuccess={(newGoal) => {
                          updateGoalOptimistically({
                            ...newGoal,
                            progress: 0,
                          });
                          setGoalDialogOpen(false);
                        }}
                        closeDialog={() => setGoalDialogOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-muted/30 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">{goals.filter(g => g.status === 'active').length}</div>
                      <div className="text-sm text-muted-foreground">Active Goals</div>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">{goals.filter(g => g.status === 'completed').length}</div>
                      <div className="text-sm text-muted-foreground">Completed Goals</div>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">
                        {goals.length ? `${Math.round(goals.filter(g => g.status === 'completed').length / goals.length * 100)}%` : '0%'}
                      </div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">All Goals</h3>
                    {isLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <GoalCardSkeleton />
                        <GoalCardSkeleton />
                        <GoalCardSkeleton />
                      </div>
                    ) : (
                      goals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="goals-list">
                          {goals.map((goal, index) => (
                            <div key={goal.id} className="rounded-lg border p-4" data-testid={`goal-card-${goal.id}`}>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium">{capitalizeFirstLetter(goal.goal_type)}</h4>
                                  <div className="text-sm text-muted-foreground" data-testid="goal-target">
                                    Target: {goal.target_value} {getUnitLabel(goal.goal_type, goal.measurement_unit)}
                                  </div>
                                  <div className="text-sm text-muted-foreground" data-testid="goal-current">
                                    Current: {goal.current_value} {getUnitLabel(goal.goal_type, goal.measurement_unit)}
                                  </div>
                                </div>
                                <Badge variant={goal.status === 'completed' ? "default" : "default"}>
                                  {goal.status ? capitalizeFirstLetter(goal.status) : ''}
                                </Badge>
                              </div>
                              <AnimatedProgressBar 
                                value={goal.current_value ?? 0} 
                                total={goal.target_value ?? 1} 
                                animate={!isLoading} 
                                delay={goalDelays[index] || 0}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground" data-testid="no-goals-message">
                          No goals set yet. Go to Goals section to create your first health goal!
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent 
              value="activities" 
              id="activities-tab" 
              data-testid="activities-content"
              className="space-y-6"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle data-testid="activity-summary-title">Activity Summary</CardTitle>
                    <CardDescription>Overview of your recorded health activities</CardDescription>
                  </div>
                  <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1">
                        <PlusCircle className="h-4 w-4" />
                        <span>Log Activity</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Log New Activity</DialogTitle>
                        <DialogDescription>
                          Record a new health activity with your preferred measurement units.
                        </DialogDescription>
                      </DialogHeader>
                      <LogActivityForm 
                        onSuccess={(newActivity) => {
                          // Optimistic update
                          addActivityOptimistically(newActivity);
                          setAddDialogOpen(false);
                        }}
                        closeDialog={() => setAddDialogOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-muted/30 p-6 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">
                        Activity Distribution
                      </h3>
                      {Object.keys(stats.activityDistribution).length > 0 ? (
                        <div className="space-y-3">
                          {Object.entries(stats.activityDistribution)
                            .sort(([, a], [, b]) => b - a)
                            .map(([type, count]) => (
                              <div key={type} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                                  <span>{count} {count === 1 ? 'entry' : 'entries'}</span>
                                </div>
                                <AnimatedProgressBar 
                                  value={count} 
                                  total={stats.totalActivities} 
                                  animate={!isLoading} 
                                  delay={activityDelays[Object.keys(stats.activityDistribution).indexOf(type) || 0] || 0}
                                />
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          No activities logged yet
                        </div>
                      )}
                    </div>

                    <div className="bg-muted/30 p-6 rounded-lg">
                      <h3 className="text-lg font-medium mb-4" data-testid="recent-activity-heading">
                        Recent Activity
                      </h3>
                      {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <ActivityCardSkeleton />
                          <ActivityCardSkeleton />
                        </div>
                      ) : (
                        activities.length > 0 ? (
                          <ActivitiesTab activities={activities} />
                        ) : (
                          <div className="text-center py-6 text-muted-foreground" data-testid="no-activities-message">
                            No activities logged yet. Go to Activities section to record your first activity!
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6 mb-3">
                    <h3
                      className="text-lg font-medium"
                      data-testid="streaks-overview-title"
                    >
                      Streaks Overview
                    </h3>
                  </div>
                  
                  {isLoading ? (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-orange-100 rounded-full">
                              <Calendar className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                              <div className="font-medium">
                                Loading...
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Loading...
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold">Loading...</div>
                            <div className="text-xs text-muted-foreground">Loading...</div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <AnimatedProgressBar 
                            value={0} 
                            total={100} 
                            animate={false} 
                          />
                          <div className="flex justify-between text-xs mt-1">
                            <span>Current: Loading...</span>
                            <span>Best: Loading...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    streaks.length > 0 ? (
                      <div className="space-y-4">
                        {streaks.map((streak, index) => (
                          <div key={streak.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="p-2 bg-orange-100 rounded-full">
                                  <Calendar className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {streak.streak_type.charAt(0).toUpperCase() + streak.streak_type.slice(1)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Last active: {new Date(streak.last_activity_date || new Date()).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold">{streak.current_streak} days</div>
                                <div className="text-xs text-muted-foreground">Current streak</div>
                              </div>
                            </div>
                            <div className="mt-3">
                              <AnimatedProgressBar 
                                value={streak.current_streak ?? 0} 
                                total={streak.longest_streak ?? 1} 
                                animate={!isLoading} 
                                delay={streakDelays[index] || 0}
                              />
                              <div className="flex justify-between text-xs mt-1">
                                <span>Current: {streak.current_streak} days</span>
                                <span>Best: {streak.longest_streak} days</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No activity streaks yet. Log activities daily to build streaks!
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Goal Achievement Modal */}
      <GoalAchievementModal
        goal={achievedGoal}
        open={showAchievementModal}
        onOpenChange={setShowAchievementModal}
        onShare={handleShareAchievement}
        onViewAll={() => {
          setShowAchievementModal(false);
          setActiveTab('goals');
        }}
      />

      {/* Log Activity/Add Goal Dialogs */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Log New Activity</DialogTitle>
            <DialogDescription>
              Record a new health activity with your preferred measurement units.
            </DialogDescription>
          </DialogHeader>
          <LogActivityForm 
            onSuccess={(newActivity) => {
              addActivityOptimistically(newActivity);
              setAddDialogOpen(false);
            }}
            closeDialog={() => setAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Goal</DialogTitle>
            <DialogDescription>
              Set a new health goal with your preferred measurement units.
            </DialogDescription>
          </DialogHeader>
          
          <SmartGoalSuggestions 
            onSelectGoal={({goalType, targetValue, measurementUnit}) => {
              // This function will be passed to the AddGoalForm 
              // to pre-fill the form with the selected suggestion
              setInitialGoalValues({
                goalType,
                targetValue,
                measurementUnit
              });
            }}
          />
          
          <AddGoalForm 
            initialValues={initialGoalValues}
            onSuccess={(newGoal) => {
              updateGoalOptimistically({
                ...newGoal,
                progress: 0,
              });
              setGoalDialogOpen(false);
            }}
            closeDialog={() => setGoalDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </SubscriptionCheck>
  );
}

// Helper function to get appropriate unit label for different activity types
function getUnitLabel(activityType: string, measurementUnit?: string): string {
  // If a specific measurement unit is provided, use it
  if (measurementUnit) {
    return measurementUnit;
  }
  
  // Otherwise, use the default for this activity type
  return defaultMeasurements[activityType] || 'units';
}

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Date unknown';
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}

function getDefaultTarget(activityType: string, value: number, measurementUnit?: string): number {
  // Use the provided measurement unit or fall back to default
  const unit = measurementUnit || defaultMeasurements[activityType] || 'units';
  
  switch(activityType) {
    case 'walking':
      return unit === 'steps' ? 10000 : 
             unit === 'km' ? 5 : 
             unit === 'miles' ? 3 : 10000;
    case 'running':
      return unit === 'km' ? 5 : 
             unit === 'miles' ? 3 : 
             unit === 'minutes' ? 30 : 5;
    case 'cycling':
      return unit === 'km' ? 20 : 
             unit === 'miles' ? 12 : 
             unit === 'minutes' ? 45 : 20;
    case 'swimming':
      return unit === 'meters' ? 1000 : 
             unit === 'km' ? 1 : 
             unit === 'yards' ? 1000 : 
             unit === 'minutes' ? 30 : 1000;
    case 'yoga':
    case 'meditation':
      return unit === 'minutes' ? 30 : 
             unit === 'hours' ? 0.5 : 30;
    case 'strength':
      return unit === 'minutes' ? 45 : 
             unit === 'hours' ? 0.75 : 
             unit === 'sets' ? 15 : 45;
    case 'water':
      return unit === 'glasses' ? 8 : 
             unit === 'ml' ? 2000 : 
             unit === 'oz' ? 64 : 8;
    case 'sleep':
      return unit === 'hours' ? 8 : 
             unit === 'minutes' ? 480 : 8;
    default:
      // If we don't know, just make the target slightly higher than value
      return Math.max(value * 1.2, 10);
  }
} 