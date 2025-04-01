export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      health_activities: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          value: number
          notes: string | null
          completed_at: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          value: number
          notes?: string | null
          completed_at: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          value?: number
          notes?: string | null
          completed_at?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      health_goals: {
        Row: {
          id: string
          user_id: string
          goal_type: string
          target_value: number
          current_value: number
          target_date: string
          status: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          goal_type: string
          target_value: number
          current_value?: number
          target_date: string
          status?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          goal_type?: string
          target_value?: number
          current_value?: number
          target_date?: string
          status?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      health_streaks: {
        Row: {
          id: string
          user_id: string
          streak_type: string
          current_streak: number
          longest_streak: number
          last_activity_date: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          streak_type: string
          current_streak?: number
          longest_streak?: number
          last_activity_date: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          streak_type?: string
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      health_suggestions: {
        Row: {
          id: string
          user_id: string
          suggestion_type: string
          content: string
          is_completed: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          suggestion_type: string
          content: string
          is_completed?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          suggestion_type?: string
          content?: string
          is_completed?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          status: string
          plan_id: string
          created_at: string
          updated_at: string | null
          current_period_end: string | null
        }
        Insert: {
          id?: string
          user_id: string
          status: string
          plan_id: string
          created_at?: string
          updated_at?: string | null
          current_period_end?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          plan_id?: string
          created_at?: string
          updated_at?: string | null
          current_period_end?: string | null
        }
      }
      users: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          token_identifier: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          token_identifier: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          token_identifier?: string
          created_at?: string
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 