"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const activitySchema = z.object({
  activityType: z.string().min(1, "Activity type is required"),
  value: z.coerce
    .number()
    .positive("Value must be a positive number")
    .min(0.1, "Value must be greater than 0"),
  notes: z.string().optional(),
  date: z.string(),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

interface ActivityFormProps {
  userId: string;
  children: React.ReactNode;
}

export function ActivityForm({ userId, children }: ActivityFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      activityType: "",
      value: undefined,
      notes: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: ActivityFormValues) => {
    if (!userId) return;
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      
      // Insert the activity
      const { error: activityError } = await supabase
        .from("health_activities")
        .insert({
          user_id: userId,
          activity_type: data.activityType,
          value: data.value,
          notes: data.notes,
          completed_at: new Date(data.date).toISOString(),
        });

      if (activityError) throw activityError;

      // Update related goals if they exist
      if (
        data.activityType === "walking" ||
        data.activityType === "running" ||
        data.activityType === "cycling"
      ) {
        // Update step goals or cardio goals
        const { data: goals } = await supabase
          .from("health_goals")
          .select("*")
          .eq("user_id", userId)
          .eq("goal_type", data.activityType === "walking" ? "steps" : "workout")
          .eq("status", "active");

        if (goals && goals.length > 0) {
          for (const goal of goals) {
            const newValue = (goal.current_value || 0) + data.value;
            const status = newValue >= goal.target_value ? "completed" : "active";

            await supabase
              .from("health_goals")
              .update({
                current_value: newValue,
                status,
                updated_at: new Date().toISOString(),
              })
              .eq("id", goal.id);
          }
        }
      }

      // Update or create streak
      const { data: existingStreak } = await supabase
        .from("health_streaks")
        .select("*")
        .eq("user_id", userId)
        .eq("streak_type", data.activityType)
        .single();

      const today = new Date().setHours(0, 0, 0, 0);
      const lastActivity = existingStreak?.last_activity_date
        ? new Date(existingStreak.last_activity_date).setHours(0, 0, 0, 0)
        : null;

      // Calculate if streak continues or resets
      let currentStreak = existingStreak?.current_streak || 0;
      let longestStreak = existingStreak?.longest_streak || 0;

      // If this is the first activity or if the last activity was yesterday, increment streak
      if (!lastActivity || today - lastActivity <= 86400000) {
        currentStreak += 1;
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
      } else if (today - lastActivity > 86400000) {
        // If more than a day has passed, reset streak
        currentStreak = 1;
      }

      if (existingStreak) {
        // Update existing streak
        await supabase
          .from("health_streaks")
          .update({
            current_streak: currentStreak,
            longest_streak: longestStreak,
            last_activity_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingStreak.id);
      } else {
        // Create new streak
        await supabase.from("health_streaks").insert({
          user_id: userId,
          streak_type: data.activityType,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: new Date().toISOString(),
        });
      }

      // Close dialog and refresh page
    setOpen(false);
      form.reset();
      router.refresh();
      window.location.reload(); // Force refresh to see new data

    } catch (error) {
      console.error("Error logging activity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log New Activity</DialogTitle>
          <DialogDescription>
            Track your health activities to monitor progress toward your goals
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="activityType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Type</FormLabel>
            <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
            >
                    <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
                    </FormControl>
              <SelectContent>
                <SelectItem value="walking">Walking</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="cycling">Cycling</SelectItem>
                <SelectItem value="swimming">Swimming</SelectItem>
                      <SelectItem value="yoga">Yoga</SelectItem>
                <SelectItem value="meditation">Meditation</SelectItem>
                      <SelectItem value="strength">Strength Training</SelectItem>
                <SelectItem value="water">Water Intake</SelectItem>
                <SelectItem value="sleep">Sleep</SelectItem>
              </SelectContent>
            </Select>
                  <FormDescription>
                    Choose the type of activity you completed
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
            <Input
              type="number"
                      step="0.01"
              placeholder="Enter value"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {form.watch("activityType") === "walking"
                      ? "Number of steps"
                      : form.watch("activityType") === "running" ||
                        form.watch("activityType") === "cycling"
                      ? "Distance in kilometers"
                      : form.watch("activityType") === "swimming"
                      ? "Distance in meters"
                      : form.watch("activityType") === "water"
                      ? "Glasses of water"
                      : form.watch("activityType") === "sleep"
                      ? "Hours of sleep"
                      : form.watch("activityType") === "meditation" ||
                        form.watch("activityType") === "yoga"
                      ? "Minutes of activity"
                      : form.watch("activityType") === "strength"
                      ? "Minutes of workout"
                      : "Value"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    When did you complete this activity?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
            <Textarea
                      placeholder="Add any additional information"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Activity"}
            </Button>
            </DialogFooter>
        </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
