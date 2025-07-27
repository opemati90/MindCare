import { 
  format, 
  formatDistance, 
  isToday, 
  isTomorrow, 
  isYesterday, 
  addDays, 
  subDays,
  startOfDay,
  endOfDay,
  parseISO,
  isValid
} from 'date-fns';

/**
 * Parse date string or return Date object
 */
export const parseDate = (date: Date | string): Date => {
  if (typeof date === 'string') {
    const parsed = parseISO(date);
    return isValid(parsed) ? parsed : new Date(date);
  }
  return date;
};

/**
 * Check if date is valid
 */
export const isValidDate = (date: Date | string): boolean => {
  const parsed = parseDate(date);
  return isValid(parsed);
};

/**
 * Get start of day
 */
export const getStartOfDay = (date: Date | string): Date => {
  return startOfDay(parseDate(date));
};

/**
 * Get end of day
 */
export const getEndOfDay = (date: Date | string): Date => {
  return endOfDay(parseDate(date));
};

/**
 * Add days to date
 */
export const addDaysToDate = (date: Date | string, days: number): Date => {
  return addDays(parseDate(date), days);
};

/**
 * Subtract days from date
 */
export const subtractDaysFromDate = (date: Date | string, days: number): Date => {
  return subDays(parseDate(date), days);
};

/**
 * Get date range for a period
 */
export const getDateRange = (period: 'today' | 'yesterday' | 'week' | 'month'): { start: Date; end: Date } => {
  const now = new Date();
  
  switch (period) {
    case 'today':
      return {
        start: getStartOfDay(now),
        end: getEndOfDay(now),
      };
    case 'yesterday':
      const yesterday = subtractDaysFromDate(now, 1);
      return {
        start: getStartOfDay(yesterday),
        end: getEndOfDay(yesterday),
      };
    case 'week':
      return {
        start: getStartOfDay(subtractDaysFromDate(now, 7)),
        end: getEndOfDay(now),
      };
    case 'month':
      return {
        start: getStartOfDay(subtractDaysFromDate(now, 30)),
        end: getEndOfDay(now),
      };
    default:
      return {
        start: getStartOfDay(now),
        end: getEndOfDay(now),
      };
  }
};

/**
 * Check if date is in the past
 */
export const isPastDate = (date: Date | string): boolean => {
  return parseDate(date) < new Date();
};

/**
 * Check if date is in the future
 */
export const isFutureDate = (date: Date | string): boolean => {
  return parseDate(date) > new Date();
};

/**
 * Get age from birth date
 */
export const getAge = (birthDate: Date | string): number => {
  const birth = parseDate(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Format date for API (ISO string)
 */
export const formatForAPI = (date: Date | string): string => {
  return parseDate(date).toISOString();
};

/**
 * Format date for input field (YYYY-MM-DD)
 */
export const formatForInput = (date: Date | string): string => {
  return format(parseDate(date), 'yyyy-MM-dd');
};

/**
 * Format time for input field (HH:mm)
 */
export const formatTimeForInput = (date: Date | string): string => {
  return format(parseDate(date), 'HH:mm');
};
