"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { 
  getDefaultUnit, 
  getAllowedUnits, 
  MEASUREMENT_UNITS 
} from "@/lib/measurements";
import { useMeasurementPreferences } from "@/hooks/use-measurement-preferences";

interface LogActivityFormProps {
  onSuccess?: (activity: any) => void;
  closeDialog?: () => void;
}

export function LogActivityForm({ onSuccess, closeDialog }: LogActivityFormProps) {
  const [loading, setLoading] = useState(false);
  const [activityType, setActivityType] = useState("");
  const [value, setValue] = useState("");
  const [measurementUnit, setMeasurementUnit] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");
  const [availableUnits, setAvailableUnits] = useState<Array<{id: string, label: string}>>([]);
  const { getPreferredUnit, setPreference } = useMeasurementPreferences();
  
  // Update available units when activity type changes
  useEffect(() => {
    if (activityType) {
      const units = getAllowedUnits(activityType);
      setAvailableUnits(units);
      
      // Set to user's preferred unit or default
      const preferredUnit = getPreferredUnit(activityType);
      setMeasurementUnit(preferredUnit);
    } else {
      setAvailableUnits([]);
      setMeasurementUnit("");
    }
  }, [activityType, getPreferredUnit]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate input
      if (!activityType || !value || !measurementUnit) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Get user and submit activity
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to log activities",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Create the activity record
      const newActivity = {
        user_id: user.id,
        activity_type: activityType,
        value: parseFloat(value),
        measurement_unit: measurementUnit,
        completed_at: date.toISOString(),
        notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from("health_activities")
        .insert(newActivity)
        .select()
        .single();
        
      if (error) throw error;
      
      // Track user preference for this activity type
      setPreference(activityType, measurementUnit);
      
      toast({
        title: "Activity logged",
        description: `${value} ${MEASUREMENT_UNITS[measurementUnit]?.label || measurementUnit} of ${activityType} recorded`,
      });
      
      // Notify parent component
      if (onSuccess) onSuccess(data);
      resetForm();
      if (closeDialog) closeDialog();
    } catch (error) {
      console.error('Error logging activity:', error);
      toast({
        title: "Failed to log activity",
        description: "There was an error recording your activity.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setActivityType("");
    setValue("");
    setMeasurementUnit("");
    setDate(new Date());
    setNotes("");
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="activityType">Activity Type</Label>
        <Select
          value={activityType}
          onValueChange={setActivityType}
        >
          <SelectTrigger id="activityType">
            <SelectValue placeholder="Select activity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="walking">Walking</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="cycling">Cycling</SelectItem>
            <SelectItem value="swimming">Swimming</SelectItem>
            <SelectItem value="yoga">Yoga</SelectItem>
            <SelectItem value="meditation">Meditation</SelectItem>
            <SelectItem value="strength">Strength Training</SelectItem>
            <SelectItem value="water">Water Intake</SelectItem>
            <SelectItem value="sleep">Sleep</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {activityType && (
        <div className="space-y-2">
          <Label htmlFor="measurementUnit">Measurement Unit</Label>
          <Select
            value={measurementUnit}
            onValueChange={setMeasurementUnit}
          >
            <SelectTrigger id="measurementUnit">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {availableUnits.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="value">Value</Label>
        <div className="flex items-center gap-2">
          <Input
            id="value"
            type="number"
            min="0"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1"
          />
          {measurementUnit && (
            <div className="text-sm text-muted-foreground min-w-16">
              {MEASUREMENT_UNITS[measurementUnit]?.label || measurementUnit}
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <DatePicker
          date={date}
          setDate={(newDate: Date) => setDate(newDate)}
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional notes here"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetForm();
            if (closeDialog) closeDialog();
          }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Logging..." : "Log Activity"}
        </Button>
      </div>
    </form>
  );
} 