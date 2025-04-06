"use client";

import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { getAllowedUnits, getUnitById } from "@/lib/measurements";
import { useMeasurementPreferences } from "@/hooks/use-measurement-preferences";

interface MeasurementUnitSelectorProps {
  activityType: string;
  value: string;
  onChange: (unit: string) => void;
  disabled?: boolean;
}

export function MeasurementUnitSelector({
  activityType,
  value,
  onChange,
  disabled = false,
}: MeasurementUnitSelectorProps) {
  const [units, setUnits] = useState<any[]>([]);
  const { getPreferredUnit, setPreference } = useMeasurementPreferences();
  
  // Load available units when activity type changes
  useEffect(() => {
    if (activityType) {
      const availableUnits = getAllowedUnits(activityType);
      setUnits(availableUnits);
      
      // If no value is selected yet, use the preferred unit
      if (!value) {
        const preferredUnit = getPreferredUnit(activityType);
        onChange(preferredUnit);
      }
    } else {
      setUnits([]);
    }
  }, [activityType, value, onChange, getPreferredUnit]);
  
  // Handle unit selection
  const handleUnitChange = (unitId: string) => {
    onChange(unitId);
    
    // Also update the user's preferences for this activity type
    if (activityType) {
      setPreference(activityType, unitId);
    }
  };
  
  // If we have no activity type, show disabled selector
  if (!activityType) {
    return (
      <Select disabled value="" onValueChange={() => {}}>
        <SelectTrigger>
          <SelectValue placeholder="Select activity first" />
        </SelectTrigger>
      </Select>
    );
  }
  
  return (
    <Select 
      value={value} 
      onValueChange={handleUnitChange} 
      disabled={disabled || units.length <= 1}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select unit">
          {value ? getUnitById(value)?.label || value : "Select unit"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {units.map((unit) => (
          <SelectItem key={unit.id} value={unit.id}>
            {unit.label} {unit.abbreviation ? `(${unit.abbreviation})` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 