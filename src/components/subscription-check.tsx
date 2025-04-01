'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface SubscriptionCheckProps {
    children: React.ReactNode;
}

export function SubscriptionCheck({ children }: SubscriptionCheckProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function checkAuth() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                router.push('/sign-in');
                return;
            }

            // Uncomment when ready to implement subscription checks
            // try {
            //   const { data: subscription, error } = await supabase
            //     .from("subscriptions")
            //     .select("*")
            //     .eq("user_id", user.id)
            //     .eq("status", "active")
            //     .single();
            //
            //   if (error || !subscription) {
            //     router.push('/pricing');
            //     return;
            //   }
            // } catch (error) {
            //   console.error("Subscription check error:", error);
            //   router.push('/pricing');
            //   return;
            // }

            setIsAuthenticated(true);
            setIsLoading(false);
        }

        checkAuth();
    }, [router]);

    if (isLoading) {
        return <div className="flex min-h-screen items-center justify-center">Checking access...</div>;
    }

    if (!isAuthenticated) {
        return null; // Will redirect in the useEffect
    }

    return (
        <>
            {isAuthenticated && children}
        </>
    );
}
