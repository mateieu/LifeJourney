"use client";

import { createClient } from "@/utils/supabase/client";

// Sleep tracking
export async function saveSleepEntry(entry: {
  date: string;
  sleep_time: string;
  wake_time: string;
  quality: number;
  notes?: string;
  duration_minutes?: number;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  // Calculate duration if not provided
  let durationMinutes = entry.duration_minutes;
  if (!durationMinutes) {
    const [sleepHour, sleepMinute] = entry.sleep_time.split(':').map(Number);
    const [wakeHour, wakeMinute] = entry.wake_time.split(':').map(Number);
    
    let sleepDate = new Date();
    sleepDate.setHours(sleepHour, sleepMinute, 0, 0);
    
    let wakeDate = new Date();
    wakeDate.setHours(wakeHour, wakeMinute, 0, 0);
    
    // If wake time is earlier than sleep time, it means the person woke up the next day
    if (wakeDate <= sleepDate) {
      wakeDate.setDate(wakeDate.getDate() + 1);
    }
    
    durationMinutes = Math.round((wakeDate.getTime() - sleepDate.getTime()) / 60000);
  }
  
  const { data, error } = await supabase
    .from('sleep_entries')
    .insert({
      user_id: user.id,
      date: entry.date,
      sleep_time: entry.sleep_time,
      wake_time: entry.wake_time,
      quality: entry.quality,
      duration_minutes: durationMinutes,
      notes: entry.notes || null
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function fetchSleepEntries(startDate?: string, endDate?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  let query = supabase
    .from('sleep_entries')
    .select('*')
    .eq('user_id', user.id);
    
  if (startDate) {
    query = query.gte('date', startDate);
  }
  
  if (endDate) {
    query = query.lte('date', endDate);
  }
  
  query = query.order('date', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export async function deleteSleepEntry(id: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('sleep_entries')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
}

// Health metrics
export async function saveHealthMetric(metric: {
  date: string;
  metric_type: string;
  value: number;
  notes?: string;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  const { data, error } = await supabase
    .from('health_metrics')
    .insert({
      user_id: user.id,
      date: metric.date,
      metric_type: metric.metric_type,
      value: metric.value,
      notes: metric.notes || null
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function saveBloodPressure(entry: {
  date: string;
  systolic: number;
  diastolic: number;
  notes?: string;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  // Insert systolic
  const { error: systolicError } = await supabase
    .from('health_metrics')
    .insert({
      user_id: user.id,
      date: entry.date,
      metric_type: 'blood_pressure_systolic',
      value: entry.systolic,
      notes: entry.notes || null
    });
    
  if (systolicError) throw systolicError;
  
  // Insert diastolic
  const { error: diastolicError } = await supabase
    .from('health_metrics')
    .insert({
      user_id: user.id,
      date: entry.date,
      metric_type: 'blood_pressure_diastolic',
      value: entry.diastolic,
      notes: entry.notes || null
    });
    
  if (diastolicError) throw diastolicError;
  
  return true;
}

export async function fetchHealthMetrics(metricType: string | string[], startDate?: string, endDate?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  let query = supabase
    .from('health_metrics')
    .select('*')
    .eq('user_id', user.id);
    
  if (Array.isArray(metricType)) {
    query = query.in('metric_type', metricType);
  } else {
    query = query.eq('metric_type', metricType);
  }
  
  if (startDate) {
    query = query.gte('date', startDate);
  }
  
  if (endDate) {
    query = query.lte('date', endDate);
  }
  
  query = query.order('date', { ascending: true });
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export async function deleteHealthMetric(id: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('health_metrics')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
}

// Nutrition tracking
export async function saveNutritionEntry(entry: {
  date: string;
  food_name: string;
  meal_type: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  const { data, error } = await supabase
    .from('nutrition_entries')
    .insert({
      user_id: user.id,
      date: entry.date,
      food_name: entry.food_name,
      meal_type: entry.meal_type,
      calories: entry.calories || null,
      protein: entry.protein || null,
      carbs: entry.carbs || null,
      fat: entry.fat || null,
      notes: entry.notes || null
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function fetchNutritionEntries(startDate?: string, endDate?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  let query = supabase
    .from('nutrition_entries')
    .select('*')
    .eq('user_id', user.id);
    
  if (startDate) {
    query = query.gte('date', startDate);
  }
  
  if (endDate) {
    query = query.lte('date', endDate);
  }
  
  query = query.order('date', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

export async function deleteNutritionEntry(id: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('nutrition_entries')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
} 