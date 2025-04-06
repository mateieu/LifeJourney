"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { createClient } from "@/utils/supabase/client";
import { MoreHorizontal, Award, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getFormattedMeasurement } from "@/lib/measurements";

interface GoalsListProps {
  goals: any[];
  setGoals: (goals: any[]) => void;
}

export function GoalsList({ goals, setGoals }: GoalsListProps) {
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  
  const getProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };
  
  const getColorClass = (progress: number) => {
    if (progress < 30) return "bg-red-500";
    if (progress < 70) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };
  
  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('health_goals')
        .delete()
        .eq('id', goalId);
      
      if (error) throw error;
      
      setGoals(goals.filter(goal => goal.id !== goalId));
      
      toast({
        title: "Goal deleted",
        description: "Goal has been successfully removed",
      });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error deleting goal",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };
  
  const toggleExpand = (goalId: string) => {
    setExpandedGoalId(expandedGoalId === goalId ? null : goalId);
  };
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {goals.map((goal) => {
        const progress = getProgress(goal.current_value || 0, goal.target_value);
        const isExpanded = expandedGoalId === goal.id;
        
        return (
          <Card key={goal.id} className={isExpanded ? "border-primary" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="capitalize">{goal.goal_type}</CardTitle>
                  <CardDescription className="mt-1">
                    Target: {getFormattedMeasurement(goal.target_value, goal.measurement_unit || 'count')}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toggleExpand(goal.id)}>
                      {isExpanded ? "Hide details" : "View details"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteGoal(goal.id)}>
                      Delete goal
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className={getColorClass(progress)} />
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>
                    {getFormattedMeasurement(goal.current_value || 0, goal.measurement_unit || 'count')}
                  </span>
                  <span>
                    {getFormattedMeasurement(goal.target_value, goal.measurement_unit || 'count')}
                  </span>
                </div>
              </div>
              
              {isExpanded && (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Started: {formatDate(goal.start_date)} | 
                      Target: {formatDate(goal.target_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Status: <Badge variant="outline" className="ml-1 capitalize">{goal.status}</Badge>
                    </span>
                  </div>
                  {goal.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-muted-foreground">{goal.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full" 
                onClick={() => toggleExpand(goal.id)}
              >
                {isExpanded ? "Hide details" : "View details"}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
} 