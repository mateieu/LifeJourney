import { formatDate, getDatesBetween, calculateDuration } from '../utils/date-utils';

describe('Date Utilities', () => {
  describe('formatDate', () => {
    it('formats a date string correctly', () => {
      const date = new Date('2023-05-15T12:00:00');
      expect(formatDate(date, 'yyyy-MM-dd')).toBe('2023-05-15');
    });
    
    it('handles invalid dates', () => {
      expect(formatDate(null as any, 'yyyy-MM-dd')).toBe('');
      expect(formatDate(undefined as any, 'yyyy-MM-dd')).toBe('');
      expect(formatDate('invalid-date' as any, 'yyyy-MM-dd')).toBe('');
    });
  });

  describe('getDatesBetween', () => {
    it('returns an array of dates between start and end', () => {
      const start = new Date(2023, 0, 1); // Jan 1, 2023
      const end = new Date(2023, 0, 3);   // Jan 3, 2023
      const result = getDatesBetween(start, end);
      
      expect(result.length).toBe(3);
      expect(result[0].getFullYear()).toBe(2023);
      expect(result[0].getMonth()).toBe(0);
      expect(result[0].getDate()).toBe(1);
      
      expect(result[2].getFullYear()).toBe(2023);
      expect(result[2].getMonth()).toBe(0);
      expect(result[2].getDate()).toBe(3);
    });
    
    it('returns a single date when start and end are the same', () => {
      const date = new Date(2023, 0, 1);
      const result = getDatesBetween(date, date);
      
      expect(result.length).toBe(1);
      expect(result[0].getFullYear()).toBe(2023);
      expect(result[0].getMonth()).toBe(0);
      expect(result[0].getDate()).toBe(1);
    });
  });

  describe('calculateDuration', () => {
    it('calculates duration between times on the same day', () => {
      const startTime = '22:00';
      const endTime = '23:30';
      
      expect(calculateDuration(startTime, endTime)).toBe(1.5);
    });
    
    it('calculates duration when end time is on the next day', () => {
      const startTime = '22:00';
      const endTime = '06:30';
      
      expect(calculateDuration(startTime, endTime)).toBe(8.5);
    });
    
    it('returns 0 for invalid inputs', () => {
      expect(calculateDuration('', '23:30')).toBe(0);
      expect(calculateDuration('22:00', '')).toBe(0);
      expect(calculateDuration('invalid', '23:30')).toBe(0);
    });
  });
}); 