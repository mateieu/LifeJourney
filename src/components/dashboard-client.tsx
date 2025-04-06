"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, Calendar, Target, Trophy, Dumbbell, Star, Medal, Zap, Heart, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { HealthInsights } from "@/components/health-insights";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardSummary } from "@/components/dashboard-summary";
import { GoalProgress } from "@/components/goal-progress";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

// Define the type for our achievement
type RecentAchievement = {
  id: string;
  title: string;
  completedDate: string;
  points: number;
  icon: string;
};

export function DashboardClient() {
  const [recentAchievements, setRecentAchievements] = useState<RecentAchievement[]>([]);
  const [loadingAchievements, setLoadingAchievements] = useState(true);

  useEffect(() => {
    fetchRecentAchievements();
  }, []);

  const fetchRecentAchievements = async () => {
    try {
      const supabase = createClient();
      
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Fetch recent achievements (completed only)
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          id, 
          completed, 
          date_achieved,
          achievements:achievement_id (
            id, 
            title, 
            icon,
            level
          )
        `)
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('date_achieved', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      
      // Transform data for display with proper TypeScript handling
      const recent: RecentAchievement[] = (data || [])
        .filter(item => item.completed && item.date_achieved && item.achievements)
        .map(item => ({
          id: item.id,
          title: item.achievements?.title || "Unknown Achievement",
          completedDate: item.date_achieved,
          // Points based on achievement level
          points: (item.achievements?.level || 1) * 50,
          icon: item.achievements?.icon || 'trophy'
        }));
      
      setRecentAchievements(recent);
    } catch (error) {
      console.error('Error fetching recent achievements:', error);
      // Fallback with empty array
      setRecentAchievements([]);
    } finally {
      setLoadingAchievements(false);
    }
  };

  const renderAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'trophy': return <Trophy className="h-4 w-4" />;
      case 'star': return <Star className="h-4 w-4" />;
      case 'medal': return <Medal className="h-4 w-4" />;
      case 'zap': return <Zap className="h-4 w-4" />;
      case 'heart': return <Heart className="h-4 w-4" />;
      case 'calendar': return <Calendar className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  // Get achievement icon color based on level
  const getAchievementColor = (level: number) => {
    switch (level) {
      case 1: return "bg-slate-100 text-slate-600";
      case 2: return "bg-blue-100 text-blue-600";
      case 3: return "bg-green-100 text-green-600";
      case 4: return "bg-purple-100 text-purple-600";
      case 5: return "bg-amber-100 text-amber-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <DashboardSummary />
      
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">Health Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="goals">Goal Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        <TabsContent value="insights" className="space-y-4">
          <HealthInsights />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Mental Wellbeing
              </CardTitle>
              <Brain className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">Mental wellness score based on your mood and stress entries</p>
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/dashboard/mental-health">
                      View Mental Health Tracker
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsDashboard />
        </TabsContent>
        <TabsContent value="goals" className="space-y-4">
          <GoalProgress />
        </TabsContent>
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recent Achievements
                </CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loadingAchievements ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center">
                        <Skeleton className="h-8 w-8 rounded-full mr-3" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-6 w-12" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentAchievements.length > 0 ? (
                      recentAchievements.map((achievement) => (
                        <div key={achievement.id} className="flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-muted/50">
                          <div className="flex items-center">
                            <div className={`h-9 w-9 rounded-full ${getAchievementColor(Math.ceil(achievement.points/50))} flex items-center justify-center mr-3`}>
                              {renderAchievementIcon(achievement.icon)}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{achievement.title}</div>
                              <div className="text-xs text-muted-foreground">
                                Earned {new Date(achievement.completedDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            +{achievement.points} pts
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <Trophy className="h-8 w-8 mx-auto text-muted-foreground opacity-30 mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">No achievements yet</p>
                        <Button size="sm" variant="outline" asChild>
                          <Link href="/dashboard/achievements">View All Achievements</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/dashboard/achievements">
                    View All Achievements
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Achievement Progress
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                    <div className="text-3xl font-bold text-primary">
                      {recentAchievements.length}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Achievements unlocked
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button size="sm" variant="secondary" asChild>
                      <Link href="/dashboard/achievements?tab=in-progress">
                        In Progress
                      </Link>
                    </Button>
                    <Button size="sm" variant="secondary" asChild>
                      <Link href="/dashboard/achievements?tab=completed">
                        Completed
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Next Milestones
                </CardTitle>
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">7-day streak</span>
                      </div>
                      <Badge variant="outline">In progress</Badge>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Track 10 workouts</span>
                      </div>
                      <Badge variant="outline">In progress</Badge>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                    <Link href="/dashboard/activities">
                      Log Activity
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Add a motivational section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Achievement Journey</CardTitle>
              <CardDescription>Stay consistent to unlock more badges and rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-between">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className="flex items-center flex-col">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        ${step <= Math.max(1, recentAchievements.length) 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                        }
                      `}>
                        {step}
                      </div>
                      <span className="text-xs mt-1 text-muted-foreground">
                        {step === 1 && "Start"}
                        {step === 2 && "Bronze"}
                        {step === 3 && "Silver"}
                        {step === 4 && "Gold"}
                        {step === 5 && "Platinum"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Complete more activities to reach the next level
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 