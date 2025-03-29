/**
 * Utility functions for scoring and display
 */

/**
 * Get color class based on score percentage
 */
export function getScoreColorClass(percentage: number): string {
  if (percentage >= 80) return "bg-green-500"
  if (percentage >= 60) return "bg-blue-500"
  if (percentage >= 40) return "bg-yellow-500"
  if (percentage >= 20) return "bg-orange-500"
  return "bg-red-500"
}

/**
 * Format a score as a percentage
 */
export function formatScorePercentage(percentage: number): string {
  return `${Math.round(percentage)}%`
}

/**
 * Format a score as a fraction
 */
export function formatScoreFraction(score: number, maxScore: number): string {
  return `${score}/${maxScore}`
}

