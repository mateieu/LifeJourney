import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Filter, ArrowDownUp } from "lucide-react";
import { ActivitiesCalendar } from "@/components/activities-calendar";
import { ActivityFeed } from "@/components/activity-feed";

export const metadata: Metadata = {
  title: "Activities | LifeJourney",
  description: "Track and manage your health and fitness activities",
};

export default function ActivitiesPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
        <Button asChild>
          <Link href="/dashboard/activities/new">
            <Plus className="mr-2 h-4 w-4" /> Log Activity
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="feed" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="feed">Activity Feed</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <ArrowDownUp className="mr-2 h-4 w-4" />
              Sort
            </Button>
          </div>
        </div>
        
        <TabsContent value="feed" className="space-y-4">
          <Suspense fallback={<ActivityListSkeleton />}>
            <ActivityFeed />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="calendar" className="space-y-4">
          <Suspense fallback={<ActivityCalendarSkeleton />}>
            <ActivitiesCalendar />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ActivityListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityCalendarSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[500px] w-full" />
    </div>
  );
} 