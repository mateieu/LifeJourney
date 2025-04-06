"use client";

import { useEffect } from "react";
import { initDatabase } from "@/utils/init-database";
import { DashboardNav } from "@/components/dashboard-nav";
import { UserDropdown } from "@/components/user-dropdown";
import { Separator } from "@/components/ui/separator";
import { PreferencesProvider } from "@/providers/preferences-provider";
import { Toaster } from "@/components/ui/toaster";

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize database tables when dashboard loads
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
      } catch (error) {
        console.error("Error initializing database:", error);
      }
    };
    
    setupDatabase();
  }, []);
  
  return (
    <PreferencesProvider>
      <div className="flex min-h-screen flex-col">
        {/* Top navigation bar */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <a href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="text-primary">LifeJourney</span>
          </a>
          <div className="ml-auto flex items-center gap-4">
            <UserDropdown />
          </div>
        </header>

        {/* Main content area with sidebar */}
        <div className="flex flex-1">
          {/* Sidebar navigation */}
          <aside className="w-64 border-r bg-background p-6 hidden md:block">
            <div className="flex items-center gap-2 mb-8">
              <h2 className="text-lg font-semibold">LifeJourney</h2>
            </div>
            <DashboardNav />
          </aside>

          {/* Main content */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
      <Toaster />
    </PreferencesProvider>
  );
} 