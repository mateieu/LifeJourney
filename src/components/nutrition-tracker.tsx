"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { format, subDays, startOfWeek, endOfWeek, parseISO } from "date-fns";
import { Apple, Coffee, Utensils, Salad, Plus, Info, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { saveNutritionEntry } from "@/lib/tracking-service";

type NutritionEntry = {
  id: string;
  user_id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
};

type NutritionSummary = {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealBreakdown: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snack: number;
  };
};

export function NutritionTracker() {
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [summary, setSummary] = useState<NutritionSummary>({
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    mealBreakdown: {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snack: 0
    }
  });
  
  const router = useRouter();
  const { toast } = useToast();
  
  // New entry form state
  const [newEntry, setNewEntry] = useState({
    meal_type: 'breakfast',
    food_name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    notes: ''
  });
  
  useEffect(() => {
    fetchNutritionEntries();
  }, [selectedDay]);
  
  const fetchNutritionEntries = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Format date to ISO string for database query
      const dateStr = format(selectedDay, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('nutrition_entries')
        .select('*')
        .eq('date', dateStr)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      setEntries(data || []);
      calculateSummary(data || []);
    } catch (error) {
      console.error('Error fetching nutrition entries:', error);
      toast({
        title: 'Error loading nutrition data',
        description: 'Could not load your nutrition entries. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const calculateSummary = (entriesData: NutritionEntry[]) => {
    const newSummary: NutritionSummary = {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      mealBreakdown: {
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        snack: 0
      }
    };
    
    entriesData.forEach(entry => {
      newSummary.totalCalories += entry.calories;
      newSummary.totalProtein += entry.protein;
      newSummary.totalCarbs += entry.carbs;
      newSummary.totalFat += entry.fat;
      
      newSummary.mealBreakdown[entry.meal_type] += entry.calories;
    });
    
    setSummary(newSummary);
  };
  
  const handleAddEntry = async () => {
    setSaving(true);
    try {
      if (!newEntry.food_name || newEntry.meal_type === '') {
        toast({
          title: "Missing fields",
          description: "Please provide at least the food name and meal type.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      // Save to database
      const success = await saveNutritionEntry({
        date: format(selectedDay, 'yyyy-MM-dd'),
        food_name: newEntry.food_name,
        meal_type: newEntry.meal_type,
        calories: newEntry.calories || undefined,
        protein: newEntry.protein || undefined,
        carbs: newEntry.carbs || undefined,
        fat: newEntry.fat || undefined,
        notes: newEntry.notes || ""
      });

      if (success) {
        // Reset form
        setNewEntry({
          meal_type: 'breakfast',
          food_name: '',
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          notes: ''
        });
        
        // Close dialog and refresh data
        setShowAddDialog(false);
        fetchNutritionEntries();
      }
    } catch (error) {
      console.error("Error adding nutrition entry:", error);
      toast({
        title: "Error",
        description: "Failed to save nutrition data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteEntry = async (id: string) => {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('nutrition_entries')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Refresh entries
      fetchNutritionEntries();
      
      toast({
        title: 'Entry deleted',
        description: 'Your nutrition entry has been deleted.'
      });
    } catch (error) {
      console.error('Error deleting nutrition entry:', error);
      toast({
        title: 'Error deleting entry',
        description: 'Could not delete your nutrition entry. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handlePreviousDay = () => {
    setSelectedDay(prev => subDays(prev, 1));
  };
  
  const handleNextDay = () => {
    setSelectedDay(prev => subDays(prev, -1));
  };
  
  const getMealIcon = (mealType: string) => {
    switch(mealType) {
      case 'breakfast': return <Coffee className="h-4 w-4" />;
      case 'lunch': return <Utensils className="h-4 w-4" />;
      case 'dinner': return <Utensils className="h-4 w-4" />;
      case 'snack': return <Apple className="h-4 w-4" />;
      default: return <Salad className="h-4 w-4" />;
    }
  };
  
  // Calculate macro percentages
  const calculateMacroPercentage = () => {
    const totalMacroGrams = summary.totalProtein + summary.totalCarbs + summary.totalFat;
    if (totalMacroGrams === 0) return [0, 0, 0];
    
    const proteinPercentage = Math.round((summary.totalProtein / totalMacroGrams) * 100);
    const carbsPercentage = Math.round((summary.totalCarbs / totalMacroGrams) * 100);
    const fatPercentage = Math.round((summary.totalFat / totalMacroGrams) * 100);
    
    return [proteinPercentage, carbsPercentage, fatPercentage];
  };
  
  const macroData = [
    { name: 'Protein', value: summary.totalProtein, color: '#10b981' },
    { name: 'Carbs', value: summary.totalCarbs, color: '#3b82f6' },
    { name: 'Fat', value: summary.totalFat, color: '#f59e0b' }
  ];
  
  const mealData = [
    { name: 'Breakfast', calories: summary.mealBreakdown.breakfast, color: '#f97316' },
    { name: 'Lunch', calories: summary.mealBreakdown.lunch, color: '#8b5cf6' },
    { name: 'Dinner', calories: summary.mealBreakdown.dinner, color: '#06b6d4' },
    { name: 'Snacks', calories: summary.mealBreakdown.snack, color: '#84cc16' }
  ];
  
  const [macroPercentages] = useState<number[]>(calculateMacroPercentage());
  
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Nutrition Tracker</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePreviousDay}>
            <ChevronDown className="h-4 w-4 -rotate-90" />
          </Button>
          
          <div className="text-sm font-medium px-2">
            {format(selectedDay, 'EEEE, MMMM d, yyyy')}
          </div>
          
          <Button variant="outline" size="sm" onClick={handleNextDay}>
            <ChevronDown className="h-4 w-4 rotate-90" />
          </Button>
          
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Food
          </Button>
        </div>
      </div>
      
      {/* Nutrition Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Calories & Macros</CardTitle>
            <CardDescription>
              Daily nutrition breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 gap-0">
              <div className="p-6 flex items-center justify-center flex-col">
                <div className="text-3xl font-bold mb-1">{summary.totalCalories}</div>
                <div className="text-sm text-muted-foreground">Calories</div>
              </div>
              
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value}g`, '']}
                      labelFormatter={() => ''}
                    />
                    <Legend 
                      layout="vertical" 
                      verticalAlign="middle" 
                      align="right"
                      iconSize={8}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="grid grid-cols-3 border-t">
              <div className="p-4 text-center">
                <div className="text-sm font-medium">{summary.totalProtein}g</div>
                <div className="text-xs text-muted-foreground">Protein</div>
              </div>
              <div className="p-4 text-center border-x">
                <div className="text-sm font-medium">{summary.totalCarbs}g</div>
                <div className="text-xs text-muted-foreground">Carbs</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-sm font-medium">{summary.totalFat}g</div>
                <div className="text-xs text-muted-foreground">Fat</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meal Distribution</CardTitle>
            <CardDescription>
              Calories per meal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[190px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mealData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`${value} kcal`, 'Calories']} />
                  <Bar dataKey="calories" name="Calories">
                    {mealData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Food Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Food Log</CardTitle>
          <CardDescription>
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} for {format(selectedDay, 'MMMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <Salad className="h-12 w-12 text-muted-foreground opacity-50 mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-1">No entries yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start logging your meals to track your nutrition.
              </p>
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add First Food
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
                const mealEntries = entries.filter(e => e.meal_type === mealType);
                if (mealEntries.length === 0) return null;
                
                return (
                  <Collapsible key={mealType} defaultOpen={true} className="mb-4">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted">
                      <div className="flex items-center gap-2">
                        {getMealIcon(mealType)}
                        <span className="text-sm font-medium capitalize">{mealType}</span>
                        <span className="text-sm text-muted-foreground">
                          ({mealEntries.reduce((acc, entry) => acc + entry.calories, 0)} kcal)
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 transition-transform ui-expanded:rotate-90" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-1">
                      <div className="space-y-1 pl-6">
                        {mealEntries.map(entry => (
                          <div key={entry.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div>
                              <div className="text-sm font-medium">{entry.food_name}</div>
                              <div className="text-xs text-muted-foreground">
                                P: {entry.protein}g • C: {entry.carbs}g • F: {entry.fat}g
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium">{entry.calories} kcal</div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteEntry(entry.id)}
                              >
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="16" 
                                  height="16" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                </svg>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Food
          </Button>
        </CardFooter>
      </Card>
      
      {/* Add Food Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Food Entry</DialogTitle>
            <DialogDescription>
              Log your nutrition intake for {format(selectedDay, 'MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="meal-type" className="text-right">
                Meal
              </Label>
              <Select
                value={newEntry.meal_type}
                onValueChange={(value) => setNewEntry({...newEntry, meal_type: value as any})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="food-name" className="text-right">
                Food
              </Label>
              <Input
                id="food-name"
                value={newEntry.food_name}
                onChange={(e) => setNewEntry({...newEntry, food_name: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="calories" className="text-right">
                Calories
              </Label>
              <Input
                id="calories"
                type="number"
                value={newEntry.calories || ''}
                onChange={(e) => setNewEntry({...newEntry, calories: Number(e.target.value)})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-6 gap-4">
              <Label className="text-right col-span-1 self-center">
                Macros
              </Label>
              <div className="col-span-5 grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="protein" className="text-xs">
                    Protein (g)
                  </Label>
                  <Input
                    id="protein"
                    type="number"
                    value={newEntry.protein || ''}
                    onChange={(e) => setNewEntry({...newEntry, protein: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="carbs" className="text-xs">
                    Carbs (g)
                  </Label>
                  <Input
                    id="carbs"
                    type="number"
                    value={newEntry.carbs || ''}
                    onChange={(e) => setNewEntry({...newEntry, carbs: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="fat" className="text-xs">
                    Fat (g)
                  </Label>
                  <Input
                    id="fat"
                    type="number"
                    value={newEntry.fat || ''}
                    onChange={(e) => setNewEntry({...newEntry, fat: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEntry}>
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 