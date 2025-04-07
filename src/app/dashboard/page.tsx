import { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard-client";
import { checkDatabaseSchema } from "@/utils/db-schema-check";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { DashboardSkeleton } from "@/components/loading-skeleton";

export const metadata: Metadata = {
  title: "Dashboard | LifeJourney",
  description: "Track your health and fitness journey",
};

export default function DashboardPage() {
  return (
    <div className="container py-8">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardClient />
      </Suspense>
        </div>
  );
}
