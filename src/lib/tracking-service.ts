"use client";

import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Health Metrics
export const saveHealthMetric = async (data: {
  date: string;
  metric_type: string;
  value: number;
  notes?: string;
}) => {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase
      .from('health_metrics')
      .insert({
        user_id: user.id,
        date: data.date,
        metric_type: data.metric_type,
        value: data.value,
        notes: data.notes
      });
      
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Health metric saved successfully",
    });
    
    return true;
  } catch (error) {
    console.error("Error saving health metric:", error);
    toast({
      title: "Error",
      description: "Failed to save health metric",
      variant: "destructive",
    });
    return false;
  }
};

export const saveBloodPressure = async (data: {
  date: string;
  systolic: number;
  diastolic: number;
  notes?: string;
}) => {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Insert systolic reading
    const { error: systolicError } = await supabase
      .from('health_metrics')
      .insert({
        user_id: user.id,
        date: data.date,
        metric_type: 'blood_pressure_systolic',
        value: data.systolic,
        notes: data.notes
      });
      
    if (systolicError) throw systolicError;
    
    // Insert diastolic reading
    const { error: diastolicError } = await supabase
      .from('health_metrics')
      .insert({
        user_id: user.id,
        date: data.date,
        metric_type: 'blood_pressure_diastolic',
        value: data.diastolic,
        notes: data.notes
      });
      
    if (diastolicError) throw diastolicError;
    
    toast({
      title: "Success",
      description: "Blood pressure saved successfully",
    });
    
    return true;
  } catch (error) {
    console.error("Error saving blood pressure:", error);
    toast({
      title: "Error",
      description: "Failed to save blood pressure",
      variant: "destructive",
    });
    return false;
  }
};

// Sleep Tracking
export const saveSleepEntry = async (data: {
  date: string;
  sleep_time: string;
  wake_time: string;
  quality: number;
  duration_minutes?: number;
  notes?: string;
}) => {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Calculate duration if not provided
    let duration = data.duration_minutes;
    if (!duration) {
      const [sleepHour, sleepMin] = data.sleep_time.split(':').map(Number);
      const [wakeHour, wakeMin] = data.wake_time.split(':').map(Number);
      
      let sleepDate = new Date();
      sleepDate.setHours(sleepHour, sleepMin, 0);
      
      let wakeDate = new Date();
      wakeDate.setHours(wakeHour, wakeMin, 0);
      
      // If wake time is earlier, assume next day
      if (wakeDate < sleepDate) {
        wakeDate.setDate(wakeDate.getDate() + 1);
      }
      
      duration = Math.round((wakeDate.getTime() - sleepDate.getTime()) / (1000 * 60));
    }
    
    const { error } = await supabase
      .from('sleep_entries')
      .insert({
        user_id: user.id,
        date: data.date,
        sleep_time: data.sleep_time,
        wake_time: data.wake_time,
        quality: data.quality,
        duration_minutes: duration,
        notes: data.notes
      });
      
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Sleep entry saved successfully",
    });
    
    return true;
  } catch (error) {
    console.error("Error saving sleep entry:", error);
    toast({
      title: "Error",
      description: "Failed to save sleep entry",
      variant: "destructive",
    });
    return false;
  }
};

// Nutrition Tracking
export const saveNutritionEntry = async (data: {
  date: string;
  food_name: string;
  meal_type: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
}) => {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { error } = await supabase
      .from('nutrition_entries')
      .insert({
        user_id: user.id,
        date: data.date,
        food_name: data.food_name,
        meal_type: data.meal_type,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        notes: data.notes
      });
      
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Nutrition entry saved successfully",
    });
    
    return true;
  } catch (error) {
    console.error("Error saving nutrition entry:", error);
    toast({
      title: "Error",
      description: "Failed to save nutrition entry",
      variant: "destructive",
    });
    return false;
  }
}; 