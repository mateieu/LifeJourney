import { Metadata } from "next";
import { Achievements } from "@/components/achievements";

export const metadata: Metadata = {
  title: "Achievements | LifeJourney",
  description: "Track your health journey accomplishments and earn badges",
};

export default function AchievementsPage() {
  return (
    <div className="container mx-auto py-6">
      <Achievements />
    </div>
  );
} 