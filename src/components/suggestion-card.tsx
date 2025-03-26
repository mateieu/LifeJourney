"use client";

import { updateSuggestionAction } from "@/app/actions";
import { Tables } from "@/types/supabase";
import { CheckCircle, Lightbulb } from "lucide-react";
import { Button } from "./ui/button";

type Suggestion = Tables<"health_suggestions">;

interface SuggestionCardProps {
  suggestion: Suggestion;
}

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const formatSuggestionType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleMarkComplete = async () => {
    const formData = new FormData();
    formData.append("suggestionId", suggestion.id);
    formData.append("isCompleted", (!suggestion.is_completed).toString());

    await updateSuggestionAction(formData);
  };

  return (
    <div
      className={`bg-card rounded-xl p-6 border shadow-sm ${suggestion.is_completed ? "border-green-500" : ""}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-full ${suggestion.is_completed ? "bg-green-100" : "bg-primary/10"} flex items-center justify-center flex-shrink-0 mt-1`}
        >
          {suggestion.is_completed ? (
            <CheckCircle className="text-green-600 h-5 w-5" />
          ) : (
            <Lightbulb className="text-primary h-5 w-5" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">
              {formatSuggestionType(suggestion.suggestion_type)}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className={`text-xs ${suggestion.is_completed ? "text-green-600" : "text-muted-foreground"}`}
              onClick={handleMarkComplete}
            >
              {suggestion.is_completed ? "Completed" : "Mark Complete"}
            </Button>
          </div>
          <p className="text-muted-foreground">{suggestion.content}</p>
        </div>
      </div>
    </div>
  );
}
