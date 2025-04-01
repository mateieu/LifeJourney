import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface AchievementCardProps {
  title: string;
  description: string;
  iconUrl: string;
  unlockedAt?: string;
  locked?: boolean;
}

export function AchievementCard({ 
  title, 
  description, 
  iconUrl, 
  unlockedAt,
  locked = false
}: AchievementCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className={`relative overflow-hidden p-4 h-full flex flex-col ${
        locked ? 'bg-muted/50' : 'bg-card'
      }`}>
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="rounded-full bg-muted p-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-muted-foreground" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
            </div>
          </div>
        )}
        
        <div className="flex items-center mb-2">
          <div className="mr-3 p-2 rounded-full bg-primary/10">
            <img src={iconUrl} alt={title} className="h-8 w-8" />
          </div>
          <h4 className="font-semibold text-sm">{title}</h4>
        </div>
        
        <p className="text-xs text-muted-foreground mb-2 flex-grow">
          {description}
        </p>
        
        {unlockedAt && !locked && (
          <div className="text-xs text-muted-foreground mt-2">
            Unlocked: {format(new Date(unlockedAt), 'MMM d, yyyy')}
          </div>
        )}
      </Card>
    </motion.div>
  );
} 