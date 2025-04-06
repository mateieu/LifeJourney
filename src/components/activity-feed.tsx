"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { getActivityLabel, formatMeasurement, convertToPreferred } from "@/lib/measurements";
import { useMeasurementPreferences } from "@/hooks/use-measurement-preferences";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupedActivities, setGroupedActivities] = useState<Record<string, Activity[]>>({});
  const { getPreferredUnit } = useMeasurementPreferences();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        
        // Get last 100 activities
        const { data, error } = await supabase
          .from("health_activities")
          .select("*")
          .order("completed_at", { ascending: false })
          .limit(100);
          
        if (error) throw error;
        
        setActivities(data || []);
        groupActivitiesByDate(data || []);
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
  }, [toast]);
  
  // Group activities by date for display
  const groupActivitiesByDate = (activityList: Activity[]) => {
    const grouped = activityList.reduce((groups, activity) => {
      const date = format(parseISO(activity.completed_at), "yyyy-MM-dd");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
      return groups;
    }, {} as Record<string, Activity[]>);
    
    setGroupedActivities(grouped);
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
      groupActivitiesByDate(updatedActivities);
      
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
  
  const handleEditActivity = (activityId: string) => {
    router.push(`/dashboard/activities/edit/${activityId}`);
  };
  
  // Convert measurement with preferred unit
  const handleConvertToPreferred = (value: number, fromUnitId: string, activityType: string) => {
    const preferredUnit = getPreferredUnit(activityType);
    const converted = convertToPreferred(value, fromUnitId, activityType, preferredUnit);
    return converted;
  };
  
  // Format measurement for display
  const formatMeasurementForDisplay = (value: number, unitId: string) => {
    return formatMeasurement(value, unitId);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4 text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto h-12 w-12"
          >
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">No activities yet</h3>
        <p className="text-muted-foreground max-w-sm mx-auto mb-4">
          Start logging your activities to track your health and fitness journey.
        </p>
        <Button onClick={() => router.push("/dashboard/activities/new")}>
          Log Your First Activity
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {Object.entries(groupedActivities)
        .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
        .map(([date, dailyActivities]) => (
          <div key={date} className="space-y-4">
            <div className="sticky top-0 bg-background pt-2 pb-2 z-10">
              <h3 className="text-lg font-medium">
                {format(new Date(date), "EEEE, MMMM d, yyyy")}
              </h3>
              <div className="h-px bg-border mt-2"></div>
            </div>
            
            <div className="space-y-3">
              {dailyActivities.map((activity) => {
                const convertedData = handleConvertToPreferred(
                  activity.value,
                  activity.measurement_unit,
                  activity.activity_type
                );
                
                return (
                  <Card key={activity.id} className="overflow-hidden">
                    <div className="flex p-6">
                      <div className="mr-4">
                        <Avatar className="h-12 w-12 bg-primary/10">
                          <AvatarFallback className="text-primary">
                            {activity.activity_type.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-base">
                            {getActivityLabel(activity.activity_type)}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {format(parseISO(activity.completed_at), "h:mm a")}
                            </Badge>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditActivity(activity.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteActivity(activity.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        <div className="text-lg font-medium">
                          {formatMeasurementForDisplay(convertedData.value, convertedData.unit)}
                        </div>
                        
                        {activity.notes && (
                          <p className="text-sm text-muted-foreground">
                            {activity.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
} 