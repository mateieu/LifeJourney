import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";

export default async function HabitsQuestionnairePage() {
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
              <h1 className="text-3xl font-bold mb-2">Your Current Habits</h1>
              <p className="text-muted-foreground">
                Tell us about your current habits so we can create a
                personalized plan for you.
              </p>
            </div>

            <form action="/questionnaire/preferences">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Exercise Habits</h2>
                  <div className="space-y-3">
                    <p className="text-sm">
                      How many days per week do you currently exercise?
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <div key={day} className="relative">
                          <input
                            type="radio"
                            id={`exercise_days_${day}`}
                            name="exercise_days"
                            value={day}
                            className="peer sr-only"
                            required
                          />
                          <label
                            htmlFor={`exercise_days_${day}`}
                            className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-200 cursor-pointer hover:border-green-500 peer-checked:border-green-500 peer-checked:bg-green-500 peer-checked:text-white transition-all"
                          >
                            {day}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <p className="text-sm">
                      What types of exercise do you currently do? (Select all
                      that apply)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="walking"
                          name="exercise_types"
                          value="walking"
                          className="rounded"
                        />
                        <label htmlFor="walking" className="text-sm">
                          Walking
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="running"
                          name="exercise_types"
                          value="running"
                          className="rounded"
                        />
                        <label htmlFor="running" className="text-sm">
                          Running
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="cycling"
                          name="exercise_types"
                          value="cycling"
                          className="rounded"
                        />
                        <label htmlFor="cycling" className="text-sm">
                          Cycling
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="swimming"
                          name="exercise_types"
                          value="swimming"
                          className="rounded"
                        />
                        <label htmlFor="swimming" className="text-sm">
                          Swimming
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="weight_training"
                          name="exercise_types"
                          value="weight_training"
                          className="rounded"
                        />
                        <label htmlFor="weight_training" className="text-sm">
                          Weight Training
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="yoga"
                          name="exercise_types"
                          value="yoga"
                          className="rounded"
                        />
                        <label htmlFor="yoga" className="text-sm">
                          Yoga
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="hiit"
                          name="exercise_types"
                          value="hiit"
                          className="rounded"
                        />
                        <label htmlFor="hiit" className="text-sm">
                          HIIT
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="team_sports"
                          name="exercise_types"
                          value="team_sports"
                          className="rounded"
                        />
                        <label htmlFor="team_sports" className="text-sm">
                          Team Sports
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="no_exercise"
                          name="exercise_types"
                          value="no_exercise"
                          className="rounded"
                        />
                        <label htmlFor="no_exercise" className="text-sm">
                          I don't exercise regularly
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Nutrition Habits</h2>
                  <div className="space-y-3">
                    <p className="text-sm">
                      How would you describe your current diet?
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="diet_balanced"
                          name="current_diet"
                          value="balanced"
                          required
                        />
                        <label htmlFor="diet_balanced" className="text-sm">
                          Balanced (varied foods in moderation)
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="diet_high_protein"
                          name="current_diet"
                          value="high_protein"
                        />
                        <label htmlFor="diet_high_protein" className="text-sm">
                          High protein
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="diet_low_carb"
                          name="current_diet"
                          value="low_carb"
                        />
                        <label htmlFor="diet_low_carb" className="text-sm">
                          Low carb
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="diet_vegetarian"
                          name="current_diet"
                          value="vegetarian"
                        />
                        <label htmlFor="diet_vegetarian" className="text-sm">
                          Vegetarian
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="diet_vegan"
                          name="current_diet"
                          value="vegan"
                        />
                        <label htmlFor="diet_vegan" className="text-sm">
                          Vegan
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="diet_keto"
                          name="current_diet"
                          value="keto"
                        />
                        <label htmlFor="diet_keto" className="text-sm">
                          Keto
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="diet_paleo"
                          name="current_diet"
                          value="paleo"
                        />
                        <label htmlFor="diet_paleo" className="text-sm">
                          Paleo
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="diet_unstructured"
                          name="current_diet"
                          value="unstructured"
                        />
                        <label htmlFor="diet_unstructured" className="text-sm">
                          Unstructured (no specific diet plan)
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <p className="text-sm">
                      How many glasses of water do you drink daily?
                    </p>
                    <select
                      name="water_intake"
                      className="w-full p-2 rounded-md border border-input bg-background"
                      required
                    >
                      <option value="">Select amount</option>
                      <option value="0-2">0-2 glasses</option>
                      <option value="3-5">3-5 glasses</option>
                      <option value="6-8">6-8 glasses</option>
                      <option value="8+">More than 8 glasses</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Sleep Habits</h2>
                  <div className="space-y-3">
                    <p className="text-sm">
                      How many hours of sleep do you typically get per night?
                    </p>
                    <select
                      name="sleep_hours"
                      className="w-full p-2 rounded-md border border-input bg-background"
                      required
                    >
                      <option value="">Select hours</option>
                      <option value="less_than_5">Less than 5 hours</option>
                      <option value="5-6">5-6 hours</option>
                      <option value="7-8">7-8 hours</option>
                      <option value="9+">More than 9 hours</option>
                    </select>
                  </div>

                  <div className="space-y-3 mt-6">
                    <p className="text-sm">
                      How would you rate your sleep quality?
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <div key={rating} className="relative">
                          <input
                            type="radio"
                            id={`sleep_quality_${rating}`}
                            name="sleep_quality"
                            value={rating}
                            className="peer sr-only"
                            required
                          />
                          <label
                            htmlFor={`sleep_quality_${rating}`}
                            className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-200 cursor-pointer hover:border-green-500 peer-checked:border-green-500 peer-checked:bg-green-500 peer-checked:text-white transition-all"
                          >
                            {rating}
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Poor</span>
                      <span>Excellent</span>
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
                  Continue to Preferences
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
