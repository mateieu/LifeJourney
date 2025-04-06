"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
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
import { DatePicker } from "@/components/ui/date-picker";
import { Tables } from "@/types/supabase";
import { activityMeasurements, defaultMeasurements } from "@/lib/measurements";
import { addDays } from "@/lib/date-utils";

type Goal = Tables<"health_goals"> & {
  measurement_unit?: string;
  notes?: string | null;
};

interface EditGoalFormProps {
  goal: Goal;
  onSuccess?: (updatedGoal: Goal) => void;
  closeDialog?: () => void;
}

export function EditGoalForm({ goal, onSuccess, closeDialog }: EditGoalFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [goalType, setGoalType] = useState(goal.goal_type || "");
  const [targetValue, setTargetValue] = useState((goal.target_value || "").toString());
  const [startDate, setStartDate] = useState<Date | undefined>(
    goal.start_date ? new Date(goal.start_date) : undefined
  );
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    goal.target_date ? new Date(goal.target_date) : undefined
  );
  const [notes, setNotes] = useState(goal.notes || "");
  const [measurementUnit, setMeasurementUnit] = useState(goal.measurement_unit || "");
  const [availableUnits, setAvailableUnits] = useState<{value: string, label: string}[]>([]);

  // Update available measurement units when goal type changes
  useEffect(() => {
    if (goalType && activityMeasurements[goalType]) {
      setAvailableUnits(activityMeasurements[goalType]);
      if (!measurementUnit || !activityMeasurements[goalType].some(u => u.value === measurementUnit)) {
        setMeasurementUnit(defaultMeasurements[goalType] || "");
      }
    } else {
      setAvailableUnits([]);
      setMeasurementUnit("");
    }
  }, [goalType, measurementUnit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!goalType || !targetValue || !targetDate) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to update a goal");
        setLoading(false);
        return;
      }

      const updatedGoal = {
        goal_type: goalType,
        target_value: parseFloat(targetValue),
        start_date: startDate?.toISOString(),
        target_date: targetDate?.toISOString(),
        notes,
        measurement_unit: measurementUnit || defaultMeasurements[goalType] || "units",
      };

      const { data, error: updateError } = await supabase
        .from("health_goals")
        .update(updatedGoal)
        .eq("id", goal.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating goal:", updateError);
        setError(updateError.message);
      } else if (data) {
        if (onSuccess) onSuccess(data);
        if (closeDialog) closeDialog();
      }
    } catch (err) {
      console.error("Error updating goal:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="goalType">Goal Type</Label>
        <Select
          value={goalType}
          onValueChange={setGoalType}
          required
        >
          <SelectTrigger id="goalType">
            <SelectValue placeholder="Select a goal type" />
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
        <div className="space-y-2">
          <Label htmlFor="measurementUnit">Measurement Unit</Label>
          <Select
            value={measurementUnit}
            onValueChange={setMeasurementUnit}
            required
          >
            <SelectTrigger id="measurementUnit">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {availableUnits.map((unit) => (
                <SelectItem key={unit.value} value={unit.value}>
                  {unit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="targetValue">Target Value</Label>
          <div className="flex items-center">
            <Input
              id="targetValue"
              type="number"
              min="0"
              step="any"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              required
              className="flex-1"
            />
            {measurementUnit && (
              <span className="ml-2 text-sm text-muted-foreground min-w-16">
                {measurementUnit}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <DatePicker
            date={startDate}
            setDate={setStartDate}
          />
        </div>
        <div className="space-y-2">
          <Label>Target Date</Label>
          <DatePicker
            date={targetDate}
            setDate={setTargetDate}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Add any additional notes about your goal"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={closeDialog}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
} 