"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useTimeFormat } from "@/hooks/use-time-format";
import { useMeasurementPreferences } from "@/hooks/use-measurement-preferences";

// Create context with default values
const PreferencesContext = createContext<{
  timeFormat: string;
  formatTime: (date: Date | string) => string;
  measurementPreferences: Record<string, string>;
  getPreferredUnit: (activityType: string) => string;
  isLoading: boolean;
}>({
  timeFormat: "12h",
  formatTime: () => "",
  measurementPreferences: {},
  getPreferredUnit: () => "",
  isLoading: true,
});

export function PreferencesProvider({ children }: { children: ReactNode }) {
  // Load both time format and measurement preferences
  const { 
    timeFormat, 
    formatTime, 
    loading: timeLoading 
  } = useTimeFormat();
  
  const {
    preferences: measurementPreferences,
    getPreferredUnit,
    loading: measurementLoading
  } = useMeasurementPreferences();
  
  // Combined loading state
  const isLoading = timeLoading || measurementLoading;
  
  return (
    <PreferencesContext.Provider
      value={{
        timeFormat,
        formatTime,
        measurementPreferences,
        getPreferredUnit,
        isLoading
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

// Custom hook to use preferences context
export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
} 