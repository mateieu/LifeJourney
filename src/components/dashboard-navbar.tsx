"use client";

import Link from "next/link";
import { createClient } from "../../supabase/client";
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
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardNavbar() {
  const supabase = createClient();
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
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/goals"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Target className="h-4 w-4" />
                  Goals
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/tracker"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <BarChart className="h-4 w-4" />
                  Activity Tracker
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/suggestions"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Lightbulb className="h-4 w-4" />
                  Suggestions
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/");
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
