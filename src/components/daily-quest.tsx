import React from 'react';
import { Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface QuestProps {
  id: string;
  title: string;
  description: string;
  type: string;
  completed: boolean;
  xp: number;
  progress?: number;
  dueTime?: string;
}

interface DailyQuestProps {
  quest?: QuestProps;
  quests?: QuestProps[];
}

export function DailyQuest({ quest, quests = [] }: DailyQuestProps) {
  // If a single quest is provided, use that
  // Otherwise, use the quests array
  const questsToRender = quest ? [quest] : quests;
  
  // Use default quests if none are provided
  const dailyQuests = questsToRender.length > 0 ? questsToRender : [
    {
      title: "Morning Stretch",
      description: "Complete a 5-minute morning stretch routine",
      xp: 50,
      completed: false,
      progress: 0,
    },
    {
      title: "Hydration Goal",
      description: "Drink 8 glasses of water today",
      xp: 100,
      completed: false,
      progress: 50,
      dueTime: "11:59 PM",
    },
    {
      title: "Mindfulness Break",
      description: "Take a 10-minute mindfulness break",
      xp: 75,
      completed: true,
      progress: 100,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Daily Quests</h2>
        <Button variant="outline" size="sm">View All</Button>
      </div>
      
      <div className="space-y-3">
        {dailyQuests.map((quest, index) => (
          <Card key={index} className={quest.completed ? "bg-green-50 border-green-100" : ""}>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md">{quest.title}</CardTitle>
                <div className="flex items-center text-sm font-semibold text-green-600">
                  {quest.xp} XP
                </div>
              </div>
              <CardDescription>{quest.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="pb-2">
              {typeof quest.progress !== 'undefined' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{quest.progress}%</span>
                  </div>
                  <Progress value={quest.progress} className="h-2" />
                </div>
              )}
            </CardContent>
            
            <CardFooter className="pt-1 pb-3 flex justify-between">
              {quest.dueTime && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  Due by {quest.dueTime}
                </div>
              )}
              
              <Button 
                variant={quest.completed ? "outline" : "default"} 
                size="sm"
                className={quest.completed ? "text-green-600 border-green-200" : ""}
              >
                {quest.completed ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Completed
                  </>
                ) : (
                  "Complete"
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 