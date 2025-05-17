/**
 * Format a date object to YYYY-MM-DD format
 * @param date The date to format
 * @returns Formatted date string in YYYY-MM-DD format
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Get a date from N days ago
 * @param days Number of days to subtract from current date
 * @returns Date object representing N days ago
 */
export function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Get today's date
 * @returns Date object for today
 */
export function getToday(): Date {
  return new Date();
}