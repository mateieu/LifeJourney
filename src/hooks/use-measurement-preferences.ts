"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { MEASUREMENT_UNITS } from '@/lib/measurements';

type PreferencesMap = Record<string, string>;

export function useMeasurementPreferences() {
  const [preferences, setPreferences] = useState<PreferencesMap>({});
  const [loading, setLoading] = useState(true);
  
  // Load preferences from local storage and Supabase
  useEffect(() => {
    const loadPreferences = async () => {
      setLoading(true);
      
      // First try to load from localStorage for immediate display
      try {
        const storedPrefs = localStorage.getItem('measurementPreferences');
        if (storedPrefs) {
          setPreferences(JSON.parse(storedPrefs));
        }
      } catch (e) {
        console.error('Error loading preferences from localStorage:', e);
      }
      
      // Then try to load from Supabase for most up-to-date preferences
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('preferences')
            .eq('user_id', user.id)
            .single();
            
          if (data?.preferences?.measurementUnits) {
            setPreferences(data.preferences.measurementUnits);
            localStorage.setItem('measurementPreferences', JSON.stringify(data.preferences.measurementUnits));
          }
        }
      } catch (error) {
        console.error('Error loading measurement preferences:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPreferences();
  }, []);
  
  // Save all preferences to Supabase
  const savePreferences = useCallback(async (prefs: PreferencesMap) => {
    // Update local state
    setPreferences(prefs);
    
    // Save to localStorage for quick access
    localStorage.setItem('measurementPreferences', JSON.stringify(prefs));
    
    // Save to Supabase for persistence across devices
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch existing preferences first
        const { data } = await supabase
          .from('user_preferences')
          .select('preferences')
          .eq('user_id', user.id)
          .single();
          
        const existingPreferences = data?.preferences || {};
        
        // Update the measurementUnits while preserving other preferences
        const updatedPreferences = {
          ...existingPreferences,
          measurementUnits: prefs
        };
        
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            preferences: updatedPreferences,
            updated_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }, []);
  
  // Update a single preference
  const setPreference = useCallback((activityType: string, unitId: string) => {
    setPreferences(prev => ({
      ...prev,
      [activityType]: unitId
    }));
  }, []);
  
  // Get the preferred unit for an activity type
  const getPreferredUnit = useCallback((activityType: string): string => {
    // If user has a preference, use it
    if (preferences[activityType]) {
      return preferences[activityType];
    }
    
    // Otherwise fall back to the first allowed unit
    const unitsByType = MEASUREMENT_UNITS.filter(unit => 
      unit.allowedActivityTypes.includes(activityType)
    );
    
    return unitsByType.length > 0 ? unitsByType[0].id : '';
  }, [preferences]);
  
  return {
    preferences,
    loading,
    savePreferences,
    setPreference,
    getPreferredUnit
  };
}
