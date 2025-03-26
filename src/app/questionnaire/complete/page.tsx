import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default async function QuestionnaireCompletePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-card rounded-xl shadow-md border p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-4">Assessment Complete!</h1>

            <p className="text-lg text-muted-foreground mb-8">
              Thank you for completing your health assessment. We've created a
              personalized health journey just for you.
            </p>

            <div className="bg-muted/30 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
              <ul className="text-left space-y-3">
                <li className="flex items-start">
                  <span className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </span>
                  <span>
                    Explore your personalized dashboard with custom health goals
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </span>
                  <span>Complete daily quests to earn points and badges</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </span>
                  <span>
                    Track your progress and build healthy habit streaks
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 p-1 rounded-full mr-3 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </span>
                  <span>
                    Unlock rewards as you achieve milestones on your journey
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/personal-dashboard">
                <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-lg py-6 px-8">
                  View Your Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/goals">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto text-lg py-6 px-8"
                >
                  Set Your First Goal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
