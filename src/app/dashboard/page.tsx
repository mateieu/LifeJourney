import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../supabase/server";
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

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <SubscriptionCheck>
      <DashboardNavbar />
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
                <h2 className="font-semibold text-xl">User Profile</h2>
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
        </div>
      </main>
    </SubscriptionCheck>
  );
}
