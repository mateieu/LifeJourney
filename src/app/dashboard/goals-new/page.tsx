"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import DashboardNavbar from "@/components/dashboard-navbar";
import { SubscriptionCheck } from "@/components/subscription-check";
import { PlusCircle, Target } from "lucide-react";
import { Tables } from "@/types/supabase";
import Link from "next/link";

type Goal = Tables<"health_goals"> & {
  measurement_unit?: string;
};

export default function NewGoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGoals() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }
        
        const { data } = await supabase
          .from("health_goals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        setGoals(data || []);
      } catch (err) {
        console.error("Error fetching goals:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchGoals();
  }, []);

  return (
    <SubscriptionCheck>
      <div className="min-h-screen bg-background">
        <DashboardNavbar />
        <div className="container max-w-6xl py-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Redesigned Goals Page</h1>
            <Link href="/dashboard/goals">
              <Button variant="outline">Go to Regular Goals Page</Button>
            </Link>
          </div>
          
          <div className="bg-primary/10 p-6 rounded-lg border-2 border-primary">
            <h2 className="text-xl font-bold mb-4">This is the new design!</h2>
            <p className="mb-4">If you can see this page, then the new design is working.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {goals.map(goal => (
                <Card key={goal.id} className="overflow-hidden border-2 border-primary">
                  <CardHeader className="bg-primary/10">
                    <CardTitle className="capitalize">
                      {goal.goal_type} Goal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="text-xl font-bold mb-2">
                      {goal.current_value || 0} of {goal.target_value}
                    </div>
                    
                    <Progress 
                      value={goal.current_value && goal.target_value ? 
                        (goal.current_value / goal.target_value) * 100 : 0} 
                      className="h-2 mb-4"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SubscriptionCheck>
  );
} 