import { useState, useEffect } from 'react';
import { Check, Award, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tables } from '@/types/supabase';
import { SimpleConfetti } from './simple-confetti';

type Goal = Tables<"health_goals"> & {
  measurement_unit?: string;
};

export function GoalAchievementModal({ 
  goal, 
  open, 
  onOpenChange,
  onShare,
  onViewAll
}: { 
  goal: Goal | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onShare: () => void;
  onViewAll: () => void;
}) {
  if (!goal) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <SimpleConfetti active={open} duration={5000} />
        
        <DialogHeader>
          <DialogTitle className="text-center text-xl sm:text-2xl flex justify-center items-center gap-2">
            <Award className="h-6 w-6 text-yellow-500" />
            Goal Achieved!
            <Award className="h-6 w-6 text-yellow-500" />
          </DialogTitle>
          <DialogDescription className="text-center pt-2 text-lg">
            Congratulations on completing your {goal.goal_type} goal!
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-12 w-12 text-green-600" />
          </div>
          
          <div className="text-center space-y-2">
            <p className="font-medium">
              {goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1)}
            </p>
            <p className="text-xl font-bold">
              {goal.target_value} {goal.measurement_unit || 'units'}
            </p>
            <p className="text-sm text-muted-foreground">
              You've reached {Math.round((goal.current_value || 0) / (goal.target_value || 1) * 100)}% of your target!
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onShare} className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share Achievement
          </Button>
          <Button onClick={onViewAll}>View All Goals</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 