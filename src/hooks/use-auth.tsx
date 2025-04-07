"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, createContext, useContext } from "react";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  
  const supabase = createClient();
  
  useEffect(() => {
    let mounted = true;
    
    const checkUser = async () => {
      try {
        setLoading(true);
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (mounted) {
          setUser(user);
        }
        
        // Redirect if not authenticated and trying to access protected routes
        if (!user && pathname && pathname.startsWith('/dashboard')) {
          router.push('/login');
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          console.error('Auth error:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setUser(session?.user || null);
          
          if (!session?.user && pathname && pathname.startsWith('/dashboard')) {
            router.push('/login');
          }
        }
      }
    );
    
    checkUser();
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);
  
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, error, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 