import React from 'react';
import { 
  Activity, 
  Heart, 
  Target, 
  Trophy, 
  Dumbbell, 
  Clock,
  ArrowUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  type: 'achievement' | 'workout' | 'streak' | 'goal' | 'milestone';
  description: string;
  time: string;
  metadata?: {
    points?: number;
    streak?: number;
    progress?: number;
  };
}

interface ActivityFeedProps {
  activities?: ActivityItem[];
}

export function ActivityFeed({ activities = [] }: ActivityFeedProps) {
  // Default activities if none provided
  const feedActivities = activities.length > 0 ? activities : [
    {
      id: '1',
      user: {
        name: 'Alex Johnson',
        initials: 'AJ',
        avatar: '/avatars/alex.png'
      },
      type: 'achievement',
      description: 'Earned the "Early Bird" achievement',
      time: '20 minutes ago',
      metadata: {
        points: 50
      }
    },
    {
      id: '2',
      user: {
        name: 'Jamie Smith',
        initials: 'JS',
      },
      type: 'workout',
      description: 'Completed a 30-minute HIIT workout',
      time: '1 hour ago',
      metadata: {
        points: 100
      }
    },
    {
      id: '3',
      user: {
        name: 'Taylor Wilson',
        initials: 'TW',
        avatar: '/avatars/taylor.png'
      },
      type: 'streak',
      description: 'Maintained a meditation streak',
      time: '2 hours ago',
      metadata: {
        streak: 7,
        points: 70
      }
    },
    {
      id: '4',
      user: {
        name: 'Morgan Lee',
        initials: 'ML',
      },
      type: 'goal',
      description: 'Reached their step goal for the week',
      time: '3 hours ago',
      metadata: {
        points: 150
      }
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'workout':
        return <Dumbbell className="h-5 w-5 text-purple-500" />;
      case 'streak':
        return <Activity className="h-5 w-5 text-green-500" />;
      case 'goal':
        return <Target className="h-5 w-5 text-blue-500" />;
      case 'milestone':
        return <Heart className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Activity Feed</h2>
      </div>
      
      <div className="space-y-3">
        {feedActivities.map((activity) => (
          <Card key={activity.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                  <AvatarFallback>{activity.user.initials}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{activity.user.name}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-gray-100 p-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <p>{activity.description}</p>
                  </div>
                  
                  {activity.metadata?.points && (
                    <div className="flex items-center gap-1 text-sm text-green-600 font-medium mt-1">
                      <ArrowUp className="h-3 w-3" />
                      {activity.metadata.points} points earned
                    </div>
                  )}
                  
                  {activity.metadata?.streak && (
                    <div className="text-sm text-orange-500 font-medium mt-1">
                      🔥 {activity.metadata.streak} day streak!
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 