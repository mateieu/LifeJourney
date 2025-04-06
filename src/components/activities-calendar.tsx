"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Activity, ChevronLeft, ChevronRight, BarChart, Clock, BookOpen } from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { createClient } from "@/utils/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { getActivityLabel, getFormattedMeasurement } from "@/lib/measurements";
import { useMeasurementPreferences } from "@/hooks/use-measurement-preferences";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Loader2, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTimeFormat } from "@/hooks/use-time-format";

type Activity = {
  id: string;
  activity_type: string;
  value: number;
  measurement_unit: string;
  completed_at: string;
  notes?: string;
  user_id: string;
  created_at: string;
};

// Activity type to color mapping for badges and highlights
const activityColors: Record<string, string> = {
  running: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  walking: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  cycling: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  swimming: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  yoga: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
  meditation: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  weightlifting: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  // Default fallback color
  default: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400"
};

// Activity icon mapping
const activityIcons: Record<string, React.ReactNode> = {
  running: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 7C16.1046 7 17 6.10457 17 5C17 3.89543 16.1046 3 15 3C13.8954 3 13 3.89543 13 5C13 6.10457 13.8954 7 15 7Z" fill="currentColor"/>
    <path d="M14.8222 8.5L12.0222 10.1667L9.9 8.5H7.5L10.8889 12.5V18.8333H13.1111V12.5L14.8222 10.1667V13.3333L18.3333 15.8333L19.5 14.1667L16.6667 12.0833V8.5H14.8222Z" fill="currentColor"/>
    <path d="M6.5 10.1667L4.5 13.3333H7.5L9.5 10.1667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>,
  walking: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.5 5.5C14.6046 5.5 15.5 4.60457 15.5 3.5C15.5 2.39543 14.6046 1.5 13.5 1.5C12.3954 1.5 11.5 2.39543 11.5 3.5C11.5 4.60457 12.3954 5.5 13.5 5.5Z" fill="currentColor"/>
    <path d="M14.25 22.5L13.5 18.5L16 14.5L13.5 8.5L9.75 12.5L7.5 22.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.75 12.5L6 17L3.75 15.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 14.5L17.5 16.5L21 14.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>,
  cycling: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="5.5" cy="17.5" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="18.5" cy="17.5" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 17.5L8.5 8.5H14.5L17.5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 8.4V6.1C10 5.49249 10.4925 5 11.1 5H15.9C16.5075 5 17 5.49249 17 6.1V6.9C17 7.50751 16.5075 8 15.9 8H14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
};

// Get color class for an activity type
const getActivityColor = (activityType: string) => {
  return activityColors[activityType] || activityColors.default;
};

// Get activity icon
const getActivityIcon = (activityType: string) => {
  return activityIcons[activityType] || <Activity className="h-4 w-4" />;
};

export function ActivitiesCalendar() {
  const [date, setDate] = useState<Date>(new Date());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateActivities, setSelectedDateActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<string>("details");
  const [totalThisMonth, setTotalThisMonth] = useState<Record<string, number>>({});
  const { convertToPreferred } = useMeasurementPreferences();
  const router = useRouter();
  const { toast } = useToast();
  const { formatTime } = useTimeFormat();
  
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        
        // Get activities for the entire month
        const start = startOfMonth(date).toISOString();
        const end = endOfMonth(date).toISOString();
        
        const { data, error } = await supabase
          .from("health_activities")
          .select("*")
          .gte("completed_at", start)
          .lte("completed_at", end)
          .order("completed_at", { ascending: false });
          
        if (error) throw error;
        
        setActivities(data || []);
        
        // Set activities for the current selected date
        updateSelectedDateActivities(date, data || []);
        
        // Calculate totals for this month
        calculateMonthlyTotals(data || []);
      } catch (error) {
        console.error("Error fetching activities:", error);
        toast({
          title: "Error loading activities",
          description: "Could not load your activity data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [date, toast]);
  
  const calculateMonthlyTotals = (monthActivities: Activity[]) => {
    // Group activities by type and sum values
    const totals: Record<string, number> = {};
    
    monthActivities.forEach(activity => {
      const { activity_type, value, measurement_unit } = activity;
      
      if (!totals[activity_type]) {
        totals[activity_type] = 0;
      }
      
      // Convert to preferred unit
      const { value: convertedValue } = convertToPreferred(
        value,
        measurement_unit,
        activity_type
      );
      
      totals[activity_type] += convertedValue;
    });
    
    setTotalThisMonth(totals);
  };
  
  const updateSelectedDateActivities = (selectedDate: Date, allActivities: Activity[]) => {
    const activitiesOnDate = allActivities.filter(activity => 
      isSameDay(parseISO(activity.completed_at), selectedDate)
    );
    setSelectedDateActivities(activitiesOnDate);
  };
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      updateSelectedDateActivities(selectedDate, activities);
    }
  };
  
  // Create an array of days with activity info for the calendar
  const getDaysWithActivities = () => {
    if (!activities.length) return [];
    
    const days = eachDayOfInterval({
      start: startOfMonth(date),
      end: endOfMonth(date)
    });
    
    return days.map(day => {
      const activitiesOnDay = activities.filter(activity => 
        isSameDay(parseISO(activity.completed_at), day)
      );
      
      // Group by activity type
      const activityTypes = new Set(activitiesOnDay.map(a => a.activity_type));
      
      return {
        date: day,
        hasActivities: activitiesOnDay.length > 0,
        activityCount: activitiesOnDay.length,
        activityTypes: Array.from(activityTypes)
      };
    });
  };
  
  const handleNewActivity = () => {
    router.push("/dashboard/activities/new");
  };
  
  const handleEditActivity = (activityId: string) => {
    router.push(`/dashboard/activities/edit/${activityId}`);
  };
  
  const handleDeleteActivity = async (activityId: string) => {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from("health_activities")
        .delete()
        .eq("id", activityId);
        
      if (error) throw error;
      
      // Update local state
      const updatedActivities = activities.filter(a => a.id !== activityId);
      setActivities(updatedActivities);
      updateSelectedDateActivities(date, updatedActivities);
      calculateMonthlyTotals(updatedActivities);
      
      toast({
        title: "Activity deleted",
        description: "The activity has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast({
        title: "Error deleting activity",
        description: "Could not delete the activity. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handlePreviousMonth = () => {
    setDate(subMonths(date, 1));
  };
  
  const handleNextMonth = () => {
    setDate(addMonths(date, 1));
  };
  
  const getActiveTypesThisMonth = () => {
    return Object.keys(totalThisMonth)
      .sort((a, b) => totalThisMonth[b] - totalThisMonth[a])
      .slice(0, 3);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const daysWithActivities = getDaysWithActivities();
  const activeTypesThisMonth = getActiveTypesThisMonth();
  const totalActivitiesThisMonth = activities.length;
  
  return (
    <div className="space-y-6">
      {/* Monthly summary card */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold">{format(date, "MMMM yyyy")}</h3>
              <p className="text-muted-foreground">
                Your activity summary for this month
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="bg-background rounded-lg p-3 shadow-sm">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Total Activities
                </div>
                <div className="text-2xl font-bold">{totalActivitiesThisMonth}</div>
              </div>
              
              {activeTypesThisMonth.map(type => {
                const unitType = selectedDateActivities.find(a => a.activity_type === type)?.measurement_unit 
                  || 'count';
                return (
                  <div key={type} className="bg-background rounded-lg p-3 shadow-sm">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                      {getActivityIcon(type)}
                      {getActivityLabel(type)}
                    </div>
                    <div className="text-2xl font-bold">
                      {getFormattedMeasurement(totalThisMonth[type], unitType)}
                    </div>
                  </div>
                );
              })}
              
              <Button variant="outline" onClick={handleNewActivity} className="self-center">
                Log New Activity
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Activity Calendar</CardTitle>
              <CardDescription>
                Track your health journey throughout the month
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium min-w-28 text-center">
                {format(date, "MMMM yyyy")}
              </div>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-3">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                className="rounded-md border-0"
                modifiers={{
                  hasActivity: daysWithActivities
                    .filter(day => day.hasActivities)
                    .map(day => day.date),
                  today: [new Date()]
                }}
                modifiersClassNames={{
                  hasActivity: "font-bold text-primary relative",
                  today: "bg-accent font-bold text-accent-foreground"
                }}
                components={{
                  Day: ({ day, ...props }) => {
                    const dayWithActivity = daysWithActivities.find(
                      d => isSameDay(d.date, day.date)
                    );
                    
                    // Special styles for today
                    const isCurrentDay = isToday(day.date);
                    
                    // Don't modify days without activities and not today
                    if (!dayWithActivity?.hasActivities && !isCurrentDay) {
                      return <div {...props}>{format(day.date, "d")}</div>;
                    }
                    
                    return (
                      <div
                        {...props}
                        className={cn(
                          props.className,
                          "relative h-10 w-10 hover:bg-muted/80 rounded-md",
                          isCurrentDay && "ring-2 ring-primary ring-offset-1"
                        )}
                      >
                        <span>{format(day.date, "d")}</span>
                        
                        {/* Activity indicator dots */}
                        {dayWithActivity?.hasActivities && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                            {dayWithActivity.activityTypes.slice(0, 3).map((type, idx) => (
                              <div 
                                key={idx}
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  type === "running" ? "bg-green-500" :
                                  type === "walking" ? "bg-blue-500" :
                                  type === "cycling" ? "bg-purple-500" :
                                  type === "swimming" ? "bg-cyan-500" :
                                  type === "yoga" ? "bg-pink-500" :
                                  type === "meditation" ? "bg-indigo-500" :
                                  type === "weightlifting" ? "bg-amber-500" :
                                  "bg-gray-500" // Default color
                                )}
                              />
                            ))}
                            {dayWithActivity.activityTypes.length > 3 && (
                              <div className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                            )}
                          </div>
                        )}
                        
                        {/* Activity count badge for days with many activities */}
                        {dayWithActivity?.hasActivities && dayWithActivity.activityCount > 1 && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                            {dayWithActivity.activityCount}
                          </div>
                        )}
                      </div>
                    );
                  }
                }}
              />
            </div>
            
            <div className="p-4 pt-0 flex flex-wrap gap-2 justify-center border-t mt-2">
              <div className="flex items-center gap-1 text-xs">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Running</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span>Walking</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span>Cycling</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <div className="h-2 w-2 rounded-full bg-cyan-500"></div>
                <span>Swimming</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <div className="h-2 w-2 rounded-full bg-pink-500"></div>
                <span>Yoga</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                <span>Other</span>
              </div>
            </div>
          </CardContent>
          
          {/* Daily streak indicator - optional feature */}
          <CardFooter className="pt-0 pb-4">
            <div className="w-full bg-card p-3 rounded-lg border text-center">
              <span className="text-sm">
                {isToday(date) 
                  ? "Today" 
                  : `Selected: ${format(date, "EEEE, MMMM d, yyyy")}`}
              </span>
            </div>
          </CardFooter>
        </Card>
        
        <div className="space-y-6">
          <Card className="h-fit overflow-hidden">
            <CardHeader className="pb-2 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <span>{format(date, "EEEE, MMMM d, yyyy")}</span>
                  </CardTitle>
                  <CardDescription>
                    {selectedDateActivities.length 
                      ? `${selectedDateActivities.length} ${selectedDateActivities.length === 1 ? 'activity' : 'activities'} logged` 
                      : "No activities recorded"
                    }
                  </CardDescription>
                </div>
                {selectedDateActivities.length > 0 && (
                  <Badge variant="secondary" className="px-2 py-1">
                    {isToday(date) ? "Today" : format(date, "MMM d")}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className={cn(
              "pb-2",
              selectedDateActivities.length === 0 ? "pt-8" : "pt-4"
            )}>
              {selectedDateActivities.length > 0 ? (
                <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="details" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Activity Details
                    </TabsTrigger>
                    <TabsTrigger value="summary" className="text-xs">
                      <BarChart className="h-3 w-3 mr-1" />
                      Daily Summary
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="m-0">
                    <ScrollArea className="h-[350px] pr-4">
                      <div className="space-y-4">
                        {selectedDateActivities.map(activity => {
                          const { value, unit } = convertToPreferred(
                            activity.value,
                            activity.measurement_unit,
                            activity.activity_type
                          );
                          
                          return (
                            <div 
                              key={activity.id} 
                              className="p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors group"
                            >
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                                  getActivityColor(activity.activity_type)
                                )}>
                                  {getActivityIcon(activity.activity_type)}
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-medium text-sm">
                                        {getActivityLabel(activity.activity_type)}
                                      </h4>
                                      <p className="text-xl font-bold mt-0.5">
                                        {getFormattedMeasurement(value, unit)}
                                      </p>
                                      <Badge variant="outline" className="text-xs mt-2">
                                        {formatTime(parseISO(activity.completed_at))}
                                      </Badge>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-36">
                                        <DropdownMenuItem onClick={() => handleEditActivity(activity.id)}>
                                          <Edit className="mr-2 h-4 w-4" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleDeleteActivity(activity.id)}
                                          className="text-red-600 focus:text-red-600"
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  
                                  {activity.notes && (
                                    <div className="mt-3 text-sm text-muted-foreground rounded-md bg-muted/50 p-3">
                                      <div className="flex gap-2">
                                        <BookOpen className="h-4 w-4 mt-0.5 shrink-0 opacity-70" />
                                        <p className="text-sm">
                                          {activity.notes}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="summary" className="m-0">
                    <div className="space-y-6">
                      <div className="grid gap-3">
                        {/* Group activities by type and show totals */}
                        {Array.from(new Set(selectedDateActivities.map(a => a.activity_type)))
                          .map(type => {
                            const activitiesOfType = selectedDateActivities.filter(a => a.activity_type === type);
                            const totalValue = activitiesOfType.reduce((sum, a) => {
                              const { value } = convertToPreferred(
                                a.value,
                                a.measurement_unit,
                                type
                              );
                              return sum + value;
                            }, 0);
                            
                            const prefUnit = activitiesOfType[0]?.measurement_unit || 'count';
                            
                            return (
                              <div 
                                key={type} 
                                className="p-4 rounded-lg border flex items-center justify-between hover:bg-accent/30 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center",
                                    getActivityColor(type)
                                  )}>
                                    {getActivityIcon(type)}
                                  </div>
                                  <div>
                                    <div className="font-medium">
                                      {getActivityLabel(type)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {activitiesOfType.length} {activitiesOfType.length === 1 ? 'activity' : 'activities'}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-xl font-bold">
                                  {getFormattedMeasurement(totalValue, prefUnit)}
                                </div>
                              </div>
                            );
                          })
                        }
                      </div>
                      
                      {/* Add a visual indicator for overall activity level */}
                      <div className="pt-2 border-t">
                        <h4 className="text-sm font-medium mb-2">Activity Distribution</h4>
                        <div className="space-y-2">
                          {Array.from(new Set(selectedDateActivities.map(a => a.activity_type))).map(type => {
                            const count = selectedDateActivities.filter(a => a.activity_type === type).length;
                            const percentage = Math.round((count / selectedDateActivities.length) * 100);
                            
                            return (
                              <div key={type} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>{getActivityLabel(type)}</span>
                                  <span className="text-muted-foreground">{percentage}%</span>
                                </div>
                                <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                                  <div 
                                    className={cn(
                                      "h-full rounded-full",
                                      type === "running" ? "bg-green-500" :
                                      type === "walking" ? "bg-blue-500" :
                                      type === "cycling" ? "bg-purple-500" :
                                      type === "swimming" ? "bg-cyan-500" :
                                      type === "yoga" ? "bg-pink-500" :
                                      type === "meditation" ? "bg-indigo-500" :
                                      type === "weightlifting" ? "bg-amber-500" :
                                      "bg-gray-500" // Default color
                                    )}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-4 bg-primary/10 p-3 rounded-full">
                    <Activity className="h-12 w-12 text-primary opacity-70" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No activities logged</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-[250px]">
                    You haven't recorded any activities for {isToday(date) ? "today" : "this day"} yet.
                  </p>
                  <Button onClick={handleNewActivity} size="sm" className="gap-2">
                    <Activity className="h-4 w-4" />
                    Log Activity for {format(date, "MMM d")}
                  </Button>
                </div>
              )}
            </CardContent>
            
            {selectedDateActivities.length > 0 && (
              <CardFooter className="pt-2 pb-4 border-t">
                <Button onClick={handleNewActivity} className="w-full">
                  {selectedDateActivities.length > 0 
                    ? "Log Another Activity" 
                    : "Log Activity"
                  }
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
} 