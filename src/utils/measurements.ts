export function convertMeasurement(value: number, fromUnit: string, toUnit: string, activity?: string): number | null {
  // If units are the same, just return the value
  if (fromUnit === toUnit) return value;
  
  // Check if conversion is valid
  if (!isValidConversion(fromUnit, toUnit)) return null;
  
  // Distance conversions
  if (fromUnit === 'km' && toUnit === 'meter') return value * 1000;
  if (fromUnit === 'meter' && toUnit === 'km') return value / 1000;
  if (fromUnit === 'mile' && toUnit === 'km') return value * 1.60934;
  if (fromUnit === 'km' && toUnit === 'mile') return value / 1.60934;
  
  // Time conversions
  if (fromUnit === 'hour' && toUnit === 'minute') return value * 60;
  if (fromUnit === 'minute' && toUnit === 'hour') return value / 60;
  if (fromUnit === 'hour' && toUnit === 'second') return value * 3600;
  if (fromUnit === 'second' && toUnit === 'hour') return value / 3600;
  if (fromUnit === 'minute' && toUnit === 'second') return value * 60;
  if (fromUnit === 'second' && toUnit === 'minute') return value / 60;
  
  // Volume conversions
  if (fromUnit === 'liter' && toUnit === 'milliliter') return value * 1000;
  if (fromUnit === 'milliliter' && toUnit === 'liter') return value / 1000;
  if (fromUnit === 'gallon' && toUnit === 'liter') return value * 3.78541;
  if (fromUnit === 'liter' && toUnit === 'gallon') return value / 3.78541;
  if (fromUnit === 'fluidOunce' && toUnit === 'cup') return value / 8;
  if (fromUnit === 'cup' && toUnit === 'fluidOunce') return value * 8;
  
  // Activity specific
  if (activity === 'walking') {
    if (fromUnit === 'step' && toUnit === 'km') return value / 1312;
    if (fromUnit === 'km' && toUnit === 'step') return value * 1312;
    if (fromUnit === 'step' && toUnit === 'mile') return (value / 1312) / 1.60934;
    if (fromUnit === 'mile' && toUnit === 'step') return (value * 1.60934) * 1312;
  }
  
  // Invalid conversions should return null
  return null;
}

export function getFormattedMeasurement(value: number, unit: string): string {
  switch (unit) {
    case 'km':
      return `${value.toFixed(2)} Kilometers`;
    case 'meter':
      return `${value} Meters`;
    case 'mile':
      return `${value.toFixed(2)} Miles`;
    case 'step':
      return `${Math.round(value)} Steps`;
    case 'hour':
      return `${value.toFixed(1)} Hours`;
    case 'minute':
      return `${value} Minutes`;
    case 'second':
      return `${value} Seconds`;
    case 'liter':
      return `${value.toFixed(2)} Liters`;
    case 'milliliter':
      return `${value} Milliliters`;
    case 'fluidOunce':
      return `${value} fl oz`;
    case 'cup':
      return `${value} cups`;
    default:
      return `${value} ${unit}`;
  }
}

export function getDefaultUnit(activity: string): string {
  switch (activity) {
    case 'walking':
      return 'step';
    case 'running':
      return 'km';
    case 'swimming':
      return 'meter';
    case 'sleep':
      return 'hour';
    default:
      return 'km';
  }
}

export function getAllowedUnits(activity: string): { id: string; label: string }[] {
  if (activity === 'walking') {
    return [
      { id: 'step', label: 'Steps' },
      { id: 'km', label: 'Kilometers' },
      { id: 'mile', label: 'Miles' }
    ];
  }
  
  if (activity === 'swimming') {
    return [
      { id: 'meter', label: 'Meters' },
      { id: 'km', label: 'Kilometers' },
      { id: 'lap', label: 'Laps' }
    ];
  }
  
  if (activity === 'sleep') {
    return [
      { id: 'hour', label: 'Hours' },
      { id: 'minute', label: 'Minutes' }
    ];
  }
  
  return [
    { id: 'km', label: 'Kilometers' },
    { id: 'mile', label: 'Miles' },
    { id: 'meter', label: 'Meters' }
  ];
}

export function isValidConversion(fromUnit: string, toUnit: string): boolean {
  const distanceUnits = ['km', 'meter', 'mile', 'step'];
  const timeUnits = ['minute', 'hour', 'second'];
  const volumeUnits = ['liter', 'milliliter', 'gallon', 'cup', 'fluidOunce'];
  
  return (
    (distanceUnits.includes(fromUnit) && distanceUnits.includes(toUnit)) ||
    (timeUnits.includes(fromUnit) && timeUnits.includes(toUnit)) ||
    (volumeUnits.includes(fromUnit) && volumeUnits.includes(toUnit))
  );
}

export function getEquivalentMeasurements(value: number, unit: string, activity: string) {
  const result: Record<string, number> = { [unit]: value };
  
  if (activity === 'walking') {
    if (unit === 'step') {
      result.km = value / 1312;
      result.mile = result.km / 1.60934;
    } else if (unit === 'km') {
      result.step = value * 1312;
      result.mile = value / 1.60934;
    } else if (unit === 'mile') {
      result.km = value * 1.60934;
      result.step = result.km * 1312;
    }
  }
  
  return result;
} 