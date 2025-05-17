/**
 * Utility functions for working with dates in the Plaid API
 */

/**
 * Get a date object for today
 */
export function getToday(): Date {
  return new Date();
}

/**
 * Get a date object for N days ago
 * @param days Number of days to go back
 */
export function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Format a date as YYYY-MM-DD (required by Plaid API)
 * @param date Date to format
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}