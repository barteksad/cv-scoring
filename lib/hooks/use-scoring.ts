"use client"

import { useState, useEffect } from "react"
import type { Question, QuestionResult, TotalScore } from "../types"

/**
 * Hook for calculating scores based on question results
 *
 * @param questions - The list of questions
 * @param results - The results for each question
 * @returns The calculated total score
 */
export function useScoring(
  questions: Question[],
  results: Record<string, QuestionResult>,
): {
  totalScore: TotalScore | null
  isExcluded: boolean
  excludedReason: string
} {
  const [totalScore, setTotalScore] = useState<TotalScore | null>(null)
  const [isExcluded, setIsExcluded] = useState(false)
  const [excludedReason, setExcludedReason] = useState("")

  useEffect(() => {
    if (Object.keys(results).length === 0 || questions.length === 0) {
      setTotalScore(null)
      setIsExcluded(false)
      setExcludedReason("")
      return
    }

    let totalPoints = 0
    let totalPossiblePoints = 0
    let excluded = false
    let excludedReason = ""

    // First check for filter questions
    for (const question of questions) {
      const result = results[question.id]
      if (!result) continue

      // Check for filter questions first
      if (question.type === "yesno" && question.isFilter && question.expectedAnswer !== undefined) {
        if (result.value !== question.expectedAnswer) {
          excluded = true
          excludedReason = `Failed filter: "${question.text}" - Expected: ${question.expectedAnswer ? "Yes" : "No"}, Got: ${result.value ? "Yes" : "No"}`
          break // Stop on first filter failure
        }
      }
    }

    // Then calculate scores if not excluded
    for (const question of questions) {
      const result = results[question.id]
      if (!result) continue

      if (question.type === "score") {
        // For score questions, multiply by weight
        totalPoints += Number(result.value) * question.weight
        totalPossiblePoints += 10 * question.weight // Max score is 10
      } else {
        // For yes/no questions, use custom points if available
        const pointsForYes = question.points !== undefined ? question.points : 10
        totalPoints += result.value ? pointsForYes : 0
        totalPossiblePoints += pointsForYes
      }
    }

    const percentage = totalPossiblePoints > 0 ? (totalPoints / totalPossiblePoints) * 100 : 0

    const newTotalScore = {
      score: totalPoints,
      maxPossibleScore: totalPossiblePoints,
      percentage,
      excluded,
      excludedReason,
    }

    setTotalScore(newTotalScore)
    setIsExcluded(excluded)
    setExcludedReason(excludedReason)
  }, [results, questions])

  return { totalScore, isExcluded, excludedReason }
}

