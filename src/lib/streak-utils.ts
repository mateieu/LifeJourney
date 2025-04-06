import { Tables } from "@/types/supabase";

export type Streak = Tables<"health_streaks"> & {
  start_date?: string | null;
};

export type Activity = Tables<"health_activities"> & {
  completed_at: string;
};

export const calculateStreaks = (activities: Activity[]): Streak[] => {
  // Group activities by type
  const groupedActivities: Record<string, Activity[]> = {};
  
  activities.forEach(activity => {
    const type = activity.activity_type;
    if (!groupedActivities[type]) {
      groupedActivities[type] = [];
    }
    groupedActivities[type].push(activity);
  });
  
  // For each activity type, calculate streaks
  const streaks: Streak[] = [];
  
  Object.entries(groupedActivities).forEach(([type, typeActivities]) => {
    // Sort activities by date
    const sortedActivities = typeActivities.sort((a, b) => 
      new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
    );
    
    let currentStreak = 0;
    let longestStreak = 0;
    let lastActivityDate = '';
    let startDate = '';
    
    // This is a simplified algorithm - a full implementation would need to
    // check for consecutive days rather than just counting activities
    sortedActivities.forEach(activity => {
      currentStreak++;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
      lastActivityDate = activity.completed_at;
      if (currentStreak === 1) {
        startDate = activity.completed_at;
      }
    });
    
    streaks.push({
      id: `${type}-streak`,
      user_id: sortedActivities[0]?.user_id || '',
      streak_type: type,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_activity_date: lastActivityDate,
      created_at: startDate,
      updated_at: lastActivityDate,
      start_date: startDate
    });
  });
  
  return streaks;
}; 