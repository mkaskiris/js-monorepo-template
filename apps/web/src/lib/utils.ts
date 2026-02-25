/**
 * Joins class names, filtering out falsy values.
 * Useful for conditional Tailwind classes.
 */
export function cn(...classes: string[]): string {
  return classes.filter(Boolean).join(' ')
}
