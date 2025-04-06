"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DashboardNavbar } from "@/components/dashboard-navbar";
import { SubscriptionCheck } from "@/components/subscription-check";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  PlusCircle, 
  FilterIcon, 
  CheckCircle, 
  Clock, 
  Calendar, 
  Target, 
  ArrowUpRight, 
  RefreshCw, 
  Trash2, 
  PencilLine, 
  MoreHorizontal,
  LineChart,
  ListFilter,
  TrendingUp,
  Award,
  Share2,
  ChevronRight,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tables } from "@/types/supabase";
import { format, differenceInDays, addDays, isBefore, isAfter } from "date-fns";
import { useDateFormat } from "@/hooks/use-date-format";
import { GoalsList } from "@/components/goals-list";
import { AddGoalDialog } from "@/components/add-goal-dialog";
import { User } from "@supabase/supabase-js";

// Update the Goal type to include notes
type Goal = Tables<"health_goals"> & {
  measurement_unit?: string;
  notes?: string | null;
};

export default function GoalsPage() {
  const router = useRouter();
  const { formatDate, getTimeRemaining } = useDateFormat();
  const [user, setUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'expired'>('all');
  const [sortBy, setSortBy] = useState<'progress' | 'date' | 'type'>('progress');
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [logActivityOpen, setLogActivityOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [goalDetails, setGoalDetailsOpen] = useState(false);
  const [achievementOpen, setAchievementOpen] = useState(false);
  const [formData, setFormData] = useState({
    goalType: "",
    targetValue: "",
    measurementUnit: "",
    startDate: new Date(),
    targetDate: addDays(new Date(), 30),
    notes: ""
  });
  const [activityData, setActivityData] = useState({
    value: "",
    date: new Date(),
    notes: ""
  });

  // Fetch user and goals on component mount
  useEffect(() => {
    const fetchUserAndGoals = async () => {
      const supabase = createClient();
      
      // Fetch user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Fetch goals
        const { data, error } = await supabase
          .from('health_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching goals:', error);
          toast({
            title: "Error fetching goals",
            description: "Please try again later",
            variant: "destructive"
          });
        } else {
          setGoals(data || []);
        }
      }
      
      setLoading(false);
    };
    
    fetchUserAndGoals();
  }, []);

  // Handle form submission for adding a new goal
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.goalType || !formData.targetValue) {
        toast({
          title: "Missing information",
          description: "Please provide all required fields",
          variant: "destructive"
        });
        return;
      }
      
      const supabase = createClient();
      
      const newGoal = {
        user_id: user.id,
        goal_type: formData.goalType,
        target_value: parseFloat(formData.targetValue),
        current_value: 0,
        start_date: formData.startDate.toISOString(),
        target_date: formData.targetDate.toISOString(),
        status: "active",
        notes: formData.notes,
        measurement_unit: formData.measurementUnit,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Optimistic update
      const tempId = Date.now().toString();
      setGoals([{ ...newGoal, id: tempId }, ...goals]);
      
      const { data, error } = await supabase
        .from("health_goals")
        .insert(newGoal)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update with actual DB data
      setGoals(goals => goals.map(g => g.id === tempId ? data : g));
      
      toast({
        title: "Goal added",
        description: "Your new goal has been created"
      });
      
      setAddGoalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error adding goal:", err);
      toast({
        title: "Failed to add goal",
        description: "There was an error creating your goal",
        variant: "destructive"
      });
    }
  };

  // Handle updating an existing goal
  const handleEditGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGoal) return;
    
    try {
      const supabase = createClient();
      
      const updatedGoal = {
        goal_type: formData.goalType,
        target_value: parseFloat(formData.targetValue),
        start_date: formData.startDate.toISOString(),
        target_date: formData.targetDate.toISOString(),
        notes: formData.notes,
        measurement_unit: formData.measurementUnit,
        updated_at: new Date().toISOString()
      };
      
      // Optimistic update
      setGoals(goals => goals.map(g => 
        g.id === selectedGoal.id ? {...selectedGoal, ...updatedGoal} : g
      ));
      
      const { data, error } = await supabase
        .from("health_goals")
        .update(updatedGoal)
        .eq("id", selectedGoal.id)
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Goal updated",
        description: "Your goal has been successfully updated"
      });
      
      setEditGoalOpen(false);
    } catch (err) {
      console.error("Error updating goal:", err);
      toast({
        title: "Update failed",
        description: "There was an error updating your goal",
        variant: "destructive"
      });
      // Revert optimistic update
      fetchGoals();
    }
  };

  // Handle logging an activity for a goal
  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGoal || !activityData.value) return;
    
    try {
      const supabase = createClient();
      
      // Log the activity
      const { error: activityError } = await supabase
        .from("health_activities")
        .insert({
          user_id: user.id,
          activity_type: selectedGoal.goal_type,
          value: parseFloat(activityData.value),
          completed_at: activityData.date.toISOString(),
          notes: activityData.notes,
          measurement_unit: selectedGoal.measurement_unit
        });
        
      if (activityError) throw activityError;
      
      // Update goal progress
      const newCurrentValue = (selectedGoal.current_value || 0) + parseFloat(activityData.value);
      const completed = newCurrentValue >= (selectedGoal.target_value || 0);
      
      // Optimistic update
      setGoals(goals => goals.map(g => 
        g.id === selectedGoal.id 
          ? {...g, current_value: newCurrentValue, status: completed ? "completed" : g.status } 
          : g
      ));
      
      const { data, error } = await supabase
        .from("health_goals")
        .update({
          current_value: newCurrentValue,
          status: completed ? "completed" : selectedGoal.status,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedGoal.id)
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Activity logged",
        description: "Your activity has been recorded and progress updated"
      });
      
      setLogActivityOpen(false);
      setActivityData({ value: "", date: new Date(), notes: "" });
      
      // Show achievement modal if goal completed
      if (completed && selectedGoal.status !== "completed") {
        setSelectedGoal({...selectedGoal, current_value: newCurrentValue, status: "completed"});
        setAchievementOpen(true);
      }
    } catch (err) {
      console.error("Error logging activity:", err);
      toast({
        title: "Failed to log activity",
        description: "There was an error recording your activity",
        variant: "destructive"
      });
      // Revert optimistic update
      fetchGoals();
    }
  };

  // Delete a goal
  const handleDeleteGoal = async (goalId: string) => {
    try {
      const supabase = createClient();
      
      // Optimistic update
      setGoals(goals => goals.filter(g => g.id !== goalId));
      
      const { error } = await supabase
        .from("health_goals")
        .delete()
        .eq("id", goalId);
        
      if (error) throw error;
      
      toast({
        title: "Goal deleted",
        description: "Your goal has been successfully removed"
      });
    } catch (err) {
      console.error("Error deleting goal:", err);
      toast({
        title: "Delete failed",
        description: "There was an error deleting your goal",
        variant: "destructive"
      });
      // Revert optimistic update
      fetchGoals();
    }
  };

  // Complete a goal
  const handleCompleteGoal = async (goal: Goal) => {
    try {
      const supabase = createClient();
      
      // Optimistic update
      setGoals(goals => goals.map(g => 
        g.id === goal.id ? {...g, status: "completed"} : g
      ));
      
      const { error } = await supabase
        .from("health_goals")
        .update({ 
          status: "completed",
          updated_at: new Date().toISOString()
        })
        .eq("id", goal.id);
        
      if (error) throw error;
      
      // Show achievement modal
      setSelectedGoal({...goal, status: "completed"});
      setAchievementOpen(true);
      
      toast({
        title: "Goal completed",
        description: "Congratulations on achieving your goal!"
      });
    } catch (err) {
      console.error("Error completing goal:", err);
      toast({
        title: "Update failed",
        description: "There was an error updating your goal",
        variant: "destructive"
      });
      // Revert optimistic update
      fetchGoals();
    }
  };

  // Reset form inputs
  const resetForm = () => {
    setFormData({
      goalType: "",
      targetValue: "",
      measurementUnit: "",
      startDate: new Date(),
      targetDate: addDays(new Date(), 30),
      notes: ""
    });
  };

  // Refresh goals from database
  const fetchGoals = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
    .from("health_goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      setGoals(data || []);
    } catch (err) {
      console.error("Error fetching goals:", err);
      setError("Failed to refresh goals");
    } finally {
      setLoading(false);
    }
  };

  // Format time remaining in a user-friendly way
  const formatTimeRemaining = (targetDate: string | null): string => {
    if (!targetDate) return "No deadline";
    
    const target = new Date(targetDate);
    const today = new Date();
    const daysRemaining = differenceInDays(target, today);
    
    if (daysRemaining < 0) {
      return `${Math.abs(daysRemaining)} days overdue`;
    } else if (daysRemaining === 0) {
      return "Due today";
    } else if (daysRemaining === 1) {
      return "Due tomorrow";
    } else if (daysRemaining < 7) {
      return `${daysRemaining} days left`;
    } else if (daysRemaining < 30) {
      return `${Math.floor(daysRemaining / 7)} weeks left`;
    } else {
      return `${Math.floor(daysRemaining / 30)} months left`;
    }
  };

  // Calculate progress percentage
  const calculateProgress = (goal: Goal): number => {
    if (!goal.current_value || !goal.target_value) return 0;
    const progress = (goal.current_value / goal.target_value) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  // Get status badge based on progress and dates
  const getStatusBadge = (goal: Goal) => {
    const progress = calculateProgress(goal);
    const targetDate = goal.target_date ? new Date(goal.target_date) : null;
    const today = new Date();
    
    if (goal.status === 'completed') {
      return <Badge className="bg-green-500">Completed</Badge>;
    }
    
    if (targetDate && isBefore(targetDate, today)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    if (progress >= 75) {
      return <Badge className="bg-green-500/80">On Track</Badge>;
    } else if (progress >= 25) {
      return <Badge variant="secondary">In Progress</Badge>;
    } else {
      return <Badge variant="outline">Just Started</Badge>;
    }
  };

  // Get progress color based on completion percentage
  const getProgressColor = (goal: Goal): string => {
    const progress = calculateProgress(goal);
    
    if (goal.status === 'completed') {
      return "bg-green-500";
    }
    
    if (progress >= 75) {
      return "bg-green-500";
    } else if (progress >= 50) {
      return "bg-yellow-500";
    } else if (progress >= 25) {
      return "bg-orange-500";
    } else {
      return "bg-primary";
    }
  };

  // Filter and sort goals
  const getFilteredGoals = () => {
    let filtered = [...goals];
    
    // Apply filter
    switch (filter) {
      case 'active':
        filtered = filtered.filter(g => g.status === 'active');
        break;
      case 'completed':
        filtered = filtered.filter(g => g.status === 'completed');
        break;
      case 'expired':
        filtered = filtered.filter(g => {
          const targetDate = g.target_date ? new Date(g.target_date) : null;
          return targetDate && isBefore(targetDate, new Date()) && g.status !== 'completed';
        });
        break;
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'progress':
        filtered.sort((a, b) => {
          const progressA = calculateProgress(a);
          const progressB = calculateProgress(b);
          return progressB - progressA;
        });
        break;
      case 'date':
        filtered.sort((a, b) => {
          const dateA = a.target_date ? new Date(a.target_date).getTime() : 0;
          const dateB = b.target_date ? new Date(b.target_date).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case 'type':
        filtered.sort((a, b) => a.goal_type.localeCompare(b.goal_type));
        break;
    }
    
    return filtered;
  };

  // Get the unit label for a goal
  const getUnitLabel = (goal: Goal): string => {
    return goal.measurement_unit || 'units';
  };

  // Generate simulated progress data for chart visualization
  const generateProgressData = (goal: Goal) => {
    const endDate = new Date();
    const startDate = goal.start_date 
      ? new Date(goal.start_date) 
      : addDays(endDate, -14);
    
    // For simplicity, we'll create a linear progression
    const days = differenceInDays(endDate, startDate) + 1;
    const dailyProgress = (goal.current_value || 0) / days;
    
    const data = [];
    let currentDate = new Date(startDate);
    let currentValue = 0;
    
    while (currentDate <= endDate) {
      currentValue += dailyProgress * (0.7 + Math.random() * 0.6); // Add some randomness
      data.push({
        date: format(currentDate, 'MMM dd'),
        value: Math.min(goal.target_value || 0, currentValue)
      });
      currentDate = addDays(currentDate, 1);
    }
    
    return data;
  };

  // Share goal achievement
  const handleShareAchievement = () => {
    if (!selectedGoal) return;
    
    const shareText = `I just achieved my ${selectedGoal.goal_type} goal of ${selectedGoal.target_value} ${getUnitLabel(selectedGoal)} on LifeJourney!`;
    
    if (navigator.share) {
      navigator.share({
        title: "Goal Achievement",
        text: shareText,
        url: window.location.href
      }).catch(err => {
        console.error("Error sharing:", err);
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard",
        description: "Share your achievement with friends!"
      });
    }
  };

  // Statistics
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const expiredGoals = goals.filter(g => {
    const targetDate = g.target_date ? new Date(g.target_date) : null;
    return targetDate && isBefore(targetDate, new Date()) && g.status !== 'completed';
  }).length;
  
  const filteredGoals = getFilteredGoals();
  
  // Render loading state
  if (loading) {
    return (
      <SubscriptionCheck>
        <div className="min-h-screen bg-background">
          {user && <DashboardNavbar user={user} />}
          <div className="container max-w-6xl py-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight">My Goals</h1>
            </div>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </SubscriptionCheck>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <SubscriptionCheck>
        <div className="min-h-screen bg-background">
          {user && <DashboardNavbar user={user} />}
          <div className="container max-w-6xl py-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight">My Goals</h1>
            </div>
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchGoals}>Try Again</Button>
            </div>
          </div>
        </div>
      </SubscriptionCheck>
    );
  }

  return (
    <SubscriptionCheck>
      <div className="min-h-screen bg-background">
        {user && <DashboardNavbar user={user} />}
        <div className="container max-w-6xl py-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight">My Goals</h1>
            <Button 
              onClick={() => setAddGoalOpen(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add New Goal
            </Button>
          </div>
          
          {goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed rounded-lg border-muted-foreground/20 text-center">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No goals yet</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Setting goals helps you track progress and stay motivated. Start by adding your first health goal.
              </p>
              <Button
                onClick={() => setAddGoalOpen(true)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Your First Goal
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Goals</p>
                      <p className="text-2xl font-bold">{activeGoals}</p>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">{completedGoals}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Expired</p>
                      <p className="text-2xl font-bold">{expiredGoals}</p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                      <Clock className="h-5 w-5 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <Tabs 
                  defaultValue="all" 
                  value={filter}
                  onValueChange={(value) => setFilter(value as 'all' | 'active' | 'completed' | 'expired')}
                  className="w-full sm:w-auto"
                >
                  <TabsList className="w-full sm:w-auto grid grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="expired">Expired</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="flex items-center gap-2">
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'progress' | 'date' | 'type')}>
                    <SelectTrigger className="w-[160px]">
                      <div className="flex items-center gap-2">
                        <ListFilter className="h-4 w-4" />
                        <span>Sort by</span>
                </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="progress">Progress</SelectItem>
                      <SelectItem value="date">Target Date</SelectItem>
                      <SelectItem value="type">Activity Type</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={fetchGoals}
                    title="Refresh goals"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredGoals.map(goal => (
                  <Card key={goal.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="capitalize">
                            {goal.goal_type} Goal
                          </CardTitle>
                          <CardDescription>
                            {formatTimeRemaining(goal.target_date)}
                          </CardDescription>
                        </div>
                        {getStatusBadge(goal)}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex justify-between items-baseline mb-2">
                        <div className="text-lg sm:text-xl font-bold flex items-center gap-1.5">
                          {goal.current_value || 0}
                          <span className="text-sm font-medium text-muted-foreground">
                            of {goal.target_value} {getUnitLabel(goal)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round(calculateProgress(goal))}%
                        </div>
                      </div>
                      
                      <Progress 
                        value={calculateProgress(goal)} 
                        className={`h-2 mb-4 ${getProgressColor(goal)}`}
                      />
                      
                      <div className="h-[120px] w-full mb-4 flex items-center justify-center">
                        <div className="relative w-full h-full">
                          {/* Simplified chart visualization */}
                          <div className="absolute inset-0 flex items-end">
                            {generateProgressData(goal).map((point, index, array) => {
                              const percentage = (point.value / (goal.target_value || 1)) * 100;
                              return (
                                <div 
                                  key={index} 
                                  className="flex-1 bg-primary/10 mr-px relative"
                                  style={{ height: `${Math.min(100, percentage)}%` }}
                                >
                                  {index === array.length - 1 && (
                                    <div className="absolute -right-1 top-0 w-2 h-2 bg-primary rounded-full transform -translate-y-1/2"></div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Target line */}
                          <div className="absolute top-0 left-0 right-0 border-t-2 border-dashed border-muted-foreground/30 flex justify-end">
                            <span className="text-xs text-muted-foreground bg-card px-1 transform translate-y-[-50%]">
                              Target
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {goal.start_date ? format(new Date(goal.start_date), 'MMM d, yyyy') : 'No start date'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Target className="h-3.5 w-3.5" />
                          <span>
                            {goal.target_date ? format(new Date(goal.target_date), 'MMM d, yyyy') : 'No target date'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedGoal(goal);
                          setGoalDetailsOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedGoal(goal);
                              setLogActivityOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <ArrowUpRight className="h-4 w-4 mr-2" />
                            Log Activity
                          </DropdownMenuItem>
                          {goal.status !== 'completed' && (
                            <DropdownMenuItem 
                              onClick={() => handleCompleteGoal(goal)}
                              className="cursor-pointer"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Completed
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedGoal(goal);
                              // Pre-fill form with existing data
                              setFormData({
                                goalType: goal.goal_type,
                                targetValue: goal.target_value?.toString() || "",
                                measurementUnit: goal.measurement_unit || "",
                                startDate: goal.start_date ? new Date(goal.start_date) : new Date(),
                                targetDate: goal.target_date ? new Date(goal.target_date) : addDays(new Date(), 30),
                                notes: goal.notes || ""
                              });
                              setEditGoalOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <PencilLine className="h-4 w-4 mr-2" />
                            Edit Goal
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this goal?")) {
                                handleDeleteGoal(goal.id);
                              }
                            }}
                            className="text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Goal
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
            )}
          </div>

        {/* Add Goal Dialog */}
        <AddGoalDialog
          open={addGoalOpen}
          onOpenChange={setAddGoalOpen}
          onGoalAdded={handleAddGoal}
        />
        
        {/* Edit Goal Dialog */}
        <Dialog open={editGoalOpen} onOpenChange={setEditGoalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Goal</DialogTitle>
              <DialogDescription>
                Update your goal details and settings.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditGoal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-goalType">Goal Type</Label>
                <Select
                  value={formData.goalType}
                  onValueChange={(value) => setFormData({...formData, goalType: value})}
                  required
                >
                  <SelectTrigger id="edit-goalType">
                    <SelectValue placeholder="Select a goal type" />
                  </SelectTrigger>
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
              </div>

              {formData.goalType && (
                <div className="space-y-2">
                  <Label htmlFor="edit-measurementUnit">Measurement Unit</Label>
                  <Select
                    value={formData.measurementUnit}
                    onValueChange={(value) => setFormData({...formData, measurementUnit: value})}
                    required
                  >
                    <SelectTrigger id="edit-measurementUnit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Same options as in the Add Goal form */}
                      {formData.goalType === "walking" && (
                        <>
                          <SelectItem value="steps">Steps</SelectItem>
                          <SelectItem value="km">Kilometers</SelectItem>
                          <SelectItem value="miles">Miles</SelectItem>
                        </>
                      )}
                      {formData.goalType === "running" && (
                        <>
                          <SelectItem value="km">Kilometers</SelectItem>
                          <SelectItem value="miles">Miles</SelectItem>
                          <SelectItem value="minutes">Minutes</SelectItem>
                        </>
                      )}
                      {formData.goalType === "cycling" && (
                        <>
                          <SelectItem value="km">Kilometers</SelectItem>
                          <SelectItem value="miles">Miles</SelectItem>
                          <SelectItem value="minutes">Minutes</SelectItem>
                        </>
                      )}
                      {formData.goalType === "swimming" && (
                        <>
                          <SelectItem value="meters">Meters</SelectItem>
                          <SelectItem value="km">Kilometers</SelectItem>
                          <SelectItem value="yards">Yards</SelectItem>
                          <SelectItem value="minutes">Minutes</SelectItem>
                        </>
                      )}
                      {(formData.goalType === "yoga" || formData.goalType === "meditation" || formData.goalType === "strength") && (
                        <>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                        </>
                      )}
                      {formData.goalType === "water" && (
                        <>
                          <SelectItem value="glasses">Glasses</SelectItem>
                          <SelectItem value="ml">Milliliters</SelectItem>
                          <SelectItem value="oz">Ounces</SelectItem>
                        </>
                      )}
                      {formData.goalType === "sleep" && (
                        <>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="minutes">Minutes</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-targetValue">Target Value</Label>
                <div className="flex items-center">
                  <Input
                    id="edit-targetValue"
                    type="number"
                    min="0"
                    step="any"
                    value={formData.targetValue}
                    onChange={(e) => setFormData({...formData, targetValue: e.target.value})}
                    required
                    className="flex-1"
                  />
                  {formData.measurementUnit && (
                    <span className="ml-2 text-sm text-muted-foreground min-w-16">
                      {formData.measurementUnit}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <div className="flex items-center border rounded-md px-3 py-2">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <input 
                      type="date" 
                      value={formData.startDate.toISOString().split('T')[0]} 
                      onChange={(e) => setFormData({...formData, startDate: new Date(e.target.value)})}
                      className="border-0 focus:outline-none focus:ring-0 p-0 text-sm bg-transparent"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Target Date</Label>
                  <div className="flex items-center border rounded-md px-3 py-2">
                    <Target className="h-4 w-4 mr-2 text-muted-foreground" />
                    <input 
                      type="date" 
                      value={formData.targetDate.toISOString().split('T')[0]} 
                      onChange={(e) => setFormData({...formData, targetDate: new Date(e.target.value)})}
                      className="border-0 focus:outline-none focus:ring-0 p-0 text-sm bg-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes (Optional)</Label>
                <Textarea
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  placeholder="Add any additional notes about your goal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setEditGoalOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Log Activity Dialog */}
        <Dialog open={logActivityOpen} onOpenChange={setLogActivityOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Log Activity</DialogTitle>
              <DialogDescription>
                Record your activity to update your goal progress.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLogActivity} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activityType">Activity Type</Label>
                <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 py-2 text-sm capitalize">
                  {selectedGoal?.goal_type}
                </div>
                    </div>

              <div className="space-y-2">
                <Label htmlFor="activityValue">Activity Value</Label>
                <div className="flex">
                  <Input
                    id="activityValue"
                    type="number"
                    min="0"
                    step="any"
                    value={activityData.value}
                    onChange={(e) => setActivityData({...activityData, value: e.target.value})}
                    placeholder={`Enter value in ${selectedGoal?.measurement_unit || "units"}`}
                    required
                    className="flex-1"
                  />
                  <div className="flex items-center ml-2 text-sm text-muted-foreground">
                    {selectedGoal?.measurement_unit || "units"}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="flex items-center border rounded-md px-3 py-2">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <input 
                    type="date" 
                    value={activityData.date.toISOString().split('T')[0]} 
                    onChange={(e) => setActivityData({...activityData, date: new Date(e.target.value)})}
                    max={new Date().toISOString().split('T')[0]}
                    className="border-0 focus:outline-none focus:ring-0 p-0 text-sm bg-transparent"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activityNotes">Notes (Optional)</Label>
                <Input
                  id="activityNotes"
                  value={activityData.notes}
                  onChange={(e) => setActivityData({...activityData, notes: e.target.value})}
                  placeholder="Add any notes about this activity"
                />
              </div>

              <div className="flex justify-between pt-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current progress: {selectedGoal?.current_value || 0} / {selectedGoal?.target_value} {selectedGoal?.measurement_unit || "units"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    After logging: {(selectedGoal?.current_value || 0) + (parseFloat(activityData.value) || 0)} / {selectedGoal?.target_value} {selectedGoal?.measurement_unit || "units"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setActivityData({ value: "", date: new Date(), notes: "" });
                      setLogActivityOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Log Activity
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Goal Details Dialog */}
        <Dialog open={goalDetails} onOpenChange={setGoalDetailsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            {selectedGoal && (
              <>
                <DialogHeader>
                  <DialogTitle className="capitalize flex items-center gap-2">
                    {selectedGoal.goal_type} Goal
                  </DialogTitle>
                  <DialogDescription>
                    Created on {format(new Date(selectedGoal.created_at), 'MMMM d, yyyy')}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 pt-2">
                  {/* Progress bar and status */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Progress</p>
                      <div className="text-3xl font-bold flex items-baseline gap-2">
                        {selectedGoal.current_value || 0}
                        <span className="text-lg font-normal text-muted-foreground">
                          / {selectedGoal.target_value} {getUnitLabel(selectedGoal)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-sm text-muted-foreground">Status</div>
                      {getStatusBadge(selectedGoal)}
                    </div>
                  </div>
                  
                  <Progress 
                    value={calculateProgress(selectedGoal)} 
                    className={`h-2.5 ${getProgressColor(selectedGoal)}`}
                  />
                  
                  {/* Visual chart of progress */}
                  <div className="h-[200px] border rounded-lg p-4 relative">
                    <div className="absolute inset-0 flex items-end p-4">
                      {generateProgressData(selectedGoal).map((point, index, array) => {
                        const percentage = (point.value / (selectedGoal.target_value || 1)) * 100;
                        return (
                          <div 
                            key={index} 
                            className="flex-1 bg-primary/10 mr-px relative group"
                            style={{ height: `${Math.min(100, percentage)}%` }}
                          >
                            {index % Math.ceil(array.length / 8) === 0 && (
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 text-xs text-muted-foreground">
                                {point.date}
                              </div>
                            )}
                            <div className="opacity-0 group-hover:opacity-100 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 bg-background border rounded px-2 py-1 text-xs whitespace-nowrap transition-opacity">
                              {point.date}: {point.value.toFixed(1)} {getUnitLabel(selectedGoal)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Target line */}
                    <div className="absolute top-4 left-4 right-4 border-t-2 border-dashed border-muted-foreground/30 flex justify-end">
                      <span className="text-xs text-muted-foreground bg-card px-1 transform translate-y-[-50%]">
                        Target: {selectedGoal.target_value} {getUnitLabel(selectedGoal)}
                      </span>
                    </div>
                    
                    {/* X-axis */}
                    <div className="absolute bottom-0 left-4 right-4 h-6 border-t border-muted-foreground/20"></div>
                  </div>
                  
                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">
                        {selectedGoal.start_date ? format(new Date(selectedGoal.start_date), 'MMM d, yyyy') : 'No start date'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Target Date</p>
                      <p className="font-medium">
                        {selectedGoal.target_date ? format(new Date(selectedGoal.target_date), 'MMM d, yyyy') : 'No target date'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Milestones */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Milestones</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {[25, 50, 75, 100].map((milestone) => {
                        const achieved = calculateProgress(selectedGoal) >= milestone;
                        const milestoneValue = (selectedGoal.target_value || 0) * (milestone / 100);
                        
                        return (
                          <div 
                            key={milestone} 
                            className={`p-3 rounded-md border text-center ${
                              achieved ? "bg-primary/10 border-primary/20" : "bg-muted/30 border-muted"
                            }`}
                          >
                            <div className="flex justify-center mb-2">
                              {achieved ? (
                                <CheckCircle className="h-5 w-5 text-primary" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                              )}
                            </div>
                            <p className={`text-sm font-medium ${achieved ? "text-foreground" : "text-muted-foreground"}`}>
                              {milestone}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {milestoneValue.toFixed(1)} {getUnitLabel(selectedGoal)}
                  </p>
                </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Notes */}
                  {selectedGoal.notes && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-sm bg-muted p-3 rounded-md">
                        {selectedGoal.notes}
                      </p>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex justify-between pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedGoal(selectedGoal);
                        setLogActivityOpen(true);
                        setGoalDetailsOpen(false);
                      }}
                    >
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Log Activity
                    </Button>
                    
                    {selectedGoal.status !== 'completed' && (
                      <Button
                        onClick={() => {
                          handleCompleteGoal(selectedGoal);
                          setGoalDetailsOpen(false);
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Completed
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Achievement Celebration Dialog */}
        <Dialog open={achievementOpen} onOpenChange={setAchievementOpen}>
          <DialogContent className="sm:max-w-md">
            {selectedGoal && (
              <div className="text-center pt-4">
                <div className="mb-4 relative">
                  {/* Simple confetti animation for achievement */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(50)].map((_, i) => (
                      <div 
                        key={i}
                        className="absolute animate-fall"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `-${Math.random() * 20}px`,
                          width: `${Math.random() * 10 + 5}px`,
                          height: `${Math.random() * 10 + 5}px`,
                          backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
                          animationDuration: `${Math.random() * 3 + 2}s`,
                          animationDelay: `${Math.random() * 0.5}s`
                        }}
                      />
                    ))}
                  </div>
                  
                  <div className="w-24 h-24 mx-auto bg-amber-100 rounded-full flex items-center justify-center relative">
                    <Award className="h-12 w-12 text-amber-500" />
                    <div className="absolute inset-0 rounded-full border-4 border-amber-200 animate-ping opacity-75" />
                  </div>
                </div>
                
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex justify-center items-center gap-2">
                    <Award className="h-5 w-5 text-amber-500" />
                    Goal Achieved!
                    <Award className="h-5 w-5 text-amber-500" />
                  </DialogTitle>
                  <DialogDescription className="text-center pt-2 text-base">
                    Congratulations on completing your {selectedGoal.goal_type} goal!
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-6 space-y-4">
                  <div className="text-center space-y-1">
                    <p className="font-medium capitalize">
                      {selectedGoal.goal_type}
                    </p>
                    <p className="text-xl font-bold">
                      {selectedGoal.target_value} {getUnitLabel(selectedGoal)}
                    </p>
                  </div>
                  
                  <Progress 
                    value={100} 
                    className="h-2 bg-green-500"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={handleShareAchievement}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share Achievement
                  </Button>
                  <Button onClick={() => setAchievementOpen(false)}>
                    View All Goals
                  </Button>
                </div>
              </div>
          )}
          </DialogContent>
        </Dialog>
        </div>
    </SubscriptionCheck>
  );
}