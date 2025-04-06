"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Tables } from "@/types/supabase";
import { toast } from "@/components/ui/use-toast";

type Goal = Tables<"health_goals"> & {
  measurement_unit?: string;
};

interface GoalActivityLoggerProps {
  goal: Goal;
  onSuccess?: (updatedGoal: Goal) => void;
  closeDialog?: () => void;
}

export function GoalActivityLogger({ goal, onSuccess, closeDialog }: GoalActivityLoggerProps) {
  const [loading, setLoading] = useState(false);
  const [activityValue, setActivityValue] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!activityValue || !date) {
      toast({
        title: "Missing information",
        description: "Please provide the activity value and date",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to log activities",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Log the activity
      const { error: activityError } = await supabase
        .from("health_activities")
        .insert({
          user_id: user.id,
          activity_type: goal.goal_type,
          value: parseFloat(activityValue),
          completed_at: date.toISOString(),
          notes,
          measurement_unit: goal.measurement_unit,
        });

      if (activityError) throw activityError;

      // Calculate new progress for the goal
      const newCurrentValue = (goal.current_value || 0) + parseFloat(activityValue);
      
      // Update the goal progress
      const { data: updatedGoal, error: goalError } = await supabase
        .from("health_goals")
        .update({
          current_value: newCurrentValue,
          // If we've reached the target, mark as completed
          ...(newCurrentValue >= (goal.target_value || 0) ? { status: "completed" } : {})
        })
        .eq("id", goal.id)
        .select()
        .single();

      if (goalError) throw goalError;

      toast({
        title: "Activity logged",
        description: "Your activity has been recorded and goal progress updated",
      });

      if (onSuccess && updatedGoal) {
        onSuccess(updatedGoal);
      }
      
      if (closeDialog) {
        closeDialog();
      }
    } catch (error) {
      console.error("Error logging activity:", error);
      toast({
        title: "Failed to log activity",
        description: "There was an error recording your activity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="activityType">Activity Type</Label>
        <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 py-2 text-sm capitalize">
          {goal.goal_type}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="activityValue">Activity Value</Label>
        <div className="flex">
          <Input
            id="activityValue"
            type="number"
            min="0"
            step="any"
            value={activityValue}
            onChange={(e) => setActivityValue(e.target.value)}
            placeholder={`Enter value in ${goal.measurement_unit || "units"}`}
            required
            className="flex-1"
          />
          <div className="flex items-center ml-2 text-sm text-muted-foreground">
            {goal.measurement_unit || "units"}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <DatePicker 
          date={date} 
          setDate={setDate} 
          disabled={(date: Date) => date > new Date()} 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Input
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this activity"
        />
      </div>

      <div className="flex justify-between pt-2">
        <div>
          <p className="text-sm text-muted-foreground">
            Current progress: {goal.current_value || 0} / {goal.target_value} {goal.measurement_unit || "units"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            After logging: {(goal.current_value || 0) + (parseFloat(activityValue) || 0)} / {goal.target_value} {goal.measurement_unit || "units"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={closeDialog}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Logging..." : "Log Activity"}
          </Button>
        </div>
      </div>
    </form>
  );
} 