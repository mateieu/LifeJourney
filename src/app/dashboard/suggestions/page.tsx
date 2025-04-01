'use client';

import { useEffect, useState } from 'react';
import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import { Button } from "@/components/ui/button";
import { Lightbulb, Plus, Check, Trophy } from "lucide-react";
import { User } from '@supabase/supabase-js';

// Define TypeScript interfaces
interface User {
  id: string;
  email: string;
}

interface Suggestion {
  id: string;
  user_id: string;
  suggestion_type: string;
  content: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string | null;
}

export default function SuggestionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/sign-in');
        return;
      }
      
      setUser(user as User);
      
      // Fetch suggestions
      const { data: suggestionsData, error } = await supabase
        .from('health_suggestions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching suggestions:', error);
      } else {
        setSuggestions(suggestionsData || []);
      }
      
      setLoading(false);
    }
    
    fetchData();
  }, [router]);

  const handleGenerateSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/suggestions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate suggestions');
      }
      
      // Refresh suggestions
      const supabase = createClient();
      const { data, error } = await supabase
        .from('health_suggestions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching updated suggestions:', error);
      } else {
        setSuggestions(data || []);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuggestion = async (id: string, isCompleted: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('health_suggestions')
        .update({ 
          is_completed: !isCompleted,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) {
        console.error('Error updating suggestion:', error);
        return;
      }
      
      // Update local state
      setSuggestions(suggestions.map(suggestion => 
        suggestion.id === id 
          ? { ...suggestion, is_completed: !isCompleted } 
          : suggestion
      ));
    } catch (error) {
      console.error('Error toggling suggestion:', error);
    }
  };

  return (
    <SubscriptionCheck>
      <DashboardNavbar />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Health Suggestions</h1>
              <p className="text-muted-foreground mt-1">
                Personalized recommendations based on your health data
              </p>
            </div>
            <Button 
              className="flex items-center gap-2"
              onClick={handleGenerateSuggestions}
              disabled={loading}
            >
              <Plus size={16} />
              Generate Suggestions
            </Button>
          </header>

          {/* Suggestions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12">
                Loading your personalized suggestions...
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <div 
                  key={suggestion.id} 
                  className={`border rounded-lg p-5 ${
                    suggestion.is_completed 
                      ? 'bg-green-50 border-green-100' 
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${
                      getSuggestionTypeColor(suggestion.suggestion_type)
                    }`}>
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-2">
                        {getSuggestionTitle(suggestion.suggestion_type)}
                      </h3>
                      <p className="text-gray-600 mb-4">{suggestion.content}</p>
                      <div className="flex justify-end">
                        <Button
                          variant={suggestion.is_completed ? "outline" : "default"}
                          size="sm"
                          className={`flex items-center gap-1 ${
                            suggestion.is_completed ? 'text-green-600 border-green-200' : ''
                          }`}
                          onClick={() => handleToggleSuggestion(
                            suggestion.id, 
                            suggestion.is_completed
                          )}
                        >
                          {suggestion.is_completed ? (
                            <>
                              <Check size={14} />
                              Completed
                            </>
                          ) : (
                            'Mark as Done'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-muted/50 rounded-xl p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Lightbulb className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No suggestions yet</h3>
                <p className="text-muted-foreground mb-6">
                  Generate your first set of personalized health suggestions
                </p>
                <Button
                  className="flex items-center gap-2"
                  onClick={handleGenerateSuggestions}
                >
                  <Plus size={16} />
                  Generate Suggestions
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </SubscriptionCheck>
  );
}

// Helper functions for suggestion types
function getSuggestionTypeColor(type: string): string {
  switch (type) {
    case 'nutrition':
      return 'bg-green-100 text-green-600';
    case 'workout':
      return 'bg-purple-100 text-purple-600';
    case 'mental_health':
      return 'bg-blue-100 text-blue-600';
    case 'sleep':
      return 'bg-indigo-100 text-indigo-600';
    case 'weight_management':
      return 'bg-orange-100 text-orange-600';
    case 'daily_activity':
      return 'bg-yellow-100 text-yellow-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

function getSuggestionTitle(type: string): string {
  switch (type) {
    case 'nutrition':
      return 'Nutrition Tip';
    case 'workout':
      return 'Workout Suggestion';
    case 'mental_health':
      return 'Mental Wellness';
    case 'sleep':
      return 'Sleep Improvement';
    case 'weight_management':
      return 'Weight Management';
    case 'daily_activity':
      return 'Daily Activity';
    default:
      return 'Health Suggestion';
  }
}
