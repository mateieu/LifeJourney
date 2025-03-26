import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import { Button } from "@/components/ui/button";
import { ActivitySquare, BarChart, Calendar, PlusCircle } from "lucide-react";
import { ActivityForm } from "@/components/activity-form";
import { ActivityList } from "@/components/activity-list";
import { StreakDisplay } from "@/components/streak-display";

export default async function TrackerPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: activities } = await supabase
    .from("health_activities")
    .select("*")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false });

  const { data: streaks } = await supabase
    .from("health_streaks")
    .select("*")
    .eq("user_id", user.id);

  return (
    <SubscriptionCheck>
      <DashboardNavbar />
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
            <ActivityForm userId={user.id}>
              <Button className="flex items-center gap-2">
                <PlusCircle size={16} />
                Log New Activity
              </Button>
            </ActivityForm>
          </header>

          {/* Streaks Section */}
          <section className="bg-card rounded-xl p-6 border shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Your Activity Streaks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {streaks && streaks.length > 0 ? (
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
              <ActivityForm userId={user.id}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <PlusCircle size={14} />
                  Log Activity
                </Button>
              </ActivityForm>
            </div>

            {activities && activities.length > 0 ? (
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
                <ActivityForm userId={user.id}>
                  <Button className="flex items-center gap-2">
                    <PlusCircle size={16} />
                    Log Your First Activity
                  </Button>
                </ActivityForm>
              </div>
            )}
          </section>
        </div>
      </main>
    </SubscriptionCheck>
  );
}
