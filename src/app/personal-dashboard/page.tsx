import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import DashboardNavbar from "@/components/dashboard-navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Target,
  BarChart,
  Lightbulb,
  Trophy,
  Calendar,
  Flame,
  Heart,
  Award,
  ArrowRight,
  Plus,
  CheckCircle2,
} from "lucide-react";

export default async function PersonalDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user's goals, activities, and streaks
  const { data: goals } = await supabase
    .from("health_goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: activities } = await supabase
    .from("health_activities")
    .select("*")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(5);

  const { data: streaks } = await supabase
    .from("health_streaks")
    .select("*")
    .eq("user_id", user.id);

  const { data: suggestions } = await supabase
    .from("health_suggestions")
    .select("*")
    .eq("user_id", user.id)
    .limit(3);

  // Calculate stats
  const activeGoals = goals?.filter((g) => g.status === "active").length || 0;
  const completedGoals =
    goals?.filter((g) => g.status === "completed").length || 0;
  const totalActivities = activities?.length || 0;
  const longestStreak =
    streaks?.reduce(
      (max, streak) => Math.max(max, streak.longest_streak || 0),
      0,
    ) || 0;

  // Generate daily quests (simplified example)
  const dailyQuests = [
    {
      id: "quest-1",
      title: "Morning Stretch",
      description: "Complete a 5-minute morning stretch routine",
      points: 50,
      isCompleted: false,
    },
    {
      id: "quest-2",
      title: "Hydration Hero",
      description: "Drink 8 glasses of water today",
      points: 30,
      isCompleted: false,
    },
    {
      id: "quest-3",
      title: "Step Master",
      description: "Reach 8,000 steps today",
      points: 100,
      isCompleted: false,
    },
  ];

  return (
    <SubscriptionCheck>
      <DashboardNavbar />
      <main className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome to Your Health Journey
            </h1>
            <p className="text-muted-foreground">
              Track your progress, complete quests, and earn rewards
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Target className="text-green-600 h-5 w-5" />
                </div>
                <h3 className="font-medium">Active Goals</h3>
              </div>
              <p className="text-3xl font-bold">{activeGoals}</p>
            </div>

            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Trophy className="text-blue-600 h-5 w-5" />
                </div>
                <h3 className="font-medium">Completed Goals</h3>
              </div>
              <p className="text-3xl font-bold">{completedGoals}</p>
            </div>

            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <BarChart className="text-purple-600 h-5 w-5" />
                </div>
                <h3 className="font-medium">Activities Logged</h3>
              </div>
              <p className="text-3xl font-bold">{totalActivities}</p>
            </div>

            <div className="bg-card rounded-xl p-6 border shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Flame className="text-orange-600 h-5 w-5" />
                </div>
                <h3 className="font-medium">Longest Streak</h3>
              </div>
              <p className="text-3xl font-bold">{longestStreak} days</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Daily Quests Section */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl border shadow-sm p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Today's Quests</h2>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Earn up to 180 points today
                  </span>
                </div>

                <div className="space-y-4">
                  {dailyQuests.map((quest) => (
                    <div
                      key={quest.id}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {quest.isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Award className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{quest.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {quest.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                          {quest.points} pts
                        </span>
                        <Button
                          size="sm"
                          variant={quest.isCompleted ? "outline" : "default"}
                          className={quest.isCompleted ? "text-green-600" : ""}
                        >
                          {quest.isCompleted ? "Completed" : "Complete"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <Button variant="outline" className="text-sm">
                    View All Quests
                  </Button>
                </div>
              </div>

              {/* Progress Section */}
              <div className="bg-card rounded-xl border shadow-sm p-6 mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <Heart className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">
                    Your Journey Progress
                  </h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        Weekly Goal Progress
                      </span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{ width: "45%" }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        Monthly Challenge
                      </span>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full"
                        style={{ width: "30%" }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        Level Progress
                      </span>
                      <span className="text-sm font-medium">Level 3 (70%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-purple-500 h-2.5 rounded-full"
                        style={{ width: "70%" }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">
                        Current Journey: Weight Loss
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        You've been on this journey for 2 weeks
                      </p>
                    </div>
                    <Link href="/questionnaire">
                      <Button variant="outline" size="sm" className="text-xs">
                        Change Journey
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-8">
              {/* Badges Section */}
              <div className="bg-card rounded-xl border shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Recent Badges</h2>
                  </div>
                  <Link href="#">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View All
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
                      <Trophy className="h-8 w-8 text-green-600" />
                    </div>
                    <span className="text-xs text-center">First Goal</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                      <Flame className="h-8 w-8 text-blue-600" />
                    </div>
                    <span className="text-xs text-center">3-Day Streak</span>
                  </div>
                  <div className="flex flex-col items-center opacity-40">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                      <BarChart className="h-8 w-8 text-gray-400" />
                    </div>
                    <span className="text-xs text-center">Locked</span>
                  </div>
                </div>
              </div>

              {/* Suggestions Section */}
              <div className="bg-card rounded-xl border shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Personalized Tips</h2>
                </div>

                <div className="space-y-4">
                  {suggestions && suggestions.length > 0 ? (
                    suggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="p-3 bg-muted/30 rounded-lg"
                      >
                        <p className="text-sm">{suggestion.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm">
                        Try to take a 10-minute walk after each meal to boost
                        your metabolism and improve digestion.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <Link href="/dashboard/suggestions">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs flex items-center justify-center"
                    >
                      More Suggestions
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-card rounded-xl border shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <Link href="/dashboard/goals">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Goal
                    </Button>
                  </Link>
                  <Link href="/dashboard/tracker">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Log Activity
                    </Button>
                  </Link>
                  <Link href="/questionnaire">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Update Health Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </SubscriptionCheck>
  );
}
