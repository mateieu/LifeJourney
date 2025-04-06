'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface SubscriptionCheckProps {
  children: React.ReactNode;
}

export function SubscriptionCheck({ children }: SubscriptionCheckProps) {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // If not logged in, redirect to login
          router.push('/login');
          return;
        }
        
        // Simple check complete, allow rendering
        setIsChecking(false);
      } catch (error) {
        console.error("Error checking subscription:", error);
        setIsChecking(false);
      }
    };
    
    checkSubscription();
  }, [router]);
  
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }
  
  return <>{children}</>;
}
