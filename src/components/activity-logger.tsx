"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import * as z from "zod";
import { createClient } from "@/utils/supabase/client";
import { useMeasurementPreferences } from "@/hooks/use-measurement-preferences";
import { getAllActivityTypes, getActivityLabel, getDefaultUnit } from "@/lib/measurements";
import { MeasurementUnitSelector } from "@/components/measurement-unit-selector";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  activity_type: z.string().min(1, "Activity type is required"),
  value: z.coerce.number().positive("Value must be positive"),
  measurement_unit: z.string().min(1, "Measurement unit is required"),
  completed_at: z.date(),
  notes: z.string().optional(),
});

export function ActivityLogger() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activityTypes, setActivityTypes] = useState<string[]>([]);
  const { getPreferredUnit, setPreference } = useMeasurementPreferences();
  
  useEffect(() => {
    setActivityTypes(getAllActivityTypes());
  }, []);
  
  // Initialize form with defaults
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activity_type: "",
      value: 0,
      measurement_unit: "",
      completed_at: new Date(),
      notes: "",
    },
  });
  
  // Watch for activity type changes to update measurement unit
  const activityType = form.watch("activity_type");
  
  useEffect(() => {
    if (activityType) {
      const preferredUnit = getPreferredUnit(activityType);
      form.setValue("measurement_unit", preferredUnit);
    }
  }, [activityType, form, getPreferredUnit]);
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      const supabase = createClient();
      
      // Format the date to ISO string
      const formattedDate = values.completed_at.toISOString();
      
      // Store in Supabase
      const { data, error } = await supabase
        .from("health_activities")
        .insert({
          activity_type: values.activity_type,
          value: values.value,
          measurement_unit: values.measurement_unit,
          completed_at: formattedDate,
          notes: values.notes || null,
        })
        .select();
      
      if (error) throw error;
      
      // Save user's preference for this activity type
      setPreference(values.activity_type, values.measurement_unit);
      
      toast({
        title: "Activity logged successfully!",
        description: `You logged ${values.value} ${values.measurement_unit} of ${getActivityLabel(values.activity_type)}.`,
      });
      
      // Reset form or redirect
      form.reset({
        activity_type: "",
        value: 0,
        measurement_unit: "",
        completed_at: new Date(),
        notes: "",
      });
      
      // Redirect to activities page
      router.push("/dashboard/activities");
      router.refresh();
      
    } catch (error) {
      console.error("Error logging activity:", error);
      toast({
        title: "Failed to log activity",
        description: "There was an error saving your activity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Activity</CardTitle>
        <CardDescription>
          Record your health and fitness activities to track your progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="activity_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an activity type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activityTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {getActivityLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the type of activity you performed
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
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
                        min="0"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="measurement_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <MeasurementUnitSelector
                        activityType={activityType}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={!activityType}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="completed_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Completed</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      setDate={field.onChange}
                    />
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
                      placeholder="Add any additional notes about this activity"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Log Activity"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 