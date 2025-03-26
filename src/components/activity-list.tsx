import { Tables } from "@/types/supabase";

type Activity = Tables<"health_activities">;

interface ActivityListProps {
  activities: Activity[];
}

export function ActivityList({ activities }: ActivityListProps) {
  const formatActivityType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getUnitLabel = (type: string) => {
    switch (type) {
      case "walking":
        return "steps";
      case "running":
        return "km";
      case "cycling":
        return "km";
      case "swimming":
        return "minutes";
      case "workout":
        return "minutes";
      case "meditation":
        return "minutes";
      case "water":
        return "glasses";
      case "sleep":
        return "hours";
      default:
        return "";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "walking":
        return "🚶";
      case "running":
        return "🏃";
      case "cycling":
        return "🚴";
      case "swimming":
        return "🏊";
      case "workout":
        return "💪";
      case "meditation":
        return "🧘";
      case "water":
        return "💧";
      case "sleep":
        return "😴";
      default:
        return "📝";
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="bg-card rounded-lg p-4 border shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                {getActivityIcon(activity.activity_type)}
              </div>
              <div>
                <h4 className="font-medium">
                  {formatActivityType(activity.activity_type)}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {activity.value} {getUnitLabel(activity.activity_type)}
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {activity.completed_at &&
                new Date(activity.completed_at).toLocaleDateString()}
            </div>
          </div>
          {activity.notes && (
            <div className="mt-3 pl-13 text-sm text-muted-foreground">
              <p className="ml-10">{activity.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
