import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";

export default async function PreferencesQuestionnairePage() {
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
          <div className="max-w-3xl mx-auto bg-card rounded-xl shadow-md border p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Your Preferences</h1>
              <p className="text-muted-foreground">
                Let us know your preferences to customize your health journey.
              </p>
            </div>

            <form action="/questionnaire/complete">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Workout Preferences</h2>
                  <div className="space-y-3">
                    <p className="text-sm">
                      What time of day do you prefer to exercise?
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="morning"
                          name="workout_time"
                          value="morning"
                          required
                        />
                        <label htmlFor="morning" className="text-sm">
                          Morning
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="afternoon"
                          name="workout_time"
                          value="afternoon"
                        />
                        <label htmlFor="afternoon" className="text-sm">
                          Afternoon
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="evening"
                          name="workout_time"
                          value="evening"
                        />
                        <label htmlFor="evening" className="text-sm">
                          Evening
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="no_preference"
                          name="workout_time"
                          value="no_preference"
                        />
                        <label htmlFor="no_preference" className="text-sm">
                          No preference
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <p className="text-sm">
                      How long do you prefer your workout sessions to be?
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="15_min"
                          name="workout_duration"
                          value="15_min"
                          required
                        />
                        <label htmlFor="15_min" className="text-sm">
                          15 minutes or less
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="30_min"
                          name="workout_duration"
                          value="30_min"
                        />
                        <label htmlFor="30_min" className="text-sm">
                          30 minutes
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="45_min"
                          name="workout_duration"
                          value="45_min"
                        />
                        <label htmlFor="45_min" className="text-sm">
                          45 minutes
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="60_min"
                          name="workout_duration"
                          value="60_min"
                        />
                        <label htmlFor="60_min" className="text-sm">
                          60 minutes or more
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <p className="text-sm">Where do you prefer to exercise?</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="home"
                          name="workout_location"
                          value="home"
                          required
                        />
                        <label htmlFor="home" className="text-sm">
                          At home
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="gym"
                          name="workout_location"
                          value="gym"
                        />
                        <label htmlFor="gym" className="text-sm">
                          At the gym
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="outdoors"
                          name="workout_location"
                          value="outdoors"
                        />
                        <label htmlFor="outdoors" className="text-sm">
                          Outdoors
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="mixed"
                          name="workout_location"
                          value="mixed"
                        />
                        <label htmlFor="mixed" className="text-sm">
                          Mix of locations
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">
                    Motivation & Accountability
                  </h2>
                  <div className="space-y-3">
                    <p className="text-sm">
                      What motivates you most to stay healthy? (Select all that
                      apply)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="appearance"
                          name="motivations"
                          value="appearance"
                          className="rounded"
                        />
                        <label htmlFor="appearance" className="text-sm">
                          Physical appearance
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="energy"
                          name="motivations"
                          value="energy"
                          className="rounded"
                        />
                        <label htmlFor="energy" className="text-sm">
                          More energy
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="longevity"
                          name="motivations"
                          value="longevity"
                          className="rounded"
                        />
                        <label htmlFor="longevity" className="text-sm">
                          Living longer
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="mental_health"
                          name="motivations"
                          value="mental_health"
                          className="rounded"
                        />
                        <label htmlFor="mental_health" className="text-sm">
                          Mental health
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="performance"
                          name="motivations"
                          value="performance"
                          className="rounded"
                        />
                        <label htmlFor="performance" className="text-sm">
                          Athletic performance
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="family"
                          name="motivations"
                          value="family"
                          className="rounded"
                        />
                        <label htmlFor="family" className="text-sm">
                          Family/children
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <p className="text-sm">
                      How do you prefer to be held accountable?
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="self"
                          name="accountability"
                          value="self"
                          required
                        />
                        <label htmlFor="self" className="text-sm">
                          Self-monitoring
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="coach"
                          name="accountability"
                          value="coach"
                        />
                        <label htmlFor="coach" className="text-sm">
                          Coach/trainer check-ins
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="friend"
                          name="accountability"
                          value="friend"
                        />
                        <label htmlFor="friend" className="text-sm">
                          Friend/family member
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="group"
                          name="accountability"
                          value="group"
                        />
                        <label htmlFor="group" className="text-sm">
                          Group challenges
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="app"
                          name="accountability"
                          value="app"
                        />
                        <label htmlFor="app" className="text-sm">
                          App reminders
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">
                    Gamification Preferences
                  </h2>
                  <div className="space-y-3">
                    <p className="text-sm">
                      What gamification elements motivate you most? (Select all
                      that apply)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="points"
                          name="gamification"
                          value="points"
                          className="rounded"
                        />
                        <label htmlFor="points" className="text-sm">
                          Points and levels
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="badges"
                          name="gamification"
                          value="badges"
                          className="rounded"
                        />
                        <label htmlFor="badges" className="text-sm">
                          Achievement badges
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="streaks"
                          name="gamification"
                          value="streaks"
                          className="rounded"
                        />
                        <label htmlFor="streaks" className="text-sm">
                          Streaks and consistency tracking
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="challenges"
                          name="gamification"
                          value="challenges"
                          className="rounded"
                        />
                        <label htmlFor="challenges" className="text-sm">
                          Challenges and quests
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="rewards"
                          name="gamification"
                          value="rewards"
                          className="rounded"
                        />
                        <label htmlFor="rewards" className="text-sm">
                          Real-world rewards
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="leaderboards"
                          name="gamification"
                          value="leaderboards"
                          className="rounded"
                        />
                        <label htmlFor="leaderboards" className="text-sm">
                          Leaderboards and competition
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Complete Assessment
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
