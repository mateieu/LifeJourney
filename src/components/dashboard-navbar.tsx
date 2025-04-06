"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { 
  BarChart, 
  Target, 
  Activity, 
  Settings, 
  Menu, 
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Create a simple useMediaQuery hook
function useMediaQuery(query: string): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(query).matches;
}

interface DashboardNavbarProps {
  user: User | null;
}

export function DashboardNavbar({ user }: DashboardNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // This is simplified to avoid client/server mismatch
  const isDesktop = typeof window !== "undefined" ? window.innerWidth >= 768 : true;
  
  const navigationLinks = [
    {
      name: "Overview",
      href: "/dashboard/progress",
      icon: BarChart,
    },
    {
      name: "Goals",
      href: "/dashboard/goals",
      icon: Target,
    },
    {
      name: "Activities",
      href: "/dashboard/activities",
      icon: Activity,
    },
    {
      name: "Preferences",
      href: "/dashboard/preferences",
      icon: Settings,
    },
  ];
  
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard/progress" className="text-xl font-bold text-primary">
              LifeJourney
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          {isDesktop ? (
            <div className="flex items-center space-x-4">
              {navigationLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    pathname === item.href
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                  {item.name}
                </Link>
              ))}
            </div>
          ) : (
            // Mobile menu button
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {!isDesktop && mobileMenuOpen && (
        <div className="px-4 pt-2 pb-3 space-y-1 sm:px-6 lg:px-8">
          {navigationLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                pathname === item.href
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
