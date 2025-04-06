import { createClient } from '@/utils/supabase/client';

/**
 * Utility to update database schema for measurement units
 * Run this manually from a component or admin page
 */
export async function runMeasurementUnitsMigration() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return { success: false, error: 'Authentication required' };
    }
    
    // 1. First, check if the column already exists in health_activities
    const { data: activitiesInfo, error: activitiesColumnError } = await supabase
      .from('health_activities')
      .select('measurement_unit')
      .limit(1);
      
    // If column doesn't exist, add it
    if (activitiesColumnError && activitiesColumnError.message.includes('column "measurement_unit" does not exist')) {
      // Column needs to be added via SQL - this might require admin privileges
      // Log message for manual migration
      console.info('Column "measurement_unit" needs to be added to health_activities table');
      console.info('Run this SQL: ALTER TABLE health_activities ADD COLUMN measurement_unit TEXT');
      
      // Here we would ideally perform the column addition, but Supabase JS client
      // doesn't directly support schema modifications, so we'll simulate by 
      // showing what manual addition would be needed.
    }
    
    // 2. Check if column exists in health_goals
    const { data: goalsInfo, error: goalsColumnError } = await supabase
      .from('health_goals')
      .select('measurement_unit')
      .limit(1);
      
    if (goalsColumnError && goalsColumnError.message.includes('column "measurement_unit" does not exist')) {
      console.info('Column "measurement_unit" needs to be added to health_goals table');
      console.info('Run this SQL: ALTER TABLE health_goals ADD COLUMN measurement_unit TEXT');
    }
    
    // 3. Update existing records to add measurement units if missing
    // For activities
    const { data: activities, error: activitiesError } = await supabase
      .from('health_activities')
      .select('*')
      .filter('measurement_unit', 'is', null);
      
    if (!activitiesError && activities && activities.length > 0) {
      console.info(`Updating ${activities.length} activities with default measurement units`);
      
      for (const activity of activities) {
        const defaultUnit = getDefaultUnitForActivityType(activity.activity_type);
        await supabase
          .from('health_activities')
          .update({ measurement_unit: defaultUnit })
          .eq('id', activity.id);
      }
    }
    
    // For goals
    const { data: goals, error: goalsError } = await supabase
      .from('health_goals')
      .select('*')
      .filter('measurement_unit', 'is', null);
      
    if (!goalsError && goals && goals.length > 0) {
      console.info(`Updating ${goals.length} goals with default measurement units`);
      
      for (const goal of goals) {
        const defaultUnit = getDefaultUnitForActivityType(goal.goal_type);
        await supabase
          .from('health_goals')
          .update({ measurement_unit: defaultUnit })
          .eq('id', goal.id);
      }
    }
    
    // 4. Create user_preferences table if it doesn't exist
    // This will likely need to be done manually as well
    const { data: prefCheck, error: prefError } = await supabase
      .from('user_preferences')
      .select('user_id')
      .limit(1);
      
    if (prefError && prefError.message.includes('relation "user_preferences" does not exist')) {
      console.info('Table "user_preferences" needs to be created');
      console.info(`
        Run this SQL:
        CREATE TABLE user_preferences (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE UNIQUE INDEX user_preferences_user_id_idx ON user_preferences (user_id);
      `);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error running measurement units migration:', error);
    return { success: false, error: error.message };
  }
}

function getDefaultUnitForActivityType(activityType) {
  const activityMeasurements = {
    walking: 'step',
    running: 'km',
    cycling: 'km',
    swimming: 'meter',
    yoga: 'minute',
    meditation: 'minute',
    strength: 'minute',
    water: 'glass',
    sleep: 'hour'
  };
  
  return activityMeasurements[activityType] || 'count';
} 