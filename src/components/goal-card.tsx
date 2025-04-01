"use client";

import { formatDistanceToNow, format } from "date-fns";
import { CheckCircle, Edit, Target, Trash, Award, Calendar, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "@/components/ui/progress";
import { Tables } from "@/types/supabase";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type Goal = Tables<"health_goals">;

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const [open, setOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState(
    goal.current_value?.toString() || "0",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const progress =
    goal.current_value && goal.target_value
      ? Math.min(
          Math.round((goal.current_value / goal.target_value) * 100),
          100,
        )
      : 0;

  const isCompleted = goal.status === "completed" || progress >= 100;

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
      case "walking":
      case "running":
      case "cycling":
        return "km";
      default:
        return "";
    }
  };

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const numValue = parseFloat(currentValue);
      if (isNaN(numValue)) {
        throw new Error("Please enter a valid number");
      }
      
      // Get the target value to check if completed
      const targetValue = goal.target_value || 0;
      
      // Determine status based on progress
      const newStatus = numValue >= targetValue ? "completed" : "active";
      
      const supabase = createClient();
      const { error } = await supabase
        .from("health_goals")
        .update({
          current_value: numValue,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", goal.id);

      if (error) throw error;
      
      // Close dialog and refresh
      setOpen(false);
      router.refresh();
      window.location.reload(); // Force a page refresh to show updated data
    } catch (error) {
      console.error("Error updating goal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGoalIcon = () => {
    switch (goal.goal_type) {
      case "steps":
        return { icon: <Target className="h-5 w-5" />, color: "bg-blue-100 text-blue-600" };
      case "walking":
        return { icon: <Target className="h-5 w-5" />, color: "bg-green-100 text-green-600" };
      case "running":
        return { icon: <Target className="h-5 w-5" />, color: "bg-orange-100 text-orange-600" };
      case "cycling":
        return { icon: <Target className="h-5 w-5" />, color: "bg-purple-100 text-purple-600" };
      case "water":
        return { icon: <Target className="h-5 w-5" />, color: "bg-cyan-100 text-cyan-600" };
      case "sleep":
        return { icon: <Target className="h-5 w-5" />, color: "bg-indigo-100 text-indigo-600" };
      case "meditation":
        return { icon: <Target className="h-5 w-5" />, color: "bg-violet-100 text-violet-600" };
      case "workout":
        return { icon: <Target className="h-5 w-5" />, color: "bg-red-100 text-red-600" };
      case "weight_loss":
        return { icon: <Target className="h-5 w-5" />, color: "bg-yellow-100 text-yellow-600" };
      default:
        return { icon: <Target className="h-5 w-5" />, color: "bg-gray-100 text-gray-600" };
    }
  };

  const getGoalTitle = () => {
    switch (goal.goal_type) {
      case "steps":
        return "Daily Steps";
      case "walking":
        return "Walking Goal";
      case "running":
        return "Running Goal";
      case "cycling":
        return "Cycling Goal";
      case "water":
        return "Water Intake";
      case "sleep":
        return "Sleep Goal";
      case "meditation":
        return "Meditation Goal";
      case "workout":
        return "Workout Goal";
      case "weight_loss":
        return "Weight Loss";
      default:
        return "Health Goal";
    }
  };

  const { icon, color } = getGoalIcon();
  const title = getGoalTitle();
  const unit = getUnitLabel(goal.goal_type);

  return (
    <div className={`border rounded-lg overflow-hidden ${
      goal.status === "completed" ? "bg-green-50 border-green-100" : "bg-white"
    }`}>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-full ${color}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">
              Target: {goal.target_value} {unit}
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {goal.current_value || 0} {unit}
            </span>
            <span className="text-muted-foreground">
              {goal.target_value} {unit}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {goal.target_date && (
              <span>
                Due {formatDistanceToNow(new Date(goal.target_date), { addSuffix: true })}
              </span>
            )}
          </div>
          
          {goal.status === "completed" && (
            <div className="flex items-center gap-1 text-green-600">
              <Award className="h-4 w-4" />
              <span>Goal achieved!</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-muted/20 p-3 border-t flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          Started {goal.start_date 
            ? format(new Date(goal.start_date), 'MMM d, yyyy')
            : format(new Date(goal.created_at), 'MMM d, yyyy')}
        </span>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              Update <ArrowRight className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Goal Progress</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateProgress} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="currentValue">Current Progress</Label>
                <Input
                  id="currentValue"
                  type="number"
                  step="0.01"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  placeholder={`Enter current value in ${unit}`}
                />
                <p className="text-sm text-muted-foreground">
                  Your goal: {goal.target_value} {unit}
                </p>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Progress"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
