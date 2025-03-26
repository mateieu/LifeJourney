import { Tables } from "@/types/supabase";
import { Flame } from "lucide-react";

type Streak = Tables<"health_streaks">;

interface StreakDisplayProps {
  streak: Streak;
}

export function StreakDisplay({ streak }: StreakDisplayProps) {
  const formatStreakType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="bg-muted/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Flame className="text-orange-500 h-5 w-5" />
        <h3 className="font-medium">{formatStreakType(streak.streak_type)}</h3>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-2xl font-bold">{streak.current_streak || 0}</p>
          <p className="text-xs text-muted-foreground">Current Streak</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">{streak.longest_streak || 0}</p>
          <p className="text-xs text-muted-foreground">Best Streak</p>
        </div>
      </div>
    </div>
  );
}
