'use client';

import { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  FaTrophy, 
  FaBell, 
  FaRunning, 
  FaFire, 
  FaUserFriends,
  FaTimes
} from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  type: 'achievement' | 'reminder' | 'streak' | 'quest' | 'friend' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  icon?: React.ReactNode;
}

export function NotificationList() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock notifications data
        const mockNotifications: Notification[] = [
          {
            id: 'notif-1',
            type: 'achievement',
            title: 'New Achievement Unlocked!',
            message: 'You\'ve earned "Early Bird" for completing a morning workout 5 days in a row.',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            read: false,
            actionUrl: '/achievements',
            icon: <FaTrophy className="text-amber-500" />
          },
          {
            id: 'notif-2',
            type: 'reminder',
            title: 'Workout Reminder',
            message: 'Don\'t forget your scheduled evening workout in 30 minutes.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
            read: true,
            actionUrl: '/habits',
            icon: <FaRunning className="text-green-500" />
          },
          {
            id: 'notif-3',
            type: 'streak',
            title: 'Streak Milestone!',
            message: 'You\'ve maintained your daily habits for 7 days straight. Great job!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
            read: false,
            actionUrl: '/dashboard',
            icon: <FaFire className="text-orange-500" />
          },
          {
            id: 'notif-4',
            type: 'friend',
            title: 'New Friend Request',
            message: 'Sarah Miller sent you a friend request.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
            read: true,
            actionUrl: '/social/friends',
            icon: <FaUserFriends className="text-blue-500" />
          },
          {
            id: 'notif-5',
            type: 'quest',
            title: 'Quest Completed!',
            message: 'You\'ve completed "Hydration Hero" quest and earned 30 XP.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
            read: true,
            actionUrl: '/quests',
            icon: <FaTrophy className="text-purple-500" />
          },
        ];
        
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
        toast({
          title: 'Error',
          description: 'Failed to load notifications',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
  }, [toast]);
  
  const markAsRead = async (id: string) => {
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };
  
  const deleteNotification = async (id: string) => {
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      
      toast({
        title: 'Notification deleted',
        description: 'The notification has been removed.',
      });
    } catch (error) {
      console.error('Failed to delete notification', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    }
  };
  
  const markAllAsRead = async () => {
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      toast({
        title: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
      toast({
        title: 'Error',
        description: 'Failed to update notifications',
        variant: 'destructive',
      });
    }
  };
  
  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    
    return format(date, 'MMM d, h:mm a');
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={markAllAsRead}
            className="text-xs"
          >
            Mark all as read
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex space-x-4 items-start">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <ScrollArea className="h-[400px] pr-4">
          <AnimatePresence initial={false}>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
                className={`mb-4 p-4 rounded-lg border ${
                  notification.read ? 'bg-card' : 'bg-primary/5 border-primary/20'
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {notification.icon || <FaBell className="text-primary" />}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className={`font-medium text-sm ${!notification.read ? 'text-primary' : ''}`}>
                        {notification.title}
                      </h3>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -mr-2 -mt-1 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <FaTimes className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatNotificationTime(notification.timestamp)}
                      </span>
                      
                      {notification.actionUrl && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Navigate to the action URL
                            window.location.href = notification.actionUrl!;
                          }}
                        >
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <FaBell className="mx-auto h-10 w-10 mb-3 text-muted-foreground/50" />
          <p>No notifications</p>
          <p className="text-sm mt-1">You're all caught up!</p>
        </div>
      )}
    </div>
  );
} 