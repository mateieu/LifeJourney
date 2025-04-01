'use client';

import { useRouter } from 'next/navigation';
import { 
  FaBed, 
  FaRunning, 
  FaApple, 
  FaBrain, 
  FaHeartbeat, 
  FaWeight,
  FaTint,
  FaChartLine
} from 'react-icons/fa';
import { MainLayout } from '@/components/layouts/main-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface TrackerCategory {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  color: string;
  path: string;
  available: boolean;
}

export default function TrackersPage() {
  const router = useRouter();
  
  const trackerCategories: TrackerCategory[] = [
    {
      id: 'sleep',
      name: 'Sleep',
      description: 'Track your sleep patterns, quality, and duration',
      icon: <FaBed className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-600',
      path: '/trackers/sleep',
      available: true,
    },
    {
      id: 'exercise',
      name: 'Exercise',
      description: 'Log workouts, track progress, and analyze performance',
      icon: <FaRunning className="h-6 w-6" />,
      color: 'bg-green-100 text-green-600',
      path: '/trackers/exercise',
      available: true,
    },
    {
      id: 'nutrition',
      name: 'Nutrition',
      description: 'Track meals, nutrients, and eating patterns',
      icon: <FaApple className="h-6 w-6" />,
      color: 'bg-red-100 text-red-600',
      path: '/trackers/nutrition',
      available: true,
    },
    {
      id: 'mindfulness',
      name: 'Mindfulness',
      description: 'Record meditation sessions and mindfulness activities',
      icon: <FaBrain className="h-6 w-6" />,
      color: 'bg-purple-100 text-purple-600',
      path: '/trackers/mindfulness',
      available: true,
    },
    {
      id: 'heart',
      name: 'Heart Rate',
      description: 'Monitor heart rate, variability, and recovery',
      icon: <FaHeartbeat className="h-6 w-6" />,
      color: 'bg-red-100 text-red-600',
      path: '/trackers/heart-rate',
      available: false,
    },
    {
      id: 'weight',
      name: 'Weight',
      description: 'Track weight, BMI, and body composition',
      icon: <FaWeight className="h-6 w-6" />,
      color: 'bg-gray-100 text-gray-600',
      path: '/trackers/weight',
      available: true,
    },
    {
      id: 'water',
      name: 'Hydration',
      description: 'Track water intake and hydration levels',
      icon: <FaTint className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-600',
      path: '/trackers/hydration',
      available: false,
    },
  ];
  
  const handleTrackerClick = (tracker: TrackerCategory) => {
    if (tracker.available) {
      router.push(tracker.path);
    } else {
      // Show toast or modal for premium features
      alert('This tracker is coming soon! Stay tuned for updates.');
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Health Trackers</h1>
          <Button 
            variant="outline" 
            onClick={() => router.push('/analytics')}
          >
            <FaChartLine className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </div>
        
        <p className="text-muted-foreground mb-6">
          Track specific health metrics with dedicated tools designed to help you better understand and improve your wellness.
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          {trackerCategories.map((tracker) => (
            <motion.div
              key={tracker.id}
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card 
                className={`p-4 h-full cursor-pointer ${
                  tracker.available ? '' : 'opacity-60'
                }`}
                onClick={() => handleTrackerClick(tracker)}
              >
                <div className="flex flex-col h-full">
                  <div className={`w-12 h-12 rounded-full ${tracker.color} flex items-center justify-center mb-3`}>
                    {tracker.icon}
                  </div>
                  
                  <h3 className="font-semibold mb-1">{tracker.name}</h3>
                  <p className="text-sm text-muted-foreground flex-grow">
                    {tracker.description}
                  </p>
                  
                  {!tracker.available && (
                    <div className="mt-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full inline-block">
                      Coming Soon
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <Card className="p-6 bg-primary text-white mt-8">
          <h3 className="font-semibold mb-2">Connect Your Devices</h3>
          <p className="text-sm opacity-90 mb-4">
            Connect fitness trackers, smartwatches, and other health devices to automatically sync your data.
          </p>
          <Button variant="secondary" className="w-full" onClick={() => router.push('/settings/devices')}>
            Connect Devices
          </Button>
        </Card>
      </div>
    </MainLayout>
  );
} 