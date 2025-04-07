import { Skeleton } from "@/components/ui/skeleton";
import { Brain } from "lucide-react";

export default function MentalHealthLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6 text-purple-500" />
        <Skeleton className="h-8 w-52" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      
      <Skeleton className="h-80" />
    </div>
  );
} 