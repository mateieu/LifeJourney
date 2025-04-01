"use client";

import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  UserCircle,
  Home,
  Target,
  Lightbulb,
  BarChart,
  LayoutDashboard,
  LineChart,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import UserProfile from "./user-profile";
import { User } from '@supabase/supabase-js';

interface DashboardNavbarProps {
  user: User | null;
}

export default function DashboardNavbar({ user }: DashboardNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" prefetch className="text-xl font-bold">
            HealthQuest
          </Link>
          <div className="hidden md:flex items-center gap-1 ml-6">
            <Link href="/dashboard" prefetch>
              <Button
                variant={pathname === "/dashboard" ? "default" : "ghost"}
                size="sm"
                className="flex items-center gap-1.5"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/goals" prefetch>
              <Button
                variant={pathname === "/dashboard/goals" ? "default" : "ghost"}
                size="sm"
                className="flex items-center gap-1.5"
              >
                <Target className="h-4 w-4" />
                Goals
              </Button>
            </Link>
            <Link href="/dashboard/tracker" prefetch>
              <Button
                variant={
                  pathname === "/dashboard/tracker" ? "default" : "ghost"
                }
                size="sm"
                className="flex items-center gap-1.5"
              >
                <BarChart className="h-4 w-4" />
                Tracker
              </Button>
            </Link>
            <Link href="/dashboard/suggestions" prefetch>
              <Button
                variant={
                  pathname === "/dashboard/suggestions" ? "default" : "ghost"
                }
                size="sm"
                className="flex items-center gap-1.5"
              >
                <Lightbulb className="h-4 w-4" />
                Suggestions
              </Button>
            </Link>
            <Link href="/dashboard/progress" prefetch>
              <Button
                variant={
                  pathname === "/dashboard/progress" ? "default" : "ghost"
                }
                size="sm"
                className="flex items-center gap-1.5"
              >
                <LineChart className="h-4 w-4" />
                Progress
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          {user && <UserProfile user={user} />}
        </div>
      </div>
    </nav>
  );
}
