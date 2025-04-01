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
      
      // Create new entry object
      const entry: SleepEntry = {
        id: `sleep-${newEntry.date}`,
        date: newEntry.date,
        bedTime: newEntry.bedTime,
        wakeTime: newEntry.wakeTime,
        duration,
        quality: newEntry.quality || 7,
        interruptions: newEntry.interruptions || 0,
        notes: newEntry.notes
      };
      
      // Add new entry to sleepEntries
      setSleepEntries(prev => [...prev, entry]);
      
      // Show success toast
      toast({
        title: 'Sleep entry added',
        description: `You slept for ${duration.toFixed(1)} hours with quality ${entry.quality}/10.`,
      });
      
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
      
      // Set selected date to new entry date
      setSelectedDate(parseISO(newEntry.date));
    } catch (error) {
      console.error('Failed to add sleep entry', error);
      toast({
        title: 'Error',
        description: 'Failed to add sleep entry',
        variant: 'destructive',
      });
    }
  };

  // Get trend label text and color
  const getTrendInfo = (trend: string) => {
    switch(trend) {
      case 'improving':
        return { text: 'Improving', color: 'text-green-500' };
      case 'declining':
        return { text: 'Declining', color: 'text-red-500' };
      default:
        return { text: 'Stable', color: 'text-blue-500' };
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/trackers')}
              className="mr-2"
            >
              <FaChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Sleep Tracker</h1>
          </div>
          
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowAddDialog(true)}
          >
            <FaPlus className="mr-2 h-3.5 w-3.5" />
            Log Sleep
          </Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <>
            {/* Overview Stats */}
            <Card className="p-4 mb-6">
              <h2 className="text-lg font-semibold mb-3">Sleep Overview</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {sleepStats?.averageDuration || 0}h
                  </div>
                  <div className="text-xs text-muted-foreground">Avg. Duration</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-500 mb-1">
                    {sleepStats?.averageQuality.toFixed(1) || 0}/10
                  </div>
                  <div className="text-xs text-muted-foreground">Avg. Quality</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-1 ${sleepStats ? getTrendInfo(sleepStats.trend).color : ''}`}>
                    {sleepStats ? getTrendInfo(sleepStats.trend).text : 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground">Trend</div>
                </div>
              </div>
              
              <div className="text-sm">
                <span className="font-medium">Best sleep:</span> {sleepStats?.bestDay.date ? (
                  <span>
                    {format(parseISO(sleepStats.bestDay.date), 'MMM d')} - {sleepStats.bestDay.duration}h 
                    with quality {sleepStats.bestDay.quality}/10
                  </span>
                ) : 'No data'}
              </div>
            </Card>
            
            {/* Sleep Trends Chart */}
            <Card className="p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Sleep Trends</h2>
                <Badge variant="outline" className="bg-primary/10">Last 14 days</Badge>
              </div>
              
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                      domain={[0, 12]}
                      tickFormatter={(value) => `${value}h`}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'hours') return [`${value.toFixed(1)}h`, 'Duration'];
                        if (name === 'quality') return [`${(value / value * 10).toFixed(1)}/10`, 'Quality'];
                        return [value, name];
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      stroke="#4E67EB"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="quality"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      stroke-dasharray="5 5"
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-primary mr-2" />
                  <span>Sleep Duration</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-amber-500 mr-2" />
                  <span>Sleep Quality</span>
                </div>
              </div>
            </Card>
            
            {/* Daily Sleep Detail */}
            <Card className="mb-6">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center mb-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={goToPreviousDay}
                  >
                    <FaChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <h2 className="text-lg font-semibold">
                    {format(selectedDate, 'EEEE, MMMM d')}
                  </h2>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={goToNextDay}
                    disabled={selectedDate >= new Date()}
                  >
                    <FaChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                {selectedEntry ? (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <FaMoon className="text-blue-600 h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Bedtime</div>
                        <div className="font-semibold">{selectedEntry.bedTime}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                        <FaSun className="text-amber-600 h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Wake time</div>
                        <div className="font-semibold">{selectedEntry.wakeTime}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <FaClock className="text-green-600 h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Duration</div>
                        <div className="font-semibold">{selectedEntry.duration} hours</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <FaChartLine className="text-purple-600 h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Quality</div>
                        <div className="font-semibold">{selectedEntry.quality}/10</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No sleep data recorded for this date.</p>
                    <Button className="mt-3" onClick={() => {
                      setNewEntry(prev => ({ ...prev, date: format(selectedDate, 'yyyy-MM-dd') }));
                      setShowAddDialog(true);
                    }}>
                      <FaPlus className="mr-2 h-4 w-4" />
                      Add Sleep Entry
                    </Button>
                  </div>
                )}
              </div>
              
              {selectedEntry && (
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-sm font-medium mb-1">Quality Rating</h3>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${selectedEntry.quality * 10}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Interruptions</h3>
                      <div className="flex items-center">
                        {selectedEntry.interruptions === 0 ? (
                          <Badge className="bg-green-100 text-green-800 border-none">
                            None
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800 border-none">
                            {selectedEntry.interruptions} time{selectedEntry.interruptions !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-1">Compared to average</h3>
                      <div className="flex items-center">
                        {selectedEntry.duration > (sleepStats?.averageDuration || 0) ? (
                          <Badge className="bg-green-100 text-green-800 border-none">
                            +{(selectedEntry.duration - (sleepStats?.averageDuration || 0)).toFixed(1)}h
                          </Badge>
                        ) : selectedEntry.duration < (sleepStats?.averageDuration || 0) ? (
                          <Badge className="bg-red-100 text-red-800 border-none">
                            -{((sleepStats?.averageDuration || 0) - selectedEntry.duration).toFixed(1)}h
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800 border-none">
                            Same as average
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {selectedEntry.notes && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Notes</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedEntry.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
            
            <Card className="p-6 bg-primary text-white">
              <h3 className="font-semibold mb-2">Sleep Tips</h3>
              <p className="text-sm opacity-90 mb-4">
                Based on your sleep patterns, maintaining a consistent sleep schedule could 
                improve your sleep quality. Aim for 7-8 hours each night.
              </p>
              <Button variant="secondary" className="w-full" onClick={() => router.push('/trackers/sleep/tips')}>
                View All Sleep Tips
              </Button>
            </Card>
          </>
        )}
        
        {/* Add Sleep Entry Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Log Sleep</DialogTitle>
              <DialogDescription>
                Record your sleep details for better tracking and insights.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="date" className="mb-1 block">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  max={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bedTime" className="mb-1 block">Bed Time</Label>
                  <Input
                    id="bedTime"
                    type="time"
                    value={newEntry.bedTime}
                    onChange={(e) => setNewEntry({ ...newEntry, bedTime: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="wakeTime" className="mb-1 block">Wake Time</Label>
                  <Input
                    id="wakeTime"
                    type="time"
                    value={newEntry.wakeTime}
                    onChange={(e) => setNewEntry({ ...newEntry, wakeTime: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label htmlFor="quality">Sleep Quality (1-10)</Label>
                  <span className="text-sm text-muted-foreground">{newEntry.quality}/10</span>
                </div>
                <Slider
                  id="quality"
                  min={1}
                  max={10}
                  step={1}
                  value={[newEntry.quality || 7]}
                  onValueChange={(value) => setNewEntry({ ...newEntry, quality: value[0] })}
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label htmlFor="interruptions">Interruptions</Label>
                  <span className="text-sm text-muted-foreground">
                    {newEntry.interruptions} time{newEntry.interruptions !== 1 ? 's' : ''}
                  </span>
                </div>
                <Slider
                  id="interruptions"
                  min={0}
                  max={10}
                  step={1}
                  value={[newEntry.interruptions || 0]}
                  onValueChange={(value) => setNewEntry({ ...newEntry, interruptions: value[0] })}
                />
              </div>
              
              <div>
                <Label htmlFor="notes" className="mb-1 block">Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="How did you feel when you woke up?"
                  value={newEntry.notes || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                />
              </div>
              
              <div className="py-2 border-t border-b flex items-center">
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Sleep Duration</div>
                  <div className="text-lg font-bold">
                    {newEntry.bedTime && newEntry.wakeTime
                      ? computeDuration(newEntry.bedTime, newEntry.wakeTime).toFixed(1)
                      : '-'} hours
                  </div>
                </div>
                
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaBed className="text-blue-600 h-6 w-6" />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEntry}>
                Save Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
} 