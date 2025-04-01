"use client";

import { useEffect, useState } from "react";
import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "@/utils/supabase/client";
import {
  InfoIcon,
  UserCircle,
  Target,
  BarChart,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DailyQuest } from "@/components/daily-quest";
import { ActivityFeed } from "@/components/activity-feed";
import { User } from "@supabase/supabase-js";

// Define the Quest type
interface Quest {
  id: string;
  title: string;
  description: string;
  type: string;
  completed: boolean;
  xp: number;
  progress?: number;
  dueTime?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [questsLoading, setQuestsLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    async function fetchUserAndData() {
      const supabase = createClient();
      
      // Fetch user
      setUserLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setUserLoading(false);

      if (!user) return;

      // Fetch quests (mock data for now)
      setQuestsLoading(true);
      try {
        // Replace this with actual fetch from Supabase when ready
        // const { data: questsData, error } = await supabase
        //   .from('quests')
        //   .select('*')
        //   .eq('user_id', user.id);
        
        // if (error) throw error;
        // setQuests(questsData || []);

        // Using mock data for development
        const mockQuests: Quest[] = [
          {
            id: '1',
            title: 'Morning Stretch',
            description: 'Complete a 5-minute morning stretch routine',
            type: 'daily',
            completed: false,
            xp: 50,
            progress: 0,
          },
          {
            id: '2',
            title: 'Hydration Goal',
            description: 'Drink 8 glasses of water today',
            type: 'daily',
            completed: false,
            xp: 100,
            progress: 50,
            dueTime: "11:59 PM",
          },
          {
            id: '3',
            title: 'Mindfulness Break',
            description: 'Take a 10-minute mindfulness break',
            type: 'daily',
            completed: true,
            xp: 75,
            progress: 100,
          },
          {
            id: '4',
            title: 'Weekly Challenge',
            description: 'Complete 3 workouts this week',
            type: 'weekly',
            completed: false,
            xp: 150,
            progress: 66,
          }
        ];
        
        setQuests(mockQuests);
      } catch (error) {
        console.error('Error fetching quests:', error);
      } finally {
        setQuestsLoading(false);
      }

      // Fetch activities
      setActivitiesLoading(true);
      try {
        // Replace with actual Supabase query when ready
        // const { data: activitiesData, error } = await supabase
        //   .from('health_activities')
        //   .select('*')
        //   .eq('user_id', user.id)
        //   .order('completed_at', { ascending: false })
        //   .limit(10);
        
        // if (error) throw error;
        // setActivities(activitiesData || []);
        
        // Using mock data for now
        setActivities([]);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setActivitiesLoading(false);
      }
    }

    fetchUserAndData();
  }, []);

  if (userLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    // Redirect handled by middleware or SubscriptionCheck, this is a fallback
    window.location.href = '/sign-in';
    return null;
  }

  return (
    <SubscriptionCheck>
      <DashboardNavbar user={user} />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="bg-secondary/50 text-sm p-3 px-4 rounded-lg text-muted-foreground flex gap-2 items-center">
              <InfoIcon size="14" />
              <span>
                This is a protected page only visible to authenticated users
              </span>
            </div>
          </header>

          {/* User Profile Section */}
          <section className="bg-card rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <UserCircle size={48} className="text-primary" />
              <div>
                <h2 className="font-semibold text-xl">Welcome, {user.user_metadata?.full_name || user.email?.split('@')[0]}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 overflow-hidden">
              <pre className="text-xs font-mono max-h-48 overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </section>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/dashboard/goals" className="group">
              <div className="bg-card rounded-xl p-6 border shadow-sm hover:border-primary/50 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Target className="text-green-600 h-5 w-5" />
                  </div>
                  <h3 className="font-medium text-lg">Health Goals</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Set and track your personal health goals
                </p>
              </div>
            </Link>

            <Link href="/dashboard/tracker" className="group">
              <div className="bg-card rounded-xl p-6 border shadow-sm hover:border-primary/50 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <BarChart className="text-blue-600 h-5 w-5" />
                  </div>
                  <h3 className="font-medium text-lg">Activity Tracker</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Log and monitor your daily health activities
                </p>
              </div>
            </Link>

            <Link href="/dashboard/suggestions" className="group">
              <div className="bg-card rounded-xl p-6 border shadow-sm hover:border-primary/50 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Lightbulb className="text-purple-600 h-5 w-5" />
                  </div>
                  <h3 className="font-medium text-lg">Suggestions</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Get personalized health recommendations
                </p>
              </div>
            </Link>
          </div>

          {/* Progress Overview */}
          <section className="bg-card rounded-xl p-6 border shadow-sm mt-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Your Wellness Journey
            </h2>
            <p className="text-muted-foreground mb-6">
              Track your progress and stay motivated with your health goals
            </p>

            <div className="flex flex-col gap-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Daily Activity Completion</span>
                  <span className="text-sm font-medium">0%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: "0%" }}
                  ></div>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Weekly Goal Progress</span>
                  <span className="text-sm font-medium">0%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full"
                    style={{ width: "0%" }}
                  ></div>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Monthly Challenge</span>
                  <span className="text-sm font-medium">0%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{ width: "0%" }}
                  ></div>
                </div>
              </div>
            </div>
          </section>

          {/* Tabs Section */}
          <Tabs defaultValue="feed">
            <TabsContent value="feed" className="mt-0">
              <ActivityFeed />
            </TabsContent>
            
            <TabsContent value="achievements">
              <h3 className="text-lg font-semibold mb-3">Achievements</h3>
              <Button variant="outline" className="w-full">View All Achievements</Button>
            </TabsContent>
            
            <TabsContent value="quests">
              <h3 className="text-lg font-semibold mb-3">Daily Quests</h3>
              <div className="space-y-3 mb-6">
                {questsLoading ? (
                  <div className="text-center py-4 text-muted-foreground">Loading quests...</div>
                ) : quests?.filter(quest => quest.type === 'daily').length > 0 ? (
                  quests.filter(quest => quest.type === 'daily').map(quest => (
                    <DailyQuest key={quest.id} quest={quest} />
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No daily quests available right now. Check back tomorrow!
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-semibold mb-3">Weekly Challenges</h3>
              <div className="space-y-3">
                {questsLoading ? (
                  <div className="text-center py-4 text-muted-foreground">Loading challenges...</div>
                ) : quests?.filter(quest => quest.type === 'weekly').length > 0 ? (
                  quests.filter(quest => quest.type === 'weekly').map(quest => (
                    <DailyQuest key={quest.id} quest={quest} />
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No weekly challenges available right now.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </SubscriptionCheck>
  );
}
