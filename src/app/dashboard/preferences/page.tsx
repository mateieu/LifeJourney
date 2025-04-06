'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { useMeasurementPreferences } from "@/hooks/use-measurement-preferences";
import { useTimeFormat } from "@/hooks/use-time-format";
import { 
  getAllActivityTypes, 
  getActivityLabel, 
  getAllowedUnits,
  getUnitById
} from "@/lib/measurements";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Clock } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DashboardNavbar } from "@/components/dashboard-navbar";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";

export default function PreferencesPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [activityTypes, setActivityTypes] = useState<string[]>([]);
  const { 
    preferences, 
    loading: measurementsLoading, 
    savePreferences, 
    setPreference, 
    getPreferredUnit 
  } = useMeasurementPreferences();
  const {
    timeFormat,
    loading: timeFormatLoading,
    saveTimeFormat
  } = useTimeFormat();
  const [user, setUser] = useState<User | null>(null);
  
  // Load all available activity types
  useEffect(() => {
    setActivityTypes(getAllActivityTypes());
  }, []);
  
  // Load user data
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    fetchUser();
  }, []);
  
  const handleUnitChange = (activityType: string, unitId: string) => {
    setPreference(activityType, unitId);
  };
  
  const handleTimeFormatChange = (format: string) => {
    saveTimeFormat(format as '12h' | '24h');
    toast({
      title: "Time format updated",
      description: `Time will now be displayed in ${format === '12h' ? '12-hour' : '24-hour'} format.`
    });
  };
  
  const handleSavePreferences = async () => {
    setIsSaving(true);
    
    try {
      await savePreferences(preferences);
      toast({
        title: "Preferences saved",
        description: "Your measurement preferences have been saved successfully."
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error saving preferences",
        description: "There was an error saving your preferences. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const isLoading = measurementsLoading || timeFormatLoading;
  
  const currentTime = new Date();
  const timeIn12h = currentTime.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
  const timeIn24h = currentTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <>
      <DashboardNavbar user={user} />
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Preferences</h1>
        
        {/* Time Format Preferences */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Format
            </CardTitle>
            <CardDescription>
              Choose how time is displayed throughout the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              defaultValue={timeFormat}
              onValueChange={handleTimeFormatChange}
              className="grid gap-6 grid-cols-2 pt-2"
            >
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="12h" id="12h" className="mt-1" />
                <div className="flex flex-col gap-1">
                  <Label htmlFor="12h" className="font-medium">12-hour (AM/PM)</Label>
                  <p className="text-muted-foreground text-sm">Example: {timeIn12h}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="24h" id="24h" className="mt-1" />
                <div className="flex flex-col gap-1">
                  <Label htmlFor="24h" className="font-medium">24-hour</Label>
                  <p className="text-muted-foreground text-sm">Example: {timeIn24h}</p>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
        
        {/* Measurement Units */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Measurement Units</CardTitle>
            <CardDescription>
              Set your preferred units for each activity type. These will be used by default when logging activities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {activityTypes.map(activityType => {
                const allowedUnits = getAllowedUnits(activityType);
                const currentUnit = getPreferredUnit(activityType);
                
                // Skip if there's only one unit available
                if (allowedUnits.length <= 1) return null;
                
                return (
                  <div key={activityType} className="space-y-2">
                    <Label htmlFor={`unit-${activityType}`}>{getActivityLabel(activityType)}</Label>
                    <Select 
                      value={currentUnit}
                      onValueChange={(value) => handleUnitChange(activityType, value)}
                    >
                      <SelectTrigger id={`unit-${activityType}`}>
                        <SelectValue>
                          {getUnitById(currentUnit)?.label || currentUnit}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {allowedUnits.map(unit => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.label} {unit.abbreviation ? `(${unit.abbreviation})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleSavePreferences} 
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Measurement Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 