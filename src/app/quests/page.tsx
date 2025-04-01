'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaTrophy, FaFire, FaCalendarDay, FaCalendarWeek, FaCalendarAlt } from 'react-icons/fa';
import { MainLayout } from '@/components/layouts/main-layout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Quest } from '@/types/api';

export default function QuestsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchQuests = async () => {
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockQuests: Quest[] = [
          {
            id: 'quest-1',
            title: 'Early Bird',
            description: 'Complete a morning exercise session before 8 AM for 3 consecutive days',
            difficulty: 'medium',
            xpReward: 50,
            currencyReward: 20,
            startDate: '2023-06-01T00:00:00Z',
            endDate: '2023-06-30T23:59:59Z',
            requirements: {
              type: 'streak',
              habitCategory: 'fitness',
              count: 3,
              timeConstraint: {
                before: '08:00:00'
              }
            },
            createdAt: '2023-05-15T00:00:00Z',
            updatedAt: '2023-05-15T00:00:00Z',
            type: 'daily',
            status: 'in_progress',
            progress: 67,
          },
          {
            id: 'quest-2',
            title: 'Hydration Hero',
            description: 'Drink 8 glasses of water daily for 5 days',
            difficulty: 'easy',
            xpReward: 30,
            currencyReward: 10,
            startDate: '2023-06-01T00:00:00Z',
            endDate: '2023-06-30T23:59:59Z',
            requirements: {
              type: 'count',
              habitId: 'water-tracking',
              targetValue: 8,
              days: 5
            },
            createdAt: '2023-05-20T00:00:00Z',
            updatedAt: '2023-05-20T00:00:00Z',
            type: 'daily',
            status: 'not_started',
            progress: 0,
          },
          {
            id: 'quest-3',
            title: 'Meditation Master',
            description: 'Meditate for at least 10 minutes every day for a week',
            difficulty: 'medium',
            xpReward: 75,
            currencyReward: 30,
            startDate: '2023-06-01T00:00:00Z',
            endDate: '2023-06-30T23:59:59Z',
            requirements: {
              type: 'duration',
              habitCategory: 'mindfulness',
              targetMinutes: 10,
              days: 7
            },
            createdAt: '2023-05-22T00:00:00Z',
            updatedAt: '2023-05-22T00:00:00Z',
            type: 'weekly',
            status: 'in_progress',
            progress: 43,
          },
          {
            id: 'quest-4',
            title: 'Sleep Champion',
            description: 'Get at least 7 hours of sleep for 10 consecutive days',
            difficulty: 'hard',
            xpReward: 100,
            currencyReward: 40,
            startDate: '2023-06-01T00:00:00Z',
            endDate: '2023-06-30T23:59:59Z',
            requirements: {
              type: 'streak',
              habitCategory: 'sleep',
              targetHours: 7,
              days: 10
            },
            createdAt: '2023-05-25T00:00:00Z',
            updatedAt: '2023-05-25T00:00:00Z',
            type: 'weekly',
            status: 'not_started',
            progress: 0,
          },
          {
            id: 'quest-5',
            title: 'Balanced Diet',
            description: 'Log a balanced meal with proteins, carbs, and vegetables for 14 days',
            difficulty: 'epic',
            xpReward: 150,
            currencyReward: 75,
            startDate: '2023-06-01T00:00:00Z',
            endDate: '2023-07-15T23:59:59Z',
            requirements: {
              type: 'count',
              habitCategory: 'nutrition',
              criteria: ['protein', 'carbs', 'vegetables'],
              days: 14
            },
            createdAt: '2023-05-30T00:00:00Z',
            updatedAt: '2023-05-30T00:00:00Z',
            type: 'monthly',
            status: 'in_progress',
            progress: 20,
          },
        ];
        
        setQuests(mockQuests);
      } catch (error) {
        console.error('Failed to fetch quests', error);
        toast({
          title: 'Error',
          description: 'Failed to load quests',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuests();
  }, [toast]);
  
  // Filter quests by type
  const dailyQuests = quests.filter(quest => quest.type === 'daily');
  const weeklyQuests = quests.filter(quest => quest.type === 'weekly');
  const monthlyQuests = quests.filter(quest => quest.type === 'monthly');

  // Get badge color based on difficulty
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'hard':
        return 'bg-orange-100 text-orange-800';
      case 'epic':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get icon based on quest type
  const getQuestTypeIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return <FaCalendarDay className="h-4 w-4" />;
      case 'weekly':
        return <FaCalendarWeek className="h-4 w-4" />;
      case 'monthly':
        return <FaCalendarAlt className="h-4 w-4" />;
      default:
        return <FaTrophy className="h-4 w-4" />;
    }
  };
  
  // Render a quest card
  const renderQuestCard = (quest: Quest) => (
    <Card key={quest.id} className="overflow-hidden mb-4">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-base">{quest.title}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(quest.difficulty)}`}>
            {quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1)}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {quest.description}
        </p>
        
        <div className="mb-3">
          <div className="flex justify-between items-center text-xs mb-1">
            <span>Progress</span>
            <span>{quest.progress}%</span>
          </div>
          <Progress value={quest.progress} className="h-2" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 text-amber-500 text-sm">
              <FaTrophy className="h-3.5 w-3.5" />
              <span>{quest.xpReward} XP</span>
            </span>
            
            {quest.currencyReward && (
              <span className="inline-flex items-center space-x-1 text-green-500 text-sm">
                <FaFire className="h-3.5 w-3.5" />
                <span>{quest.currencyReward} coins</span>
              </span>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs"
            onClick={() => router.push(`/quests/${quest.id}`)}
          >
            {quest.status === 'not_started' ? 'Start' : 
             quest.status === 'in_progress' ? 'Continue' : 
             quest.status === 'completed' ? 'View' : 'Details'}
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <MainLayout>
      <div className="container max-w-lg mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quests</h1>
          <Button variant="outline" onClick={() => {}}>
            <FaFire className="mr-2 h-4 w-4" />
            Current Streak: 5 days
          </Button>
        </div>
        
        <Tabs defaultValue="daily" className="mb-8">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="daily" className="flex items-center">
              <FaCalendarDay className="mr-2 h-4 w-4" />
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center">
              <FaCalendarWeek className="mr-2 h-4 w-4" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center">
              <FaCalendarAlt className="mr-2 h-4 w-4" />
              Monthly
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily">
            <h2 className="text-lg font-semibold mb-4">Daily Quests</h2>
            
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="mb-4">
                  <div className="p-4">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-2 w-full" />
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : dailyQuests.length > 0 ? (
              dailyQuests.map(quest => renderQuestCard(quest))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No daily quests available right now.</p>
                <p className="text-sm mt-1">Check back tomorrow for new quests!</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="weekly">
            <h2 className="text-lg font-semibold mb-4">Weekly Challenges</h2>
            
            {isLoading ? (
              Array(2).fill(0).map((_, i) => (
                <Card key={i} className="mb-4">
                  <div className="p-4">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-2 w-full" />
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : weeklyQuests.length > 0 ? (
              weeklyQuests.map(quest => renderQuestCard(quest))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No weekly challenges available right now.</p>
                <p className="text-sm mt-1">New challenges will be available soon!</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="monthly">
            <h2 className="text-lg font-semibold mb-4">Monthly Challenges</h2>
            
            {isLoading ? (
              Array(1).fill(0).map((_, i) => (
                <Card key={i} className="mb-4">
                  <div className="p-4">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-2 w-full" />
                      <div className="flex justify-between">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : monthlyQuests.length > 0 ? (
              monthlyQuests.map(quest => renderQuestCard(quest))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No monthly challenges available right now.</p>
                <p className="text-sm mt-1">Check back next month for epic challenges!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <Card className="p-6 bg-primary text-white">
          <h3 className="font-semibold mb-2">Quest Rewards</h3>
          <p className="text-sm opacity-90 mb-4">
            Complete quests to earn XP, coins, and unlock special achievements and items for your character!
          </p>
          <Button variant="secondary" className="w-full">View Rewards Store</Button>
        </Card>
      </div>
    </MainLayout>
  );
} 