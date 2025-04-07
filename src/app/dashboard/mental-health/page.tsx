import { Metadata } from "next";
import { MentalHealthTracker } from "@/components/mental-health-tracker";

export const metadata: Metadata = {
  title: "Mental Health Tracker | LifeJourney",
  description: "Track your mood, energy levels, and stress to improve mental wellbeing",
};

export default function MentalHealthPage() {
  return <MentalHealthTracker />;
} 