'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaTrophy, FaLock, FaMedal, FaSearch, FaFilter } from 'react-icons/fa';
import { MainLayout } from '@/components/layouts/main-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

// Define the achievement types
interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'fitness' | 'nutrition' | 'sleep' | 'mindfulness' | 'streaks' | 'general';
  iconUrl: string;
  unlockedAt?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

type FilterCategory = 'all' | 'fitness' | 'nutrition' | 'sleep' | 'mindfulness' | 'streaks' | 'general';
type FilterRarity = 'all' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export default function AchievementsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');
  const [rarityFilter, setRarityFilter] = useState<FilterRarity>('all');
  
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockAchievements: Achievement[] = [
          {
            id: 'achievement-1',
            name: 'First Steps',
            description: 'Complete your first habit tracking',
            category: 'general',
            iconUrl: '/icons/first-steps.svg',
            unlockedAt: '2023-05-01T10:15:00Z',
            rarity: 'common',
          },
          {
            id: 'achievement-2',
            name: 'Early Bird',
            description: 'Complete a morning habit before 8 AM for 5 consecutive days',
            category: 'streaks',
            iconUrl: '/icons/early-bird.svg',
            unlockedAt: '2023-05-10T07:30:00Z',
            rarity: 'uncommon',
          },
          {
            id: 'achievement-3',
            name: 'Mindfulness Beginner',
            description: 'Meditate for 10 consecutive days',
            category: 'mindfulness',
            iconUrl: '/icons/mindfulness.svg',
            unlockedAt: '2023-05-20T18:45:00Z',
            rarity: 'uncommon',
          },
          {
            id: 'achievement-4',
            name: 'Workout Warrior',
            description: 'Complete 20 workout sessions',
            category: 'fitness',
            iconUrl: '/icons/workout.svg',
            unlockedAt: '2023-06-05T16:20:00Z',
            rarity: 'rare',
          },
          {
            id: 'achievement-5',
            name: 'Sleep Master',
            description: 'Maintain a healthy sleep schedule for 2 weeks',
            category: 'sleep',
            iconUrl: '/icons/sleep.svg',
            rarity: 'rare',
          },
          {
            id: 'achievement-6',
            name: 'Nutrition Expert',
            description: 'Log balanced meals for 30 days',
            category: 'nutrition',
            iconUrl: '/icons/nutrition.svg',
            rarity: 'epic',
          },
          {
            id: 'achievement-7',
            name: '30-Day Champion',
            description: 'Maintain a 30-day streak on any habit',
            category: 'streaks',
            iconUrl: '/icons/streak.svg',
            rarity: 'epic',
          },
          {
            id: 'achievement-8',
            name: 'Wellness Guru',
            description: 'Achieve perfect balance across all health categories for 1 month',
            category: 'general',
            iconUrl: '/icons/guru.svg',
            rarity: 'legendary',
          },
        ];
        
        setAchievements(mockAchievements);
      } catch (error) {
        console.error('Failed to fetch achievements', error);
        toast({
          title: 'Error',
          description: 'Failed to load achievements',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAchievements();
  }, [toast]);
  
  // Apply filters and search
  const filteredAchievements = achievements.filter(achievement => {
    const matchesCategory = categoryFilter === 'all' || achievement.category === categoryFilter;
    const matchesRarity = rarityFilter === 'all' || achievement.rarity === rarityFilter;
    const matchesSearch = achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesRarity && matchesSearch;
  });
  
  // Split into unlocked and locked achievements
  const unlockedAchievements = filteredAchievements.filter(a => a.unlockedAt);
  const lockedAchievements = filteredAchievements.filter(a => !a.unlockedAt);
  
  // Get color based on rarity
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800';
      case 'uncommon':
        return 'bg-green-100 text-green-800';
      case 'rare':
        return 'bg-blue-100 text-blue-800';
      case 'epic':
        return 'bg-purple-100 text-purple-800';
      case 'legendary':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Achievement card component
  const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
    const isLocked = !achievement.unlockedAt;
    
    return (
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <Card className={`relative overflow-hidden ${isLocked ? 'bg-muted/50' : 'bg-card'}`}>
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="rounded-full bg-muted p-2">
                <FaLock className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          )}
          
          <div className="p-4">
            <div className="flex items-center mb-2">
              <div className="mr-3 p-2 rounded-full bg-primary/10">
                <img src={achievement.iconUrl} alt={achievement.name} className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{achievement.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getRarityColor(achievement.rarity)}`}>
                  {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                </span>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mb-3">
              {achievement.description}
            </p>
            
            {achievement.unlockedAt && (
              <div className="text-xs text-muted-foreground">
                <FaTrophy className="inline-block mr-1 text-amber-500" />
                Unlocked: {format(new Date(achievement.unlockedAt), 'MMM d, yyyy')}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <MainLayout>
      <div className="container max-w-lg mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Achievements</h1>
          <div className="flex items-center space-x-1 text-muted-foreground text-sm">
            <FaMedal className="h-4 w-4 text-amber-500" />
            <span>{unlockedAchievements.length}/{achievements.length} Unlocked</span>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-6 space-y-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search achievements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setRarityFilter('all');
              }}
              disabled={searchQuery === '' && categoryFilter === 'all' && rarityFilter === 'all'}
            >
              Clear
            </Button>
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
                  <FaFilter className="mr-2 h-4 w-4" />
                  {categoryFilter === 'all' ? 'All Categories' : (
                    categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuRadioGroup value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as FilterCategory)}>
                  <DropdownMenuRadioItem value="all">All Categories</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="fitness">Fitness</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="nutrition">Nutrition</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="sleep">Sleep</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="mindfulness">Mindfulness</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="streaks">Streaks</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="general">General</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
                  <FaMedal className="mr-2 h-4 w-4" />
                  {rarityFilter === 'all' ? 'All Rarities' : (
                    rarityFilter.charAt(0).toUpperCase() + rarityFilter.slice(1)
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuRadioGroup value={rarityFilter} onValueChange={(value) => setRarityFilter(value as FilterRarity)}>
                  <DropdownMenuRadioItem value="all">All Rarities</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="common">Common</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="uncommon">Uncommon</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="rare">Rare</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="epic">Epic</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="legendary">Legendary</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Achievements Tabs */}
        <Tabs defaultValue="unlocked" className="mb-8">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="unlocked" className="flex items-center">
              <FaTrophy className="mr-2 h-4 w-4" />
              Unlocked ({unlockedAchievements.length})
            </TabsTrigger>
            <TabsTrigger value="locked" className="flex items-center">
              <FaLock className="mr-2 h-4 w-4" />
              Locked ({lockedAchievements.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="unlocked">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array(4).fill(0).map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-center mb-3">
                      <Skeleton className="h-12 w-12 rounded-full mr-3" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-3/4" />
                  </Card>
                ))}
              </div>
            ) : unlockedAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unlockedAchievements.map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No unlocked achievements match your filters.</p>
                <p className="text-sm mt-1">Try different search terms or filters.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="locked">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array(4).fill(0).map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-center mb-3">
                      <Skeleton className="h-12 w-12 rounded-full mr-3" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-3/4" />
                  </Card>
                ))}
              </div>
            ) : lockedAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lockedAchievements.map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No locked achievements match your filters.</p>
                <p className="text-sm mt-1">Try different search terms or filters.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Achievement Progress Info */}
        <Card className="p-6 bg-primary text-white">
          <h3 className="font-semibold mb-2">Your Progress</h3>
          <p className="text-sm opacity-90 mb-4">
            You've unlocked {unlockedAchievements.length} out of {achievements.length} achievements. Keep up the good work to unlock more rare and legendary achievements!
          </p>
          <Button variant="secondary" className="w-full" onClick={() => router.push('/character')}>
            View Your Character
          </Button>
        </Card>
      </div>
    </MainLayout>
  );
} 