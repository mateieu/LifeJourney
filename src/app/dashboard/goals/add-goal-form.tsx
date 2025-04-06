"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { MeasurementUnitSelector } from "@/components/measurement-unit-selector";
import { getDefaultUnit, getFormattedMeasurement, MEASUREMENT_UNITS } from "@/lib/measurements";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, addDays } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { runPendingMigrations } from "@/lib/db-migrations";
import { addMeasurementUnitToGoals } from "@/db/migrations/add_measurement_unit_to_goals";
import { DatePicker } from "@/components/ui/date-picker";

interface AddGoalFormProps {
  onSuccess?: (newGoal: any) => void;
  closeDialog?: () => void;
  initialValues?: {
    goalType?: string;
    targetValue?: number;
    measurementUnit?: string;
  };
}

export function AddGoalForm({ 
  onSuccess,
  closeDialog,
  initialValues = {}
}: AddGoalFormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [goalType, setGoalType] = useState<string>(initialValues.goalType || '');
  const [targetValue, setTargetValue] = useState<string>(
    initialValues.targetValue ? initialValues.targetValue.toString() : ''
  );
  const [measurementUnit, setMeasurementUnit] = useState<string>(
    initialValues.measurementUnit || ''
  );
  const [startDate, setStartDate] = useState<Date>(initialValues.startDate || new Date());
  const [targetDate, setTargetDate] = useState<Date>(initialValues.targetDate || addDays(new Date(), 30));
  const [notes, setNotes] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    runPendingMigrations();
  }, []);

  useEffect(() => {
    if (goalType) {
      const defaultUnit = getDefaultUnit(goalType);
      setMeasurementUnit(defaultUnit);
    }
  }, [goalType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goalType || !targetValue || !measurementUnit) {
      toast({
        title: "Missing information",
        description: "Please provide all required fields",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to create goals",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      const newGoal = {
        user_id: user.id,
        goal_type: goalType,
        target_value: parseFloat(targetValue),
        measurement_unit: measurementUnit,
        start_date: startDate.toISOString(),
        target_date: targetDate.toISOString(),
        notes,
        current_value: 0,
        status: "in_progress",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from("health_goals")
        .insert(newGoal)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Goal created",
        description: `Goal to reach ${getFormattedMeasurement(parseFloat(targetValue), measurementUnit)} of ${goalType} created`,
      });
      
      if (onSuccess) onSuccess(data);
      resetForm();
      if (closeDialog) closeDialog();
      
      router.refresh();
    } catch (err: any) {
      console.error('Error creating goal:', err);
      toast({
        title: "Failed to create goal",
        description: "There was an error creating your goal.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setGoalType('');
    setTargetValue('');
    setMeasurementUnit('');
    setStartDate(new Date());
    const defaultTarget = new Date();
    defaultTarget.setDate(defaultTarget.getDate() + 30);
    setTargetDate(defaultTarget);
    setNotes('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="goalType" className="text-sm font-medium">
          Goal Type
        </label>
        <Select 
          value={goalType} 
          onValueChange={(value) => setGoalType(value)}
        >
          <SelectTrigger id="goalType">
            <SelectValue placeholder="Select goal type" />
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
      
      {goalType && (
        <MeasurementUnitSelector 
          activityType={goalType}
          value={measurementUnit}
          onChange={setMeasurementUnit}
          usePreferredAsDefault={true}
        />
      )}
      
      <div className="space-y-2">
        <label htmlFor="targetValue" className="text-sm font-medium">
          Target Value
        </label>
        <div className="flex items-center">
          <Input
            id="targetValue"
            type="number"
            min="0"
            step="any"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder={`Enter ${goalType || 'goal'} target`}
            className="w-full"
          />
          <span className="ml-2 text-sm text-muted-foreground min-w-[60px]">
            {measurementUnit && MEASUREMENT_UNITS[measurementUnit]?.label}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="startDate" className="text-sm font-medium">
            Start Date
          </label>
          <DatePicker
            date={startDate}
            setDate={(newDate: Date) => setStartDate(newDate)}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="targetDate" className="text-sm font-medium">
            Target Date
          </label>
          <DatePicker
            date={targetDate}
            setDate={(newDate: Date) => setTargetDate(newDate)}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Notes (Optional)
        </label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes about your goal"
          className="min-h-[80px]"
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        {closeDialog && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={closeDialog}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Goal"}
        </Button>
      </div>
    </form>
  );
} 