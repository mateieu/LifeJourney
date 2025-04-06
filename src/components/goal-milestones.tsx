import { Tables } from "@/types/supabase";
import { CheckCircle2, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type Goal = Tables<"health_goals"> & {
  measurement_unit?: string;
};

interface GoalMilestonesProps {
  goal: Goal;
}

export function GoalMilestones({ goal }: GoalMilestonesProps) {
  const calculateProgress = () => {
    if (!goal.current_value || !goal.target_value) return 0;
    return (goal.current_value / goal.target_value) * 100;
  };

  const progress = calculateProgress();
  const milestones = [25, 50, 75, 100];
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Milestones</h3>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {milestones.map((milestone) => {
          const achieved = progress >= milestone;
          const milestoneValue = (goal.target_value || 0) * (milestone / 100);
          
          return (
            <div 
              key={milestone} 
              className={`p-3 rounded-md border text-center ${
                achieved ? "bg-primary/10 border-primary/20" : "bg-muted/30 border-muted"
              }`}
            >
              <div className="flex justify-center mb-2">
                {achieved ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <p className={`text-sm font-medium ${achieved ? "text-foreground" : "text-muted-foreground"}`}>
                {milestone}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {milestoneValue.toFixed(1)} {goal.measurement_unit || "units"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
} 