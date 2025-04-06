import { useState } from 'react';
import { Calendar, Trophy, ArrowRight, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tables } from '@/types/supabase';

type Activity = Tables<"health_activities"> & {
  notes?: string | null;
  created_at?: string;
  updated_at?: string | null;
  completed_at: string;
};

type Streak = Tables<"health_streaks">;

interface StreakChallengeProps {
  streaks: Tables<"health_streaks">[];
  activities: any[]; // Use any to avoid type issues
  onLogActivity: () => void;
}

export function StreakChallenge({ streaks, activities, onLogActivity }: StreakChallengeProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Find the streak with highest potential
  const getBestStreak = (): Streak | null => {
    if (streaks.length === 0) return null;
    
    return streaks.reduce((best, current) => {
      // Prioritize active streaks that are close to a milestone
      const currentClose = (current.current_streak || 0) % 5 >= 3; // Close to next 5-day milestone
      const bestClose = (best.current_streak || 0) % 5 >= 3;
      
      if (currentClose && !bestClose) return current;
      if (!currentClose && bestClose) return best;
      
      // Otherwise, pick the one with highest current streak
      return (current.current_streak || 0) > (best.current_streak || 0) ? current : best;
    });
  };
  
  const bestStreak = getBestStreak();
  if (!bestStreak) return null;
  
  // Check if user has logged this activity today
  const hasLoggedToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return activities.some(activity => 
      activity.activity_type === bestStreak.streak_type && 
      activity.completed_at.split('T')[0] === today
    );
  };
  
  const activityLoggedToday = hasLoggedToday();
  
  // Calculate next milestone
  const currentStreak = bestStreak.current_streak || 0;
  const nextMilestone = Math.ceil(currentStreak / 5) * 5;
  const progress = (currentStreak / nextMilestone) * 100;
  
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Streak Challenge</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            className="text-xs"
          >
            {expanded ? 'Hide Details' : 'Show Details'}
            <ArrowRight className={`h-3 w-3 ml-1 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium capitalize">
                {bestStreak.streak_type} Streak
              </h3>
              <p className="text-sm text-muted-foreground">
                {activityLoggedToday 
                  ? 'You\'ve logged this activity today!' 
                  : 'Log this activity today to continue your streak!'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold flex items-center justify-end gap-1">
                {currentStreak} 
                <span className="text-sm text-muted-foreground">days</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {nextMilestone - currentStreak} days to next milestone
              </div>
            </div>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          {expanded && (
            <div className="pt-2 space-y-4">
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, i) => {
                  const dayIndex = (new Date().getDay() - 6 + i) % 7;
                  const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex];
                  const isToday = i === 6;
                  
                  // This is just for display, in a real app you'd check if activity was logged on that day
                  const wasLogged = i < 6 || activityLoggedToday;
                  
                  return (
                    <div 
                      key={i} 
                      className={`flex flex-col items-center p-2 rounded-md ${
                        isToday ? 'bg-primary/10 border border-primary/30' : 
                        wasLogged ? 'bg-green-50' : 'bg-muted/30'
                      }`}
                    >
                      <span className="text-xs">{dayName}</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-1 ${
                        wasLogged ? 'bg-green-100 text-green-600' : 'bg-muted/50 text-muted-foreground'
                      }`}>
                        {wasLogged ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Started {new Date(bestStreak.start_date || '').toLocaleDateString()}
                  </span>
                </div>
                
                {!activityLoggedToday && (
                  <Button size="sm" onClick={onLogActivity}>
                    Log {bestStreak.streak_type}
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {!expanded && !activityLoggedToday && (
            <Button size="sm" onClick={onLogActivity} className="w-full mt-2">
              Log {bestStreak.streak_type} activity to continue streak
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 