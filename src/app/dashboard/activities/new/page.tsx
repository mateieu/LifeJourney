import { Metadata } from "next";
import { ActivityLogger } from "@/components/activity-logger";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Log Activity | LifeJourney",
  description: "Record your health and fitness activities",
};

export default function NewActivityPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/activities">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Activities
          </Link>
        </Button>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <ActivityLogger />
      </div>
    </div>
  );
} 