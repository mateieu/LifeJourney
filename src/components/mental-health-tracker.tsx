"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay } from "date-fns";
import { Brain, Plus, Calendar, ArrowRight, ArrowLeft, Smile, Frown, Meh, Sun, Cloud, CloudLightning, SunDim, X, Battery } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { ensureTableExists, checkSupabaseConnection } from "@/utils/supabase-helpers";

type MoodEntry = {
  id: string;
  user_id: string;
  date: string;
  mood_score: number;
  energy_level: number;
  stress_level: number;
  sleep_quality?: number;
  notes?: string;
  tags?: string[];
  created_at: string;
};

const MOOD_LABELS: Record<number, { label: string; icon: JSX.Element; color: string }> = {
  1: { label: "Very Low", icon: <Frown className="h-4 w-4" />, color: "text-red-500" },
  2: { label: "Low", icon: <Frown className="h-4 w-4" />, color: "text-orange-500" },
  3: { label: "Neutral", icon: <Meh className="h-4 w-4" />, color: "text-yellow-500" },
  4: { label: "Good", icon: <Smile className="h-4 w-4" />, color: "text-blue-500" },
  5: { label: "Excellent", icon: <Smile className="h-4 w-4" />, color: "text-green-500" },
};

const MENTAL_HEALTH_TAGS = [
  "Anxious", "Calm", "Depressed", "Energetic", "Focused", 
  "Grateful", "Happy", "Irritable", "Motivated", "Overwhelmed", 
  "Peaceful", "Productive", "Relaxed", "Restless", "Sad", 
  "Stressed", "Tired", "Unmotivated", "Worried"
];

export function MentalHealthTracker() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);
  const [newEntry, setNewEntry] = useState<Partial<MoodEntry>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    mood_score: 3,
    energy_level: 3,
    stress_level: 3,
    tags: [],
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [summary, setSummary] = useState({
    avgMood: 0,
    avgEnergy: 0,
    avgStress: 0,
    bestDay: null as { date: string; score: number } | null,
    worstDay: null as { date: string; score: number } | null,
  });
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{connected: boolean, checked: boolean}>({
    connected: false,
    checked: false
  });

  const { toast } = useToast();

  useEffect(() => {
    ensureMentalHealthTable();
    fetchEntries();
  }, [weekStart]);

  useEffect(() => {
    const checkConnection = async () => {
      const status = await checkSupabaseConnection();
      setConnectionStatus({
        connected: status.connected,
        checked: true
      });
    };
    
    checkConnection();
  }, []);

  const ensureMentalHealthTable = async () => {
    try {
      const tableDefinition = `
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid REFERENCES auth.users(id) NOT NULL,
        date date NOT NULL,
        mood_score integer NOT NULL,
        energy_level integer NOT NULL,
        stress_level integer NOT NULL,
        sleep_quality integer,
        notes text,
        tags text[],
        created_at timestamp with time zone DEFAULT now(),
        UNIQUE(user_id, date)
      `;
      
      const success = await ensureTableExists('mental_health_entries', tableDefinition);
      if (!success) {
        setError("Failed to ensure the mental health table exists. Some features may not work correctly.");
      }
    } catch (error) {
      console.error("Error ensuring mental health table exists:", error);
    }
  };

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const start = format(weekStart, 'yyyy-MM-dd');
      const end = format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('mental_health_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      setEntries(data || []);
      calculateSummary(data || []);
    } catch (err) {
      console.error('Error fetching mental health entries:', err);
      setError('Failed to load data. Please try again later.');
      toast({
        title: 'Error loading data',
        description: 'Could not load your mental health entries. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data: MoodEntry[]) => {
    if (!data.length) {
      setSummary({
        avgMood: 0,
        avgEnergy: 0,
        avgStress: 0,
        bestDay: null,
        worstDay: null,
      });
      return;
    }
    
    const avgMood = data.reduce((sum, entry) => sum + entry.mood_score, 0) / data.length;
    const avgEnergy = data.reduce((sum, entry) => sum + entry.energy_level, 0) / data.length;
    const avgStress = data.reduce((sum, entry) => sum + entry.stress_level, 0) / data.length;
    
    let bestDay = data[0];
    let worstDay = data[0];
    
    data.forEach(entry => {
      if (entry.mood_score > bestDay.mood_score) {
        bestDay = entry;
      }
      if (entry.mood_score < worstDay.mood_score) {
        worstDay = entry;
      }
    });
    
    setSummary({
      avgMood,
      avgEnergy,
      avgStress,
      bestDay: { date: bestDay.date, score: bestDay.mood_score },
      worstDay: { date: worstDay.date, score: worstDay.mood_score },
    });
  };

  const handlePreviousWeek = () => {
    setWeekStart(subWeeks(weekStart, 1));
  };

  const handleNextWeek = () => {
    setWeekStart(addWeeks(weekStart, 1));
  };

  const validateEntry = () => {
    const errors = [];
    
    if (!newEntry.date) {
      errors.push("Date is required");
    }
    
    if (!newEntry.mood_score || newEntry.mood_score < 1 || newEntry.mood_score > 5) {
      errors.push("Valid mood score (1-5) is required");
    }
    
    if (!newEntry.energy_level || newEntry.energy_level < 1 || newEntry.energy_level > 5) {
      errors.push("Valid energy level (1-5) is required");
    }
    
    if (!newEntry.stress_level || newEntry.stress_level < 1 || newEntry.stress_level > 5) {
      errors.push("Valid stress level (1-5) is required");
    }
    
    if (newEntry.sleep_quality && (newEntry.sleep_quality < 1 || newEntry.sleep_quality > 5)) {
      errors.push("Sleep quality must be between 1-5");
    }
    
    return errors;
  };

  const handleAddEntry = async () => {
    const validationErrors = validateEntry();
    
    if (validationErrors.length > 0) {
      toast({
        title: 'Validation Error',
        description: validationErrors.join('. '),
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const entryToAdd = {
        ...newEntry,
        user_id: user.id,
        tags: selectedTags,
      };
      
      const { data, error } = await supabase
        .from('mental_health_entries')
        .upsert(entryToAdd, { onConflict: 'user_id,date' })
        .select();
      
      if (error) throw error;
      
      setShowAddDialog(false);
      
      setNewEntry({
        date: format(new Date(), 'yyyy-MM-dd'),
        mood_score: 3,
        energy_level: 3,
        stress_level: 3,
      });
      
      setSelectedTags([]);
      
      toast({
        title: 'Mental health entry saved',
        description: 'Your mental health data has been recorded successfully.',
        variant: 'default',
      });
      
      fetchEntries();
    } catch (error) {
      console.error('Error adding mental health entry:', error);
      toast({
        title: 'Error saving entry',
        description: 'Could not save your mental health entry. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('mental_health_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Entry deleted',
        description: 'Your mental health entry has been deleted.',
        variant: 'default',
      });
      
      fetchEntries();
      setSelectedEntry(null);
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: 'Error deleting entry',
        description: 'Could not delete your mental health entry. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const chartData = useMemo(() => {
    const days = eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(weekStart, { weekStartsOn: 1 })
    });
    
    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const entry = entries.find(e => e.date === dateStr);
      
      return {
        date: day,
        dateStr,
        shortDisplay: format(day, 'EEE'),
        mood: entry ? entry.mood_score : null,
        energy: entry ? entry.energy_level : null,
        stress: entry ? entry.stress_level : null,
        hasEntry: !!entry,
      };
    });
  }, [entries, weekStart]);

  const getMoodIcon = (score: number) => {
    if (score <= 2) return <Frown className="h-5 w-5 text-red-500" />;
    if (score === 3) return <Meh className="h-5 w-5 text-yellow-500" />;
    return <Smile className="h-5 w-5 text-green-500" />;
  };

  if (!connectionStatus.checked) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-12 bg-muted rounded-md w-3/4 mx-auto"></div>
          <div className="h-64 bg-muted rounded-md w-full"></div>
          <div className="flex justify-between space-x-4">
            <div className="h-24 bg-muted rounded-md w-1/3"></div>
            <div className="h-24 bg-muted rounded-md w-1/3"></div>
            <div className="h-24 bg-muted rounded-md w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!connectionStatus.connected) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-destructive mb-4">
          <CloudLightning className="h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium mb-2">Connection Error</h3>
        <p className="text-muted-foreground text-center max-w-md mb-4">
          Unable to connect to the database. Please check your connection and try again.
        </p>
        <Button onClick={() => window.location.reload()}>Retry Connection</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Brain className="h-6 w-6 mr-2 text-purple-500" />
              Mental Health Tracker
            </h2>
            <p className="text-muted-foreground">Loading your data...</p>
          </div>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded-md w-64"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="h-36 bg-muted rounded-md"></div>
            <div className="h-36 bg-muted rounded-md"></div>
            <div className="h-36 bg-muted rounded-md"></div>
          </div>
          <div className="h-80 bg-muted rounded-md"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-destructive mb-4">
          <CloudLightning className="h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium mb-2">Error loading data</h3>
        <p className="text-muted-foreground text-center max-w-md mb-4">{error}</p>
        <Button onClick={fetchEntries}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Brain className="h-6 w-6 mr-2 text-purple-500" />
            Mental Health Tracker
          </h2>
          <p className="text-muted-foreground">Track your mood, energy, and stress levels</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Log Mental State
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mood Summary</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">
                  {summary.avgMood > 0 ? getMoodIcon(Math.round(summary.avgMood)) : <Meh className="h-4 w-4" />}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.avgMood > 0 ? MOOD_LABELS[Math.round(summary.avgMood) as 1|2|3|4|5].label : "No data"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average mood this week
                </p>
                {summary.bestDay && (
                  <div className="mt-4 bg-green-50 dark:bg-green-950/30 p-2 rounded-md">
                    <div className="text-xs text-muted-foreground">Best Day</div>
                    <div className="text-sm font-medium flex items-center">
                      {format(parseISO(summary.bestDay.date), 'EEEE, MMM d')}
                      <div className="ml-2">
                        {getMoodIcon(summary.bestDay.score)}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Energy Level</CardTitle>
                <Sun className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.avgEnergy > 0 ? `${Math.round(summary.avgEnergy * 20)}%` : "No data"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average energy this week
                </p>
                {summary.avgEnergy > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-amber-500 h-2.5 rounded-full" 
                        style={{ width: `${Math.round(summary.avgEnergy * 20)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stress Level</CardTitle>
                <CloudLightning className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.avgStress > 0 ? `${Math.round(summary.avgStress * 20)}%` : "No data"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average stress this week
                </p>
                {summary.avgStress > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-red-500 h-2.5 rounded-full" 
                        style={{ width: `${Math.round(summary.avgStress * 20)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Weekly Trends</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {format(weekStart, 'MMM d')} - {format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'MMM d')}
                  </span>
                  <Button variant="outline" size="icon" onClick={handleNextWeek} disabled={isSameDay(addWeeks(weekStart, 1), startOfWeek(new Date(), { weekStartsOn: 1 }))}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Your mood, energy, and stress levels over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="shortDisplay" />
                    <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                    <Tooltip />
                    <ReferenceLine y={3} stroke="#9ca3af" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="mood" name="Mood" stroke="#10b981" strokeWidth={2} connectNulls />
                    <Line type="monotone" dataKey="energy" name="Energy" stroke="#f59e0b" strokeWidth={2} connectNulls />
                    <Line type="monotone" dataKey="stress" name="Stress" stroke="#ef4444" strokeWidth={2} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Mental Health Calendar</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {format(weekStart, 'MMM d')} - {format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'MMM d')}
                  </span>
                  <Button variant="outline" size="icon" onClick={handleNextWeek} disabled={isSameDay(addWeeks(weekStart, 1), startOfWeek(new Date(), { weekStartsOn: 1 }))}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                View your mental health data by day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
                
                {chartData.map((day) => {
                  const isToday = isSameDay(day.date, new Date());
                  
                  return (
                    <div
                      key={day.dateStr}
                      className={cn(
                        "flex flex-col items-center p-2 rounded-lg cursor-pointer min-h-[110px] transition-colors",
                        day.hasEntry ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted",
                        isToday && "border border-primary/50"
                      )}
                      onClick={() => {
                        if (day.hasEntry) {
                          const entry = entries.find(e => e.date === day.dateStr);
                          if (entry) setSelectedEntry(entry);
                        } else {
                          setNewEntry({
                            ...newEntry,
                            date: day.dateStr,
                          });
                          setShowAddDialog(true);
                        }
                      }}
                    >
                      <div className="font-medium">{format(day.date, 'd')}</div>
                      {day.hasEntry ? (
                        <div className="mt-2 flex flex-col items-center">
                          <div 
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              day.mood === 1 && "bg-red-100 text-red-600",
                              day.mood === 2 && "bg-orange-100 text-orange-600",
                              day.mood === 3 && "bg-yellow-100 text-yellow-600",
                              day.mood === 4 && "bg-blue-100 text-blue-600",
                              day.mood === 5 && "bg-green-100 text-green-600",
                            )}
                          >
                            {day.mood && getMoodIcon(day.mood)}
                          </div>
                          <div className="flex items-center mt-2 text-xs text-muted-foreground">
                            <Sun className="h-3 w-3 mr-1 text-amber-500" />
                            <span>{day.energy}/5</span>
                          </div>
                          <div className="flex items-center mt-1 text-xs text-muted-foreground">
                            <CloudLightning className="h-3 w-3 mr-1 text-red-500" />
                            <span>{day.stress}/5</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
                          No entry
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {selectedEntry && (
            <Card className="mt-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {format(parseISO(selectedEntry.date), 'EEEE, MMMM d, yyyy')}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedEntry(null)}>
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Mood</div>
                    <div className="flex items-center text-2xl font-bold">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                        MOOD_LABELS[selectedEntry.mood_score as 1|2|3|4|5].color
                      )}>
                        {getMoodIcon(selectedEntry.mood_score)}
                      </div>
                      {MOOD_LABELS[selectedEntry.mood_score as 1|2|3|4|5].label}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Energy</div>
                    <div className="text-2xl font-bold flex items-center">
                      <Sun className="h-5 w-5 mr-2 text-amber-500" />
                      Level {selectedEntry.energy_level}/5
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Stress</div>
                    <div className="text-2xl font-bold flex items-center">
                      <CloudLightning className="h-5 w-5 mr-2 text-red-500" />
                      Level {selectedEntry.stress_level}/5
                    </div>
                  </div>
                </div>
                
                {selectedEntry.sleep_quality && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <div className="text-sm font-medium">Sleep Quality</div>
                    <div className="flex mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star} 
                          className={cn(
                            "text-lg",
                            star <= (selectedEntry.sleep_quality || 0)
                              ? "text-yellow-500" 
                              : "text-gray-300"
                          )}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedEntry.notes && (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-muted-foreground">Notes</div>
                    <div className="mt-1 p-3 bg-muted rounded-lg">
                      {selectedEntry.notes}
                    </div>
                  </div>
                )}
                
                {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-muted-foreground">Tags</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedEntry.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" size="sm" onClick={() => setSelectedEntry(null)}>
                  Close
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDeleteEntry(selectedEntry.id)}
                >
                  Delete Entry
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="insights">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mood Distribution</CardTitle>
                <CardDescription>
                  How your mood has varied over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Very Low', value: entries.filter(e => e.mood_score === 1).length },
                      { name: 'Low', value: entries.filter(e => e.mood_score === 2).length },
                      { name: 'Neutral', value: entries.filter(e => e.mood_score === 3).length },
                      { name: 'Good', value: entries.filter(e => e.mood_score === 4).length },
                      { name: 'Excellent', value: entries.filter(e => e.mood_score === 5).length },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" name="Days" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Stress vs Energy</CardTitle>
                <CardDescription>
                  Relationship between your stress and energy levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={entries.map(entry => ({
                      date: format(parseISO(entry.date), 'MMM d'),
                      stress: entry.stress_level,
                      energy: entry.energy_level,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="energy" name="Energy" stroke="#f59e0b" strokeWidth={2} />
                      <Line type="monotone" dataKey="stress" name="Stress" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Personalized Insights</CardTitle>
                <CardDescription>
                  Observations and suggestions based on your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {entries.length > 0 ? (
                    <>
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center">
                          <Brain className="h-4 w-4 mr-2 text-blue-500" />
                          Mood Pattern
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {summary.avgMood >= 4 
                            ? "Your mood has been consistently positive lately. Great job maintaining your mental wellbeing!"
                            : summary.avgMood >= 3 
                            ? "Your mood has been relatively stable. Consider activities that bring you joy to boost it further."
                            : "Your mood has been lower than optimal. Consider reaching out to a friend or professional for support."}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center">
                          <Sun className="h-4 w-4 mr-2 text-amber-500" />
                          Energy Insights
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {summary.avgEnergy >= 4 
                            ? "Your energy levels are excellent. Channel this energy into meaningful activities."
                            : summary.avgEnergy >= 3 
                            ? "Your energy levels are moderate. Consider regular exercise and proper sleep to improve them."
                            : "Your energy levels have been low. Focus on rest, nutrition, and gentle movement."}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center">
                          <CloudLightning className="h-4 w-4 mr-2 text-red-500" />
                          Stress Management
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {summary.avgStress <= 2 
                            ? "Your stress levels are well-managed. Continue your effective coping strategies."
                            : summary.avgStress <= 3 
                            ? "Your stress levels are moderate. Regular mindfulness or meditation may help reduce them."
                            : "Your stress levels are elevated. Consider stress reduction techniques like deep breathing or talking to someone."}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                        <h4 className="font-medium mb-2">Resources & Suggestions</h4>
                        <ul className="text-sm text-muted-foreground space-y-2">
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Try mindfulness meditation for 5-10 minutes daily to reduce stress</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Regular physical activity can boost mood and energy levels</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Consider journaling about positive experiences each day</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Maintain social connections - reach out to friends or family</span>
                          </li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No data available yet</h3>
                      <p className="text-muted-foreground">
                        Log your mental health entries to receive personalized insights
                      </p>
                      <Button onClick={() => setShowAddDialog(true)} className="mt-4">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Entry
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Mental Health History</CardTitle>
              <CardDescription>
                Your mental health entries over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {entries.length > 0 ? (
                <div className="space-y-4">
                  {entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                    <div 
                      key={entry.id}
                      className="p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <div className="flex items-center mb-2 sm:mb-0">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                          "bg-" + (
                            entry.mood_score <= 2 ? "red" : 
                            entry.mood_score === 3 ? "yellow" : 
                            "green"
                          ) + "-100",
                          "text-" + (
                            entry.mood_score <= 2 ? "red" : 
                            entry.mood_score === 3 ? "yellow" : 
                            "green"
                          ) + "-600"
                        )}>
                          {getMoodIcon(entry.mood_score)}
                        </div>
                        <div>
                          <div className="font-medium">{format(parseISO(entry.date), 'EEEE, MMMM d, yyyy')}</div>
                          <div className="text-sm text-muted-foreground">
                            Mood: {MOOD_LABELS[entry.mood_score as 1|2|3|4|5].label}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-4 sm:space-x-2">
                        <div className="text-sm flex items-center">
                          <Sun className="h-4 w-4 mr-1 text-amber-500" />
                          <span>{entry.energy_level}/5</span>
                        </div>
                        <div className="text-sm flex items-center">
                          <CloudLightning className="h-4 w-4 mr-1 text-red-500" />
                          <span>{entry.stress_level}/5</span>
                        </div>
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="hidden sm:flex items-center">
                            <Badge variant="outline" className="text-xs">
                              {entry.tags.length} tag{entry.tags.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No entries yet</h3>
                  <p className="text-muted-foreground">
                    Start tracking your mental health by adding your first entry
                  </p>
                  <Button onClick={() => setShowAddDialog(true)} className="mt-4">
                    <Plus className="h-4 w-4 mr-1" />
                    Add First Entry
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Log Mental Health Entry</DialogTitle>
            <DialogDescription>
              Record how you're feeling today. Track your mood, energy, stress, and more.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={newEntry.date}
                onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Mood
              </Label>
              <div className="col-span-3 space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground px-1">
                  <span>Very Low</span>
                  <span>Excellent</span>
                </div>
                <Slider
                  id="mood"
                  min={1}
                  max={5}
                  step={1}
                  value={[newEntry.mood_score || 3]}
                  onValueChange={(value) => setNewEntry({ ...newEntry, mood_score: value[0] })}
                  className="cursor-pointer"
                />
                <div className="flex justify-between">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <div
                      key={score}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center cursor-pointer",
                        (newEntry.mood_score || 3) === score
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                      onClick={() => setNewEntry({ ...newEntry, mood_score: score })}
                    >
                      {score}
                    </div>
                  ))}
                </div>
                <div className="text-center font-medium">
                  {MOOD_LABELS[(newEntry.mood_score || 3) as 1|2|3|4|5].label}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Energy
              </Label>
              <div className="col-span-3 space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground px-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
                <Slider
                  id="energy"
                  min={1}
                  max={5}
                  step={1}
                  value={[newEntry.energy_level || 3]}
                  onValueChange={(value) => setNewEntry({ ...newEntry, energy_level: value[0] })}
                  className="cursor-pointer"
                />
                <div className="flex justify-between">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center cursor-pointer",
                        (newEntry.energy_level || 3) === level
                          ? "bg-amber-500 text-white"
                          : "bg-muted hover:bg-muted/80"
                      )}
                      onClick={() => setNewEntry({ ...newEntry, energy_level: level })}
                    >
                      {level}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Stress
              </Label>
              <div className="col-span-3 space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground px-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
                <Slider
                  id="stress"
                  min={1}
                  max={5}
                  step={1}
                  value={[newEntry.stress_level || 3]}
                  onValueChange={(value) => setNewEntry({ ...newEntry, stress_level: value[0] })}
                  className="cursor-pointer"
                />
                <div className="flex justify-between">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center cursor-pointer",
                        (newEntry.stress_level || 3) === level
                          ? "bg-red-500 text-white"
                          : "bg-muted hover:bg-muted/80"
                      )}
                      onClick={() => setNewEntry({ ...newEntry, stress_level: level })}
                    >
                      {level}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sleep" className="text-right">
                Sleep Quality
              </Label>
              <div className="col-span-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star} 
                      className={cn(
                        "text-xl cursor-pointer",
                        star <= (newEntry.sleep_quality || 0)
                          ? "text-yellow-500" 
                          : "text-gray-300 hover:text-yellow-500/50"
                      )}
                      onClick={() => setNewEntry({ 
                        ...newEntry, 
                        sleep_quality: star === newEntry.sleep_quality ? star - 1 : star
                      })}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right pt-2">
                Tags
              </Label>
              <div className="col-span-3">
                <div className="flex flex-wrap gap-2">
                  {MENTAL_HEALTH_TAGS.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer hover:bg-muted",
                        selectedTags.includes(tag) && "bg-purple-500 hover:bg-purple-500/90"
                      )}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Any thoughts or observations about your day..."
                value={newEntry.notes || ''}
                onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                className="col-span-3"
              />
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
  );
}