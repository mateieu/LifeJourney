// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  height?: number;
  weight?: number;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  createdAt: string;
  updatedAt: string;
}

// Character Types
export interface Character {
  id: string;
  userId: string;
  name: string;
  level: number;
  experience: number;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Habit Types
export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: 'fitness' | 'nutrition' | 'sleep' | 'mindfulness' | 'other';
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  targetValue?: number;
  unit?: string;
  startDate: string;
  endDate?: string;
  reminderTime?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Habit Log Types
export interface HabitLog {
  id: string;
  habitId: string;
  value?: number;
  completed: boolean;
  notes?: string;
  logDate: string;
  createdAt: string;
}

// Quest Types
export interface Quest {
  id: string;
  title: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  xpReward: number;
  currencyReward?: number;
  startDate: string;
  endDate?: string;
  requirements: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// User Quest Types
export interface UserQuest {
  id: string;
  userId: string;
  questId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  progress: Record<string, any>;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  requirements: Record<string, any>;
  createdAt: string;
}

// User Achievement Types
export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
} 