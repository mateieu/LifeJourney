'use client';

import { useEffect, useState } from 'react';
import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import { Button } from "@/components/ui/button";
import { PlusCircle, Target, Trophy, TrendingUp } from "lucide-react";
import { GoalForm } from "@/components/goal-form";
import { GoalCard } from "@/components/goal-card";
import { User } from '@supabase/supabase-js';
import { Tables } from "@/types/supabase";

type Goal = Tables<"health_goals">;

export default function GoalsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to handle userId being possibly undefined
  const getUserId = (): string => {
    if (!user?.id) {
      return ""; // Fallback empty string
    }
    return user.id;
  };

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/sign-in');
        return;
      }
      
      setUser(user);
      
      // Fetch goals
      const { data: goalsData, error } = await supabase
        .from('health_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching goals:', error);
      } else {
        // Map database results to include start_date if missing
        const processedGoals = (goalsData || []).map(goal => ({
          ...goal,
          start_date: goal.start_date || goal.created_at // Use created_at as fallback
        }));
        setGoals(processedGoals);
      }
      
      setLoading(false);
    }
    
    fetchData();
  }, [router]);

  return (
    <SubscriptionCheck>
      <DashboardNavbar user={user} />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Health Goals</h1>
              <p className="text-muted-foreground mt-1">
                Set and track your wellness journey goals
              </p>
            </div>
            {user && (
              <GoalForm userId={getUserId()}>
                <Button className="flex items-center gap-2">
                  <PlusCircle size={16} />
                  Add New Goal
                </Button>
              </GoalForm>
            )}
          </header>

          {/* Goals Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12">Loading your goals...</div>
            ) : goals.length > 0 ? (
              goals.map((goal) => <GoalCard key={goal.id} goal={goal} />)
            ) : (
              <div className="col-span-full bg-muted/50 rounded-xl p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No goals yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start by setting your first health goal
                </p>
                {user && (
                  <GoalForm userId={getUserId()}>
                    <Button className="flex items-center gap-2">
                      <PlusCircle size={16} />
                      Create Your First Goal
                    </Button>
                  </GoalForm>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {goals && goals.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Goal Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card rounded-xl p-6 border shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Trophy className="text-green-600 h-5 w-5" />
                    </div>
                    <h3 className="font-medium">Active Goals</h3>
                  </div>
                  <p className="text-3xl font-bold">
                    {goals.filter((g) => g.status === "active").length}
                  </p>
                </div>
                <div className="bg-card rounded-xl p-6 border shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <TrendingUp className="text-blue-600 h-5 w-5" />
                    </div>
                    <h3 className="font-medium">In Progress</h3>
                  </div>
                  <p className="text-3xl font-bold">
                    {
                      goals.filter(
                        (g) =>
                          (g.current_value || 0) > 0 &&
                          (g.current_value || 0) < (g.target_value || 0)
                      ).length
                    }
                  </p>
                </div>
                <div className="bg-card rounded-xl p-6 border shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Trophy className="text-purple-600 h-5 w-5" />
                    </div>
                    <h3 className="font-medium">Completed</h3>
                  </div>
                  <p className="text-3xl font-bold">
                    {goals.filter((g) => g.status === "completed").length}
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </SubscriptionCheck>
  );
}
