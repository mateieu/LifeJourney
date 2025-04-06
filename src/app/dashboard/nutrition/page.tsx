import { Metadata } from "next";
import { NutritionTracker } from "@/components/nutrition-tracker";

export const metadata: Metadata = {
  title: "Nutrition Tracker | LifeJourney",
  description: "Track your daily food intake and nutrition",
};

export default function NutritionPage() {
  return (
    <div className="container py-8">
      <NutritionTracker />
    </div>
  );
} 