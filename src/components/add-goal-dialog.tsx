"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MeasurementUnitSelector } from "@/components/measurement-unit-selector";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "@/components/ui/use-toast";
import { getDefaultUnit } from "@/lib/measurements";

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalAdded: (goal: any) => void;
}

export function AddGoalDialog({
  open,
  onOpenChange,
  onGoalAdded,
}: AddGoalDialogProps) {
  const [goalType, setGoalType] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [measurementUnit, setMeasurementUnit] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [targetDate, setTargetDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // Default to 30 days from now
    return date;
  });
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      // Only reset when dialog closes
      setGoalType("");
      setTargetValue("");
      setMeasurementUnit("");
      setStartDate(new Date());
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      setTargetDate(futureDate);
      setNotes("");
    }
  }, [open]);

  // Set default measurement unit when goal type changes
  useEffect(() => {
    if (goalType) {
      setMeasurementUnit(getDefaultUnit(goalType));
    }
  }, [goalType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!goalType || !targetValue || !startDate || !targetDate) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validate that target date is after start date
      if (targetDate < startDate) {
        toast({
          title: "Invalid dates",
          description: "Target date must be after start date",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to create goals",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Create the goal
      const newGoal = {
        user_id: user.id,
        goal_type: goalType,
        target_value: parseFloat(targetValue),
        current_value: 0,
        measurement_unit: measurementUnit,
        start_date: startDate.toISOString(),
        target_date: targetDate.toISOString(),
        status: "in_progress",
        notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("health_goals")
        .insert(newGoal)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Goal created",
        description: "Your new goal has been created successfully",
      });

      // Notify parent component
      onGoalAdded(data);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating goal:", error);
      toast({
        title: "Error creating goal",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Goal</DialogTitle>
            <DialogDescription>
              Set a new health goal to track your progress
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="goalType">Goal Type</Label>
              <Select
                value={goalType}
                onValueChange={setGoalType}
              >
                <SelectTrigger>
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
              />
            )}

            <div className="grid gap-2">
              <Label htmlFor="targetValue">Target Value</Label>
              <Input
                id="targetValue"
                type="number"
                min="0"
                step="any"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <DatePicker
                  date={startDate}
                  setDate={(newDate) => setStartDate(newDate)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="targetDate">Target Date</Label>
                <DatePicker
                  date={targetDate}
                  setDate={(newDate) => setTargetDate(newDate)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about your goal"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 