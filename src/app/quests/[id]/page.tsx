import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlay, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MainLayout } from '@/components/layouts/main-layout';

const QuestDetailPage = ({ quest }) => {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async (status) => {
    setIsUpdating(true);
    try {
      // Implement the logic to update the quest status
    } catch (error) {
      console.error('Error updating quest status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-6">{quest.name}</h1>

        <Card className="p-4 mb-6">
          <h2 className="font-semibold mb-4">Quest Details</h2>
          <div className="space-y-4">
            <div>
              <span className="font-medium">Target Duration:</span>{' '}
              <span className="text-muted-foreground">
                {quest.requirements.targetMinutes} minutes per day
              </span>
            </div>
            
            <div>
              <span className="font-medium">Required Days:</span>{' '}
              <span className="text-muted-foreground">
                {quest.requirements.days} days
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4 mb-6">
          <h2 className="font-semibold mb-4">Requirements</h2>
          <div className="space-y-4">
            {quest.requirements.type === 'streak' && (
              <>
                <div>
                  <span className="font-medium">Activity Type:</span>{' '}
                  <span className="text-muted-foreground capitalize">
                    {quest.requirements.habitCategory}
                  </span>
                </div>
                
                <div>
                  <span className="font-medium">Required Streak:</span>{' '}
                  <span className="text-muted-foreground">
                    {quest.requirements.count || quest.requirements.days} days in a row
                  </span>
                </div>
                
                {quest.requirements.timeConstraint && (
                  <div>
                    <span className="font-medium">Time Constraint:</span>{' '}
                    <span className="text-muted-foreground">
                      Before {quest.requirements.timeConstraint.before?.slice(0, 5)}
                    </span>
                  </div>
                )}
              </>
            )}
            
            {quest.requirements.type === 'count' && (
              <>
                <div>
                  <span className="font-medium">Activity Type:</span>{' '}
                  <span className="text-muted-foreground capitalize">
                    {quest.requirements.habitCategory || 'Specific habit'}
                  </span>
                </div>
                
                <div>
                  <span className="font-medium">Target Count:</span>{' '}
                  <span className="text-muted-foreground">
                    {quest.requirements.targetValue} per day
                  </span>
                </div>
                
                <div>
                  <span className="font-medium">Required Days:</span>{' '}
                  <span className="text-muted-foreground">
                    {quest.requirements.days} days
                  </span>
                </div>
                
                {quest.requirements.criteria && (
                  <div>
                    <span className="font-medium">Specific Criteria:</span>{' '}
                    <span className="text-muted-foreground">
                      {quest.requirements.criteria.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
        
        {/* Related Achievements */}
        {quest.relatedAchievements && quest.relatedAchievements.length > 0 && (
          <Card className="p-4 mb-6">
            <h2 className="font-semibold mb-4">Related Achievements</h2>
            
            <div className="space-y-4">
              {quest.relatedAchievements.map(achievement => (
                <div key={achievement.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <img 
                      src={achievement.iconUrl || '/icons/default-achievement.svg'} 
                      alt={achievement.name}
                      className="w-6 h-6"
                    />
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm">{achievement.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {quest.status === 'not_started' && (
            <Button 
              onClick={() => handleUpdateStatus('in_progress')} 
              disabled={isUpdating}
              className="w-full"
            >
              <FaPlay className="mr-2 h-4 w-4" />
              Start Quest
            </Button>
          )}
          
          {quest.status === 'in_progress' && quest.progress === 100 && (
            <Button 
              onClick={() => handleUpdateStatus('completed')} 
              disabled={isUpdating}
              className="w-full"
            >
              <FaCheck className="mr-2 h-4 w-4" />
              Complete Quest
            </Button>
          )}
          
          {quest.status === 'completed' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center text-green-800 mb-4">
              <FaCheck className="inline-block mr-2 h-4 w-4" />
              Quest completed! You've earned {quest.xpReward} XP and {quest.currencyReward} coins.
            </div>
          )}
          
          {quest.status === 'in_progress' && quest.progress < 100 && (
            <p className="text-center text-sm text-muted-foreground mb-4">
              <FaExclamationTriangle className="inline-block mr-2 h-4 w-4 text-amber-500" />
              Complete all steps to finish this quest and claim your rewards.
            </p>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => router.push('/quests')}
            className="w-full"
          >
            Back to Quests
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default QuestDetailPage; 