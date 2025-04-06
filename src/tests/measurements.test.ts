import { describe, it, expect } from 'vitest';
import {
  convertMeasurement,
  getFormattedMeasurement,
  getDefaultUnit,
  getAllowedUnits,
  isValidConversion,
  getEquivalentMeasurements
} from '../lib/measurements';

describe('Measurement Unit System', () => {
  describe('Unit Conversion', () => {
    it('should correctly convert between units of the same type', () => {
      // Distance conversions
      expect(convertMeasurement(1, 'km', 'meter')).toBeCloseTo(1000);
      expect(convertMeasurement(1, 'mile', 'km')).toBeCloseTo(1.60934);
      
      // Time conversions
      expect(convertMeasurement(1, 'hour', 'minute')).toBe(60);
      expect(convertMeasurement(30, 'minute', 'hour')).toBe(0.5);
      
      // Volume conversions
      expect(convertMeasurement(1, 'liter', 'milliliter')).toBe(1000);
      expect(convertMeasurement(8, 'fluidOunce', 'cup')).toBeCloseTo(1, 1);
    });
    
    it('should handle activity-specific conversions', () => {
      // Steps to distance (depends on activity)
      expect(convertMeasurement(1312, 'step', 'km', 'walking')).toBeCloseTo(1, 1);
      expect(convertMeasurement(1, 'km', 'step', 'walking')).toBeCloseTo(1312, 0);
    });
    
    it('should return null for invalid conversions', () => {
      // Can't convert between different unit types
      expect(convertMeasurement(1, 'km', 'hour')).toBeNull();
      expect(convertMeasurement(1, 'step', 'milliliter')).toBeNull();
    });
    
    it('should handle edge cases appropriately', () => {
      // Zero values
      expect(convertMeasurement(0, 'km', 'meter')).toBe(0);
      
      // Very large values
      expect(convertMeasurement(1000000, 'meter', 'km')).toBe(1000);
      
      // Very small values
      expect(convertMeasurement(0.001, 'km', 'meter')).toBe(1);
    });
  });
  
  describe('Formatting', () => {
    it('should format measurements according to their type', () => {
      // Distance formatting
      expect(getFormattedMeasurement(1.5, 'km')).toBe('1.50 Kilometers');
      expect(getFormattedMeasurement(1500, 'meter')).toBe('1500 Meters');
      
      // Time formatting
      expect(getFormattedMeasurement(1.5, 'hour')).toBe('1.5 Hours');
      expect(getFormattedMeasurement(0.5, 'hour')).toBe('30 Minutes'); // Convert small hours to minutes
      
      // Count formatting
      expect(getFormattedMeasurement(1500, 'step')).toBe('1500 Steps');
    });
  });
  
  describe('Activity Unit Management', () => {
    it('should return the correct default unit for activities', () => {
      expect(getDefaultUnit('walking')).toBe('step');
      expect(getDefaultUnit('swimming')).toBe('meter');
      expect(getDefaultUnit('sleep')).toBe('hour');
    });
    
    it('should return allowed units for an activity', () => {
      const walkingUnits = getAllowedUnits('walking');
      expect(walkingUnits).toHaveLength(3);
      expect(walkingUnits.map(u => u.id)).toContain('step');
      expect(walkingUnits.map(u => u.id)).toContain('km');
      expect(walkingUnits.map(u => u.id)).toContain('mile');
    });
    
    it('should validate unit conversion compatibility', () => {
      // Valid conversions (same type)
      expect(isValidConversion('km', 'mile')).toBe(true);
      expect(isValidConversion('minute', 'hour')).toBe(true);
      
      // Invalid conversions (different types)
      expect(isValidConversion('km', 'hour')).toBe(false);
      expect(isValidConversion('step', 'milliliter')).toBe(false);
    });
  });
  
  describe('Equivalent Measurements', () => {
    it('should calculate all equivalent measurements for an activity', () => {
      const equivalents = getEquivalentMeasurements(5000, 'step', 'walking');
      
      expect(equivalents).toHaveProperty('step');
      expect(equivalents).toHaveProperty('km');
      expect(equivalents).toHaveProperty('mile');
      
      expect(equivalents.step.value).toBeCloseTo(5000);
      expect(equivalents.km.value).toBeCloseTo(3.8095, 1);
      expect(equivalents.mile.value).toBeCloseTo(2.4855, 1);
    });
  });
});
