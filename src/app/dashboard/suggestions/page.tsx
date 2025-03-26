import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import { Button } from "@/components/ui/button";
import { Lightbulb, RefreshCw } from "lucide-react";
import { SuggestionCard } from "@/components/suggestion-card";
import { generateSuggestionsAction } from "@/app/actions";

export default async function SuggestionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: suggestions } = await supabase
    .from("health_suggestions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <SubscriptionCheck>
      <DashboardNavbar />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Personalized Suggestions</h1>
              <p className="text-muted-foreground mt-1">
                Recommendations tailored to your health journey
              </p>
            </div>
            <form action={generateSuggestionsAction}>
              <Button className="flex items-center gap-2">
                <RefreshCw size={16} />
                Generate New Suggestions
              </Button>
            </form>
          </header>

          {/* Suggestions List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestions && suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))
            ) : (
              <div className="col-span-full bg-muted/50 rounded-xl p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Lightbulb className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  No suggestions yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Generate personalized health suggestions based on your goals
                  and activities
                </p>
                <form action={generateSuggestionsAction}>
                  <Button className="flex items-center gap-2">
                    <RefreshCw size={16} />
                    Generate Suggestions
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </SubscriptionCheck>
  );
}
