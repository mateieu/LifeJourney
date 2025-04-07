"use client";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Sun, Monitor } from "lucide-react";

export function ThemeToggleCard() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize how LifeJourney looks for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            className="w-full justify-start px-3 py-6 flex-col h-auto items-center space-y-2"
            onClick={() => setTheme("light")}
          >
            <Sun className="h-5 w-5" />
            <div className="text-sm font-normal">Light</div>
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            className="w-full justify-start px-3 py-6 flex-col h-auto items-center space-y-2"
            onClick={() => setTheme("dark")}
          >
            <Moon className="h-5 w-5" />
            <div className="text-sm font-normal">Dark</div>
          </Button>
          <Button
            variant={theme === "system" ? "default" : "outline"}
            className="w-full justify-start px-3 py-6 flex-col h-auto items-center space-y-2"
            onClick={() => setTheme("system")}
          >
            <Monitor className="h-5 w-5" />
            <div className="text-sm font-normal">System</div>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {theme === "light" ? "Light mode is easier to read in bright environments." : 
          theme === "dark" ? "Dark mode reduces eye strain in low-light environments." :
          "System mode automatically matches your device settings."}
        </p>
      </CardContent>
    </Card>
  );
} 