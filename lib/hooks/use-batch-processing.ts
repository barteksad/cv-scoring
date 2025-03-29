"use client"

import { useState, useEffect } from "react"
import { analyzeCV } from "../services/ai-service"
import type { CV, Question, CandidateResult, FilterOptions, SortField, SortDirection } from "../types"

/**
 * Hook for batch processing multiple CVs
 *
 * @param cvs - The list of CVs to process
 * @param questions - The list of questions to evaluate against
 * @param customInstructions - Optional custom instructions for the AI
 * @returns The batch processing state and functions
 */
export function useBatchProcessing(cvs: CV[], questions: Question[], customInstructions: string) {
  const [candidates, setCandidates] = useState<CandidateResult[]>([])
  const [processedCount, setProcessedCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  // Filtering and sorting state
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: "",
    scoreRange: null,
    showExcluded: true,
    statusFilter: "all",
  })
  const [sortField, setSortField] = useState<SortField>("score")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  // Initialize candidates from CVs
  useEffect(() => {
    if (cvs.length > 0) {
      const initialCandidates = cvs.map((cv) => ({
        id: cv.id,
        name: cv.name,
        text: cv.text,
        results: {},
        totalScore: { score: 0, maxPossibleScore: 0, percentage: 0 },
        status: "pending" as const,
      }))

      setCandidates(initialCandidates)
      setProcessedCount(0)
      setIsProcessing(false)
    }
  }, [cvs])

  /**
   * Calculate total score for a candidate
   */
  const calculateTotalScore = (results: Record<string, any>, candidateText: string) => {
    let totalPoints = 0
    let totalPossiblePoints = 0
    let excluded = false
    let excludedReason = ""

    questions.forEach((question) => {
      const result = results[question.id]
      if (!result) return

      // Check for filter questions first
      if (question.type === "yesno" && question.isFilter && question.expectedAnswer !== undefined) {
        if (result.value !== question.expectedAnswer) {
          excluded = true
          excludedReason = `Failed filter: "${question.text}" - Expected: ${question.expectedAnswer ? "Yes" : "No"}, Got: ${result.value ? "Yes" : "No"}`
        }
      }

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
    })

    const percentage = totalPossiblePoints > 0 ? (totalPoints / totalPossiblePoints) * 100 : 0

    return {
      score: totalPoints,
      maxPossibleScore: totalPossiblePoints,
      percentage,
      excluded,
      excludedReason,
    }
  }

  /**
   * Process all CVs in the batch
   */
  const processBatch = async () => {
    if (candidates.length === 0 || questions.length === 0) {
      return false
    }

    setIsProcessing(true)
    setProcessedCount(0)

    // Process candidates sequentially to avoid overwhelming the API
    for (let i = 0; i < candidates.length; i++) {
      const candidate = { ...candidates[i] }
      candidate.status = "processing"

      // Update the candidate status
      setCandidates((prev) => prev.map((c) => (c.id === candidate.id ? candidate : c)))

      try {
        // Process each question for this candidate
        const results: Record<string, any> = {}

        for (const question of questions) {
          try {
            const result = await analyzeCV(candidate.text, question, customInstructions)
            results[question.id] = result
          } catch (error) {
            console.error(`Error analyzing question ${question.id} for candidate ${candidate.id}:`, error)
            results[question.id] = {
              type: question.type,
              value: question.type === "score" ? 0 : false,
              explanation: "Error analyzing this question",
            }
          }
        }

        // Calculate total score
        const totalScore = calculateTotalScore(results, candidate.text)

        // Update candidate with results
        candidate.results = results
        candidate.totalScore = totalScore
        candidate.status = "completed"
      } catch (error) {
        console.error(`Error processing candidate ${candidate.id}:`, error)
        candidate.status = "error"
        candidate.error = "Failed to process this CV"
      }

      // Update candidates array
      setCandidates((prev) => prev.map((c) => (c.id === candidate.id ? candidate : c)))

      // Update progress
      setProcessedCount(i + 1)
    }

    setIsProcessing(false)
    return true
  }

  /**
   * Update filter options
   */
  const updateFilterOptions = (newOptions: Partial<FilterOptions>) => {
    setFilterOptions((prev) => ({ ...prev, ...newOptions }))
  }

  /**
   * Toggle sort direction
   */
  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  /**
   * Get filtered and sorted candidates
   */
  const getFilteredCandidates = () => {
    return candidates
      .filter((candidate) => {
        // Excluded filter
        if (!filterOptions.showExcluded && candidate.totalScore.excluded) {
          return false
        }

        // Search filter
        const nameMatch = candidate.name.toLowerCase().includes(filterOptions.searchTerm.toLowerCase())

        // Score filter
        const scoreMatch =
          filterOptions.scoreRange === null ||
          (candidate.totalScore.percentage >= filterOptions.scoreRange &&
            candidate.totalScore.percentage < filterOptions.scoreRange + 20)

        // Tab filter
        if (filterOptions.statusFilter === "all") return nameMatch && scoreMatch
        if (filterOptions.statusFilter === "completed")
          return candidate.status === "completed" && nameMatch && scoreMatch
        if (filterOptions.statusFilter === "pending")
          return (candidate.status === "pending" || candidate.status === "processing") && nameMatch && scoreMatch
        if (filterOptions.statusFilter === "error") return candidate.status === "error" && nameMatch && scoreMatch
        if (filterOptions.statusFilter === "excluded") return candidate.totalScore.excluded && nameMatch

        return nameMatch && scoreMatch
      })
      .sort((a, b) => {
        if (sortField === "name") {
          return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        } else {
          return sortDirection === "asc"
            ? a.totalScore.percentage - b.totalScore.percentage
            : b.totalScore.percentage - a.totalScore.percentage
        }
      })
  }

  /**
   * Export results as CSV
   */
  const exportResults = () => {
    // Create CSV header
    let csv = "Candidate Name,Total Score,Percentage,Excluded"

    // Add question headers
    questions.forEach((question) => {
      csv += `,${question.text.replace(/,/g, " ")}`
    })

    csv += "\n"

    // Add candidate data
    candidates
      .filter((c) => c.status === "completed")
      .forEach((candidate) => {
        csv += `"${candidate.name}",${candidate.totalScore.score}/${candidate.totalScore.maxPossibleScore},${Math.round(candidate.totalScore.percentage)}%,${candidate.totalScore.excluded ? "Yes" : "No"}`

        // Add question results
        questions.forEach((question) => {
          const result = candidate.results[question.id]
          if (!result) {
            csv += ",N/A"
          } else if (question.type === "score") {
            csv += `,${result.value}/10`
          } else {
            csv += `,${result.value ? "Yes" : "No"}`
          }
        })

        csv += "\n"
      })

    // Create and download the file
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("hidden", "")
    a.setAttribute("href", url)
    a.setAttribute("download", "cv_analysis_results.csv")
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return {
    candidates,
    filteredCandidates: getFilteredCandidates(),
    processedCount,
    isProcessing,
    filterOptions,
    sortField,
    sortDirection,
    processBatch,
    updateFilterOptions,
    setSortField,
    toggleSortDirection,
    exportResults,
  }
}

