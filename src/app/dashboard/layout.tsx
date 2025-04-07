import { Metadata } from "next";
import { DashboardNav } from "@/components/dashboard-nav";
import { UserNav } from "@/components/user-nav";
import { Container } from "@/components/ui/container";
import { Suspense } from "react";
import { PageProgress } from "@/components/page-progress";
import Link from "next/link";
import { AuthProviderWrapper } from "@/components/auth-provider-wrapper";
import { ErrorBoundary } from "@/components/error-boundary";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Dashboard | LifeJourney",
  description: "Monitor your health journey in one centralized dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProviderWrapper>
      <div className="flex min-h-screen flex-col bg-background">
        <Suspense fallback={<PageProgress />}>
          <header className="sticky top-0 z-30 border-b bg-background">
            <Container>
              <div className="flex h-16 items-center justify-between">
                <Link 
                  href="/dashboard" 
                  className="flex items-center space-x-2 font-semibold"
                >
                  <span className="text-primary text-xl">LifeJourney</span>
                </Link>
                <div className="flex items-center space-x-3">
                  <ThemeToggle />
                  <UserNav />
                </div>
              </div>
            </Container>
          </header>
          
          <div className="flex-1 flex">
            <aside className="fixed z-20 left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-muted/30 hidden md:block overflow-y-auto">
              <DashboardNav />
            </aside>
            <main className="flex-1 md:pl-64 p-6 md:p-8">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
          </div>
        </Suspense>
      </div>
    </AuthProviderWrapper>
  );
} 