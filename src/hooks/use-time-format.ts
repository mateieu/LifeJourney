"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

type TimeFormat = '12h' | '24h';

export function useTimeFormat() {
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('12h');
  const [loading, setLoading] = useState(true);
  
  // Load preference from local storage and Supabase
  useEffect(() => {
    const loadTimeFormat = async () => {
      setLoading(true);
      
      // First try to load from localStorage for immediate display
      try {
        const storedFormat = localStorage.getItem('timeFormat');
        if (storedFormat && (storedFormat === '12h' || storedFormat === '24h')) {
          setTimeFormat(storedFormat as TimeFormat);
        }
      } catch (e) {
        console.error('Error loading time format from localStorage:', e);
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
            
          if (data?.preferences?.timeFormat && 
              (data.preferences.timeFormat === '12h' || data.preferences.timeFormat === '24h')) {
            setTimeFormat(data.preferences.timeFormat);
            localStorage.setItem('timeFormat', data.preferences.timeFormat);
          }
        }
      } catch (error) {
        console.error('Error loading time format preference:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTimeFormat();
  }, []);
  
  // Save preference to localStorage and Supabase
  const saveTimeFormat = useCallback(async (format: TimeFormat) => {
    // Update local state
    setTimeFormat(format);
    
    // Save to localStorage for quick access
    localStorage.setItem('timeFormat', format);
    
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
        
        // Update the timeFormat while preserving other preferences
        const updatedPreferences = {
          ...existingPreferences,
          timeFormat: format
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
      console.error('Error saving time format preference:', error);
    }
  }, []);
  
  // Format a date string according to the user's preferred time format
  const formatTime = useCallback((date: Date | string): string => {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    if (timeFormat === '12h') {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    } else {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });
    }
  }, [timeFormat]);
  
  return {
    timeFormat,
    loading,
    saveTimeFormat,
    formatTime,
    is12Hour: timeFormat === '12h',
    is24Hour: timeFormat === '24h'
  };
} 