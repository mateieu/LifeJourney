"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Star, Clock, Zap, Calendar, Heart, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

type Achievement = {
  id: string;
  title: string;
  description: string;
  category: "sleep" | "activity" | "nutrition" | "consistency" | "milestone";
  icon: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  date_achieved: string | null;
  level: number;
};

export function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchAchievements();
    ensureAchievementsTable();
  }, []);

  const ensureAchievementsTable = async () => {
    try {
      const supabase = createClient();
      
      // Create achievements table if it doesn't exist
      const { error: tableError } = await supabase.rpc('create_table_if_not_exists', {
        table_name: 'achievements',
        table_definition: `
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          title text NOT NULL,
          description text NOT NULL,
          category text NOT NULL,
          icon text NOT NULL,
          threshold integer NOT NULL,
          level integer DEFAULT 1,
          created_at timestamp with time zone DEFAULT now()
        `
      });
      
      if (tableError) console.error("Error creating achievements table:", tableError);
      
      // Create user_achievements table if it doesn't exist
      const { error: userAchievementsError } = await supabase.rpc('create_table_if_not_exists', {
        table_name: 'user_achievements',
        table_definition: `
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id uuid REFERENCES auth.users(id) NOT NULL,
          achievement_id uuid REFERENCES achievements(id) NOT NULL,
          progress integer DEFAULT 0,
          completed boolean DEFAULT false,
          date_achieved timestamp with time zone,
          created_at timestamp with time zone DEFAULT now(),
          UNIQUE(user_id, achievement_id)
        `
      });
      
      if (userAchievementsError) console.error("Error creating user_achievements table:", userAchievementsError);
      
      // Insert default achievements if table is empty
      const { data: existingAchievements } = await supabase
        .from('achievements')
        .select('id')
        .limit(1);
      
      if (!existingAchievements?.length) {
        const defaultAchievements = [
          {
            title: "Early Bird",
            description: "Log 5 days of waking up before 7 AM",
            category: "sleep",
            icon: "star",
            threshold: 5,
            level: 1
          },
          {
            title: "Quality Sleeper",
            description: "Achieve 5 nights of top-quality sleep (5/5)",
            category: "sleep",
            icon: "moon",
            threshold: 5,
            level: 1
          },
          {
            title: "Sleep Champion",
            description: "Record 30 consecutive days of sleep tracking",
            category: "consistency",
            icon: "trophy",
            threshold: 30,
            level: 2
          },
          {
            title: "Marathon Runner",
            description: "Log 10 running activities",
            category: "activity",
            icon: "zap",
            threshold: 10,
            level: 1
          },
          {
            title: "Calorie Counter",
            description: "Track 50 meals in the nutrition log",
            category: "nutrition",
            icon: "heart",
            threshold: 50,
            level: 2
          },
          {
            title: "Health Analyst",
            description: "Log 20 different health metrics",
            category: "milestone",
            icon: "crown",
            threshold: 20,
            level: 2
          },
          {
            title: "One Week Streak",
            description: "Use the app for 7 consecutive days",
            category: "consistency",
            icon: "calendar",
            threshold: 7,
            level: 1
          },
          {
            title: "Fitness Journey",
            description: "Complete 30 workouts of any type",
            category: "activity",
            icon: "medal",
            threshold: 30,
            level: 3
          }
        ];
        
        // Insert default achievements
        const { error: insertError } = await supabase
          .from('achievements')
          .insert(defaultAchievements);
          
        if (insertError) console.error("Error inserting default achievements:", insertError);
      }
      
    } catch (error) {
      console.error("Error setting up achievements tables:", error);
    }
  };

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // First make sure user has entries for all achievements
      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('id');
      
      if (allAchievements && allAchievements.length > 0) {
        // Create user_achievement entries for any missing achievements
        const achievements = allAchievements.map(achievement => ({
          user_id: user.id,
          achievement_id: achievement.id,
          progress: 0,
          completed: false
        }));
        
        // Use upsert to avoid duplicate key violations
        const { error: upsertError } = await supabase
          .from('user_achievements')
          .upsert(achievements, { 
            onConflict: 'user_id,achievement_id',
            ignoreDuplicates: true
          });
        
        if (upsertError) console.error("Error ensuring user achievements:", upsertError);
      }
      
      // Fetch achievements joined with user progress
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          id, 
          progress, 
          completed, 
          date_achieved,
          achievements (
            id, 
            title, 
            description, 
            category, 
            icon, 
            threshold, 
            level
          )
        `)
        .eq('user_id', user.id)
        .order('completed', { ascending: false })
        .order('progress', { ascending: false });
      
      if (error) throw error;
      
      // Process achievements for display
      const processedAchievements: Achievement[] = (data || []).map((item: any) => ({
        id: item.achievements.id,
        title: item.achievements.title,
        description: item.achievements.description,
        category: item.achievements.category,
        icon: item.achievements.icon,
        progress: item.progress,
        maxProgress: item.achievements.threshold,
        completed: item.completed,
        date_achieved: item.date_achieved,
        level: item.achievements.level || 1
      }));
      
      setAchievements(processedAchievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: 'Error loading achievements',
        description: 'Could not load your achievements. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'trophy': return <Trophy className="h-5 w-5" />;
      case 'medal': return <Medal className="h-5 w-5" />;
      case 'star': return <Star className="h-5 w-5" />;
      case 'clock': return <Clock className="h-5 w-5" />;
      case 'zap': return <Zap className="h-5 w-5" />;
      case 'calendar': return <Calendar className="h-5 w-5" />;
      case 'heart': return <Heart className="h-5 w-5" />;
      case 'crown': return <Crown className="h-5 w-5" />;
      default: return <Trophy className="h-5 w-5" />;
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sleep': return 'bg-blue-500 text-white';
      case 'activity': return 'bg-orange-500 text-white';
      case 'nutrition': return 'bg-green-500 text-white';
      case 'consistency': return 'bg-purple-500 text-white';
      case 'milestone': return 'bg-amber-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };
  
  const getBadgeColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      case 2: return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 3: return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 4: return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 5: return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
      default: return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };
  
  // Filter achievements based on tab
  const filteredAchievements = achievements.filter(achievement => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return achievement.completed;
    if (activeTab === 'in-progress') return !achievement.completed && achievement.progress > 0;
    return achievement.category === activeTab;
  });
  
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Achievements</h2>
          <p className="text-muted-foreground">Track your progress and earn badges</p>
        </div>
        <div className="flex items-center space-x-1">
          <Badge className="bg-blue-500 text-white px-3 py-1">
            {achievements.filter(a => a.completed).length}/{achievements.length} Completed
          </Badge>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="consistency">Streaks</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
              <h3 className="text-lg font-medium mb-2">No achievements found</h3>
              <p className="text-muted-foreground">
                {activeTab === 'completed' 
                  ? "You haven't completed any achievements yet. Keep going!" 
                  : activeTab === 'in-progress'
                    ? "You don't have any achievements in progress. Start tracking your health!"
                    : "No achievements in this category. Continue your health journey!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((achievement) => (
                <Card 
                  key={achievement.id}
                  className={cn(
                    "overflow-hidden transition-all",
                    achievement.completed && "border-green-200 dark:border-green-800"
                  )}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center mr-3",
                          achievement.completed 
                            ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" 
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        )}>
                          {renderIcon(achievement.icon)}
                        </div>
                        <div>
                          <CardTitle className="text-base">{achievement.title}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {achievement.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant="outline" className={getBadgeColor(achievement.level)}>
                          Level {achievement.level}
                        </Badge>
                        <Badge className={getCategoryColor(achievement.category)}>
                          {achievement.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <div className="text-muted-foreground">
                          Progress: {achievement.progress}/{achievement.maxProgress}
                        </div>
                        <div>
                          {achievement.completed && achievement.date_achieved && (
                            <span className="text-xs text-muted-foreground">
                              Completed {format(new Date(achievement.date_achieved), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                      </div>
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className={cn(
                          "h-2",
                          achievement.completed ? "bg-green-100 dark:bg-green-900" : "bg-slate-100 dark:bg-slate-800"
                        )}
                        indicatorClassName={achievement.completed ? "bg-green-500" : undefined}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 