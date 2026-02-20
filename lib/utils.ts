/**
 * Utility Functions
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format score with color
 */
export function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-600'
  if (score >= 7) return 'text-yellow-600'
  return 'text-red-600'
}

/**
 * Format score background color
 */
export function getScoreBgColor(score: number): string {
  if (score >= 8) return 'bg-green-100'
  if (score >= 7) return 'bg-yellow-100'
  return 'bg-red-100'
}

/**
 * Format date/time
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

/**
 * Get score badge variant
 */
export function getScoreBadge(score: number): 'success' | 'warning' | 'destructive' {
  if (score >= 8) return 'success'
  if (score >= 7) return 'warning'
  return 'destructive'
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}
