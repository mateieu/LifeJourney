"use client";

import { useState, useEffect } from "react";

export function PageProgress() {
  const [progress, setProgress] = useState(15);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + (Math.random() * 10);
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div 
        className="h-1 bg-primary transition-all ease-in-out duration-300" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
} 