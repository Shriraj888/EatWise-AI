/**
 * Formatting utilities for EatWise AI.
 */

/**
 * Format a date to YYYY-MM-DD string.
 * @param {Date} date
 * @returns {string}
 */
export const formatDateKey = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

/**
 * Format date for display (e.g., "Mon, Apr 7, 2026").
 * @param {Date} date
 * @returns {string}
 */
export const formatDisplayDate = (date = new Date()) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format time from Date or ISO string (e.g., "2:30 PM").
 * @param {Date|string} date
 * @returns {string}
 */
export const formatTime = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Get greeting based on time of day.
 * @returns {string}
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

/**
 * Format number with commas (e.g., 1,234).
 * @param {number} num
 * @returns {string}
 */
export const formatNumber = (num) => {
  return Math.round(num).toLocaleString();
};

/**
 * Format macro grams (e.g., "45g").
 * @param {number} grams
 * @returns {string}
 */
export const formatGrams = (grams) => {
  return `${Math.round(grams)}g`;
};

/**
 * Truncate text to a max length.
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Generate a unique ID.
 * @returns {string}
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};
