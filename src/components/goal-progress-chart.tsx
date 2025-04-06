"use client";

import { useEffect, useRef } from "react";
import { Tables } from "@/types/supabase";
import { format, subDays, eachDayOfInterval, parseISO } from "date-fns";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';

type Goal = Tables<"health_goals"> & {
  measurement_unit?: string;
};

interface GoalProgressChartProps {
  goal: Goal;
  showLabels?: boolean;
}

export function GoalProgressChart({ goal, showLabels = false }: GoalProgressChartProps) {
  // This would normally come from your database, but we'll simulate it for the demo
  const simulateProgressData = () => {
    const endDate = new Date();
    const startDate = goal.start_date 
      ? new Date(goal.start_date) 
      : subDays(endDate, 14);
    
    // Generate dates between start and now
    const dates = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Generate simulated progress data
    let currentValue = 0;
    const progressIncrement = (goal.current_value || 0) / dates.length;
    
    return dates.map((date, index) => {
      currentValue += progressIncrement * (0.5 + Math.random());
      return {
        date: format(date, "MMM dd"),
        value: Math.min(goal.target_value || 100, Math.max(0, currentValue)),
        fullDate: date,
      };
    });
  };

  const data = simulateProgressData();
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-sm text-sm">
          <p className="font-medium">{label}</p>
          <p className="text-primary">
            {payload[0].value.toFixed(1)} {goal.measurement_unit || "units"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 5, left: showLabels ? 20 : 5, bottom: showLabels ? 20 : 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        {showLabels && (
          <XAxis 
            dataKey="date" 
            fontSize={12}
            tickMargin={10}
            tick={{ fill: '#888' }}
          />
        )}
        {showLabels && (
          <YAxis 
            fontSize={12}
            tickMargin={8}
            tick={{ fill: '#888' }}
            domain={[0, goal.target_value || 100]}
          />
        )}
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine 
          y={goal.target_value} 
          label={{ value: 'Target', position: 'insideBottomRight', fill: '#888', fontSize: 12 }} 
          stroke="#888" 
          strokeDasharray="3 3" 
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
} 