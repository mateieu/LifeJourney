'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for authentication status
    const checkAuth = async () => {
      try {
        // API call to check authentication
        const isAuthenticated = false; // Replace with actual auth check
        
        // Simulate loading
        setTimeout(() => {
          setLoading(false);
          // Redirect based on auth status
          if (isAuthenticated) {
            router.push('/dashboard');
          } else {
            router.push('/login');
          }
        }, 2000);
      } catch (error) {
        console.error('Auth check failed', error);
        setLoading(false);
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);
  
  return null; // This component doesn't render anything, it just handles the redirect
} 