import { format, formatDistance, formatRelative, addDays, parseISO, isValid } from 'date-fns';

export function useDateFormat() {
  const formatDate = (date: Date | string | null | undefined, formatStr: string = 'MMM d, yyyy') => {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return '';
      return format(dateObj, formatStr);
    } catch (e) {
      return '';
    }
  };
  
  const getRelativeTime = (date: Date | string | null | undefined) => {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return '';
      return formatDistance(dateObj, new Date(), { addSuffix: true });
    } catch (e) {
      return '';
    }
  };
  
  const getTimeRemaining = (targetDate: Date | string | null | undefined) => {
    if (!targetDate) return "No deadline";
    
    try {
      const target = typeof targetDate === 'string' ? parseISO(targetDate) : targetDate;
      if (!isValid(target)) return "Invalid date";
      
      const today = new Date();
      const diffInTime = target.getTime() - today.getTime();
      const diffInDays = Math.round(diffInTime / (1000 * 60 * 60 * 24));
      
      if (diffInDays < 0) {
        return `${Math.abs(diffInDays)} days overdue`;
      } else if (diffInDays === 0) {
        return "Due today";
      } else if (diffInDays === 1) {
        return "Due tomorrow";
      } else if (diffInDays < 7) {
        return `${diffInDays} days left`;
      } else if (diffInDays < 30) {
        return `${Math.floor(diffInDays / 7)} weeks left`;
      } else {
        return `${Math.floor(diffInDays / 30)} months left`;
      }
    } catch (e) {
      return "Invalid date";
    }
  };
  
  return { formatDate, getRelativeTime, getTimeRemaining };
} 