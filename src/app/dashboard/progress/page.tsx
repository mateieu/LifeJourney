'use client';

import { useEffect, useState } from 'react';
import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import { Tables } from "@/types/supabase";
import { User } from '@supabase/supabase-js';
import { 
  BarChart as BarChartIcon, 
  LineChart, 
  PieChart, 
  Calendar,
  Trophy,
  Activity,
  Target
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Activity = Tables<"health_activities">;
type Goal = Tables<"health_goals">;
type Streak = Tables<"health_streaks">;

export default function ProgressPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/sign-in');
        return;
      }
      
      setUser(user);
      
      // Fetch all data in parallel
      const [activitiesResponse, goalsResponse, streaksResponse] = await Promise.all([
        supabase
          .from('health_activities')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false }),
        supabase
          .from('health_goals')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('health_streaks')
          .select('*')
          .eq('user_id', user.id)
      ]);
      
      setActivities(activitiesResponse.data || []);
      setGoals(goalsResponse.data || []);
      setStreaks(streaksResponse.data || []);
      setLoading(false);
    }
    
    fetchData();
  }, [router]);

  // Calculate total activities by type
  const activityCounts = activities.reduce((acc, activity) => {
    const type = activity.activity_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate progress percentages for all goals
  const goalProgress = goals.map(goal => {
    const progress = goal.current_value && goal.target_value
      ? Math.min((goal.current_value / goal.target_value) * 100, 100)
      : 0;
    return {
      ...goal,
      progress
    };
  });

  // Get top streaks
  const topStreaks = [...streaks].sort((a, b) => 
    (b.current_streak || 0) - (a.current_streak || 0)
  ).slice(0, 3);

  return (
    <SubscriptionCheck>
      <DashboardNavbar user={user} />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <header>
            <h1 className="text-3xl font-bold">Progress Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              View insights and analytics about your health journey
            </p>
          </header>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Active Goals</CardTitle>
                    <CardDescription>Your ongoing health goals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {goals.filter(g => g.status === 'active').length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {Math.round(goals.filter(g => g.status === 'completed').length / (goals.length || 1) * 100)}% completion rate
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Activities Logged</CardTitle>
                    <CardDescription>Total activities tracked</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {activities.length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Across {Object.keys(activityCounts).length} different types
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Longest Streak</CardTitle>
                    <CardDescription>Your best activity streak</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {streaks.reduce((max, streak) => Math.max(max, streak.longest_streak || 0), 0)} days
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {topStreaks[0]?.streak_type && `${topStreaks[0].streak_type} activity`}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Current Goal Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Goal Progress</CardTitle>
                  <CardDescription>Your active goals and their current progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {goalProgress
                      .filter(goal => goal.status === 'active')
                      .sort((a, b) => b.progress - a.progress)
                      .slice(0, 5)
                      .map(goal => (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1)}</span>
                            <span>{Math.round(goal.progress)}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                        </div>
                      ))}
                    {goalProgress.filter(goal => goal.status === 'active').length === 0 && (
                      <div className="text-center py-6 text-muted-foreground">
                        No active goals. Create some goals to track your progress!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Streaks */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Streaks</CardTitle>
                  <CardDescription>Your most consistent activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topStreaks.map(streak => (
                      <div key={streak.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {streak.streak_type.charAt(0).toUpperCase() + streak.streak_type.slice(1)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {streak.current_streak} day current streak
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{streak.longest_streak} days</div>
                          <div className="text-sm text-muted-foreground">Longest</div>
                        </div>
                      </div>
                    ))}
                    {topStreaks.length === 0 && (
                      <div className="text-center py-6 text-muted-foreground">
                        No streaks yet. Start logging daily activities to build streaks!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Goal Completion</CardTitle>
                  <CardDescription>Overview of your health goals progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-muted/30 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">{goals.filter(g => g.status === 'active').length}</div>
                      <div className="text-sm text-muted-foreground">Active Goals</div>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">{goals.filter(g => g.status === 'completed').length}</div>
                      <div className="text-sm text-muted-foreground">Completed Goals</div>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold">
                        {goals.length ? `${Math.round(goals.filter(g => g.status === 'completed').length / goals.length * 100)}%` : '0%'}
                      </div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">All Goals</h3>
                    {loading ? (
                      <div className="text-center py-6 text-muted-foreground">Loading goals data...</div>
                    ) : goalProgress.length > 0 ? (
                      <div className="space-y-6">
                        {goalProgress.map(goal => (
                          <div key={goal.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-full ${
                                  goal.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                }`}>
                                  {goal.status === 'completed' ? <Trophy className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                                </div>
                                <span className="font-medium">{goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1)}</span>
                              </div>
                              <span className="text-sm px-2 py-1 rounded-full bg-muted">
                                {goal.status === 'completed' ? 'Completed' : 'In Progress'}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Target: {goal.target_value}</span>
                                <span>Current: {goal.current_value || 0}</span>
                              </div>
                              <Progress value={goal.progress} className="h-2" />
                              <div className="text-xs text-right text-muted-foreground">
                                {goal.target_date && `Due ${new Date(goal.target_date).toLocaleDateString()}`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No goals set yet. Go to Goals section to create your first health goal!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Summary</CardTitle>
                  <CardDescription>Overview of your recorded health activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-muted/30 p-6 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Activity Distribution</h3>
                      {Object.keys(activityCounts).length > 0 ? (
                        <div className="space-y-3">
                          {Object.entries(activityCounts)
                            .sort(([, a], [, b]) => b - a)
                            .map(([type, count]) => (
                              <div key={type} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                                  <span>{count} entries</span>
                                </div>
                                <Progress value={(count / activities.length) * 100} className="h-2" />
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          No activities logged yet
                        </div>
                      )}
                    </div>

                    <div className="bg-muted/30 p-6 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                      {activities.length > 0 ? (
                        <div className="space-y-4">
                          {activities.slice(0, 5).map(activity => (
                            <div key={activity.id} className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-full">
                                <Activity className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <span className="font-medium">
                                    {activity.activity_type.charAt(0).toUpperCase() + activity.activity_type.slice(1)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {activity.completed_at 
                                      ? new Date(activity.completed_at).toLocaleDateString() 
                                      : 'Date unknown'}
                                  </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {activity.value} {getUnitLabel(activity.activity_type)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          No activities logged yet
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6 mb-3">
                    <h3 className="text-lg font-medium">Streaks Overview</h3>
                  </div>
                  
                  {streaks.length > 0 ? (
                    <div className="space-y-4">
                      {streaks.map(streak => (
                        <div key={streak.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-orange-100 rounded-full">
                                <Calendar className="h-4 w-4 text-orange-600" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {streak.streak_type.charAt(0).toUpperCase() + streak.streak_type.slice(1)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Last active: {new Date(streak.last_activity_date || new Date()).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold">{streak.current_streak} days</div>
                              <div className="text-xs text-muted-foreground">Current streak</div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <Progress value={(streak.current_streak || 0) / (streak.longest_streak || 1) * 100} className="h-1.5" />
                            <div className="flex justify-between text-xs mt-1">
                              <span>Current: {streak.current_streak} days</span>
                              <span>Best: {streak.longest_streak} days</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No activity streaks yet. Log activities daily to build streaks!
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </SubscriptionCheck>
  );
}

// Helper function to get appropriate unit label for different activity types
function getUnitLabel(activityType: string): string {
  switch (activityType) {
    case 'walking':
      return 'steps';
    case 'running':
    case 'cycling':
      return 'km';
    case 'swimming':
      return 'm';
    case 'yoga':
    case 'meditation':
    case 'strength':
      return 'min';
    case 'water':
      return 'glasses';
    case 'sleep':
      return 'hours';
    default:
      return 'units';
  }
} 