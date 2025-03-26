import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import { Target, Dumbbell, Heart } from "lucide-react";

export default async function GoalsQuestionnairePage() {
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
              <h1 className="text-3xl font-bold mb-2">Your Health Goals</h1>
              <p className="text-muted-foreground">
                Select your primary health goal to help us personalize your
                journey.
              </p>
            </div>

            <form action="/questionnaire/habits">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="relative">
                  <input
                    type="radio"
                    id="weight_loss"
                    name="primary_goal"
                    value="weight_loss"
                    className="peer sr-only"
                    required
                  />
                  <label
                    htmlFor="weight_loss"
                    className="flex flex-col items-center p-6 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:border-green-500 peer-checked:border-green-500 peer-checked:bg-green-50 transition-all"
                  >
                    <div className="bg-green-100 p-3 rounded-full mb-4">
                      <Target className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Weight Loss</h3>
                    <p className="text-sm text-center text-gray-500">
                      Lose weight through balanced nutrition and effective
                      workouts
                    </p>
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="radio"
                    id="muscle_gain"
                    name="primary_goal"
                    value="muscle_gain"
                    className="peer sr-only"
                  />
                  <label
                    htmlFor="muscle_gain"
                    className="flex flex-col items-center p-6 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:border-green-500 peer-checked:border-green-500 peer-checked:bg-green-50 transition-all"
                  >
                    <div className="bg-green-100 p-3 rounded-full mb-4">
                      <Dumbbell className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Muscle Gain</h3>
                    <p className="text-sm text-center text-gray-500">
                      Build strength and muscle with progressive resistance
                      training
                    </p>
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="radio"
                    id="general_wellness"
                    name="primary_goal"
                    value="general_wellness"
                    className="peer sr-only"
                  />
                  <label
                    htmlFor="general_wellness"
                    className="flex flex-col items-center p-6 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:border-green-500 peer-checked:border-green-500 peer-checked:bg-green-50 transition-all"
                  >
                    <div className="bg-green-100 p-3 rounded-full mb-4">
                      <Heart className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      General Wellness
                    </h3>
                    <p className="text-sm text-center text-gray-500">
                      Improve overall health with balanced habits and
                      mindfulness
                    </p>
                  </label>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <h2 className="text-xl font-semibold">Specific Goals</h2>
                <p className="text-sm text-muted-foreground">
                  Select all that apply to you:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="lose_weight"
                      name="specific_goals"
                      value="lose_weight"
                      className="rounded"
                    />
                    <label htmlFor="lose_weight" className="text-sm">
                      Lose weight
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="build_muscle"
                      name="specific_goals"
                      value="build_muscle"
                      className="rounded"
                    />
                    <label htmlFor="build_muscle" className="text-sm">
                      Build muscle
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="improve_fitness"
                      name="specific_goals"
                      value="improve_fitness"
                      className="rounded"
                    />
                    <label htmlFor="improve_fitness" className="text-sm">
                      Improve fitness
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="reduce_stress"
                      name="specific_goals"
                      value="reduce_stress"
                      className="rounded"
                    />
                    <label htmlFor="reduce_stress" className="text-sm">
                      Reduce stress
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="sleep_better"
                      name="specific_goals"
                      value="sleep_better"
                      className="rounded"
                    />
                    <label htmlFor="sleep_better" className="text-sm">
                      Sleep better
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="eat_healthier"
                      name="specific_goals"
                      value="eat_healthier"
                      className="rounded"
                    />
                    <label htmlFor="eat_healthier" className="text-sm">
                      Eat healthier
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="increase_energy"
                      name="specific_goals"
                      value="increase_energy"
                      className="rounded"
                    />
                    <label htmlFor="increase_energy" className="text-sm">
                      Increase energy
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="improve_mobility"
                      name="specific_goals"
                      value="improve_mobility"
                      className="rounded"
                    />
                    <label htmlFor="improve_mobility" className="text-sm">
                      Improve mobility
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h2 className="text-xl font-semibold">Target Timeline</h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="1_month"
                      name="timeline"
                      value="1_month"
                      required
                    />
                    <label htmlFor="1_month" className="text-sm">
                      1 month
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="3_months"
                      name="timeline"
                      value="3_months"
                    />
                    <label htmlFor="3_months" className="text-sm">
                      3 months
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="6_months"
                      name="timeline"
                      value="6_months"
                    />
                    <label htmlFor="6_months" className="text-sm">
                      6 months
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="ongoing"
                      name="timeline"
                      value="ongoing"
                    />
                    <label htmlFor="ongoing" className="text-sm">
                      Ongoing lifestyle change
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
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
                  Continue to Habits
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
