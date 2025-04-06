"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      
      // Set initial value
      setMatches(media.matches);
      
      // Define listener
      const listener = (e: MediaQueryListEvent) => {
        setMatches(e.matches);
      };
      
      // Add listener
      media.addEventListener("change", listener);
      
      // Clean up
      return () => {
        media.removeEventListener("change", listener);
      };
    }
    
    return undefined;
  }, [query]);
  
  return matches;
} 