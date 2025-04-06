"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Activity,
  LineChart,
  Medal,
  Heart,
  Moon,
  Utensils,
  CalendarDays,
  Settings,
  Trophy,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="grid gap-1">
      <Button
        variant={pathname === "/dashboard" ? "default" : "ghost"}
        className="justify-start"
        asChild
      >
        <Link href="/dashboard">
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Overview
        </Link>
      </Button>
      <Button
        variant={pathname === "/dashboard/activities" ? "default" : "ghost"}
        className="justify-start"
        asChild
      >
        <Link href="/dashboard/activities">
          <Activity className="h-4 w-4 mr-2" />
          Activities
        </Link>
      </Button>
      <Button
        variant={pathname === "/dashboard/goals" ? "default" : "ghost"}
        className="justify-start"
        asChild
      >
        <Link href="/dashboard/goals">
          <Medal className="h-4 w-4 mr-2" />
          Goals
        </Link>
      </Button>
      <Button
        variant={pathname === "/dashboard/progress" ? "default" : "ghost"}
        className="justify-start"
        asChild
      >
        <Link href="/dashboard/progress">
          <LineChart className="h-4 w-4 mr-2" />
          Progress
        </Link>
      </Button>
      <Button
        variant={pathname === "/dashboard/nutrition" ? "default" : "ghost"}
        className="justify-start"
        asChild
      >
        <Link href="/dashboard/nutrition">
          <Utensils className="h-4 w-4 mr-2" />
          Nutrition
        </Link>
      </Button>
      <Button
        variant={pathname === "/dashboard/sleep" ? "default" : "ghost"}
        className="justify-start"
        asChild
      >
        <Link href="/dashboard/sleep">
          <Moon className="h-4 w-4 mr-2" />
          Sleep
        </Link>
      </Button>
      <Button
        variant={pathname === "/dashboard/health" ? "default" : "ghost"}
        className="justify-start"
        asChild
      >
        <Link href="/dashboard/health">
          <Heart className="h-4 w-4 mr-2" />
          Health
        </Link>
      </Button>
      <Button
        variant={pathname === "/dashboard/calendar" ? "default" : "ghost"}
        className="justify-start"
        asChild
      >
        <Link href="/dashboard/calendar">
          <CalendarDays className="h-4 w-4 mr-2" />
          Calendar
        </Link>
      </Button>
      <Button
        variant={pathname === "/dashboard/achievements" ? "default" : "ghost"}
        className="justify-start"
        asChild
      >
        <Link href="/dashboard/achievements">
          <Trophy className="h-4 w-4 mr-2" />
          Achievements
        </Link>
      </Button>
      <Button
        variant={pathname === "/dashboard/settings" ? "default" : "ghost"}
        className="justify-start"
        asChild
      >
        <Link href="/dashboard/settings">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Link>
      </Button>
      <Button
        variant={pathname === "/dashboard/mental-health" ? "default" : "ghost"}
        className="justify-start"
        asChild
      >
        <Link href="/dashboard/mental-health">
          <Brain className="h-4 w-4 mr-2" />
          Mental Health
        </Link>
      </Button>
    </nav>
  );
} 