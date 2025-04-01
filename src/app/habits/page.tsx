'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FaPlus, 
  FaFilter, 
  FaRunning, 
  FaApple, 
  FaBed, 
  FaBrain,
  FaChartLine
} from 'react-icons/fa';
import { MainLayout } from '@/components/layouts/main-layout';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { HabitTracker } from '@/components/dashboard/habit-tracker';
import { useToast } from '@/hooks/use-toast';
import { Habit } from '@/types/api';

type FilterCategory = 'all' | 'fitness' | 'nutrition' | 'sleep' | 'mindfulness' | 'other';

export default function HabitsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const fetchHabits = async () => {
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockHabits: Habit[] = [
          {
            id: 'habit-1',
            userId: 'user123',
            name: 'Morning Run',
            description: 'Run at least 3km every morning before breakfast',
            category: 'fitness',
            frequency: 'daily',
            targetValue: 3,
            unit: 'km',
            startDate: '2023-05-01T00:00:00Z',
            active: true,
            createdAt: '2023-05-01T00:00:00Z',
            updatedAt: '2023-06-15T00:00:00Z',
          },
          {
            id: 'habit-2',
            userId: 'user123',
            name: 'Eat Vegetables',
            description: 'Include vegetables in at least 2 meals per day',
            category: 'nutrition',
            frequency: 'daily',
            targetValue: 2,
            unit: 'meals',
            startDate: '2023-05-05T00:00:00Z',
            active: true,
            createdAt: '2023-05-05T00:00:00Z',
            updatedAt: '2023-06-10T00:00:00Z',
          },
          {
            id: 'habit-3',
            userId: 'user123',
            name: 'Meditation',
            description: 'Practice mindfulness meditation',
            category: 'mindfulness',
            frequency: 'daily',
            targetValue: 10,
            unit: 'min',
            startDate: '2023-04-15T00:00:00Z',
            active: true,
            createdAt: '2023-04-15T00:00:00Z',
            updatedAt: '2023-06-01T00:00:00Z',
          },
          {
            id: 'habit-4',
            userId: 'user123',
            name: 'Sleep Tracking',
            description: 'Get 7-8 hours of quality sleep',
            category: 'sleep',
            frequency: 'daily',
            targetValue: 7.5,
            unit: 'hours',
            startDate: '2023-05-10T00:00:00Z',
            active: true,
            createdAt: '2023-05-10T00:00:00Z',
            updatedAt: '2023-06-05T00:00:00Z',
          },
          {
            id: 'habit-5',
            userId: 'user123',
            name: 'Read a Book',
            description: 'Read for personal development',
            category: 'other',
            frequency: 'daily',
            targetValue: 20,
            unit: 'min',
            startDate: '2023-03-01T00:00:00Z',
            active: false,
            createdAt: '2023-03-01T00:00:00Z',
            updatedAt: '2023-04-15T00:00:00Z',
          },
        ];
        
        // Add completed status randomly for demo
        const habitsWithStatus = mockHabits.map(habit => ({
          ...habit,
          completed: Math.random() > 0.5,
          progress: habit.active ? Math.floor(Math.random() * 100) : 0
        }));
        
        setHabits(habitsWithStatus);
      } catch (error) {
        console.error('Failed to fetch habits', error);
        toast({
          title: 'Error',
          description: 'Failed to load habits',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHabits();
  }, [toast]);
  
  // Filter habits by category and search query
  const filteredHabits = habits.filter(habit => {
    const matchesCategory = filter === 'all' || habit.category === filter;
    const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (habit.description && habit.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });
  
  const activeHabits = filteredHabits.filter(habit => habit.active);
  const inactiveHabits = filteredHabits.filter(habit => !habit.active);
  
  // Get icon based on category
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'fitness':
        return <FaRunning className="text-green-500" />;
      case 'nutrition':
        return <FaApple className="text-red-500" />;
      case 'sleep':
        return <FaBed className="text-blue-500" />;
      case 'mindfulness':
        return <FaBrain className="text-purple-500" />;
      default:
        return <FaChartLine className="text-gray-500" />;
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-lg mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Habits</h1>
          <Button onClick={() => router.push('/habits/new')}>
            <FaPlus className="mr-2 h-4 w-4" />
            Add Habit
          </Button>
        </div>
        
        {/* Search and Filter */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FaFilter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={filter} onValueChange={(value) => setFilter(value as FilterCategory)}>
                <DropdownMenuRadioItem value="all">All Categories</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="fitness">Fitness</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="nutrition">Nutrition</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="sleep">Sleep</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="mindfulness">Mindfulness</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="other">Other</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Tabs for Active/Inactive habits */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="active">Active Habits</TabsTrigger>
            <TabsTrigger value="inactive">Inactive Habits</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Loading habits...</p>
              </div>
            ) : activeHabits.length > 0 ? (
              <div className="space-y-3">
                {activeHabits.map(habit => (
                  <Link key={habit.id} href={`/habits/${habit.id}`} className="block">
                    <HabitTracker habit={habit} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No active habits found matching your criteria.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => router.push('/habits/new')}
                >
                  <FaPlus className="mr-2 h-4 w-4" />
                  Add Your First Habit
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="inactive">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Loading habits...</p>
              </div>
            ) : inactiveHabits.length > 0 ? (
              <div className="space-y-3">
                {inactiveHabits.map(habit => (
                  <Link key={habit.id} href={`/habits/${habit.id}`} className="block opacity-60 hover:opacity-100 transition-opacity">
                    <HabitTracker habit={habit} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No inactive habits found.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
} 