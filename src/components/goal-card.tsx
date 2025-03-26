"use client";

import { updateGoalAction } from "@/app/actions";
import { Tables } from "@/types/supabase";
import { CheckCircle, Edit, Target, Trash } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Goal = Tables<"health_goals">;

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const [open, setOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState(
    goal.current_value?.toString() || "0",
  );

  const progress =
    goal.current_value && goal.target_value
      ? Math.min(
          Math.round((goal.current_value / goal.target_value) * 100),
          100,
        )
      : 0;

  const isCompleted = goal.status === "completed" || progress >= 100;

  const formatGoalType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getUnitLabel = (type: string) => {
    switch (type) {
      case "weight_loss":
        return "kg";
      case "steps":
        return "steps";
      case "workout":
        return "sessions";
      case "meditation":
        return "minutes";
      case "water":
        return "glasses";
      case "sleep":
        return "hours";
      default:
        return "";
    }
  };

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("goalId", goal.id);
    formData.append("currentValue", currentValue);

    await updateGoalAction(formData);
    setOpen(false);
  };

  return (
    <div
      className={`bg-card rounded-xl p-6 border shadow-sm ${isCompleted ? "border-green-500" : ""}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full ${isCompleted ? "bg-green-100" : "bg-primary/10"} flex items-center justify-center`}
          >
            {isCompleted ? (
              <CheckCircle className="text-green-600 h-5 w-5" />
            ) : (
              <Target className="text-primary h-5 w-5" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {formatGoalType(goal.goal_type)}
            </h3>
            <p className="text-sm text-muted-foreground">
              Target: {goal.target_value} {getUnitLabel(goal.goal_type)}
            </p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Goal Progress</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateProgress} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="currentValue">Current Value</Label>
                <Input
                  id="currentValue"
                  type="number"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  placeholder="Enter current value"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Progress</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div
            className={`${isCompleted ? "bg-green-500" : "bg-primary"} h-2.5 rounded-full transition-all duration-500`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Current: {goal.current_value || 0} {getUnitLabel(goal.goal_type)}
        </div>

        {goal.target_date && (
          <div className="text-sm text-muted-foreground">
            Due: {new Date(goal.target_date).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
