"use client";

import { 
  HeartPulse, 
  Activity, 
  Moon, 
  LineChart, 
  Target, 
  Utensils,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <HeartPulse className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold">LifeJourney</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/about">
            About
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Login
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Track Your Health Journey
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    LifeJourney helps you monitor all aspects of your health in one place. 
                    Track activities, set goals, and understand your progress.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="px-8">Get Started</Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="px-8">Login</Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
                    <Activity className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-bold">Activity Tracking</h3>
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                      Log and monitor your daily activities
                    </p>
                  </div>
                  <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
                    <Target className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-bold">Goal Setting</h3>
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                      Set and track your health goals
                    </p>
                  </div>
                  <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
                    <LineChart className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-bold">Progress Analysis</h3>
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                      Visualize your health journey
                    </p>
                  </div>
                  <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
                    <HeartPulse className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-bold">Health Metrics</h3>
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                      Monitor vital health data
                    </p>
                  </div>
                  <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
                    <Moon className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-bold">Sleep Tracking</h3>
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                      Improve your sleep quality
                    </p>
                  </div>
                  <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
                    <Utensils className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-bold">Nutrition Logs</h3>
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                      Track your nutritional intake
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                  <Sparkles className="h-4 w-4 inline-block mr-1" />
                  Why LifeJourney?
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Your Complete Health Tracking Solution
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  LifeJourney provides a comprehensive platform to track all aspects of your health and fitness journey. 
                  From activity logging to nutrition tracking, we help you make informed decisions about your well-being.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2023 LifeJourney. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="/terms">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="/privacy">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
} 