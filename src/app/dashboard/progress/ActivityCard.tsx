"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Droplets, Moon } from "lucide-react";
import { 
  convertMeasurement, 
  getFormattedMeasurement, 
  getAllowedUnits,
  getUnitById
} from "@/lib/measurements";
import { useMeasurementPreferences } from "@/hooks/use-measurement-preferences";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  activity: {
    id: string;
    activity_type: string;
    value: number;
    measurement_unit?: string;
    completed_at: string;
  };
  delay?: number;
}

export function ActivityCard({ activity, delay = 0 }: ActivityCardProps) {
  const { activity_type, value, measurement_unit, completed_at } = activity;
  const { getPreferredUnit, setPreference } = useMeasurementPreferences();
  const initialMount = useRef(true);
  
  // Initialize with either the activity's unit or the user's preferred unit
  const [displayUnit, setDisplayUnit] = useState<string>(
    measurement_unit || getPreferredUnit(activity_type)
  );
  
  // Only set display unit once when component mounts
  useEffect(() => {
    if (initialMount.current) {
      setDisplayUnit(measurement_unit || getPreferredUnit(activity_type));
      initialMount.current = false;
    }
  }, [activity_type, measurement_unit, getPreferredUnit]);
  
  // Get the display value in the selected unit
  const displayValue = useMemo(() => {
    if (!measurement_unit || measurement_unit === displayUnit) {
      return value;
    }
    
    // Convert to selected display unit
    const converted = convertMeasurement(value, measurement_unit, displayUnit, activity_type);
    return converted !== null ? converted : value;
  }, [value, measurement_unit, displayUnit, activity_type]);
  
  // Get available units for this activity type
  const allowedUnits = useMemo(() => {
    return getAllowedUnits(activity_type);
  }, [activity_type]);
  
  // Activity icon mapping
  const getActivityIcon = () => {
    switch (activity_type) {
      case 'water': return <Droplets className="h-5 w-5 text-blue-500" />;
      case 'sleep': return <Moon className="h-5 w-5 text-indigo-500" />;
      default: return <Activity className="h-5 w-5 text-green-500" />;
    }
  };
  
  // Handle unit change without causing re-render loops
  const handleUnitChange = (newUnit: string) => {
    if (newUnit === displayUnit) return;
    
    setDisplayUnit(newUnit);
    setPreference(activity_type, newUnit);
  };
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 transform",
        "hover:shadow-md",
        delay > 0 ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      )}
      style={{ 
        transitionDelay: `${delay}ms` 
      }}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              {getActivityIcon()}
            </div>
            <h3 className="text-lg font-medium capitalize">{activity_type}</h3>
          </div>
          
          {/* Unit selector dropdown */}
          {allowedUnits.length > 1 && (
            <Select
              value={displayUnit}
              onValueChange={handleUnitChange}
            >
              <SelectTrigger className="h-8 px-2 w-auto min-w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allowedUnits.map(unit => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        {/* Activity value with unit display */}
        <div className="mt-3 flex items-end gap-1">
          <span className="text-3xl font-bold">
            {typeof displayValue === 'number' ? 
              displayValue >= 10000 ? 
                displayValue.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 
                displayValue >= 10 ? 
                  displayValue.toLocaleString(undefined, { maximumFractionDigits: 1 }) : 
                  displayValue.toLocaleString(undefined, { maximumFractionDigits: 2 })
              : displayValue
            }
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {getUnitById(displayUnit)?.label || displayUnit}
          </span>
        </div>
        
        {/* Original value (if converted) */}
        {measurement_unit && measurement_unit !== displayUnit && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Original: {getFormattedMeasurement(value, measurement_unit)}
          </div>
        )}
        
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {format(new Date(completed_at), 'MMM d, yyyy')}
        </div>
      </CardContent>
    </Card>
  );
} 