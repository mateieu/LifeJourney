import { useState } from "react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function QuestionnairePage() {
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
              <h1 className="text-3xl font-bold mb-2">Health Assessment</h1>
              <p className="text-muted-foreground">
                Let's personalize your health journey by understanding your
                goals and current habits.
              </p>
            </div>

            <form action="/questionnaire/goals">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Age</label>
                      <input
                        type="number"
                        name="age"
                        className="w-full p-2 rounded-md border border-input bg-background"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Gender</label>
                      <select
                        name="gender"
                        className="w-full p-2 rounded-md border border-input bg-background"
                        required
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="prefer-not-to-say">
                          Prefer not to say
                        </option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Height (cm)</label>
                      <input
                        type="number"
                        name="height"
                        className="w-full p-2 rounded-md border border-input bg-background"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Weight (kg)</label>
                      <input
                        type="number"
                        name="weight"
                        className="w-full p-2 rounded-md border border-input bg-background"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">
                    Current Activity Level
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="sedentary"
                        name="activity_level"
                        value="sedentary"
                        required
                      />
                      <label htmlFor="sedentary" className="text-sm">
                        Sedentary (little to no exercise)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="light"
                        name="activity_level"
                        value="light"
                      />
                      <label htmlFor="light" className="text-sm">
                        Lightly active (light exercise 1-3 days/week)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="moderate"
                        name="activity_level"
                        value="moderate"
                      />
                      <label htmlFor="moderate" className="text-sm">
                        Moderately active (moderate exercise 3-5 days/week)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="very"
                        name="activity_level"
                        value="very"
                      />
                      <label htmlFor="very" className="text-sm">
                        Very active (hard exercise 6-7 days/week)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="extra"
                        name="activity_level"
                        value="extra"
                      />
                      <label htmlFor="extra" className="text-sm">
                        Extra active (very hard exercise & physical job)
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Health Conditions</h2>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="none"
                        name="health_conditions"
                        value="none"
                      />
                      <label htmlFor="none" className="text-sm">
                        None
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="hypertension"
                        name="health_conditions"
                        value="hypertension"
                      />
                      <label htmlFor="hypertension" className="text-sm">
                        Hypertension
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="diabetes"
                        name="health_conditions"
                        value="diabetes"
                      />
                      <label htmlFor="diabetes" className="text-sm">
                        Diabetes
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="heart_disease"
                        name="health_conditions"
                        value="heart_disease"
                      />
                      <label htmlFor="heart_disease" className="text-sm">
                        Heart Disease
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="arthritis"
                        name="health_conditions"
                        value="arthritis"
                      />
                      <label htmlFor="arthritis" className="text-sm">
                        Arthritis
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="other"
                        name="health_conditions"
                        value="other"
                      />
                      <label htmlFor="other" className="text-sm">
                        Other
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Continue to Goals
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
