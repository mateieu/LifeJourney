/**
 * Measurement unit definitions and conversion utilities
 */

export interface MeasurementUnit {
  id: string;
  label: string;
  abbreviation: string;
  allowedActivityTypes: string[];
  conversionFactor?: number; // For conversion to base unit
  baseUnit?: string; // Reference to the base unit id for this measurement type
}

// Define all the measurement units available in the app
export const MEASUREMENT_UNITS: MeasurementUnit[] = [
  // Distance units
  {
    id: 'kilometers',
    label: 'Kilometers',
    abbreviation: 'km',
    allowedActivityTypes: ['running', 'walking', 'cycling', 'swimming', 'hiking'],
    conversionFactor: 1, // Base unit for distance
  },
  {
    id: 'miles',
    label: 'Miles',
    abbreviation: 'mi',
    allowedActivityTypes: ['running', 'walking', 'cycling', 'swimming', 'hiking'],
    conversionFactor: 1.60934, // 1 mile = 1.60934 km
    baseUnit: 'kilometers',
  },
  {
    id: 'meters',
    label: 'Meters',
    abbreviation: 'm',
    allowedActivityTypes: ['running', 'walking', 'swimming'],
    conversionFactor: 0.001, // 1 meter = 0.001 km
    baseUnit: 'kilometers',
  },
  
  // Weight units
  {
    id: 'kilograms',
    label: 'Kilograms',
    abbreviation: 'kg',
    allowedActivityTypes: ['weight_lifting', 'weight', 'bodyweight'],
    conversionFactor: 1, // Base unit for weight
  },
  {
    id: 'pounds',
    label: 'Pounds',
    abbreviation: 'lbs',
    allowedActivityTypes: ['weight_lifting', 'weight', 'bodyweight'],
    conversionFactor: 0.453592, // 1 pound = 0.453592 kg
    baseUnit: 'kilograms',
  },
  
  // Time units
  {
    id: 'minutes',
    label: 'Minutes',
    abbreviation: 'min',
    allowedActivityTypes: ['yoga', 'meditation', 'stretching', 'plank'],
    conversionFactor: 1, // Base unit for time
  },
  {
    id: 'hours',
    label: 'Hours',
    abbreviation: 'hr',
    allowedActivityTypes: ['yoga', 'meditation', 'stretching'],
    conversionFactor: 60, // 1 hour = 60 minutes
    baseUnit: 'minutes',
  },
  {
    id: 'seconds',
    label: 'Seconds',
    abbreviation: 'sec',
    allowedActivityTypes: ['plank'],
    conversionFactor: 1/60, // 1 second = 1/60 minutes
    baseUnit: 'minutes',
  },
  
  // Count units
  {
    id: 'reps',
    label: 'Repetitions',
    abbreviation: 'reps',
    allowedActivityTypes: ['pushups', 'pullups', 'situps', 'squats', 'strength_training'],
  },
  {
    id: 'sets',
    label: 'Sets',
    abbreviation: 'sets',
    allowedActivityTypes: ['strength_training'],
  }
];

// Get all available activity types
export function getAllActivityTypes(): string[] {
  const allTypes = new Set<string>();
  
  MEASUREMENT_UNITS.forEach(unit => {
    unit.allowedActivityTypes.forEach(type => {
      allTypes.add(type);
    });
  });
  
  return Array.from(allTypes);
}

// Get human-readable label for an activity type
export function getActivityLabel(activityType: string): string {
  // Convert from snake_case to Title Case
  return activityType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Get allowed units for a specific activity type
export function getAllowedUnits(activityType: string): MeasurementUnit[] {
  return MEASUREMENT_UNITS.filter(unit => 
    unit.allowedActivityTypes.includes(activityType)
  );
}

// Get a unit by its ID
export function getUnitById(unitId: string): MeasurementUnit | undefined {
  return MEASUREMENT_UNITS.find(unit => unit.id === unitId);
}

// Convert a measurement from one unit to another
export function convertMeasurement(
  value: number,
  fromUnitId: string,
  toUnitId: string
): number {
  // If units are the same, no conversion needed
  if (fromUnitId === toUnitId) return value;
  
  const fromUnit = getUnitById(fromUnitId);
  const toUnit = getUnitById(toUnitId);
  
  // Can't convert if either unit is not found
  if (!fromUnit || !toUnit) return value;
  
  // Can't convert if units don't share a base unit
  if (fromUnit.baseUnit !== toUnit.baseUnit && 
      fromUnit.id !== toUnit.baseUnit && 
      toUnit.id !== fromUnit.baseUnit) {
    return value;
  }
  
  // Get base unit
  const baseUnitId = fromUnit.baseUnit || fromUnit.id;
  
  // Convert to base unit first
  let valueInBaseUnit = value;
  if (fromUnit.conversionFactor && fromUnit.id !== baseUnitId) {
    valueInBaseUnit = value * fromUnit.conversionFactor;
  }
  
  // Then convert from base unit to target unit
  if (toUnit.baseUnit === baseUnitId && toUnit.conversionFactor) {
    return valueInBaseUnit / toUnit.conversionFactor;
  }
  
  return valueInBaseUnit;
}

// Format a measurement value with its unit
export function formatMeasurement(
  value: number,
  unitId: string,
  decimalPlaces: number = 2
): string {
  const unit = getUnitById(unitId);
  
  if (!unit) return `${value}`;
  
  const formattedValue = Number.isInteger(value) 
    ? value.toString() 
    : value.toFixed(decimalPlaces);
    
  return `${formattedValue} ${unit.abbreviation}`;
}

// Get all measurement types (useful for UI dropdowns)
export function getAllMeasurementTypes(): MeasurementUnit[] {
  return MEASUREMENT_UNITS;
}

// Get a list of activity types for a given measurement type
export function getActivitiesForMeasurementType(measurementTypeId: string): string[] {
  return MEASUREMENT_UNITS
    .filter(unit => unit.allowedActivityTypes.includes(measurementTypeId))
    .map(unit => unit.id);
}

// Get the default measurement unit for an activity type
export function getDefaultUnit(activityType: string): string {
  const allowedUnits = getAllowedUnits(activityType);
  
  if (allowedUnits.length === 0) {
    return ''; // No units available for this activity type
  }
  
  // Find a base unit if possible
  const baseUnit = allowedUnits.find(unit => !unit.baseUnit);
  
  // Return the base unit if found, otherwise return the first allowed unit
  return baseUnit ? baseUnit.id : allowedUnits[0].id;
}

// Convert measurement to user's preferred unit
export function convertToPreferred(
  value: number,
  currentUnitId: string,
  activityType: string,
  preferredUnitId?: string
): { value: number; unit: string } {
  // If no preferred unit specified, get default
  const targetUnitId = preferredUnitId || getDefaultUnit(activityType);
  
  // Do the conversion
  const convertedValue = convertMeasurement(value, currentUnitId, targetUnitId);
  
  return {
    value: convertedValue,
    unit: targetUnitId
  };
} 