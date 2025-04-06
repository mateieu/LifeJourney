import { Metadata } from "next";
import { MentalHealthTracker } from "@/components/mental-health-tracker";

export const metadata: Metadata = {
  title: "Mental Health Tracker | LifeJourney",
  description: "Track and monitor your mental wellbeing, mood, and stress levels",
};

export default function MentalHealthPage() {
  return (
    <div className="container mx-auto py-6">
      <MentalHealthTracker />
    </div>
  );
} 