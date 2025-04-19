/**
 * formatDate.ts
 * Utility function for consistent date formatting across the application
 *
 * CALLED BY:
 * - site/src/components/changelog/ChangelogEntry.astro
 * - site/src/components/articles/PostCard.astro
 * - site/src/components/articles/PostCardFeature.astro
 * - [Add other components that use this as they are created]
 *
 * @param {Date | string | number} date - Date to format, accepts Date object, ISO string, or timestamp (ms)
 * @returns {string} Formatted date string in the format "MMMM D, YYYY"
 *
 * Defensive logic: Handles Date, string, or number (timestamp). Always produces a valid Date object or returns fallback.
 *
 * @example
 * ```typescript
 * import { formatDate } from '../utils/formatDate';
 *
 * // Using with Date object
 * const date = new Date();
 * const formatted = formatDate(date); // "March 18, 2025"
 *
 * // Using with ISO string
 * const isoDate = "2025-03-18T22:00:00Z";
 * const formatted = formatDate(isoDate); // "March 18, 2025"
 *
 * // Using with timestamp 
 * const ts = Date.now();
 * const formatted = formatDate(ts); // "March 18, 2025"
 * ```
 */
export function formatDate(date: Date | string | number): string {
  // Defensive: Convert any input to Date object
  let dateObj: Date;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    return '';
  }

  // Defensive: If invalid date, return empty string
  if (isNaN(dateObj.valueOf())) {
    return '';
  }

  // Format options for consistent date display
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  // Use browser's Intl API for localized date formatting
  return dateObj.toLocaleDateString('en-US', options);
}

/**
 * Additional date formatting utilities can be added here as needed.
 * Follow the same pattern of comprehensive documentation and type safety.
 */
