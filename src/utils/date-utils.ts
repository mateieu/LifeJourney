import { format as fnsFormat, parseISO, eachDayOfInterval } from 'date-fns';

/**
 * Format a date using date-fns format patterns
 */
export function formatDate(date: Date | string | null | undefined, formatString: string): string {
  try {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return fnsFormat(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Get an array of dates between start and end (inclusive)
 */
export function getDatesBetween(start: Date, end: Date): Date[] {
  if (start > end) {
    return [];
  }
  
  return eachDayOfInterval({ start, end });
}

/**
 * Calculate duration between two time strings (HH:MM format)
 * Handles overnight periods (when end time is earlier than start time)
 */
export function calculateDuration(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  
  try {
    // Parse hours and minutes from time strings
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
      return 0;
    }
    
    let duration = (endHours - startHours) + (endMinutes - startMinutes) / 60;
    
    // If duration is negative, it means the end time is on the next day
    if (duration < 0) {
      duration += 24;
    }
    
    return Math.round(duration * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error calculating duration:', error);
    return 0;
  }
} 