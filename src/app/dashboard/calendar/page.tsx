import { Metadata } from "next";
import { LifeCalendar } from "@/components/life-calendar";

export const metadata: Metadata = {
  title: "Life Calendar | LifeJourney",
  description: "View all your health data in a unified calendar view",
};

export default function CalendarPage() {
  return (
    <div className="container mx-auto py-6">
      <LifeCalendar />
    </div>
  );
} 