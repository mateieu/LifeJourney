// Activity types and their measurement options
export type ActivityType = 'walking' | 'running' | 'cycling' | 'swimming' | 'yoga' | 'meditation' | 'strength' | 'water' | 'sleep';

export interface MeasurementOption {
  value: string;
  label: string;
  conversionFactor?: number; // For converting between units
}

// Default measurement unit for each activity type
export const defaultMeasurements: Record<ActivityType, string> = {
  walking: 'step',
  running: 'km',
  cycling: 'km',
  swimming: 'meter',
  yoga: 'minute',
  meditation: 'minute',
  strength: 'minute',
  water: 'glass',
  sleep: 'hour'
};

// Add this mapping of activity types to their measurement options
export const activityMeasurements: Record<ActivityType, MeasurementOption[]> = {
  walking: [
    { value: 'step', label: 'Steps' },
    { value: 'km', label: 'Kilometers', conversionFactor: 1 },
    { value: 'mile', label: 'Miles', conversionFactor: 1.60934 } // 1 mile = 1.60934 km
  ],
  running: [
    { value: 'km', label: 'Kilometers', conversionFactor: 1 },
    { value: 'mile', label: 'Miles', conversionFactor: 1.60934 },
    { value: 'minute', label: 'Minutes' }
  ],
  cycling: [
    { value: 'km', label: 'Kilometers', conversionFactor: 1 },
    { value: 'mile', label: 'Miles', conversionFactor: 1.60934 },
    { value: 'minute', label: 'Minutes' }
  ],
  swimming: [
    { value: 'meter', label: 'Meters', conversionFactor: 1 },
    { value: 'km', label: 'Kilometers', conversionFactor: 1000 },
    { value: 'yard', label: 'Yards', conversionFactor: 0.9144 }, // 1 yard = 0.9144 meters
    { value: 'minute', label: 'Minutes' }
  ],
  yoga: [
    { value: 'minute', label: 'Minutes', conversionFactor: 1 },
    { value: 'hour', label: 'Hours', conversionFactor: 60 }
  ],
  meditation: [
    { value: 'minute', label: 'Minutes', conversionFactor: 1 },
    { value: 'hour', label: 'Hours', conversionFactor: 60 }
  ],
  strength: [
    { value: 'minute', label: 'Minutes', conversionFactor: 1 },
    { value: 'hour', label: 'Hours', conversionFactor: 60 },
    { value: 'rep', label: 'Repetitions' }
  ],
  water: [
    { value: 'glass', label: 'Glasses' },
    { value: 'milliliter', label: 'Milliliters' },
    { value: 'fluidOunce', label: 'Fluid Ounces' },
    { value: 'cup', label: 'Cups' }
  ],
  sleep: [
    { value: 'hour', label: 'Hours', conversionFactor: 1 },
    { value: 'minute', label: 'Minutes', conversionFactor: 1/60 }
  ]
};

// Helper function to get an appropriate default target based on activity type and measurement unit
export function getDefaultTarget(activityType: string, value = 0, measurementUnit?: string): number {
  // Use the provided measurement unit or fall back to default
  const unit = measurementUnit || defaultMeasurements[activityType as ActivityType] || 'count';
  
  switch(activityType) {
    case 'walking':
      return unit === 'step' ? 10000 : 
             unit === 'km' ? 5 : 
             unit === 'mile' ? 3 : 10000;
    case 'running':
      return unit === 'km' ? 5 : 
             unit === 'mile' ? 3 : 
             unit === 'minute' ? 30 : 5;
    case 'cycling':
      return unit === 'km' ? 20 : 
             unit === 'mile' ? 12 : 
             unit === 'minute' ? 45 : 20;
    case 'swimming':
      return unit === 'meter' ? 1000 : 
             unit === 'km' ? 1 : 
             unit === 'yard' ? 1000 : 
             unit === 'minute' ? 30 : 1000;
    case 'yoga':
    case 'meditation':
      return unit === 'minute' ? 30 : 
             unit === 'hour' ? 0.5 : 30;
    case 'strength':
      return unit === 'minute' ? 45 : 
             unit === 'hour' ? 0.75 : 
             unit === 'rep' ? 15 : 45;
    case 'water':
      return unit === 'glass' ? 8 : 
             unit === 'milliliter' ? 2000 : 
             unit === 'fluidOunce' ? 64 : 
             unit === 'cup' ? 8 : 8;
    case 'sleep':
      return unit === 'hour' ? 8 : 
             unit === 'minute' ? 480 : 8;
    default:
      // If we don't know, just make the target slightly higher than value
      return Math.max(value * 1.2, 10);
  }
}

// Helper function to get appropriate unit label for different activity types
export function getUnitLabel(activityType: string, measurementUnit?: string): string {
  // If a specific measurement unit is provided, use it
  if (measurementUnit) {
    return measurementUnit;
  }
  
  // Check if the activity type is in our map
  if (activityType in defaultMeasurements) {
    return defaultMeasurements[activityType as ActivityType];
  }
  
  // Default fallback
  return 'units';
} 