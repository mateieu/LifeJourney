import { Tables } from "@/types/supabase";
import { Flame as Fire, Trophy, Calendar, Activity } from "lucide-react";
import { Progress } from "./ui/progress";
import { formatDistanceToNow } from "date-fns";

type Streak = Tables<"health_streaks">;

interface StreakDisplayProps {
  streak: Streak;
}

export function StreakDisplay({ streak }: StreakDisplayProps) {
  const getStreakColor = () => {
    const current = streak.current_streak || 0;
    if (current >= 30) return "text-red-500";
    if (current >= 14) return "text-orange-500";
    if (current >= 7) return "text-yellow-500";
    return "text-blue-500";
  };

  const getProgressValue = () => {
    const current = streak.current_streak || 0;
    const target = current < 7 ? 7 : current < 14 ? 14 : current < 30 ? 30 : 60;
    return (current / target) * 100;
  };

  const getNextMilestone = () => {
    const current = streak.current_streak || 0;
    if (current < 7) return 7;
    if (current < 14) return 14;
    if (current < 30) return 30;
    if (current < 60) return 60;
    if (current < 90) return 90;
    return Math.ceil(current / 30) * 30;
  };

  const getStreakTypeLabel = (type: string) => {
    const formatted = type.charAt(0).toUpperCase() + type.slice(1);
    return formatted === "Walking" ? "Steps" : formatted;
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {getStreakTypeLabel(streak.streak_type)}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${getStreakColor()}`}>
          {streak.current_streak || 0}
        </span>
        <span className="text-sm text-muted-foreground">day streak</span>
      </div>

      <div className="mt-3 mb-1 flex justify-between text-xs">
        <span className="text-muted-foreground">Current</span>
        <span className="text-muted-foreground">
          Next: {getNextMilestone()} days
        </span>
      </div>

      <Progress value={getProgressValue()} className="h-1.5" />

      <div className="mt-4 flex justify-between text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Trophy className="h-3.5 w-3.5" />
          <span>Best: {streak.longest_streak || 0} days</span>
        </div>
        {streak.last_activity_date && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Last active {formatDistanceToNow(new Date(streak.last_activity_date), { addSuffix: true })}</span>
          </div>
        )}
      </div>
    </div>
  );
}
