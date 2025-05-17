/**
 * Date utility functions for Plaid API
 */

/**
 * Format a date for Plaid API requests
 * @param date Date to format
 * @returns formatted date string (YYYY-MM-DD)
 */
export function formatDateForPlaid(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get a date for the specified number of days ago
 * @param daysAgo Number of days ago
 * @returns Date object
 */
export function getDateDaysAgo(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

/**
 * Format a date in a user-friendly format
 * @param date Date to format
 * @returns formatted date string (MMM DD, YYYY)
 */
export function formatDateForDisplay(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Get the current date as a string in YYYY-MM-DD format
 * @returns Current date as string
 */
export function getCurrentDateFormatted(): string {
  return formatDateForPlaid(new Date());
}