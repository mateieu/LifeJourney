"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Activity, 
  Heart, 
  Home, 
  Moon, 
  Utensils, 
  Settings, 
  Goal, 
  Trophy,
  Brain,
  Calendar,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: <Home className="h-4 w-4" />,
  },
  {
    title: "Sleep",
    href: "/dashboard/sleep",
    icon: <Moon className="h-4 w-4" />,
  },
  {
    title: "Nutrition",
    href: "/dashboard/nutrition",
    icon: <Utensils className="h-4 w-4" />,
  },
  {
    title: "Activities",
    href: "/dashboard/activities",
    icon: <Activity className="h-4 w-4" />,
  },
  {
    title: "Health",
    href: "/dashboard/health",
    icon: <Heart className="h-4 w-4" />,
  },
  {
    title: "Mental Health",
    href: "/dashboard/mental-health",
    icon: <Brain className="h-4 w-4" />,
  },
  {
    title: "Goals",
    href: "/dashboard/goals",
    icon: <Goal className="h-4 w-4" />,
  },
  {
    title: "Achievements",
    href: "/dashboard/achievements",
    icon: <Trophy className="h-4 w-4" />,
  },
  {
    title: "Calendar",
    href: "/dashboard/calendar",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-4 w-4" />,
  },
];

export function DashboardNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button - visible only on small screens */}
      <div className="fixed bottom-4 right-4 z-40 md:hidden">
        <Button 
          variant="default" 
          size="icon" 
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-background/95 backdrop-blur-sm md:hidden">
          <div className="pt-16 pb-8 px-6 flex flex-col items-center">
            <div className="flex justify-center mb-6">
              <ThemeToggle />
            </div>
            <nav className="flex flex-col items-center space-y-4 w-full">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center w-full max-w-[240px] justify-center space-x-2 rounded-md px-3 py-3 font-medium",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <nav className="grid gap-1 px-4 py-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            <div className="flex h-6 w-6 items-center justify-center">
              {item.icon}
            </div>
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
    </>
  );
} 