'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaTrophy, FaMedal, FaFire, FaRunning, FaApple, FaBed, FaBrain, FaCalendarAlt } from 'react-icons/fa';
import { MainLayout } from '@/components/layouts/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarUrl?: string;
  level: number;
  score: number;
  rank: number;
  streak?: number;
  isCurrentUser?: boolean;
}

type LeaderboardCategory = 'overall' | 'fitness' | 'nutrition' | 'sleep' | 'mindfulness' | 'streaks';
type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time';

export default function LeaderboardsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<LeaderboardCategory>('overall');
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly');
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setIsLoading(true);
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock leaderboard data
        const mockLeaderboard: LeaderboardEntry[] = [
          {
            userId: 'user-1',
            name: 'Alex Johnson',
            avatarUrl: '/avatars/alex.jpg',
            level: 15,
            score: 2450,
            rank: 1,
            streak: 21,
          },
          {
            userId: 'user-2',
            name: 'Sarah Miller',
            avatarUrl: '/avatars/sarah.jpg',
            level: 12,
            score: 2100,
            rank: 2,
            streak: 14,
          },
          {
            userId: 'user-3',
            name: 'Michael Thompson',
            avatarUrl: '/avatars/michael.jpg',
            level: 14,
            score: 1950,
            rank: 3,
            streak: 10,
          },
          {
            userId: 'current-user',
            name: 'You',
            avatarUrl: '/avatars/you.jpg',
            level: 7,
            score: 1250,
            rank: 4,
            streak: 5,
            isCurrentUser: true,
          },
          {
            userId: 'user-4',
            name: 'Emma Wilson',
            avatarUrl: '/avatars/emma.jpg',
            level: 9,
            score: 1100,
            rank: 5,
            streak: 7,
          },
          {
            userId: 'user-5',
            name: 'David Brown',
            avatarUrl: '/avatars/david.jpg',
            level: 6,
            score: 950,
            rank: 6,
            streak: 3,
          },
          {
            userId: 'user-6',
            name: 'Olivia Davis',
            avatarUrl: '/avatars/olivia.jpg',
            level: 5,
            score: 800,
            rank: 7,
            streak: 2,
          },
        ];
        
        setLeaderboardData(mockLeaderboard);
        
        // Find current user's rank
        const currentUser = mockLeaderboard.find(entry => entry.isCurrentUser);
        if (currentUser) {
          setCurrentUserRank(currentUser.rank);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard data', error);
        toast({
          title: 'Error',
          description: 'Failed to load leaderboard data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboardData();
  }, [toast, category, period]);
  
  // Function to get category icon
  const getCategoryIcon = (categoryName: LeaderboardCategory) => {
    switch(categoryName) {
      case 'fitness':
        return <FaRunning className="text-green-500" />;
      case 'nutrition':
        return <FaApple className="text-red-500" />;
      case 'sleep':
        return <FaBed className="text-blue-500" />;
      case 'mindfulness':
        return <FaBrain className="text-purple-500" />;
      case 'streaks':
        return <FaFire className="text-amber-500" />;
      default:
        return <FaTrophy className="text-primary" />;
    }
  };
  
  // Function to get category display name
  const getCategoryDisplayName = (categoryName: LeaderboardCategory) => {
    switch(categoryName) {
      case 'overall':
        return 'Overall';
      case 'fitness':
        return 'Fitness';
      case 'nutrition':
        return 'Nutrition';
      case 'sleep':
        return 'Sleep';
      case 'mindfulness':
        return 'Mindfulness';
      case 'streaks':
        return 'Streaks';
      default:
        return 'Overall';
    }
  };
  
  // Function to get period display name
  const getPeriodDisplayName = (periodName: LeaderboardPeriod) => {
    switch(periodName) {
      case 'daily':
        return 'Today';
      case 'weekly':
        return 'This Week';
      case 'monthly':
        return 'This Month';
      case 'all_time':
        return 'All Time';
      default:
        return 'This Week';
    }
  };
  
  // Function to render medal for top 3
  const renderRankMedal = (rank: number) => {
    if (rank === 1) {
      return <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
        <FaMedal className="h-5 w-5" />
      </div>;
    } else if (rank === 2) {
      return <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
        <FaMedal className="h-5 w-5" />
      </div>;
    } else if (rank === 3) {
      return <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-700">
        <FaMedal className="h-5 w-5" />
      </div>;
    } else {
      return <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium">
        {rank}
      </div>;
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-lg mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Leaderboards</h1>
          {currentUserRank && (
            <div className="flex items-center space-x-1 text-primary text-sm">
              <FaTrophy className="h-4 w-4" />
              <span>Your Rank: {currentUserRank}</span>
            </div>
          )}
        </div>
        
        {/* Category and Time Period Filters */}
        <div className="flex gap-2 mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1">
                {getCategoryIcon(category)}
                <span className="ml-2">{getCategoryDisplayName(category)}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuRadioGroup value={category} onValueChange={(value) => setCategory(value as LeaderboardCategory)}>
                <DropdownMenuRadioItem value="overall">
                  <FaTrophy className="mr-2 h-4 w-4 text-primary" />
                  Overall
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="fitness">
                  <FaRunning className="mr-2 h-4 w-4 text-green-500" />
                  Fitness
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="nutrition">
                  <FaApple className="mr-2 h-4 w-4 text-red-500" />
                  Nutrition
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="sleep">
                  <FaBed className="mr-2 h-4 w-4 text-blue-500" />
                  Sleep
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="mindfulness">
                  <FaBrain className="mr-2 h-4 w-4 text-purple-500" />
                  Mindfulness
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="streaks">
                  <FaFire className="mr-2 h-4 w-4 text-amber-500" />
                  Streaks
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1">
                <FaCalendarAlt className="mr-2 h-4 w-4" />
                {getPeriodDisplayName(period)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuRadioGroup value={period} onValueChange={(value) => setPeriod(value as LeaderboardPeriod)}>
                <DropdownMenuRadioItem value="daily">Today</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="weekly">This Week</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="monthly">This Month</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="all_time">All Time</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Leaderboard */}
        <Card className="overflow-hidden mb-6">
          <div className="p-4 bg-primary text-white flex items-center space-x-2">
            {getCategoryIcon(category)}
            <h2 className="font-semibold">{getCategoryDisplayName(category)} Leaderboard - {getPeriodDisplayName(period)}</h2>
          </div>
          
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y">
              {leaderboardData.map((entry) => (
                <div 
                  key={entry.userId} 
                  className={`p-4 flex items-center justify-between ${
                    entry.isCurrentUser ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {renderRankMedal(entry.rank)}
                    
                    <Avatar
                      src={entry.avatarUrl}
                      alt={entry.name}
                      className="h-12 w-12"
                    />
                    
                    <div>
                      <h3 className={`font-medium ${entry.isCurrentUser ? 'text-primary' : ''}`}>
                        {entry.name} {entry.isCurrentUser && '(You)'}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>Level {entry.level}</span>
                        {entry.streak && (
                          <>
                            <span>•</span>
                            <span className="flex items-center">
                              <FaFire className="mr-1 h-3 w-3 text-amber-500" />
                              {entry.streak} days
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xl font-semibold">
                    {entry.score}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        
        {/* Bottom CTA */}
        <Button 
          variant="outline" 
          className="w-full mb-4"
          onClick={() => router.push('/social/friends')}
        >
          <FaUserPlus className="mr-2 h-4 w-4" />
          Find Friends
        </Button>
        
        <Card className="p-6 bg-primary text-white">
          <h3 className="font-semibold mb-2">Join Team Challenges</h3>
          <p className="text-sm opacity-90 mb-4">
            Team up with friends to compete in group challenges and climb the leaderboards together!
          </p>
          <Button variant="secondary" className="w-full" onClick={() => router.push('/social/teams')}>
            Browse Team Challenges
          </Button>
        </Card>
      </div>
    </MainLayout>
  );
} 