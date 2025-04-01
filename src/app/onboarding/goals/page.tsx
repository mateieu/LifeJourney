'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FaRunning, 
  FaApple, 
  FaBed, 
  FaBrain, 
  FaHeartbeat, 
  FaWeight,
  FaTint,
  FaArrowRight,
  FaArrowLeft
} from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface Goal {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  color: string;
}

export default function GoalsSelectionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  
  const goals: Goal[] = [
    {
      id: 'fitness',
      name: 'Fitness',
      description: 'Improve strength, endurance, and overall fitness',
      icon: <FaRunning className="h-6 w-6" />,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'nutrition',
      name: 'Nutrition',
      description: 'Develop healthier eating habits and meal planning',
      icon: <FaApple className="h-6 w-6" />,
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 'sleep',
      name: 'Better Sleep',
      description: 'Improve sleep quality and establish better sleep routines',
      icon: <FaBed className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'mindfulness',
      name: 'Mindfulness',
      description: 'Reduce stress and improve mental well-being',
      icon: <FaBrain className="h-6 w-6" />,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'heart_health',
      name: 'Heart Health',
      description: 'Improve cardiovascular health and endurance',
      icon: <FaHeartbeat className="h-6 w-6" />,
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 'weight',
      name: 'Weight Management',
      description: 'Achieve and maintain a healthy weight',
      icon: <FaWeight className="h-6 w-6" />,
      color: 'bg-gray-100 text-gray-600'
    },
    {
      id: 'hydration',
      name: 'Hydration',
      description: 'Drink more water and stay properly hydrated',
      icon: <FaTint className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-600'
    },
  ];
  
  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };
  
  const handleContinue = () => {
    if (selectedGoals.length === 0) {
      toast({
        title: 'No goals selected',
        description: 'Please select at least one goal to continue',
        variant: 'destructive',
      });
      return;
    }
    
    // Here you'd store the selected goals in your state management solution
    console.log('Selected goals:', selectedGoals);
    
    // Navigate to the next onboarding step
    router.push('/onboarding/personal-info');
  };
  
  const handleBack = () => {
    router.push('/onboarding/welcome');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container max-w-lg mx-auto px-4 py-6 flex-1 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">What are your health goals?</h1>
          <p className="text-muted-foreground">
            Select the areas you'd like to focus on. This will help us personalize your experience.
          </p>
        </div>
        
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 gap-4 mb-8">
            {goals.map((goal) => (
              <motion.div
                key={goal.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`p-4 cursor-pointer transition-colors h-full ${
                    selectedGoals.includes(goal.id) 
                      ? 'border-primary border-2' 
                      : 'border hover:border-primary/50'
                  }`}
                  onClick={() => toggleGoal(goal.id)}
                >
                  <div className="flex flex-col h-full">
                    <div className={`w-12 h-12 rounded-full ${goal.color} flex items-center justify-center mb-3`}>
                      {goal.icon}
                    </div>
                    
                    <h3 className="font-semibold mb-1">{goal.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {goal.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="mt-auto">
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Step 2 of 5</span>
              <span>{selectedGoals.length} goals selected</span>
            </div>
            <Progress value={40} className="h-2" />
          </div>
          
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="flex-1"
            >
              <FaArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <Button 
              onClick={handleContinue}
              className="flex-1"
              disabled={selectedGoals.length === 0}
            >
              Continue
              <FaArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 