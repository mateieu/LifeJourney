import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAllowedUnits } from '@/lib/measurements';
import { useMeasurementPreferences } from '@/hooks/use-measurement-preferences';

interface MeasurementUnitSelectorProps {
  activityType: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  usePreferredAsDefault?: boolean;
}

export function MeasurementUnitSelector({
  activityType,
  value,
  onChange,
  label = 'Measurement Unit',
  required = true,
  usePreferredAsDefault = true,
}: MeasurementUnitSelectorProps) {
  const [availableUnits, setAvailableUnits] = useState<Array<{id: string, label: string}>>([]);
  const { getPreferredUnit, setPreference } = useMeasurementPreferences();
  
  useEffect(() => {
    if (activityType) {
      const units = getAllowedUnits(activityType);
      setAvailableUnits(units);
      
      // Set to preferred unit if requested and no value is already selected
      if (usePreferredAsDefault && !value) {
        const preferredUnit = getPreferredUnit(activityType);
        onChange(preferredUnit);
      }
    }
  }, [activityType, usePreferredAsDefault, value, onChange, getPreferredUnit]);
  
  const handleChange = (newValue: string) => {
    onChange(newValue);
    
    // Also update user preferences
    setPreference(activityType, newValue);
  };
  
  if (!activityType || availableUnits.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-2">
      <Label htmlFor="measurementUnit">{label}</Label>
      <Select
        value={value}
        onValueChange={handleChange}
        required={required}
      >
        <SelectTrigger id="measurementUnit" className="w-full">
          <SelectValue placeholder="Select unit" />
        </SelectTrigger>
        <SelectContent>
          {availableUnits.map((unit) => (
            <SelectItem key={unit.id} value={unit.id}>
              {unit.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
