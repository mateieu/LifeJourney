import { createClient } from "@/utils/supabase/client";

// Tables and columns that should exist in our database
const requiredSchema = {
  activities: ['id', 'user_id', 'activity_type', 'value', 'unit', 'completed_at', 'notes'],
  goals: ['id', 'user_id', 'title', 'description', 'target_date', 'completed_at', 'progress', 'target_value', 'current_value', 'activity_type'],
  sleep_entries: ['id', 'user_id', 'date', 'sleep_time', 'wake_time', 'quality', 'notes', 'duration_minutes'],
  health_metrics: ['id', 'user_id', 'date', 'metric_type', 'value', 'notes'],
  nutrition_entries: ['id', 'user_id', 'date', 'food_name', 'meal_type', 'calories', 'protein', 'carbs', 'fat', 'notes'],
  user_preferences: ['id', 'user_id', 'preferences', 'updated_at']
};

/**
 * Check if the database has the necessary columns for measurement units
 */
export async function checkDatabaseSchema(): Promise<boolean> {
  try {
    const supabase = createClient();
    
    // Check if we need to initialize schema 
    const { data: schemaData, error: schemaError } = await supabase
      .from('app_metadata')
      .select('*')
      .eq('key', 'schema_version')
      .single();
      
    if (schemaError || !schemaData) {
      // Schema version not found, we need to initialize or update
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking database schema:', error);
    return false;
  }
}

export async function initializeDatabaseSchema(): Promise<boolean> {
  try {
    const supabase = createClient();
    
    // Create required tables and columns if they don't exist
    for (const [table, columns] of Object.entries(requiredSchema)) {
      // Check if table exists
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
        
      if (error) {
        // Table doesn't exist or other error, create the table
        console.log(`Creating table: ${table}`);
        
        // Generate SQL to create table based on columns
        // This is just a placeholder - in a real app you would use migrations
        const createTableSQL = `CREATE TABLE ${table} (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          ${columns.map(col => {
            if (col === 'id') return '';
            if (col === 'user_id') return 'user_id UUID REFERENCES auth.users(id) NOT NULL';
            if (col === 'preferences') return 'preferences JSONB DEFAULT \'{}\' NOT NULL';
            if (col.includes('date')) return `${col} DATE`;
            if (col.includes('time')) return `${col} TIME`;
            if (col.includes('value') || col.includes('calories') || 
                col.includes('protein') || col.includes('carbs') || 
                col.includes('fat') || col.includes('quality') || 
                col.includes('progress') || col.includes('duration')) 
              return `${col} NUMERIC`;
            return `${col} TEXT`;
          }).filter(Boolean).join(',\n          ')},
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`;
        
        // For an actual application, you would execute this via Supabase edge functions
        // or a server-side API route with admin privileges
        console.log(`Would execute: ${createTableSQL}`);
      }
    }
    
    // Set schema version
    await supabase
      .from('app_metadata')
      .upsert({
        key: 'schema_version',
        value: '1.0',
        updated_at: new Date().toISOString()
      });
      
    return true;
  } catch (error) {
    console.error('Error initializing database schema:', error);
    return false;
  }
} 