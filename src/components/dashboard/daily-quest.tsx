import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FaChevronRight, FaTrophy } from 'react-icons/fa';
import { Quest } from '@/types/api';

interface DailyQuestProps {
  quest: Quest & { 
    status?: 'not_started' | 'in_progress' | 'completed' | 'failed';
    userProgress?: number;
  };
}

export function DailyQuest({ quest }: DailyQuestProps) {
  const [status, setStatus] = useState(quest.status || 'not_started');
  const [progress, setProgress] = useState(quest.userProgress || 0);
  
  // Calculate the progress percentage for display
  const progressPercentage = Math.min(100, Math.max(0, progress));
  
  // Determine the button text based on quest status
  const getButtonText = () => {
    switch (status) {
      case 'not_started':
        return 'Start Quest';
      case 'in_progress':
        return 'Continue';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'View Details';
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">{quest.title}</h4>
          <div className="flex items-center space-x-1 text-amber-500">
            <FaTrophy className="h-4 w-4" />
            <span className="text-sm font-medium">{quest.xpReward} XP</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {quest.description}
        </p>
        
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            status === 'completed' ? 'bg-green-100 text-green-800' :
            status === 'failed' ? 'bg-red-100 text-red-800' :
            status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {status.replace('_', ' ')}
          </span>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              disabled={status === 'completed' || status === 'failed'}
            >
              {getButtonText()}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <FaChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
} 