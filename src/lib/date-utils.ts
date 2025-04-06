import { addDays as fnsAddDays, format, parse, isValid } from "date-fns";

export function addDays(date: Date | undefined, days: number): Date {
  return date ? fnsAddDays(date, days) : fnsAddDays(new Date(), days);
}

export function formatDate(date: Date | undefined, formatString: string = "PPP"): string {
  return date && isValid(date) ? format(date, formatString) : "";
}

export function parseDate(dateString: string, formatString: string = "yyyy-MM-dd"): Date | undefined {
  try {
    const date = parse(dateString, formatString, new Date());
    return isValid(date) ? date : undefined;
  } catch {
    return undefined;
  }
}

export function getRelativeTimeLabel(targetDate: string | Date | null | undefined): string {
  if (!targetDate) return "No deadline";
  
  const target = targetDate instanceof Date ? targetDate : new Date(targetDate);
  const today = new Date();
  const diffInMs = target.getTime() - today.getTime();
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
  
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
} 