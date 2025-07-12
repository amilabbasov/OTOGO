/**
 * Converts a date string from DD/MM/YYYY format to ISO format (YYYY-MM-DD)
 * @param date - Date string in DD/MM/YYYY format
 * @returns ISO formatted date string or null if invalid
 */
export function toIsoDate(date: string): string | null {
  if (!date || date.length !== 10) {
    return null;
  }
  const [day, month, year] = date.split('/');
  if (!day || !month || !year) {
    return null;
  }
  // Ensure proper formatting with leading zeros
  const formattedDay = day.padStart(2, '0');
  const formattedMonth = month.padStart(2, '0');
  const formattedYear = year.padStart(4, '0');
  return `${formattedYear}-${formattedMonth}-${formattedDay}`;
}

/**
 * Formats a date string for display in DD/MM/YYYY format
 * @param dateString - Date string (can be ISO format or any valid date string)
 * @returns Formatted date string or 'Not provided' if invalid
 */
export function formatDateForDisplay(dateString?: string): string {
  if (!dateString) return 'Not provided';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Gets the birthday from a user object, checking multiple possible field names
 * @param user - User object that might contain birthday information
 * @returns Birthday string or undefined if not found
 */
export function getUserBirthday(user: any): string | undefined {
  if (!user) return undefined;
  
  // Check multiple possible field names
  return user.birthday || user.dateOfBirth || user.birthDate || user.date_of_birth;
} 