/**
 * Converts pros/cons data to a consistent array format
 * @param input - Can be string (newline-separated) or array
 * @returns Array of non-empty strings
 */
export function convertToArray(input: string | string[] | undefined): string[] {
  if (Array.isArray(input)) return input.filter(Boolean);
  if (typeof input === 'string') return input.split('\n').filter(Boolean);
  return [];
}
