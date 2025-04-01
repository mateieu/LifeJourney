'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, subDays, addDays, parseISO, isValid } from 'date-fns';
import { 
  FaBed, 
  FaMoon, 
  FaSun, 
  FaClock, 
  FaChartLine, 
  FaPlus, 
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaCheck
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MainLayout } from '@/components/layouts/main-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface SleepEntry {
  id: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  duration: number; // in hours
  quality: number; // 1-10 scale
  interruptions: number;
  notes?: string;
}

interface SleepStats {
  averageDuration: number;
  averageQuality: number;
  bestDay: {
    date: string;
    duration: number;
    quality: number;
  };
  trend: 'improving' | 'declining' | 'stable';
}

export default function SleepTrackerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [sleepStats, setSleepStats] = useState<SleepStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Form state for adding new entry
  const [newEntry, setNewEntry] = useState<Partial<SleepEntry>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    bedTime: '22:30',
    wakeTime: '06:30',
    quality: 7,
    interruptions: 1,
    notes: '',
  });
  
  // Compute duration from bed time and wake time
  const computeDuration = (bedTime: string, wakeTime: string): number => {
    try {
      const [bedHours, bedMinutes] = bedTime.split(':').map(Number);
      const [wakeHours, wakeMinutes] = wakeTime.split(':').map(Number);
      
      let duration = wakeHours - bedHours;
      if (duration < 0) duration += 24; // Handle overnight sleep
      
      // Add minutes contribution
      duration += (wakeMinutes - bedMinutes) / 60;
      
      return parseFloat(duration.toFixed(1));
    } catch (e) {
      return 0;
    }
  };
  
  // Update duration when bed or wake time changes
  useEffect(() => {
    if (newEntry.bedTime && newEntry.wakeTime) {
      setNewEntry(prev => ({
        ...prev,
        duration: computeDuration(prev.bedTime!, prev.wakeTime!)
      }));
    }
  }, [newEntry.bedTime, newEntry.wakeTime]);
  
  useEffect(() => {
    const fetchSleepData = async () => {
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock data for the last 14 days
        const today = new Date();
        const mockEntries: SleepEntry[] = [];
        
        for (let i = 13; i >= 0; i--) {
          const entryDate = subDays(today, i);
          const dateStr = format(entryDate, 'yyyy-MM-dd');
          
          // Generate realistic sleep data with some randomness
          const baseQuality = 7; // Base quality
          const qualityVariation = Math.random() * 4 - 2; // -2 to 2
          const quality = Math.min(10, Math.max(1, Math.round(baseQuality + qualityVariation)));
          
          const baseDuration = 7.5; // Base duration in hours
          const durationVariation = Math.random() * 2 - 1; // -1 to 1
          const duration = parseFloat((baseDuration + durationVariation).toFixed(1));
          
          // Generate realistic bed and wake times
          const baseBedHour = 22; // 10 PM
          const baseBedMinute = 30;
          const bedTimeVariation = Math.floor(Math.random() * 60) - 30; // -30 to 30 minutes
          
          const bedMinute = (baseBedMinute + bedTimeVariation + 60) % 60;
          const bedHour = ((baseBedHour + Math.floor((baseBedMinute + bedTimeVariation) / 60)) + 24) % 24;
          
          const bedTime = `${bedHour.toString().padStart(2, '0')}:${bedMinute.toString().padStart(2, '0')}`;
          
          // Calculate wake time based on duration
          const bedTimeTotal = bedHour * 60 + bedMinute;
          const durationMinutes = duration * 60;
          const wakeTimeTotal = (bedTimeTotal + durationMinutes) % (24 * 60);
          
          const wakeHour = Math.floor(wakeTimeTotal / 60);
          const wakeMinute = Math.floor(wakeTimeTotal % 60);
          
          const wakeTime = `${wakeHour.toString().padStart(2, '0')}:${wakeMinute.toString().padStart(2, '0')}`;
          
          mockEntries.push({
            id: `sleep-${dateStr}`,
            date: dateStr,
            bedTime,
            wakeTime,
            duration,
            quality,
            interruptions: Math.floor(Math.random() * 3),
            notes: Math.random() > 0.7 ? 'Slept well, woke up refreshed.' : undefined
          });
        }
        
        setSleepEntries(mockEntries);
        
        // Calculate statistics
        const durations = mockEntries.map(entry => entry.duration);
        const qualities = mockEntries.map(entry => entry.quality);
        
        const averageDuration = durations.reduce((sum, val) => sum + val, 0) / durations.length;
        const averageQuality = qualities.reduce((sum, val) => sum + val, 0) / qualities.length;
        
        // Find best day (highest combination of duration and quality)
        const bestEntry = mockEntries.reduce((best, current) => {
          const bestScore = best.duration * 0.6 + best.quality * 0.4;
          const currentScore = current.duration * 0.6 + current.quality * 0.4;
          return currentScore > bestScore ? current : best;
        }, mockEntries[0]);
        
        // Calculate trend based on last 7 days vs previous 7 days
        const recentDurations = durations.slice(7).reduce((sum, val) => sum + val, 0) / 7;
        const previousDurations = durations.slice(0, 7).reduce((sum, val) => sum + val, 0) / 7;
        
        const trend = 
          recentDurations > previousDurations + 0.3 ? 'improving' :
          recentDurations < previousDurations - 0.3 ? 'declining' : 'stable';
        
        setSleepStats({
          averageDuration: parseFloat(averageDuration.toFixed(1)),
          averageQuality: parseFloat(averageQuality.toFixed(1)),
          bestDay: {
            date: bestEntry.date,
            duration: bestEntry.duration,
            quality: bestEntry.quality
          },
          trend
        });
      } catch (error) {
        console.error('Failed to fetch sleep data', error);
        toast({
          title: 'Error',
          description: 'Failed to load sleep tracking data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSleepData();
  }, [toast]);
  
  // Get entry for selected date
  const selectedEntry = sleepEntries.find(entry => entry.date === format(selectedDate, 'yyyy-MM-dd'));
  
  // Prepare data for chart
  const chartData = sleepEntries.map(entry => ({
    date: format(parseISO(entry.date), 'MMM dd'),
    hours: entry.duration,
    quality: entry.quality / 10 * entry.duration, // Scale quality to match hours for visualization
  }));
  
  // Handle date navigation
  const goToPreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };
  
  const goToNextDay = () => {
    const tomorrow = addDays(new Date(), 1);
    if (selectedDate < tomorrow) {
      setSelectedDate(prev => addDays(prev, 1));
    }
  };
  
  // Handle new entry submission
  const handleAddEntry = async () => {
    try {
      // Validate form
      if (!newEntry.bedTime || !newEntry.wakeTime || !newEntry.date) {
        toast({
          title: 'Missing information',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }
      
      // Calculate duration
      const duration = computeDuration(newEntry.bedTime, newEntry.wakeTime);
      
      // Add new entry to sleepEntries
      setSleepEntries(prev => [...prev, { ...newEntry, duration, id: `sleep-${newEntry.date}` }]);
      
      // Close dialog
      setShowAddDialog(false);
      
      // Reset form
      setNewEntry({
        date: format(new Date(), 'yyyy-MM-dd'),
        bedTime: '22:30',
        wakeTime: '06:30',
        quality: 7,
        interruptions: 1,
        notes: '',
      });
    } catch (error) {
      console.error('Failed to add sleep entry', error);
      toast({
        title: 'Error',
        description: 'Failed to add sleep entry',
        variant: 'destructive',
      });
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-lg mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Store</h1>
          <div className="flex items-center text-amber-500">
            <FaCoins className="mr-2 h-5 w-5" />
            <span className="text-lg font-bold">{userCoins}</span>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-shrink-0">
                  <FaFilter className="mr-2 h-4 w-4" />
                  {getCategoryDisplayName(categoryFilter)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuRadioGroup value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as ItemCategory)}>
                  <DropdownMenuRadioItem value="all">All Categories</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="head">Head</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="body">Body</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="legs">Legs</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="feet">Feet</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="accessory">Accessories</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="weapon">Weapons</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="power_up">Power-Ups</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-shrink-0">
                  <FaCrown className="mr-2 h-4 w-4" />
                  {rarityFilter === 'all' ? 'All Rarities' : rarityFilter.charAt(0).toUpperCase() + rarityFilter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuRadioGroup value={rarityFilter} onValueChange={(value) => setRarityFilter(value as ItemRarity)}>
                  <DropdownMenuRadioItem value="all">All Rarities</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="common">Common</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="uncommon">Uncommon</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="rare">Rare</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="epic">Epic</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="legendary">Legendary</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-shrink-0">
                  <FaTag className="mr-2 h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuRadioGroup value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                  <DropdownMenuRadioItem value="rarity">By Rarity</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="price_asc">Price: Low to High</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="price_desc">Price: High to Low</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name_asc">Name: A to Z</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name_desc">Name: Z to A</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Store Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-32 w-full mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-full mb-3" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredAndSortedItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <FaShoppingCart className="mx-auto h-10 w-10 mb-3 text-muted-foreground/50" />
            <p className="mb-1">No items match your search criteria.</p>
            <p className="text-sm">Try adjusting your filters or search term.</p>
          </div>
        )}
        
        {/* Item Purchase Dialog */}
        {selectedItem && (
          <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex justify-between items-center">
                  <span>{selectedItem.name}</span>
                  <Badge variant="outline" className={getRarityColor(selectedItem.rarity)}>
                    {selectedItem.rarity.charAt(0).toUpperCase() + selectedItem.rarity.slice(1)}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  {selectedItem.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex justify-center my-2">
                <div className="w-48 h-48 bg-gray-100 rounded-md flex items-center justify-center">
                  <img 
                    src={selectedItem.imageUrl} 
                    alt={selectedItem.name}
                    className="object-contain h-36 w-36"
                  />
                </div>
              </div>
              
              {selectedItem.benefits && selectedItem.benefits.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Benefits:</h4>
                  <ul className="space-y-1 text-sm">
                    {selectedItem.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="py-2 border-y flex items-center justify-between">
                <div className="flex items-center">
                  <FaCoins className="text-amber-500 mr-2 h-5 w-5" />
                  <span className="text-xl font-bold">{selectedItem.price}</span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Your balance: {userCoins} coins
                </div>
              </div>
              
              <DialogFooter className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedItem(null)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePurchase}
                  disabled={userCoins < selectedItem.price || isPurchasing}
                >
                  {isPurchasing ? 'Processing...' : 'Purchase'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Bottom Banner */}
        <Card className="p-6 bg-primary text-white mt-8">
          <h3 className="font-semibold mb-2">Earn More Coins</h3>
          <p className="text-sm opacity-90 mb-4">
            Complete quests, maintain streaks, and achieve your goals to earn more coins for exclusive items!
          </p>
          <Button variant="secondary" className="w-full" onClick={() => router.push('/quests')}>
            View Available Quests
          </Button>
        </Card>
      </div>
    </MainLayout>
  );
}