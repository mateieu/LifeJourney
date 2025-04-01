import { useState } from 'react';
import { format } from 'date-fns';
import { FaCheckCircle, FaRegCircle, FaChevronRight } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Habit } from '@/types/api';

interface HabitTrackerProps {
  habit: Habit & { completed?: boolean; progress?: number };
}

export function HabitTracker({ habit }: HabitTrackerProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(habit.completed || false);
  const [progress, setProgress] = useState(habit.progress || 0);
  const { toast } = useToast();

  const handleToggleCompletion = async () => {
    setIsCompleting(true);
    try {
      // API call to update habit completion status
      const newCompletionStatus = !isCompleted;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsCompleted(newCompletionStatus);
      if (newCompletionStatus) {
        setProgress(100);
        toast({
          title: 'Habit completed!',
          description: `You've earned 10 XP for completing ${habit.name}`,
        });
      } else {
        setProgress(0);
      }
    } catch (error) {
      console.error('Failed to update habit status', error);
      toast({
        title: 'Error',
        description: 'Failed to update habit status',
        variant: 'destructive',
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <Card className="p-4 flex items-center space-x-3">
      <Button 
        variant="ghost" 
        size="icon" 
        className="flex-shrink-0" 
        onClick={handleToggleCompletion}
        disabled={isCompleting}
      >
        {isCompleted ? (
          <FaCheckCircle className="h-6 w-6 text-primary" />
        ) : (
          <FaRegCircle className="h-6 w-6 text-muted-foreground" />
        )}
      </Button>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-medium truncate">{habit.name}</h4>
          <span className="text-xs text-muted-foreground">
            {habit.targetValue ? `${progress}% of ${habit.targetValue}${habit.unit || ''}` : ''}
          </span>
        </div>
        
        {habit.targetValue && (
          <Progress value={progress} className="h-1.5" />
        )}
        
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-muted-foreground">
            {habit.frequency === 'daily' ? 'Daily' : habit.frequency}
          </span>
          {habit.category && (
            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
              {habit.category}
            </span>
          )}
        </div>
      </div>
      
      <Button variant="ghost" size="icon" className="flex-shrink-0">
        <FaChevronRight className="h-4 w-4 text-muted-foreground" />
      </Button>
    </Card>
  );
} 