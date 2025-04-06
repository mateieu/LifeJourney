"use client";

import * as React from "react";
import { useToast } from "./use-toast";

// Create a context for toast state
export const ToastContext = React.createContext<ReturnType<typeof useToast> | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toastState = useToast();
  
  return (
    <ToastContext.Provider value={toastState}>
      {children}
    </ToastContext.Provider>
  );
}

// Helper hook to use toast context
export function useToastContext() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
} 