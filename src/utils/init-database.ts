"use client";

import { createClient } from "@/utils/supabase/client";

export async function initDatabase() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  try {
    // Check and create health_metrics table if needed
    const { error: healthMetricsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'health_metrics',
      table_definition: `
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid REFERENCES auth.users(id) NOT NULL,
        date date NOT NULL,
        metric_type text NOT NULL,
        value numeric NOT NULL,
        notes text,
        created_at timestamp with time zone DEFAULT now()
      `
    });

    // Check and create sleep_entries table if needed
    const { error: sleepEntriesError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'sleep_entries',
      table_definition: `
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid REFERENCES auth.users(id) NOT NULL,
        date date NOT NULL,
        sleep_time time NOT NULL,
        wake_time time NOT NULL,
        quality integer NOT NULL CHECK (quality BETWEEN 1 AND 5),
        duration_minutes integer,
        notes text,
        created_at timestamp with time zone DEFAULT now()
      `
    });

    // Check and create nutrition_entries table if needed
    const { error: nutritionEntriesError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'nutrition_entries',
      table_definition: `
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid REFERENCES auth.users(id) NOT NULL,
        date date NOT NULL,
        food_name text NOT NULL,
        meal_type text NOT NULL,
        calories integer,
        protein numeric,
        carbs numeric,
        fat numeric,
        notes text,
        created_at timestamp with time zone DEFAULT now()
      `
    });

    // Check and create user_preferences table if needed
    const { error: preferencesError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'user_preferences',
      table_definition: `
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid REFERENCES auth.users(id) UNIQUE NOT NULL,
        preferences jsonb DEFAULT '{}'::jsonb,
        updated_at timestamp with time zone DEFAULT now()
      `
    });

    // Check if there were any errors
    if (healthMetricsError || sleepEntriesError || nutritionEntriesError || preferencesError) {
      console.error("Database initialization errors:", {
        healthMetricsError,
        sleepEntriesError,
        nutritionEntriesError,
        preferencesError
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
} 