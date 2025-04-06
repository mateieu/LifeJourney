import { createClient } from '@/utils/supabase/client';

export async function addMeasurementUnitToGoals() {
  const supabase = createClient();
  
  // Add measurement_unit column to health_goals table
  const { error } = await supabase.rpc('add_column_if_not_exists', {
    table_name: 'health_goals',
    column_name: 'measurement_unit',
    column_type: 'text'
  });
  
  if (error) {
    console.error('Error adding measurement_unit column:', error);
    return false;
  }
  
  console.log('Successfully added measurement_unit column to health_goals table');
  return true;
} 