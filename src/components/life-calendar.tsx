"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Clock, Moon, Plus, Trash2, Activity, Heart, Utensils, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays } from "lucide-react";

type Event = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  all_day: boolean;
  category: string;
  color: string;
  created_at: string;
};

type ActivityData = {
  id: string;
  type: string;
  date: string;
  value: number;
  unit: string;
};

type SleepData = {
  id: string;
  date: string;
  duration_minutes: number;
  quality: number;
};

type HealthData = {
  id: string;
  date: string;
  metric_type: string;
  value: number;
};

type NutritionData = {
  id: string;
  date: string;
  meal_type: string;
  food_name: string;
  calories: number;
};

type DayData = {
  date: Date;
  events: Event[];
  activities: ActivityData[];
  sleep: SleepData | null;
  health: HealthData[];
  nutrition: NutritionData[];
};

// Define types for the different data entries
type CalendarData = {
  date: Date;
  sleep?: {
    id: string;
    duration: number;
    quality: number;
  };
  nutrition?: {
    id: string;
    calories: number;
    entries: number;
  };
  activity?: {
    id: string;
    type: string;
    duration: number;
    calories: number;
  };
  metrics?: {
    id: string;
    types: string[];
  };
  mentalHealth?: {
    id: string;
    mood: number;
    energy: number;
    stress: number;
  };
};

export function LifeCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [sleep, setSleep] = useState<SleepData[]>([]);
  const [health, setHealth] = useState<HealthData[]>([]);
  const [nutrition, setNutrition] = useState<NutritionData[]>([]);
  const [selectedDayData, setSelectedDayData] = useState<DayData | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_time: format(new Date(), "HH:mm"),
    end_time: "",
    all_day: false,
    category: "personal",
    color: "#3b82f6"
  });
  const [date, setDate] = useState<Date>(new Date());
  const [calendarData, setCalendarData] = useState<Record<string, CalendarData>>({});
  const [activeTab, setActiveTab] = useState("overview");
  
  const { toast } = useToast();
  
  // Event categories
  const categories = [
    { value: "personal", label: "Personal", color: "#3b82f6" },
    { value: "health", label: "Health", color: "#10b981" },
    { value: "fitness", label: "Fitness", color: "#f97316" },
    { value: "work", label: "Work", color: "#8b5cf6" },
    { value: "important", label: "Important", color: "#ef4444" }
  ];
  
  // Dates with events/activities for calendar highlight
  const getDatesWithData = () => {
    const dates = new Set<string>();
    
    events.forEach(event => {
      dates.add(format(new Date(event.start_time), "yyyy-MM-dd"));
    });
    
    activities.forEach(activity => {
      dates.add(activity.date);
    });
    
    sleep.forEach(item => {
      dates.add(item.date);
    });
    
    health.forEach(item => {
      dates.add(item.date);
    });
    
    nutrition.forEach(item => {
      dates.add(item.date);
    });
    
    return Array.from(dates).map(dateStr => new Date(dateStr));
  };
  
  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchEvents(),
          fetchActivities(),
          fetchSleep(),
          fetchHealth(),
          fetchNutrition()
        ]);
      } catch (error) {
        console.error("Error fetching calendar data:", error);
        toast({
          title: "Data loading error",
          description: "Could not load your calendar data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);
  
  // Update selected day data when date changes
  useEffect(() => {
    if (!selectedDate) return;
    
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    
    const dayEvents = events.filter(event => {
      const eventDate = format(new Date(event.start_time), "yyyy-MM-dd");
      return eventDate === formattedDate;
    });
    
    const dayActivities = activities.filter(activity => {
      return activity.date === formattedDate;
    });
    
    const daySleep = sleep.find(item => {
      return item.date === formattedDate;
    }) || null;
    
    const dayHealth = health.filter(item => {
      return item.date === formattedDate;
    });
    
    const dayNutrition = nutrition.filter(item => {
      return item.date === formattedDate;
    });
    
    setSelectedDayData({
      date: selectedDate,
      events: dayEvents,
      activities: dayActivities,
      sleep: daySleep,
      health: dayHealth,
      nutrition: dayNutrition
    });
    
  }, [selectedDate, events, activities, sleep, health, nutrition]);
  
  // Fetch events from database
  const fetchEvents = async () => {
    try {
      const supabase = createClient();
      
      // First check if the table exists, create it if not
      try {
        const { error: checkError } = await supabase.rpc('create_table_if_not_exists', {
          table_name: 'events',
          table_definition: `
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id uuid REFERENCES auth.users(id) NOT NULL,
            title text NOT NULL,
            description text,
            start_time timestamp with time zone NOT NULL,
            end_time timestamp with time zone,
            all_day boolean DEFAULT false,
            category text DEFAULT 'personal',
            color text DEFAULT '#3b82f6',
            created_at timestamp with time zone DEFAULT now()
          `
        });
        
        if (checkError) {
          console.error("Error checking events table:", checkError);
        }
      } catch (error) {
        console.error("Error with create_table_if_not_exists RPC:", error);
        // Continue anyway, as the table might already exist
      }
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    }
  };
  
  // Fetch activities
  const fetchActivities = async () => {
    try {
      const supabase = createClient();
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from('activities')
        .select('id, type, date, value, unit')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setActivities([]);
    }
  };
  
  // Fetch sleep data
  const fetchSleep = async () => {
    try {
      const supabase = createClient();
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from('sleep_entries')
        .select('id, date, duration_minutes, quality')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setSleep(data || []);
    } catch (error) {
      console.error("Error fetching sleep data:", error);
      setSleep([]);
    }
  };
  
  // Fetch health metrics
  const fetchHealth = async () => {
    try {
      const supabase = createClient();
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from('health_metrics')
        .select('id, date, metric_type, value')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setHealth(data || []);
    } catch (error) {
      console.error("Error fetching health metrics:", error);
      setHealth([]);
    }
  };
  
  // Fetch nutrition entries
  const fetchNutrition = async () => {
    try {
      const supabase = createClient();
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from('nutrition_entries')
        .select('id, date, meal_type, food_name, calories')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setNutrition(data || []);
    } catch (error) {
      console.error("Error fetching nutrition data:", error);
      setNutrition([]);
    }
  };
  
  // Save new event
  const handleAddEvent = async () => {
    if (!selectedDate) return;
    
    setSaving(true);
    try {
      if (!newEvent.title) {
        toast({
          title: "Missing information",
          description: "Please provide a title for your event.",
          variant: "destructive"
        });
        setSaving(false);
        return;
      }
      
      const supabase = createClient();
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Combine selected date with time
      const [startHours, startMinutes] = newEvent.start_time.split(':').map(Number);
      const startDate = new Date(selectedDate);
      startDate.setHours(startHours, startMinutes, 0, 0);
      
      let endDate = null;
      if (newEvent.end_time) {
        const [endHours, endMinutes] = newEvent.end_time.split(':').map(Number);
        endDate = new Date(selectedDate);
        endDate.setHours(endHours, endMinutes, 0, 0);
      }
      
      const { data, error } = await supabase
        .from('events')
        .insert({
          user_id: user.id,
          title: newEvent.title,
          description: newEvent.description || null,
          start_time: startDate.toISOString(),
          end_time: endDate ? endDate.toISOString() : null,
          all_day: newEvent.all_day,
          category: newEvent.category,
          color: newEvent.color
        })
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setEvents([...events, data[0]]);
      }
      
      // Reset form
      setNewEvent({
        title: "",
        description: "",
        start_time: format(new Date(), "HH:mm"),
        end_time: "",
        all_day: false,
        category: "personal",
        color: "#3b82f6"
      });
      
      setShowAddDialog(false);
      
      toast({
        title: "Event added",
        description: "Your event has been successfully added to the calendar."
      });
    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        title: "Error adding event",
        description: "There was a problem adding your event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Delete event
  const handleDeleteEvent = async (id: string) => {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setEvents(events.filter(event => event.id !== id));
      
      toast({
        title: "Event deleted",
        description: "The event has been removed from your calendar."
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error deleting event",
        description: "There was a problem deleting the event. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Format duration in minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  useEffect(() => {
    fetchCalendarData();
  }, [date]);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Calculate first and last day of current month
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      // Format dates for database queries
      const startStr = format(firstDay, 'yyyy-MM-dd');
      const endStr = format(lastDay, 'yyyy-MM-dd');
      
      // Fetch sleep data
      const { data: sleepData, error: sleepError } = await supabase
        .from('sleep_entries')
        .select('id, date, duration_minutes, quality')
        .eq('user_id', user.id)
        .gte('date', startStr)
        .lte('date', endStr);
      
      if (sleepError) throw sleepError;
      
      // Fetch nutrition data 
      const { data: nutritionData, error: nutritionError } = await supabase
        .from('nutrition_entries')
        .select('id, date, calories')
        .eq('user_id', user.id)
        .gte('date', startStr)
        .lte('date', endStr);
      
      if (nutritionError) throw nutritionError;
      
      // Fetch activity data
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select('id, date, type, duration_minutes, calories_burned')
        .eq('user_id', user.id)
        .gte('date', startStr)
        .lte('date', endStr);
      
      if (activityError) throw activityError;
      
      // Fetch health metrics data
      const { data: metricsData, error: metricsError } = await supabase
        .from('health_metrics')
        .select('id, date, metric_type')
        .eq('user_id', user.id)
        .gte('date', startStr)
        .lte('date', endStr);
      
      if (metricsError) throw metricsError;
      
      // Fetch mental health data
      const { data: mentalHealthData, error: mentalHealthError } = await supabase
        .from('mental_health_entries')
        .select('id, date, mood_score, energy_level, stress_level')
        .eq('user_id', user.id)
        .gte('date', startStr)
        .lte('date', endStr);
      
      if (mentalHealthError) throw mentalHealthError;
      
      // Process data for calendar
      const data: Record<string, CalendarData> = {};
      
      // Initialize all days in the month
      let currentDate = new Date(firstDay);
      while (currentDate <= lastDay) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        data[dateStr] = {
          date: new Date(currentDate)
        };
        currentDate = addDays(currentDate, 1);
      }
      
      // Add sleep data
      sleepData?.forEach(entry => {
        const dateStr = entry.date;
        if (data[dateStr]) {
          data[dateStr].sleep = {
            id: entry.id,
            duration: entry.duration_minutes / 60, // Convert to hours
            quality: entry.quality
          };
        }
      });
      
      // Add nutrition data
      nutritionData?.forEach(entry => {
        const dateStr = entry.date;
        if (data[dateStr]) {
          if (!data[dateStr].nutrition) {
            data[dateStr].nutrition = {
              id: entry.id,
              calories: entry.calories,
              entries: 1
            };
          } else {
            data[dateStr].nutrition.calories += entry.calories;
            data[dateStr].nutrition.entries += 1;
          }
        }
      });
      
      // Add activity data
      activityData?.forEach(entry => {
        const dateStr = entry.date;
        if (data[dateStr]) {
          data[dateStr].activity = {
            id: entry.id,
            type: entry.type,
            duration: entry.duration_minutes / 60, // Convert to hours
            calories: entry.calories_burned
          };
        }
      });
      
      // Add metrics data
      metricsData?.forEach(entry => {
        const dateStr = entry.date;
        if (data[dateStr]) {
          if (!data[dateStr].metrics) {
            data[dateStr].metrics = {
              id: entry.id,
              types: [entry.metric_type]
            };
          } else {
            if (!data[dateStr].metrics.types.includes(entry.metric_type)) {
              data[dateStr].metrics.types.push(entry.metric_type);
            }
          }
        }
      });
      
      // Add mental health data
      mentalHealthData?.forEach(entry => {
        const dateStr = entry.date;
        if (data[dateStr]) {
          data[dateStr].mentalHealth = {
            id: entry.id,
            mood: entry.mood_score,
            energy: entry.energy_level, 
            stress: entry.stress_level
          };
        }
      });
      
      setCalendarData(data);
      
      // Select current day data if it exists, or first day with data
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      if (data[todayStr]) {
        setSelectedDate(new Date());
      } else {
        // Find first date with any data
        const firstDataDate = Object.keys(data).find(dateStr => 
          data[dateStr].sleep || data[dateStr].nutrition || 
          data[dateStr].activity || data[dateStr].metrics || data[dateStr].mentalHealth
        );
        
        if (firstDataDate) {
          setSelectedDate(new Date(firstDataDate));
        }
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      toast({
        title: 'Error loading calendar data',
        description: 'Could not load your health data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const renderDayContent = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const data = calendarData[dateStr];
    
    if (!data) return null;
    
    const hasSleep = !!data.sleep;
    const hasNutrition = !!data.nutrition;
    const hasActivity = !!data.activity;
    const hasMetrics = !!data.metrics;
    const hasMentalHealth = !!data.mentalHealth;
    
    return (
      <div className="w-full h-full flex flex-col items-center">
        <div className="flex flex-wrap gap-1 mt-1">
          {hasSleep && (
            <div className="w-2 h-2 rounded-full bg-blue-500" title="Sleep data recorded" />
          )}
          {hasNutrition && (
            <div className="w-2 h-2 rounded-full bg-green-500" title="Nutrition data recorded" />
          )}
          {hasActivity && (
            <div className="w-2 h-2 rounded-full bg-orange-500" title="Activity data recorded" />
          )}
          {hasMetrics && (
            <div className="w-2 h-2 rounded-full bg-purple-500" title="Health metrics recorded" />
          )}
          {hasMentalHealth && (
            <div className="w-2 h-2 rounded-full bg-purple-500" title="Mental health data recorded" />
          )}
        </div>
      </div>
    );
  };
  
  const selectedDateData = selectedDate 
    ? calendarData[format(selectedDate, 'yyyy-MM-dd')] 
    : undefined;
  
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[350px]" />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Skeleton className="h-[150px]" />
          <Skeleton className="h-[150px]" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Life Calendar</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Health Calendar</CardTitle>
            <CardDescription>
              View all your health data across sleep, nutrition, activities, and metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={date}
              onMonthChange={setDate}
              className="rounded-md border"
              components={{
                DayContent: ({ day }) => renderDayContent(day),
              }}
            />
            <div className="flex items-center justify-center space-x-4 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-1.5" />
                <span className="text-xs">Sleep</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1.5" />
                <span className="text-xs">Nutrition</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-orange-500 mr-1.5" />
                <span className="text-xs">Activity</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-1.5" />
                <span className="text-xs">Health Metrics</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'No Date Selected'}
            </CardTitle>
            <CardDescription>
              {selectedDateData?.sleep || selectedDateData?.nutrition || 
               selectedDateData?.activity || selectedDateData?.metrics || selectedDateData?.mentalHealth 
                ? 'Health data for selected day' 
                : 'No health data recorded'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="overview">All</TabsTrigger>
                <TabsTrigger value="sleep">Sleep</TabsTrigger>
                <TabsTrigger value="nutrition">Food</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                {(!selectedDateData?.sleep && !selectedDateData?.nutrition && 
                  !selectedDateData?.activity && !selectedDateData?.metrics && !selectedDateData?.mentalHealth) ? (
                  <div className="text-center py-6">
                    <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-2" />
                    <p className="text-sm text-muted-foreground">No health data recorded for this day</p>
                    <div className="flex justify-center space-x-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => {
                        // Route to sleep tracker
                        window.location.href = '/dashboard/sleep';
                      }}>
                        <Moon className="h-4 w-4 mr-1" />
                        Log Sleep
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        // Route to nutrition tracker 
                        window.location.href = '/dashboard/nutrition';
                      }}>
                        <Utensils className="h-4 w-4 mr-1" />
                        Log Meal
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {selectedDateData?.sleep && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                            <Moon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Sleep</div>
                            <div className="text-xs text-muted-foreground">
                              {Math.floor(selectedDateData.sleep.duration)}h {Math.round((selectedDateData.sleep.duration % 1) * 60)}m
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-blue-100/50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 hover:bg-blue-100">
                          {selectedDateData.sleep.quality}/5
                        </Badge>
                      </div>
                    )}
                    
                    {selectedDateData?.nutrition && (
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                            <Utensils className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Nutrition</div>
                            <div className="text-xs text-muted-foreground">
                              {selectedDateData.nutrition.calories} calories
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-100/50 text-green-700 dark:bg-green-900/50 dark:text-green-400 hover:bg-green-100">
                          {selectedDateData.nutrition.entries} meal{selectedDateData.nutrition.entries !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    )}
                    
                    {selectedDateData?.activity && (
                      <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mr-3">
                            <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{selectedDateData.activity.type}</div>
                            <div className="text-xs text-muted-foreground">
                              {selectedDateData.activity.duration}h • {selectedDateData.activity.calories} cal
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                          <a href="/dashboard/activities">View</a>
                        </Button>
                      </div>
                    )}
                    
                    {selectedDateData?.metrics && (
                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3">
                            <Heart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Health Metrics</div>
                            <div className="text-xs text-muted-foreground">
                              {selectedDateData.metrics.types.slice(0, 2).join(', ')}
                              {selectedDateData.metrics.types.length > 2 && ` +${selectedDateData.metrics.types.length - 2} more`}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                          <a href="/dashboard/health">View</a>
                        </Button>
                      </div>
                    )}
                    
                    {selectedDateData?.mentalHealth && (
                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-3">
                            <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Mental Health</div>
                            <div className="text-xs text-muted-foreground">
                              Mood: {selectedDateData.mentalHealth.mood}/5 • Stress: {selectedDateData.mentalHealth.stress}/5
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                          <a href="/dashboard/mental-health">View</a>
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="sleep">
                {selectedDateData?.sleep ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Sleep Quality</h4>
                        <div className="flex mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span 
                              key={star} 
                              className={cn(
                                "text-lg",
                                star <= selectedDateData.sleep!.quality
                                  ? "text-yellow-500" 
                                  : "text-gray-300"
                              )}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <h4 className="font-medium">Duration</h4>
                        <p className="text-2xl font-bold">
                          {Math.floor(selectedDateData.sleep.duration)}h {Math.round((selectedDateData.sleep.duration % 1) * 60)}m
                        </p>
                      </div>
                    </div>
                    <Button className="w-full" asChild>
                      <a href="/dashboard/sleep">View Sleep Tracker</a>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Moon className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">No sleep data recorded for this day</p>
                    <Button onClick={() => {
                      // Route to sleep tracker with date pre-selected
                      window.location.href = `/dashboard/sleep?date=${format(selectedDate, 'yyyy-MM-dd')}`;
                    }}>
                      <Plus className="h-4 w-4 mr-1" />
                      Log Sleep
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="nutrition">
                {selectedDateData?.nutrition ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted p-3 rounded-lg text-center">
                        <h4 className="text-sm font-medium text-muted-foreground">Total Calories</h4>
                        <p className="text-2xl font-bold">{selectedDateData.nutrition.calories}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg text-center">
                        <h4 className="text-sm font-medium text-muted-foreground">Meals Logged</h4>
                        <p className="text-2xl font-bold">{selectedDateData.nutrition.entries}</p>
                      </div>
                    </div>
                    <Button className="w-full" asChild>
                      <a href="/dashboard/nutrition">View Nutrition Tracker</a>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Utensils className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">No meal data recorded for this day</p>
                    <Button onClick={() => {
                      // Route to nutrition tracker with date pre-selected
                      window.location.href = `/dashboard/nutrition?date=${format(selectedDate, 'yyyy-MM-dd')}`;
                    }}>
                      <Plus className="h-4 w-4 mr-1" />
                      Log Meal
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="activity">
                {selectedDateData?.activity ? (
                  <div className="space-y-4">
                    <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Activity className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
                        <h4 className="font-medium text-orange-800 dark:text-orange-300">{selectedDateData.activity.type}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-muted-foreground">Duration</div>
                          <div className="font-bold">
                            {Math.floor(selectedDateData.activity.duration)}h {Math.round((selectedDateData.activity.duration % 1) * 60)}m
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Calories Burned</div>
                          <div className="font-bold">{selectedDateData.activity.calories} cal</div>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full" asChild>
                      <a href="/dashboard/activities">View Activity Tracker</a>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">No activity data recorded for this day</p>
                    <Button onClick={() => {
                      // Route to activities tracker with date pre-selected
                      window.location.href = `/dashboard/activities?date=${format(selectedDate, 'yyyy-MM-dd')}`;
                    }}>
                      <Plus className="h-4 w-4 mr-1" />
                      Log Activity
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard">
                View Full Dashboard
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 