import { Metadata } from "next";
import { HealthMetricsPage } from "@/components/health-metrics-page";

export const metadata: Metadata = {
  title: "Health Metrics | LifeJourney",
  description: "Track your vital health metrics to monitor your wellbeing",
};

export default function HealthMetricsRoute() {
  return (
    <div className="container mx-auto py-6">
      <HealthMetricsPage />
    </div>
  );
} 