import { format, formatDistance } from "date-fns";
import { Tables } from "@/types/supabase";
import {
  Activity,
  BarChart,
  Droplets,
  Moon,
  Edit,
  Clock,
  Bike,
  Dumbbell,
  Footprints,
  Waves,
  PersonStanding
} from "lucide-react";

// Custom running icon using footprints
const Running = () => <Footprints className="h-5 w-5 -rotate-45" />;
// Yoga icon
const Yoga = () => <PersonStanding className="h-5 w-5" />;
// Brain icon for meditation
const Brain = () => <Activity className="h-5 w-5" />;

type Activity = Tables<"health_activities">;

interface ActivityListProps {
  activities: Activity[];
}

export function ActivityList({ activities }: ActivityListProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "walking":
        return { icon: <Footprints className="h-5 w-5" />, color: "bg-green-100 text-green-600" };
      case "running":
        return { icon: <Running />, color: "bg-orange-100 text-orange-600" };
      case "cycling":
        return { icon: <Bike className="h-5 w-5" />, color: "bg-purple-100 text-purple-600" };
      case "swimming":
        return { icon: <Waves className="h-5 w-5" />, color: "bg-blue-100 text-blue-600" };
      case "yoga":
        return { icon: <Yoga />, color: "bg-pink-100 text-pink-600" };
      case "meditation":
        return { icon: <Brain />, color: "bg-violet-100 text-violet-600" };
      case "strength":
        return { icon: <Dumbbell className="h-5 w-5" />, color: "bg-red-100 text-red-600" };
      case "water":
        return { icon: <Droplets className="h-5 w-5" />, color: "bg-cyan-100 text-cyan-600" };
      case "sleep":
        return { icon: <Moon className="h-5 w-5" />, color: "bg-indigo-100 text-indigo-600" };
      default:
        return { icon: <Activity className="h-5 w-5" />, color: "bg-gray-100 text-gray-600" };
    }
  };

  const getActivityTitle = (type: string) => {
    switch (type) {
      case "walking":
        return "Walking";
      case "running":
        return "Running";
      case "cycling":
        return "Cycling";
      case "swimming":
        return "Swimming";
      case "yoga":
        return "Yoga";
      case "meditation":
        return "Meditation";
      case "strength":
        return "Strength Training";
      case "water":
        return "Water Intake";
      case "sleep":
        return "Sleep";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getValueLabel = (type: string, value: number) => {
    switch (type) {
      case "walking":
        return `${value} steps`;
      case "running":
      case "cycling":
        return `${value} km`;
      case "swimming":
        return `${value} m`;
      case "yoga":
      case "meditation":
      case "strength":
        return `${value} min`;
      case "water":
        return `${value} glasses`;
      case "sleep":
        return `${value} hours`;
      default:
        return `${value}`;
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const { icon, color } = getActivityIcon(activity.activity_type);
        return (
          <div key={activity.id} className="bg-white rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${color}`}>{icon}</div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-medium">
                    {getActivityTitle(activity.activity_type)}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {activity.completed_at && 
                      formatDistance(
                        new Date(activity.completed_at),
                        new Date(),
                        { addSuffix: true }
                      )}
                  </span>
                </div>
                <p className="text-lg font-semibold mt-1">
                  {getValueLabel(activity.activity_type, activity.value)}
                </p>
                {activity.notes && (
                  <p className="text-sm text-muted-foreground mt-2 border-t pt-2">
                    {activity.notes}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
