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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const goalSchema = z.object({
  goalType: z.string().min(1, "Goal type is required"),
  targetValue: z.coerce
    .number()
    .positive("Target value must be a positive number"),
  targetDate: z.string().min(1, "Target date is required"),
});

type GoalFormValues = z.infer<typeof goalSchema>;

interface GoalFormProps {
  userId: string;
  children: React.ReactNode;
}

export function GoalForm({ userId, children }: GoalFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Set default target date to 30 days from now
  const defaultTargetDate = new Date();
  defaultTargetDate.setDate(defaultTargetDate.getDate() + 30);

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      goalType: "",
      targetValue: undefined,
      targetDate: defaultTargetDate.toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: GoalFormValues) => {
    if (!userId) return;
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      
      const { error } = await supabase.from("health_goals").insert({
        user_id: userId,
        goal_type: data.goalType,
        target_value: data.targetValue,
        current_value: 0,
        target_date: data.targetDate,
        status: "active",
      });

      if (error) throw error;

      // Close dialog and refresh page
      setOpen(false);
      form.reset();
      router.refresh();
      window.location.reload(); // Force refresh to see new data

    } catch (error) {
      console.error("Error creating goal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Health Goal</DialogTitle>
          <DialogDescription>
            Set a new health goal to track your progress
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="goalType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="steps">Daily Steps</SelectItem>
                      <SelectItem value="walking">Walking Distance</SelectItem>
                      <SelectItem value="running">Running Distance</SelectItem>
                      <SelectItem value="cycling">Cycling Distance</SelectItem>
                      <SelectItem value="water">Water Intake</SelectItem>
                      <SelectItem value="sleep">Sleep Hours</SelectItem>
                      <SelectItem value="meditation">Meditation Minutes</SelectItem>
                      <SelectItem value="workout">Workout Sessions</SelectItem>
                      <SelectItem value="weight_loss">Weight Loss</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the type of health goal you want to set
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Value</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter target value"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {form.watch("goalType") === "steps"
                      ? "Number of steps per day"
                      : form.watch("goalType") === "walking" ||
                        form.watch("goalType") === "running" ||
                        form.watch("goalType") === "cycling"
                      ? "Total kilometers"
                      : form.watch("goalType") === "water"
                      ? "Glasses per day"
                      : form.watch("goalType") === "sleep"
                      ? "Hours per night"
                      : form.watch("goalType") === "meditation"
                      ? "Minutes per session"
                      : form.watch("goalType") === "workout"
                      ? "Sessions per week"
                      : form.watch("goalType") === "weight_loss"
                      ? "Kilograms to lose"
                      : "Value to achieve"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    When do you want to achieve this goal by?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Goal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
