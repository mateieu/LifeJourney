export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      health_activities: {
        Row: {
          id: string;
          user_id: string;
          activity_type: string;
          value: number;
          notes: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_type: string;
          value: number;
          notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_type?: string;
          value?: number;
          notes?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      health_goals: {
        Row: {
          id: string;
          user_id: string;
          goal_type: string;
          target_value: number;
          current_value: number | null;
          target_date: string | null;
          status: string | null;
          start_date: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_type: string;
          target_value: number;
          current_value?: number | null;
          target_date?: string | null;
          status?: string | null;
          start_date?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal_type?: string;
          target_value?: number;
          current_value?: number | null;
          target_date?: string | null;
          status?: string | null;
          start_date?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      health_streaks: {
        Row: {
          id: string;
          user_id: string;
          streak_type: string;
          current_streak: number | null;
          longest_streak: number | null;
          last_activity_date: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          streak_type: string;
          current_streak?: number | null;
          longest_streak?: number | null;
          last_activity_date?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          streak_type?: string;
          current_streak?: number | null;
          longest_streak?: number | null;
          last_activity_date?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      health_suggestions: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          is_completed: boolean | null;
          suggestion_type: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          is_completed?: boolean | null;
          suggestion_type: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          is_completed?: boolean | null;
          suggestion_type?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "health_suggestions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          amount: number | null;
          cancel_at_period_end: boolean | null;
          canceled_at: number | null;
          created_at: string;
          currency: string | null;
          current_period_end: number | null;
          current_period_start: number | null;
          custom_field_data: Json | null;
          customer_cancellation_comment: string | null;
          customer_cancellation_reason: string | null;
          customer_id: string | null;
          ended_at: number | null;
          ends_at: number | null;
          id: string;
          interval: string | null;
          metadata: Json | null;
          price_id: string | null;
          started_at: number | null;
          status: string | null;
          stripe_id: string | null;
          stripe_price_id: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          amount?: number | null;
          cancel_at_period_end?: boolean | null;
          canceled_at?: number | null;
          created_at?: string;
          currency?: string | null;
          current_period_end?: number | null;
          current_period_start?: number | null;
          custom_field_data?: Json | null;
          customer_cancellation_comment?: string | null;
          customer_cancellation_reason?: string | null;
          customer_id?: string | null;
          ended_at?: number | null;
          ends_at?: number | null;
          id?: string;
          interval?: string | null;
          metadata?: Json | null;
          price_id?: string | null;
          started_at?: number | null;
          status?: string | null;
          stripe_id?: string | null;
          stripe_price_id?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          amount?: number | null;
          cancel_at_period_end?: boolean | null;
          canceled_at?: number | null;
          created_at?: string;
          currency?: string | null;
          current_period_end?: number | null;
          current_period_start?: number | null;
          custom_field_data?: Json | null;
          customer_cancellation_comment?: string | null;
          customer_cancellation_reason?: string | null;
          customer_id?: string | null;
          ended_at?: number | null;
          ends_at?: number | null;
          id?: string;
          interval?: string | null;
          metadata?: Json | null;
          price_id?: string | null;
          started_at?: number | null;
          status?: string | null;
          stripe_id?: string | null;
          stripe_price_id?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          credits: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          image: string | null;
          name: string | null;
          subscription: string | null;
          token_identifier: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          credits?: string | null;
          email?: string | null;
          full_name?: string | null;
          id: string;
          image?: string | null;
          name?: string | null;
          subscription?: string | null;
          token_identifier: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          credits?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          image?: string | null;
          name?: string | null;
          subscription?: string | null;
          token_identifier?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      webhook_events: {
        Row: {
          created_at: string;
          data: Json | null;
          event_type: string;
          id: string;
          modified_at: string;
          stripe_event_id: string | null;
          type: string;
        };
        Insert: {
          created_at?: string;
          data?: Json | null;
          event_type: string;
          id?: string;
          modified_at?: string;
          stripe_event_id?: string | null;
          type: string;
        };
        Update: {
          created_at?: string;
          data?: Json | null;
          event_type?: string;
          id?: string;
          modified_at?: string;
          stripe_event_id?: string | null;
          type?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type NewRecord<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateRecord<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
