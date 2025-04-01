'use client';

import { useEffect, useState } from 'react';
import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import { Button } from "@/components/ui/button";
import { ActivitySquare, BarChart, Calendar, PlusCircle } from "lucide-react";
import { ActivityForm } from "@/components/activity-form";
import { ActivityList } from "@/components/activity-list";
import { StreakDisplay } from "@/components/streak-display";
import { Tables } from "@/types/supabase";
import { User } from '@supabase/supabase-js';

type Activity = Tables<"health_activities">;
type Streak = Tables<"health_streaks">;

export default function TrackerPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
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
      
      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('health_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });
      
      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
      } else {
        setActivities(activitiesData || []);
      }
      
      // Fetch streaks
      const { data: streaksData, error: streaksError } = await supabase
        .from("health_streaks")
        .select("*")
        .eq("user_id", user.id);
      
      if (streaksError) {
        console.error('Error fetching streaks:', streaksError);
      } else {
        setStreaks(streaksData || []);
      }
      
      setLoading(false);
    }
    
    fetchData();
  }, [router]);

  // Function to handle userId being possibly undefined
  const getUserId = (): string => {
    if (!user?.id) {
      return ""; // Fallback empty string
    }
    return user.id;
  };

  return (
    <SubscriptionCheck>
      <DashboardNavbar user={user} />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Activity Tracker</h1>
              <p className="text-muted-foreground mt-1">
                Log and monitor your daily health activities
              </p>
            </div>
            {user && (
              <ActivityForm userId={getUserId()}>
                <Button className="flex items-center gap-2">
                  <PlusCircle size={16} />
                  Log New Activity
                </Button>
              </ActivityForm>
            )}
          </header>

          {/* Streaks Section */}
          <section className="bg-card rounded-xl p-6 border shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Your Activity Streaks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {!loading && streaks.length > 0 ? (
                streaks.map((streak) => (
                  <StreakDisplay key={streak.id} streak={streak} />
                ))
              ) : (
                <div className="col-span-full bg-muted/20 rounded-lg p-6 text-center">
                  <p className="text-muted-foreground">
                    Start logging activities to build your streaks!
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Recent Activities */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ActivitySquare className="h-5 w-5 text-primary" />
                Recent Activities
              </h2>
              {user && (
                <ActivityForm userId={getUserId()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <PlusCircle size={14} />
                    Log Activity
                  </Button>
                </ActivityForm>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">Loading your activity data...</div>
            ) : activities.length > 0 ? (
              <ActivityList activities={activities} />
            ) : (
              <div className="bg-muted/50 rounded-xl p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  No activities logged yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start tracking your health journey by logging your first
                  activity
                </p>
                {user && (
                  <ActivityForm userId={getUserId()}>
                    <Button className="flex items-center gap-2">
                      <PlusCircle size={16} />
                      Log Your First Activity
                    </Button>
                  </ActivityForm>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </SubscriptionCheck>
  );
}
