import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaRunning, FaApple, FaBed, FaMedal, FaTrophy, FaFire } from 'react-icons/fa';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

// Define the activity types for the feed
type ActivityType = 'habit_completed' | 'achievement_unlocked' | 'quest_completed' | 'level_up' | 'streak_milestone';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  icon?: React.ReactNode;
  userData?: {
    name: string;
    avatarUrl?: string;
  };
  metadata?: Record<string, any>;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Simulate API fetch
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Mock data
        const mockActivities: Activity[] = [
          {
            id: '1',
            type: 'habit_completed',
            title: 'Morning Run Completed',
            description: 'You ran 5km this morning. Great job keeping up your routine!',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            icon: <FaRunning className="text-green-500" />,
            metadata: {
              habitId: 'abc123',
              value: 5,
              unit: 'km'
            }
          },
          {
            id: '2',
            type: 'achievement_unlocked',
            title: 'Early Bird Achievement',
            description: 'You completed a habit before 8 AM for 5 consecutive days.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            icon: <FaMedal className="text-amber-500" />,
            metadata: {
              achievementId: 'early_bird_1'
            }
          },
          {
            id: '3',
            type: 'habit_completed',
            title: 'Healthy Meal Logged',
            description: 'You logged a balanced meal with proteins, vegetables, and whole grains.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
            icon: <FaApple className="text-red-500" />,
            metadata: {
              habitId: 'def456',
              mealType: 'lunch'
            }
          },
          {
            id: '4',
            type: 'quest_completed',
            title: 'Hydration Quest Completed',
            description: 'You drank 8 glasses of water today. Your hydration quest is complete!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            icon: <FaTrophy className="text-blue-500" />,
            metadata: {
              questId: 'hydration_1',
              xpEarned: 50
            }
          },
          {
            id: '5',
            type: 'streak_milestone',
            title: '7 Day Streak!',
            description: 'You've maintained your daily habits for a full week. Keep it up!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            icon: <FaFire className="text-orange-500" />,
            metadata: {
              streakDays: 7
            }
          },
          {
            id: '6',
            type: 'level_up',
            title: 'Level Up!',
            description: 'You've reached Level 3. New quests and rewards are now available.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
            icon: <FaTrophy className="text-purple-500" />,
            metadata: {
              newLevel: 3,
              xpTotal: 300
            }
          },
        ];
        
        setActivities(mockActivities);
      } catch (error) {
        console.error('Failed to fetch activities', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivities();
  }, []);
  
  // Helper to format activity timestamp
  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };
  
  // Render loading skeletons
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex space-x-4 p-4 bg-card rounded-lg border">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {activities.length > 0 ? (
          activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-card rounded-lg border hover:border-primary/50 transition-colors"
            >
              <div className="flex space-x-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {activity.icon || <FaRunning className="text-primary" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">{activity.title}</h4>
                    <time className="text-xs text-muted-foreground">
                      {formatActivityTime(activity.timestamp)}
                    </time>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                  
                  {activity.type === 'quest_completed' && activity.metadata?.xpEarned && (
                    <div className="mt-2 text-xs inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                      <FaTrophy className="mr-1 h-3 w-3" />
                      Earned {activity.metadata.xpEarned} XP
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent activity to display.</p>
            <p className="text-sm mt-1">
              Complete habits and quests to see your activity here.
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 