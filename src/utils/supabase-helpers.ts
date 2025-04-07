import { createClient } from "@/utils/supabase/client";

export async function ensureTableExists(tableName: string, tableDefinition: string) {
  try {
    const supabase = createClient();
    
    const { error } = await supabase.rpc('create_table_if_not_exists', {
      table_name: tableName,
      table_definition: tableDefinition
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error ensuring table ${tableName} exists:`, error);
    return false;
  }
}

export async function checkSupabaseConnection() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('health_goals').select('count').limit(1);
    
    if (error) throw error;
    return { connected: true, error: null };
  } catch (error) {
    console.error("Supabase connection error:", error);
    return { connected: false, error };
  }
} 