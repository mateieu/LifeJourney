"use server";

import { encodedRedirect } from "@/utils/utils";
import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || "";
  const supabase = await createClient();

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        email: email,
      },
    },
  });

  if (error) {
    return encodedRedirect("error", "/sign-up", error.message);
  }

  if (user) {
    try {
      const { error: updateError } = await supabase.from("users").insert({
        id: user.id,
        user_id: user.id,
        name: fullName,
        email: email,
        token_identifier: user.id,
        created_at: new Date().toISOString(),
      });

      if (updateError) {
        // Error handling without console.error
        return encodedRedirect(
          "error",
          "/sign-up",
          "Error updating user. Please try again.",
        );
      }
    } catch (err) {
      // Error handling without console.error
      return encodedRedirect(
        "error",
        "/sign-up",
        "Error updating user. Please try again.",
      );
    }
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {});

  if (error) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const checkUserSubscription = async (userId: string) => {
  const supabase = await createClient();

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (error) {
    return false;
  }

  return !!subscription;
};

// Goal Management Actions
export const createGoalAction = async (formData: FormData) => {
  const supabase = await createClient();

  const userId = formData.get("userId") as string;
  const goalType = formData.get("goalType") as string;
  const targetValue = parseFloat(formData.get("targetValue") as string);
  const targetDate = formData.get("targetDate") as string;

  const { error } = await supabase.from("health_goals").insert({
    user_id: userId,
    goal_type: goalType,
    target_value: targetValue,
    current_value: 0,
    target_date: targetDate,
    status: "active",
  });

  if (error) {
    return encodedRedirect(
      "error",
      "/dashboard/goals",
      "Failed to create goal. Please try again.",
    );
  }

  return redirect("/dashboard/goals");
};

export const updateGoalAction = async (formData: FormData) => {
  const supabase = await createClient();

  const goalId = formData.get("goalId") as string;
  const currentValue = parseFloat(formData.get("currentValue") as string);

  // Get the goal to check if it's completed
  const { data: goal } = await supabase
    .from("health_goals")
    .select("target_value")
    .eq("id", goalId)
    .single();

  const status =
    goal && currentValue >= goal.target_value ? "completed" : "active";

  const { error } = await supabase
    .from("health_goals")
    .update({
      current_value: currentValue,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", goalId);

  if (error) {
    return encodedRedirect(
      "error",
      "/dashboard/goals",
      "Failed to update goal. Please try again.",
    );
  }

  return redirect("/dashboard/goals");
};

// Activity Tracking Actions
export const logActivityAction = async (formData: FormData) => {
  const supabase = await createClient();

  const userId = formData.get("userId") as string;
  const activityType = formData.get("activityType") as string;
  const value = parseFloat(formData.get("value") as string);
  const notes = formData.get("notes") as string;
  const date = formData.get("date") as string;

  // Insert the activity
  const { error: activityError } = await supabase
    .from("health_activities")
    .insert({
      user_id: userId,
      activity_type: activityType,
      value,
      notes,
      completed_at: new Date(date).toISOString(),
    });

  if (activityError) {
    return encodedRedirect(
      "error",
      "/dashboard/tracker",
      "Failed to log activity. Please try again.",
    );
  }

  // Update related goals if they exist
  if (
    activityType === "walking" ||
    activityType === "running" ||
    activityType === "cycling"
  ) {
    // Update step goals or cardio goals
    const { data: goals } = await supabase
      .from("health_goals")
      .select("*")
      .eq("user_id", userId)
      .eq("goal_type", activityType === "walking" ? "steps" : "workout")
      .eq("status", "active");

    if (goals && goals.length > 0) {
      for (const goal of goals) {
        const newValue = (goal.current_value || 0) + value;
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
    .eq("streak_type", activityType)
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
      streak_type: activityType,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: new Date().toISOString(),
    });
  }

  return redirect("/dashboard/tracker");
};

// Suggestions Actions
export const generateSuggestionsAction = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user's goals and activities to generate relevant suggestions
  const { data: goals } = await supabase
    .from("health_goals")
    .select("*")
    .eq("user_id", user.id);

  const { data: activities } = await supabase
    .from("health_activities")
    .select("*")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(10);

  // Clear previous suggestions
  await supabase.from("health_suggestions").delete().eq("user_id", user.id);

  // Generate new suggestions based on goals and activities
  const suggestions = [
    {
      user_id: user.id,
      suggestion_type: "daily_activity",
      content:
        "Try to take a 10-minute walk after each meal to boost your metabolism and improve digestion.",
      is_completed: false,
    },
    {
      user_id: user.id,
      suggestion_type: "nutrition",
      content:
        "Aim to drink at least 8 glasses of water today to stay hydrated and support your overall health.",
      is_completed: false,
    },
    {
      user_id: user.id,
      suggestion_type: "workout",
      content:
        "Consider adding a 20-minute strength training session to your routine 2-3 times per week.",
      is_completed: false,
    },
    {
      user_id: user.id,
      suggestion_type: "mental_health",
      content:
        "Practice mindfulness meditation for 5 minutes each morning to reduce stress and improve focus.",
      is_completed: false,
    },
  ];

  // Add goal-specific suggestions if goals exist
  if (goals && goals.length > 0) {
    for (const goal of goals) {
      if (goal.goal_type === "weight_loss") {
        suggestions.push({
          user_id: user.id,
          suggestion_type: "weight_management",
          content:
            "Try replacing one high-calorie snack with a piece of fruit or vegetable each day.",
          is_completed: false,
        });
      } else if (goal.goal_type === "steps") {
        suggestions.push({
          user_id: user.id,
          suggestion_type: "activity",
          content:
            "Park farther away from entrances or take the stairs instead of the elevator to increase your daily steps.",
          is_completed: false,
        });
      } else if (goal.goal_type === "sleep") {
        suggestions.push({
          user_id: user.id,
          suggestion_type: "sleep",
          content:
            "Create a relaxing bedtime routine and try to go to bed at the same time each night to improve sleep quality.",
          is_completed: false,
        });
      }
    }
  }

  // Insert all suggestions
  const { error } = await supabase
    .from("health_suggestions")
    .insert(suggestions);

  if (error) {
    return encodedRedirect(
      "error",
      "/dashboard/suggestions",
      "Failed to generate suggestions. Please try again.",
    );
  }

  return redirect("/dashboard/suggestions");
};

export const updateSuggestionAction = async (formData: FormData) => {
  const supabase = await createClient();

  const suggestionId = formData.get("suggestionId") as string;
  const isCompleted = formData.get("isCompleted") === "true";

  const { error } = await supabase
    .from("health_suggestions")
    .update({
      is_completed: isCompleted,
      updated_at: new Date().toISOString(),
    })
    .eq("id", suggestionId);

  if (error) {
    return encodedRedirect(
      "error",
      "/dashboard/suggestions",
      "Failed to update suggestion. Please try again.",
    );
  }

  return redirect("/dashboard/suggestions");
};
