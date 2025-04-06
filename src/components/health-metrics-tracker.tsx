"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Heart, Activity, Plus, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine, Line } from "recharts";
import { createClient } from "@/utils/supabase/client";
import { format, parseISO, subDays } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { fetchHealthMetrics } from "@/services/health-data-service";
import { saveBloodPressure } from "@/lib/tracking-service";
import { saveHealthMetric } from "@/lib/tracking-service";
import { deleteHealthMetric } from "@/services/health-data-service";

// Add this type definition and object right after the imports
interface MetricTypeInfo {
  id: string;
  label: string;
  unit: string;
  normalRange: [number, number]; // Min, Max
  icon: React.ReactNode;
  color: string;
  decimalPlaces: number;
}

interface HealthMetric {
  id: string;
  user_id: string;
  date: string;
  metric_type: string;
  value: number;
  notes?: string | null;
  created_at: string;
}

// Define the different metrics we support tracking
const metricTypes: Record<string, MetricTypeInfo> = {
  blood_pressure_systolic: {
    id: "blood_pressure_systolic",
    label: "Blood Pressure (Systolic)",
    unit: "mmHg",
    normalRange: [90, 120],
    icon: <Heart className="h-4 w-4" />,
    color: "#ef4444",
    decimalPlaces: 0, // Whole numbers only for BP
  },
  blood_pressure_diastolic: {
    id: "blood_pressure_diastolic",
    label: "Blood Pressure (Diastolic)",
    unit: "mmHg",
    normalRange: [60, 80],
    icon: <Heart className="h-4 w-4" />,
    color: "#3b82f6",
    decimalPlaces: 0, // Whole numbers only for BP
  },
  heart_rate: {
    id: "heart_rate",
    label: "Heart Rate",
    unit: "bpm",
    normalRange: [60, 100],
    icon: <Activity className="h-4 w-4" />,
    color: "#f97316",
    decimalPlaces: 0, // Whole numbers only for heart rate
  },
  weight: {
    id: "weight",
    label: "Weight",
    unit: "kg",
    normalRange: [50, 100], // Example range, adjust as needed
    icon: <ArrowDown className="h-4 w-4" />,
    color: "#8b5cf6",
    decimalPlaces: 1, // One decimal place for weight (e.g., 70.5 kg)
  },
  temperature: {
    id: "temperature",
    label: "Body Temperature",
    unit: "°C",
    normalRange: [36.1, 37.2],
    icon: <Activity className="h-4 w-4" />,
    color: "#ec4899",
    decimalPlaces: 1, // One decimal place for temperature (e.g., 36.7°C)
  },
};

// Add this function to determine the status of a value
function getValueStatus(type: string, value: number): 'normal' | 'high' | 'low' {
  const metricInfo = metricTypes[type];
  if (!metricInfo) return "normal";
  
  if (value < metricInfo.normalRange[0]) return "low";
  if (value > metricInfo.normalRange[1]) return "high";
  return "normal";
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    // Find a data entry to extract the date from
    const dataEntry = payload[0].payload;
    
    // Try to get a proper date from the data entry
    let formattedDate = label;
    try {
      // If the label is already the display date (e.g., "Jan 5")
      if (dataEntry.date) {
        // Use the full ISO date from the data entry
        formattedDate = format(parseISO(dataEntry.date), 'EEEE, MMMM d, yyyy');
      } else if (typeof label === 'string' && label.includes('-')) {
        // Try parsing it as an ISO date if it looks like one
        formattedDate = format(parseISO(label), 'EEEE, MMMM d, yyyy');
      }
    } catch (e) {
      // If parsing fails, just use the label as is
      console.log('Error parsing date in tooltip:', e);
    }

    return (
      <div className="bg-background border rounded-md shadow-sm p-2 text-xs">
        <p className="font-medium">{formattedDate}</p>
        <div className="mt-1 space-y-1">
          {payload.map((entry: any, index: number) => {
            const metricInfo = metricTypes[entry.dataKey];
            if (!metricInfo) return null;
            
            // Format value with appropriate decimal places
            const formattedValue = entry.dataKey === 'heart_rate' 
              ? Math.round(entry.value) 
              : entry.value.toFixed(metricInfo.decimalPlaces);
            
            return (
              <div key={index} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span>{metricInfo.label}: </span>
                <span className="font-medium">
                  {formattedValue} {metricInfo.unit}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  return null;
};

// Blood Pressure Chart Component
function BloodPressureChartCard({
  title,
  data,
  loading
}: {
  title: string;
  data: any[];
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <Heart className="h-12 w-12 mb-4 opacity-20" />
            <p>No data available for the selected period</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={[40, 180]} // Appropriate range for blood pressure
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${Math.round(value)}`} // Ensure whole numbers
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine 
                  y={120} 
                  stroke="red" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: 'Systolic Max', 
                    position: 'left', 
                    style: { fill: 'red', fontSize: '10px' } 
                  }} 
                />
                <ReferenceLine 
                  y={90} 
                  stroke="orange" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: 'Systolic Min', 
                    position: 'left', 
                    style: { fill: 'orange', fontSize: '10px' } 
                  }} 
                />
                <ReferenceLine 
                  y={80} 
                  stroke="red" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: 'Diastolic Max', 
                    position: 'left', 
                    style: { fill: 'red', fontSize: '10px' } 
                  }} 
                />
                <ReferenceLine 
                  y={60} 
                  stroke="orange" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: 'Diastolic Min', 
                    position: 'left', 
                    style: { fill: 'orange', fontSize: '10px' } 
                  }} 
                />
                <Line
                  type="monotone"
                  dataKey="blood_pressure_systolic"
                  name="Systolic"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{
                    r: 4,
                    stroke: "#ef4444",
                    strokeWidth: 1,
                    fill: "white"
                  }}
                  activeDot={{
                    r: 6,
                    stroke: "#ef4444",
                    strokeWidth: 1,
                    fill: "#ef4444"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="blood_pressure_diastolic"
                  name="Diastolic"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{
                    r: 4,
                    stroke: "#3b82f6",
                    strokeWidth: 1,
                    fill: "white"
                  }}
                  activeDot={{
                    r: 6,
                    stroke: "#3b82f6",
                    strokeWidth: 1,
                    fill: "#3b82f6"
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Generic metric chart component
function MetricChartCard({
  title,
  data,
  metricType,
  loading
}: {
  title: string;
  data: any[];
  metricType: string;
  loading: boolean;
}) {
  const metricInfo = metricTypes[metricType];
  
  if (!metricInfo) return null;
  
  // Configure y-axis domain and ticks based on metric type
  const getYAxisConfig = () => {
    switch(metricType) {
      case 'heart_rate':
        return {
          domain: [40, 180] as [number, number], // Explicitly define as tuple
          tickFormatter: (value: number) => `${Math.round(value)}`
        };
      case 'weight':
        return {
          domain: [
            Math.floor((Math.min(...data.filter(d => d[metricType]).map(d => d[metricType])) || 50) * 0.95),
            Math.ceil((Math.max(...data.filter(d => d[metricType]).map(d => d[metricType])) || 100) * 1.05)
          ] as [number, number],
          tickFormatter: (value: number) => `${value.toFixed(1)}`
        };
      case 'temperature':
        return {
          domain: [35, 41] as [number, number], // Normal to fever range
          tickFormatter: (value: number) => `${value.toFixed(1)}`
        };
      default:
        return {
          domain: [0, 200] as [number, number],
          tickFormatter: (value: number) => `${value}`
        };
    }
  };
  
  const yAxisConfig = getYAxisConfig();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <Activity className="h-12 w-12 mb-4 opacity-20" />
            <p>No data available for the selected period</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={yAxisConfig.domain}
                  tickFormatter={yAxisConfig.tickFormatter}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                {metricInfo.normalRange && (
                  <>
                    <ReferenceLine 
                      y={metricInfo.normalRange[0]} 
                      stroke="orange" 
                      strokeDasharray="3 3" 
                      label={{ 
                        value: 'Min Normal', 
                        position: 'left', 
                        style: { fill: 'orange', fontSize: '10px' } 
                      }} 
                    />
                    <ReferenceLine 
                      y={metricInfo.normalRange[1]} 
                      stroke="red" 
                      strokeDasharray="3 3" 
                      label={{ 
                        value: 'Max Normal', 
                        position: 'left', 
                        style: { fill: 'red', fontSize: '10px' } 
                      }} 
                    />
                  </>
                )}
                <Line
                  type="monotone"
                  dataKey={metricType}
                  name={metricInfo.label}
                  stroke={metricInfo.color}
                  strokeWidth={2}
                  dot={{
                    r: 4,
                    stroke: metricInfo.color,
                    strokeWidth: 1,
                    fill: "white"
                  }}
                  activeDot={{
                    r: 6,
                    stroke: metricInfo.color,
                    strokeWidth: 1,
                    fill: metricInfo.color
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main Health Metrics Tracker Component
export function HealthMetricsTracker() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetricType, setSelectedMetricType] = useState<string>("heart_rate");
  const [timeRange, setTimeRange] = useState<string>("7d");
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newEntry, setNewEntry] = useState({
    metric_type: "heart_rate",
    value: "",
    notes: "",
    date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [recentMetrics, setRecentMetrics] = useState<any[]>([]);
  
  useEffect(() => {
    fetchMetrics();
  }, [selectedMetricType, timeRange]);
  
  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Calculate date range based on selected time range
      const endDate = new Date();
      let startDate = subDays(endDate, 7);
      
      if (timeRange === "30d") {
        startDate = subDays(endDate, 30);
      } else if (timeRange === "90d") {
        startDate = subDays(endDate, 90);
      }
      
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');
      
      // Find related metric types for blood pressure
      const metricTypes = selectedMetricType.startsWith('blood_pressure') 
        ? ['blood_pressure_systolic', 'blood_pressure_diastolic']
        : [selectedMetricType];
      
      // Use the service to fetch data
      const data = await fetchHealthMetrics(metricTypes, startDateStr, endDateStr);
      
      // Group data by date for charts
      const groupedData = processDataForCharts(data || []);
      setMetrics(groupedData);
      
      // Fallback to sample data if no real data is available
      if (groupedData.length === 0) {
        const sampleData = generateSampleData(startDate, endDate, selectedMetricType);
        setMetrics(sampleData);
      }
      
      // Get all metrics for recent metrics section - limited to last 10
      const allMetricsData = await fetchHealthMetrics(Object.keys(metricTypes));
      setRecentMetrics(allMetricsData.slice(0, 10) || []);
      
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      // Fallback to sample data on error
      const endDate = new Date();
      let startDate = subDays(endDate, parseInt(timeRange.replace('d', '')));
      const sampleData = generateSampleData(startDate, endDate, selectedMetricType);
      setMetrics(sampleData);
    } finally {
      setLoading(false);
    }
  };
  
  // Add this new function to process the data for charts
  const processDataForCharts = (data: any[]) => {
    // Group data by date
    const dateMap: Record<string, any> = {};
    
    data.forEach(item => {
      const dateStr = item.date;
      
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = {
          date: dateStr, // Keep the full ISO date for tooltip parsing
          displayDate: format(parseISO(dateStr), 'MMM d') // This is shown on the X-axis
        };
      }
      
      // Add the metric value to the date entry
      dateMap[dateStr][item.metric_type] = item.value;
    });
    
    // Convert map to array and sort by date
    return Object.values(dateMap).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };
  
  // Generate sample data for demonstration
  const generateSampleData = (startDate: Date, endDate: Date, metricType: string) => {
    const data = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      let value;
      
      switch(metricType) {
        case 'heart_rate':
          value = 60 + Math.floor(Math.random() * 30);
          break;
        case 'blood_pressure_systolic':
          data.push({
            date: dateStr,
            displayDate: format(currentDate, 'MMM d'),
            blood_pressure_systolic: 110 + Math.floor(Math.random() * 30),
            blood_pressure_diastolic: 70 + Math.floor(Math.random() * 20)
          });
          break;
        case 'weight':
          value = 70 + Math.random() * 10;
          break;
        case 'temperature':
          value = 36.1 + Math.random() * 1.5;
          break;
        default:
          value = 0;
      }
      
      if (metricType !== 'blood_pressure_systolic') {
        data.push({
          date: dateStr,
          displayDate: format(currentDate, 'MMM d'),
          [metricType]: value
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  };
  
  // Process chart data
  const getChartData = () => {
    if (metrics.length === 0) return [];
    return metrics;
  };
  
  const chartData = getChartData();
  
  const handleAddEntry = async () => {
    setSaving(true);
    
    try {
      if (!newEntry.metric_type || !newEntry.value || !newEntry.date) {
        throw new Error("Please fill in all required fields");
      }
      
      // Different validation based on metric type
      if (newEntry.metric_type === "blood_pressure") {
        // Parse values like "120/80"
        const parts = newEntry.value.toString().split('/');
        if (parts.length !== 2) {
          throw new Error("Please enter blood pressure in format 120/80");
        }
        
        const systolic = parseInt(parts[0].trim());
        const diastolic = parseInt(parts[1].trim());
        
        if (isNaN(systolic) || isNaN(diastolic)) {
          throw new Error("Please enter valid blood pressure values");
        }
        
        // Validate reasonable ranges
        if (systolic < 70 || systolic > 220) {
          throw new Error("Systolic blood pressure should be between 70 and 220 mmHg");
        }
        
        if (diastolic < 40 || diastolic > 120) {
          throw new Error("Diastolic blood pressure should be between 40 and 120 mmHg");
        }
        
        if (diastolic >= systolic) {
          throw new Error("Systolic (first number) should be higher than diastolic (second number)");
        }
        
        // Save using service
        await saveBloodPressure({
          date: newEntry.date,
          systolic,
          diastolic,
          notes: newEntry.notes
        });
        
      } else {
        const value = parseFloat(newEntry.value.toString());
        if (isNaN(value)) {
          throw new Error("Please enter a valid number");
        }
        
        // Validate ranges based on metric type
        switch(newEntry.metric_type) {
          case "heart_rate":
            if (value < 30 || value > 220) {
              throw new Error("Heart rate should be between 30 and 220 bpm");
            }
            break;
          case "weight":
            if (value < 30 || value > 300) {
              throw new Error("Weight should be between 30 and 300 kg");
            }
            break;
          case "temperature":
            if (value < 34 || value > 42) {
              throw new Error("Body temperature should be between 34°C and 42°C");
            }
            break;
        }
        
        // Save using service
        await saveHealthMetric({
          date: newEntry.date,
          metric_type: newEntry.metric_type,
          value,
          notes: newEntry.notes
        });
      }
      
      // Refresh metrics
      fetchMetrics();
      
      // Reset form to defaults
      setNewEntry({
        metric_type: "heart_rate",
        value: "",
        notes: "",
        date: format(new Date(), 'yyyy-MM-dd'),
      });
      
      // Close dialog
      setShowAddDialog(false);
      
      toast({
        title: 'Metric added',
        description: 'Your health metric has been saved successfully.'
      });
    } catch (error) {
      console.error('Error adding health metric:', error);
      toast({
        title: 'Error adding metric',
        description: error instanceof Error ? error.message : 'Could not add your health metric. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteMetric = async (id: string) => {
    try {
      await deleteHealthMetric(id);
      
      // Refresh metrics
      fetchMetrics();
      
      toast({
        title: 'Metric deleted',
        description: 'Your health metric has been deleted.'
      });
    } catch (error) {
      console.error('Error deleting health metric:', error);
      toast({
        title: 'Error deleting metric',
        description: 'Could not delete your health metric. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Health Metrics</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Log Metric
        </Button>
      </div>
      
      {/* Metric Type Selector */}
      <Tabs 
        defaultValue="heart_rate" 
        value={selectedMetricType}
        onValueChange={setSelectedMetricType}
        className="space-y-4"
      >
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="heart_rate">Heart Rate</TabsTrigger>
            <TabsTrigger value="blood_pressure_systolic">Blood Pressure</TabsTrigger>
            <TabsTrigger value="weight">Weight</TabsTrigger>
            <TabsTrigger value="temperature">Temperature</TabsTrigger>
          </TabsList>
          
          <Select 
            value={timeRange} 
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Metric Visualizations */}
        <TabsContent value="heart_rate" className="space-y-4">
          <MetricChartCard 
            title="Heart Rate Over Time"
            data={chartData}
            metricType="heart_rate"
            loading={loading}
          />
        </TabsContent>
        
        <TabsContent value="blood_pressure_systolic" className="space-y-4">
          <BloodPressureChartCard
            title="Blood Pressure Over Time"
            data={chartData}
            loading={loading}
          />
        </TabsContent>
        
        <TabsContent value="weight" className="space-y-4">
          <MetricChartCard 
            title="Weight Over Time"
            data={chartData}
            metricType="weight"
            loading={loading}
          />
        </TabsContent>
        
        <TabsContent value="temperature" className="space-y-4">
          <MetricChartCard 
            title="Temperature Over Time"
            data={chartData}
            metricType="temperature"
            loading={loading}
          />
        </TabsContent>
      </Tabs>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Metrics</CardTitle>
          <CardDescription>
            Your recently recorded health metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentMetrics.length === 0 ? (
            <div className="text-center py-6">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
              <p className="text-muted-foreground">No metrics recorded yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start tracking your health metrics to see them here
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                Log Your First Metric
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentMetrics.map(metric => (
                <div key={metric.id} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium capitalize">
                        {metric.metric_type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex text-sm text-muted-foreground mt-1">
                      <span className="font-medium mr-2">
                        {metric.value} {metric.metric_type.includes('blood_pressure') ? 'mmHg' : 
                                    metric.metric_type === 'heart_rate' ? 'bpm' :
                                    metric.metric_type === 'weight' ? 'kg' :
                                    metric.metric_type === 'temperature' ? '°C' : ''}
                      </span>
                      <span>
                        {format(parseISO(metric.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {metric.notes && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {metric.notes}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMetric(metric.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Health Metric</DialogTitle>
            <DialogDescription>
              Record your health metrics to track your wellbeing over time
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="metric-type" className="text-right">
                Metric
              </Label>
              <Select
                value={newEntry.metric_type}
                onValueChange={(value) => setNewEntry({...newEntry, metric_type: value})}
              >
                <SelectTrigger id="metric-type" className="col-span-3">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heart_rate">Heart Rate</SelectItem>
                  <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="temperature">Body Temperature</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="metric-date" className="text-right">
                Date
              </Label>
              <Input
                id="metric-date"
                type="date"
                value={newEntry.date}
                onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="metric-value" className="text-right">
                Value
              </Label>
              <div className="col-span-3 flex items-center">
                <Input
                  id="metric-value"
                  placeholder={
                    newEntry.metric_type === "blood_pressure" 
                      ? "e.g. 120/80" 
                      : "Enter value"
                  }
                  value={newEntry.value}
                  onChange={(e) => setNewEntry({...newEntry, value: e.target.value})}
                  className="flex-1"
                />
                <div className="ml-2 text-sm text-muted-foreground">
                  {newEntry.metric_type === "blood_pressure" 
                    ? "mmHg"
                    : newEntry.metric_type === "heart_rate" ? "bpm" :
                      newEntry.metric_type === "weight" ? "kg" :
                      newEntry.metric_type === "temperature" ? "°C" : ""
                  }
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="metric-notes" className="text-right">
                Notes
              </Label>
              <Input
                id="metric-notes"
                placeholder="Any additional information (optional)"
                value={newEntry.notes}
                onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEntry} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Metric
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricSummaryCard({ 
  title, 
  latestValues, 
  metricType 
}: { 
  title: string; 
  latestValues: Record<string, HealthMetric>; 
  metricType: string;
}) {
  const metricInfo = metricTypes[metricType];
  const latestValue = latestValues[metricType];
  
  if (!metricInfo) return null;
  
  const hasData = !!latestValue;
  const status = hasData ? getValueStatus(metricType, latestValue.value) : null;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="flex flex-col">
            <div className="flex items-center">
              <div className={cn(
                "text-2xl font-bold mr-2",
                status === "normal" ? "text-green-500" : 
                status === "high" ? "text-red-500" : "text-amber-500"
              )}>
                {/* Format value appropriately based on metric type */}
                {metricType === 'heart_rate' 
                  ? Math.round(latestValue.value) 
                  : latestValue.value.toFixed(metricInfo.decimalPlaces)
                }
              </div>
              <div className="text-sm text-muted-foreground">
                {metricInfo.unit}
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Recorded on {format(parseISO(latestValue.date), 'MMM d, yyyy')}
            </div>
            <div className="mt-2 text-xs">
              Normal range: {metricInfo.normalRange[0]}-{metricInfo.normalRange[1]} {metricInfo.unit}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground py-2">
            No data recorded
          </div>
        )}
      </CardContent>
    </Card>
  );
} 