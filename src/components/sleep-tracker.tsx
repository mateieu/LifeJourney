"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from "recharts";
import { format, subDays, addDays, parseISO } from "date-fns";
import { Moon, Sun, Plus, ArrowLeft, ArrowRight, Clock, BedDouble, Star, AlertCircle, CalendarIcon, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type SleepEntry = {
  id: string;
  user_id: string;
  date: string; // Changed from sleep_date to match database schema
  sleep_time: string;
  wake_time: string;
  duration_minutes: number;
  quality: number;
  notes: string | null;
  created_at: string;
};

type SleepSummary = {
  averageDuration: number;
  averageQuality: number;
  totalEntries: number;
  bestDay: {
    date: string;
    duration: number;
    quality: number;
  } | null;
};

// Custom dot component to solve the type issues
const CustomDot = (props: any) => {
  const { cx, cy, payload, fill } = props;
  if (!payload || !payload.hasEntry) return null;
  return (
    <svg x={cx - 4} y={cy - 4} width={8} height={8} fill={fill} viewBox="0 0 8 8">
      <circle cx="4" cy="4" r="4" />
    </svg>
  );
};

// Update formatTimeInput function with better error handling
const formatTimeInput = (time24h: string): string => {
  if (!time24h) return '';
  
  try {
    const parts = time24h.split(':');
    if (parts.length !== 2) return time24h; // Return original if not in HH:MM format
    
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    
    if (isNaN(hours) || isNaN(minutes)) return time24h; // Return original if not numeric
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (e) {
    // Return the original value if any parsing error occurs
    return time24h;
  }
};

// Update parseTimeInput with better error handling as well
const parseTimeInput = (timeStr: string): string => {
  if (!timeStr) return '';
  
  // Check if already in 24h format
  if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (e) {
      return timeStr;
    }
  }
  
  try {
    // Split time and AM/PM
    const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/;
    const match = timeStr.match(timeRegex);
    
    if (!match) return timeStr; // Return original if no match
    
    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const period = match[3]?.toUpperCase() || '';
    
    if (isNaN(hours) || isNaN(minutes)) return timeStr; // Return original if not numeric
    
    // Convert to 24-hour format
    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (e) {
    return timeStr; // Return original on parse error
  }
};

// Now define the TimeInput component that uses those functions
const TimeInput = ({ value, onChange, placeholder }: { 
  value: string, 
  onChange: (value: string) => void, 
  placeholder?: string 
}) => {
  const [inputValue, setInputValue] = useState(value ? formatTimeInput(value) : '');
  
  // Update displayed value when the prop changes
  useEffect(() => {
    if (value) {
      setInputValue(formatTimeInput(value));
    }
  }, [value]);
  
  return (
    <div className="relative w-full">
      <Input
        value={inputValue}
        onChange={(e) => {
          const newValue = e.target.value;
          setInputValue(newValue);
          
          // Only update the parent state if we can successfully parse it
          try {
            const parsed = parseTimeInput(newValue);
            if (parsed && /^\d{1,2}:\d{2}$/.test(parsed)) {
              onChange(parsed);
            }
          } catch (e) {
            // Don't update if parsing fails
          }
        }}
        onBlur={() => {
          // On blur, reformat to ensure consistent display
          if (value) {
            setInputValue(formatTimeInput(value));
          }
        }}
        placeholder={placeholder}
        className="pr-16"
      />
      <div className="absolute inset-y-0 right-0 flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          type="button"
          onClick={() => {
            // Toggle between common sleep and wake times
            const newTime = value === '22:00' ? '06:00' : '22:00';
            onChange(newTime);
            setInputValue(formatTimeInput(newTime));
          }}
          className="h-full px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          24h
        </Button>
      </div>
    </div>
  );
};

export function SleepTracker() {
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const today = new Date();
    return subDays(today, 6); // Show last 7 days by default
  });
  const [summary, setSummary] = useState<SleepSummary>({
    averageDuration: 0,
    averageQuality: 0,
    totalEntries: 0,
    bestDay: null
  });
  
  // New entry form state
  const [newEntry, setNewEntry] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    sleepTime: '22:00',
    wakeTime: '06:00',
    quality: 3,
    notes: ''
  });
  
  const { toast } = useToast();
  
  useEffect(() => {
    fetchSleepEntries();
  }, [weekStart]);
  
  const fetchSleepEntries = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Get week end date
      const weekEnd = addDays(weekStart, 6);
      
      // Format dates for database query
      const startStr = format(weekStart, 'yyyy-MM-dd');
      const endStr = format(weekEnd, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('sleep_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startStr)
        .lte('date', endStr)
        .order('date', { ascending: false });
        
      if (error) throw error;
      
      setEntries(data || []);
      calculateSummary(data || []);
    } catch (error) {
      console.error('Error fetching sleep entries:', error);
      toast({
        title: 'Error loading sleep data',
        description: 'Could not load your sleep entries. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const calculateSummary = (entriesData: SleepEntry[]) => {
    if (entriesData.length === 0) {
      setSummary({
        averageDuration: 0,
        averageQuality: 0,
        totalEntries: 0,
        bestDay: null
      });
      return;
    }
    
    const totalDuration = entriesData.reduce((sum, entry) => sum + entry.duration_minutes, 0);
    const totalQuality = entriesData.reduce((sum, entry) => sum + entry.quality, 0);
    
    // Find best day (highest quality or duration if tie)
    const bestEntry = [...entriesData].sort((a, b) => {
      if (a.quality !== b.quality) {
        return b.quality - a.quality;
      }
      return b.duration_minutes - a.duration_minutes;
    })[0];
    
    setSummary({
      averageDuration: totalDuration / entriesData.length,
      averageQuality: totalQuality / entriesData.length,
      totalEntries: entriesData.length,
      bestDay: {
        date: bestEntry.date,
        duration: bestEntry.duration_minutes,
        quality: bestEntry.quality
      }
    });
  };
  
  const handleAddSleep = async () => {
    setSaving(true);
    try {
      if (!newEntry.date || !newEntry.sleepTime || !newEntry.wakeTime || !newEntry.quality) {
        toast({
          title: "Missing fields",
          description: "Please fill all required fields.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      // Calculate duration in minutes
      const [sleepHours, sleepMinutes] = newEntry.sleepTime.split(':').map(Number);
      const [wakeHours, wakeMinutes] = newEntry.wakeTime.split(':').map(Number);
      
      let sleepDate = new Date();
      sleepDate.setHours(sleepHours, sleepMinutes, 0, 0);
      
      let wakeDate = new Date();
      wakeDate.setHours(wakeHours, wakeMinutes, 0, 0);
      
      // If wake time is earlier than sleep time, assume it's the next day
      if (wakeDate < sleepDate) {
        wakeDate.setDate(wakeDate.getDate() + 1);
      }
      
      const durationMinutes = Math.round((wakeDate.getTime() - sleepDate.getTime()) / 60000);
      
      const supabase = createClient();
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from('sleep_entries')
        .insert({
          user_id: user.id,
          date: newEntry.date,
          sleep_time: newEntry.sleepTime,
          wake_time: newEntry.wakeTime,
          quality: newEntry.quality,
          duration_minutes: durationMinutes,
          notes: newEntry.notes || null
        })
        .select();
      
      if (error) throw error;
      
      // Reset form
      setNewEntry({
        date: format(new Date(), 'yyyy-MM-dd'),
        sleepTime: '22:00',
        wakeTime: '06:00',
        quality: 3,
        notes: ''
      });
      
      // Close dialog and refresh data
      setShowAddDialog(false);
      fetchSleepEntries();
      
      toast({
        title: "Sleep entry added",
        description: "Your sleep data has been saved successfully."
      });
    } catch (error) {
      console.error("Error adding sleep entry:", error);
      toast({
        title: "Error",
        description: "Failed to save sleep data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteEntry = async (id: string) => {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('sleep_entries')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Refresh entries
      fetchSleepEntries();
      
      toast({
        title: 'Entry deleted',
        description: 'Your sleep entry has been deleted.'
      });
    } catch (error) {
      console.error('Error deleting sleep entry:', error);
      toast({
        title: 'Error deleting entry',
        description: 'Could not delete your sleep entry. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handlePreviousWeek = () => {
    setWeekStart(date => subDays(date, 7));
  };
  
  const handleNextWeek = () => {
    const nextWeekStart = addDays(weekStart, 7);
    // Don't allow going into the future beyond current week
    if (nextWeekStart <= new Date()) {
      setWeekStart(nextWeekStart);
    }
  };
  
  // Format minutes as hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Get color based on sleep quality
  const getSleepQualityColor = (quality: number) => {
    if (quality >= 4) return 'text-green-500';
    if (quality >= 3) return 'text-blue-500';
    if (quality >= 2) return 'text-amber-500';
    return 'text-red-500';
  };
  
  // Get color based on sleep duration
  const getSleepDurationColor = (minutes: number) => {
    if (minutes >= 480) return 'text-green-500'; // 8+ hours
    if (minutes >= 420) return 'text-blue-500'; // 7+ hours
    if (minutes >= 360) return 'text-amber-500'; // 6+ hours
    return 'text-red-500'; // less than 6 hours
  };
  
  // Process data for charts
  const getChartData = () => {
    // Create 7 days of dates
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      return {
        date,
        dateStr: format(date, 'yyyy-MM-dd'),
        display: format(date, 'EEE dd'),
        shortDisplay: format(date, 'EEE'),
        duration: 0,
        quality: 0,
        hasEntry: false
      };
    });
    
    // Fill in sleep data
    entries.forEach(entry => {
      const dateIndex = dates.findIndex(d => d.dateStr === entry.date);
      if (dateIndex >= 0) {
        dates[dateIndex].duration = entry.duration_minutes / 60; // Convert to hours for chart
        dates[dateIndex].quality = entry.quality;
        dates[dateIndex].hasEntry = true;
      }
    });
    
    return dates;
  };
  
  const chartData = getChartData();
  
  const formatTime = (timeStr: string) => {
    // Format time based on 12-hour clock with AM/PM
    const date = new Date(`2000-01-01T${timeStr}`);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };
  
  // Add this function with your other utility functions
  const calculateDuration = (sleepTime: string, wakeTime: string): number => {
    if (!sleepTime || !wakeTime) return 0;
    
    try {
      const [sleepHours, sleepMinutes] = sleepTime.split(':').map(Number);
      const [wakeHours, wakeMinutes] = wakeTime.split(':').map(Number);
      
      let sleepDate = new Date();
      sleepDate.setHours(sleepHours, sleepMinutes, 0, 0);
      
      let wakeDate = new Date();
      wakeDate.setHours(wakeHours, wakeMinutes, 0, 0);
      
      // If wake time is earlier than sleep time, assume it's the next day
      if (wakeDate < sleepDate) {
        wakeDate.setDate(wakeDate.getDate() + 1);
      }
      
      return Math.round((wakeDate.getTime() - sleepDate.getTime()) / 60000);
    } catch (e) {
      return 0;
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sleep Tracker</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-sm font-medium px-2">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </div>
          
          <Button variant="outline" size="sm" onClick={handleNextWeek}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Log Sleep
          </Button>
        </div>
      </div>
      
      {/* Sleep Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Sleep Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className={cn(
                "text-2xl font-bold", 
                getSleepDurationColor(summary.averageDuration)
              )}>
                {formatDuration(summary.averageDuration)}
              </div>
              <div className="text-xs text-muted-foreground">
                {summary.totalEntries} entries this week
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sleep Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="text-2xl font-bold">
                {summary.averageQuality.toFixed(1)} / 5
              </div>
              <div className="flex mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star} 
                    className={cn(
                      "text-lg",
                      star <= Math.round(summary.averageQuality) 
                        ? "text-yellow-500" 
                        : "text-gray-300 dark:text-gray-600"
                    )}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best Sleep</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.bestDay ? (
              <div className="flex flex-col">
                <div className="text-2xl font-bold">
                  {formatDuration(summary.bestDay.duration)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(summary.bestDay.date), 'EEEE, MMM d')}
                </div>
                <div className="flex mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star} 
                      className={cn(
                        "text-sm",
                        summary.bestDay && star <= summary.bestDay.quality 
                          ? "text-yellow-500" 
                          : "text-gray-300 dark:text-gray-600"
                      )}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No sleep data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Sleep Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sleep Calendar</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
              </span>
              <Button variant="outline" size="icon" onClick={handleNextWeek} disabled={addDays(weekStart, 7) > new Date()}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>Your sleep patterns for the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Days of the week - better aligned header */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Calendar slots - aligned to the day headers */}
              {Array.from({ length: 7 }).map((_, index) => {
                const currentDay = addDays(weekStart, index);
                const dateStr = format(currentDay, 'yyyy-MM-dd');
                const day = chartData.find(d => d.dateStr === dateStr);
                
                if (!day) return null; // Should never happen
                
                const hasData = day.hasEntry;
                const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;
                
                return (
                  <div 
                    key={dateStr} 
                    className={cn(
                      "flex flex-col items-center p-2 rounded-lg transition-colors cursor-pointer",
                      hasData ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted",
                      isToday && "border border-primary/50"
                    )}
                    onClick={() => {
                      // Pre-fill the date when adding new entry
                      setNewEntry({
                        ...newEntry,
                        date: dateStr
                      });
                      setShowAddDialog(true);
                    }}
                  >
                    <div className="font-bold text-lg">{format(currentDay, 'd')}</div>
                    {hasData ? (
                      <div className="mt-1 flex flex-col items-center">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span className={cn("text-xs font-medium", getSleepDurationColor(day.duration * 60))}>
                            {Math.floor(day.duration)}h {Math.round((day.duration % 1) * 60)}m
                          </span>
                        </div>
                        <div className="flex mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span 
                              key={star} 
                              className={cn(
                                "text-[0.6rem]",
                                star <= day.quality 
                                  ? "text-yellow-500" 
                                  : "text-gray-300"
                              )}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-muted-foreground">No data</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sleep duration chart with improved scale */}
            <div className="h-[180px] mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="shortDisplay" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      // Format to match the calendar day headers
                      const dayIndex = chartData.findIndex(d => d.shortDisplay === value);
                      if (dayIndex >= 0) {
                        const date = addDays(weekStart, dayIndex);
                        return format(date, 'EEE');
                      }
                      return value;
                    }}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    domain={[0, 12]} // Set fixed domain for consistency
                    ticks={[0, 2, 4, 6, 8, 10, 12]}
                    label={{ 
                      value: 'Duration (hours)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fontSize: '12px' }
                    }}
                    tickFormatter={(value) => `${value}h`}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'Duration') {
                        const hours = Math.floor(Number(value));
                        const minutes = Math.round((Number(value) % 1) * 60);
                        return [`${hours}h ${minutes}m`, 'Sleep Duration'];
                      }
                      return [value, name];
                    }}
                    labelFormatter={(label) => {
                      const day = chartData.find(d => d.shortDisplay === label);
                      return day ? format(day.date, 'EEEE, MMMM d, yyyy') : label;
                    }}
                  />
                  <ReferenceLine 
                    y={8} 
                    yAxisId="left" 
                    stroke="green" 
                    strokeDasharray="3 3" 
                    label={{ 
                      value: 'Ideal (8h)', 
                      position: 'right', 
                      style: { fill: 'green', fontSize: '10px' } 
                    }} 
                  />
                  <ReferenceLine 
                    y={7} 
                    yAxisId="left" 
                    stroke="#3b82f6" 
                    strokeDasharray="3 3" 
                    label={{ 
                      value: 'Recommended (7h)', 
                      position: 'left', 
                      style: { fill: '#3b82f6', fontSize: '10px' } 
                    }} 
                  />
                  <Line
                    type="monotone"
                    dataKey="duration"
                    name="Duration"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    yAxisId="left"
                    connectNulls
                    dot={<CustomDot fill="#3b82f6" />}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Sleep Entries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Sleep Log</CardTitle>
            <CardDescription>
              {entries.length} entries for this week
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Entry
          </Button>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <BedDouble className="h-12 w-12 text-muted-foreground opacity-50 mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-1">No sleep entries</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                Start tracking your sleep to get insights into your sleep patterns and quality.
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                Log Your First Sleep
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map(entry => (
                <div key={entry.id} className="flex items-start border-b pb-4 last:border-0 last:pb-0">
                  <div className="mr-4 mt-1">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Moon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 mt-1">
                      <div>
                        <div className="text-xs text-muted-foreground">Bedtime</div>
                        <div className="text-sm flex items-center">
                          <Moon className="h-3 w-3 mr-1 text-indigo-500" />
                          {formatTime(entry.sleep_time)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Wake time</div>
                        <div className="text-sm flex items-center">
                          <Sun className="h-3 w-3 mr-1 text-amber-500" />
                          {formatTime(entry.wake_time)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                        <div className={cn(
                          "text-sm font-medium flex items-center",
                          getSleepDurationColor(entry.duration_minutes)
                        )}>
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(entry.duration_minutes)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Quality</div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span 
                              key={star} 
                              className={cn(
                                "text-xs",
                                star <= entry.quality 
                                  ? "text-yellow-500" 
                                  : "text-gray-300 dark:text-gray-600"
                              )}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {entry.notes && (
                      <div className="mt-2">
                        <div className="text-xs text-muted-foreground">Notes</div>
                        <div className="text-sm mt-1 bg-muted p-2 rounded-md">
                          {entry.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Sleep Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Your Sleep</DialogTitle>
            <DialogDescription>
              Record when you slept and how well you rested
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label>Sleep Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newEntry.date ? format(new Date(newEntry.date), 'EEEE, MMMM d, yyyy') : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newEntry.date ? new Date(newEntry.date) : undefined}
                    onSelect={(date) => 
                      setNewEntry({...newEntry, date: date ? format(date, 'yyyy-MM-dd') : ''})
                    }
                    initialFocus
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sleep-time">Bedtime</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Moon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex">
                    <Input
                      id="sleep-time"
                      value={formatTimeInput(newEntry.sleepTime)}
                      onChange={(e) => {
                        const parsed = parseTimeInput(e.target.value);
                        if (parsed) setNewEntry({...newEntry, sleepTime: parsed});
                      }}
                      placeholder="10:30 PM"
                      className="pl-10 rounded-r-none"
                    />
                    <div className="inline-flex">
                      <Button 
                        variant="secondary"
                        size="sm"
                        type="button"
                        className="h-10 rounded-l-none"
                        onClick={() => {
                          // Toggle between 12-hour and 24-hour format display
                          const input = document.getElementById('sleep-time') as HTMLInputElement;
                          if (input) {
                            if (input.value.includes('AM') || input.value.includes('PM')) {
                              input.value = newEntry.sleepTime; // Show 24h format
                            } else {
                              input.value = formatTimeInput(newEntry.sleepTime); // Show 12h format
                            }
                          }
                        }}
                      >
                        24h
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Enter in 12h (10:30 PM) or 24h (22:30) format
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="wake-time">Wake Time</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Sun className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex">
                    <Input
                      id="wake-time"
                      value={formatTimeInput(newEntry.wakeTime)}
                      onChange={(e) => {
                        const parsed = parseTimeInput(e.target.value);
                        if (parsed) setNewEntry({...newEntry, wakeTime: parsed});
                      }}
                      placeholder="6:30 AM"
                      className="pl-10 rounded-r-none"
                    />
                    <div className="inline-flex">
                      <Button 
                        variant="secondary"
                        size="sm"
                        type="button"
                        className="h-10 rounded-l-none"
                        onClick={() => {
                          // Toggle between 12-hour and 24-hour format display
                          const input = document.getElementById('wake-time') as HTMLInputElement;
                          if (input) {
                            if (input.value.includes('AM') || input.value.includes('PM')) {
                              input.value = newEntry.wakeTime; // Show 24h format
                            } else {
                              input.value = formatTimeInput(newEntry.wakeTime); // Show 12h format
                            }
                          }
                        }}
                      >
                        24h
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Enter in 12h (6:30 AM) or 24h (06:30) format
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Time Presets */}
            <div className="space-y-2">
              <Label>Common Sleep Patterns</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  type="button"
                  onClick={() => setNewEntry({
                    ...newEntry, 
                    sleepTime: '22:00', 
                    wakeTime: '06:00'
                  })}
                  className="justify-start"
                >
                  <Moon className="h-3 w-3 mr-1" />
                  <span className="truncate">22:00 - 06:00</span>
                  <span className="text-xs text-muted-foreground ml-auto">(8h)</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  type="button"
                  onClick={() => setNewEntry({
                    ...newEntry, 
                    sleepTime: '23:00', 
                    wakeTime: '07:00'
                  })}
                  className="justify-start"
                >
                  <Moon className="h-3 w-3 mr-1" />
                  <span className="truncate">23:00 - 07:00</span>
                  <span className="text-xs text-muted-foreground ml-auto">(8h)</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  type="button"
                  onClick={() => setNewEntry({
                    ...newEntry, 
                    sleepTime: '23:30', 
                    wakeTime: '06:30'
                  })}
                  className="justify-start"
                >
                  <Moon className="h-3 w-3 mr-1" />
                  <span className="truncate">23:30 - 06:30</span>
                  <span className="text-xs text-muted-foreground ml-auto">(7h)</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  type="button"
                  onClick={() => setNewEntry({
                    ...newEntry, 
                    sleepTime: '00:00', 
                    wakeTime: '08:00'
                  })}
                  className="justify-start"
                >
                  <Moon className="h-3 w-3 mr-1" />
                  <span className="truncate">00:00 - 08:00</span>
                  <span className="text-xs text-muted-foreground ml-auto">(8h)</span>
                </Button>
              </div>
            </div>
            
            {/* Sleep Quality */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="quality">Sleep Quality</Label>
                <span className="text-sm font-medium">{newEntry.quality}/5</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-10 w-10 p-0 rounded-full",
                      rating <= newEntry.quality ? "bg-yellow-50 border-yellow-300" : ""
                    )}
                    onClick={() => setNewEntry({...newEntry, quality: rating})}
                  >
                    <span
                      className={`text-lg ${
                        rating <= newEntry.quality
                          ? "text-yellow-500"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  </Button>
                ))}
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground px-2">
                <span>Poor</span>
                <span>Fair</span>
                <span>Good</span>
                <span>Very Good</span>
                <span>Excellent</span>
              </div>
            </div>
            
            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={newEntry.notes}
                onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                placeholder="How did you sleep? Any dreams or disturbances?"
                rows={3}
              />
            </div>
            
            {/* Duration Preview */}
            {newEntry.sleepTime && newEntry.wakeTime && (
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm font-medium flex items-center justify-between">
                  <span>Estimated Sleep Duration:</span>
                  <span className={getSleepDurationColor(calculateDuration(newEntry.sleepTime, newEntry.wakeTime))}>
                    {formatDuration(calculateDuration(newEntry.sleepTime, newEntry.wakeTime))}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSleep} disabled={saving}>
              {saving ? "Saving..." : "Save Sleep Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Sleep Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Sleep Improvement Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Moon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Consistent Schedule</h4>
                <p className="text-sm text-muted-foreground">Try to go to bed and wake up at the same time every day, even on weekends.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Evening Routine</h4>
                <p className="text-sm text-muted-foreground">Develop a relaxing pre-sleep routine to signal your body it's time to wind down.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                  <line x1="6" y1="1" x2="6" y2="4"></line>
                  <line x1="10" y1="1" x2="10" y2="4"></line>
                  <line x1="14" y1="1" x2="14" y2="4"></line>
                </svg>
              </div>
              <div>
                <h4 className="font-medium mb-1">Limit Caffeine</h4>
                <p className="text-sm text-muted-foreground">Avoid caffeine at least 6 hours before bedtime to prevent sleep disruption.</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <div>
                <h4 className="font-medium mb-1">Reduce Screen Time</h4>
                <p className="text-sm text-muted-foreground">Limit exposure to screens and blue light at least an hour before bedtime.</p>
              </div>
            </div>
            
            {summary.averageDuration > 0 && (
              <>
                {summary.averageDuration < 420 && (
                  <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900">
                    <h4 className="font-medium text-red-800 dark:text-red-400 flex items-center mb-1">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Sleep Duration Alert
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Your average sleep duration is less than the recommended 7 hours. 
                      This may affect your physical and mental health. Consider adjusting your schedule 
                      to get more rest.
                    </p>
                  </div>
                )}
                
                {summary.averageDuration >= 420 && summary.averageDuration < 480 && (
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900">
                    <h4 className="font-medium text-amber-800 dark:text-amber-400 flex items-center mb-1">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Sleep Improvement Opportunity
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      You're getting close to the recommended sleep duration! 
                      Aiming for 7-9 hours consistently will help optimize your health and wellbeing.
                    </p>
                  </div>
                )}
                
                {summary.averageDuration >= 480 && (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-100 dark:border-green-900">
                    <h4 className="font-medium text-green-800 dark:text-green-400 flex items-center mb-1">
                      <Star className="h-4 w-4 mr-2" />
                      Great Sleep Habits
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      You're averaging {Math.floor(summary.averageDuration / 60)} hours of sleep, which is excellent! 
                      Maintaining this pattern will support your overall health and daily performance.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}