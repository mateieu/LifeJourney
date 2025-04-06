// Create this API route for admins to update the DB schema
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getDefaultUnit } from '@/lib/measurements';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Now we can use supabase directly
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is an admin (optional, implement your own admin check)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    // Check if columns exist in health_activities and add them if needed
    try {
      await supabase.rpc('add_column_if_not_exists', {
        table_name: 'health_activities',
        column_name: 'measurement_unit',
        column_type: 'text'
      });
    } catch (error) {
      console.error('Error adding measurement_unit to health_activities:', error);
      // Continue execution - the column might already exist
    }

    // Check if columns exist in health_goals and add them if needed
    try {
      await supabase.rpc('add_column_if_not_exists', {
        table_name: 'health_goals',
        column_name: 'measurement_unit',
        column_type: 'text'
      });
    } catch (error) {
      console.error('Error adding measurement_unit to health_goals:', error);
      // Continue execution - the column might already exist
    }

    // Create user_preferences table if it doesn't exist
    try {
      await supabase.rpc('create_table_if_not_exists', {
        table_definition: `
          CREATE TABLE user_preferences (
            id SERIAL PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          CREATE UNIQUE INDEX IF NOT EXISTS user_preferences_user_id_idx ON user_preferences (user_id);
        `
      });
    } catch (error) {
      console.error('Error creating user_preferences table:', error);
      // Continue execution - the table might already exist
    }

    // Update existing records to add measurement units if missing
    // For activities
    const { data: activities, error: activitiesError } = await supabase
      .from('health_activities')
      .select('id, activity_type, measurement_unit')
      .is('measurement_unit', null);

    if (!activitiesError && activities && activities.length > 0) {
      for (const activity of activities) {
        const defaultUnit = getDefaultUnit(activity.activity_type);
        await supabase
          .from('health_activities')
          .update({ measurement_unit: defaultUnit })
          .eq('id', activity.id);
      }
    }

    // For goals
    const { data: goals, error: goalsError } = await supabase
      .from('health_goals')
      .select('id, goal_type, measurement_unit')
      .is('measurement_unit', null);

    if (!goalsError && goals && goals.length > 0) {
      for (const goal of goals) {
        const defaultUnit = getDefaultUnit(goal.goal_type);
        await supabase
          .from('health_goals')
          .update({ measurement_unit: defaultUnit })
          .eq('id', goal.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database schema updated successfully',
      stats: {
        activitiesUpdated: activities?.length || 0,
        goalsUpdated: goals?.length || 0
      }
    });
  } catch (error) {
    console.error('Error updating database schema:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating database schema', error },
      { status: 500 }
    );
  }
} 