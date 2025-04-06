import { Metadata } from "next";
import { SleepTracker } from "@/components/sleep-tracker";

export const metadata: Metadata = {
  title: "Sleep Tracking | LifeJourney",
  description: "Track your sleep patterns and improve your rest",
};

export default function SleepPage() {
  return <SleepTracker />;
} 