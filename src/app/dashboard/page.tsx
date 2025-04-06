import { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard-client";
import { checkDatabaseSchema } from "@/utils/db-schema-check";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | LifeJourney",
  description: "Track your health and fitness journey",
};

export default function DashboardPage() {
  return (
    <div className="container py-8">
      <Suspense fallback={
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <DashboardClient />
      </Suspense>
    </div>
  );
}
