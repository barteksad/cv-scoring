"use client"

import { useState, useEffect } from "react"
import { analyzeCV } from "../services/ai-service"
import type { Question, QuestionResult } from "../types"

/**
 * Hook for analyzing a CV against a set of questions
 *
 * @param cvText - The text content of the CV
 * @param questions - The list of questions to evaluate against
 * @param customInstructions - Optional custom instructions for the AI
 * @returns The analysis state and results
 */
export function useCVAnalysis(cvText: string, questions: Question[], customInstructions: string) {
  const [results, setResults] = useState<Record<string, QuestionResult>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    // Reset results when questions change
    if (questions.length === 0) {
      setResults({})
      setLoading({})
      return
    }

    // When CV text changes, reset all results
    if (cvText) {
      const newLoading: Record<string, boolean> = {}

      // Set all questions to loading
      questions.forEach((question) => {
        newLoading[question.id] = true
      })

      setLoading(newLoading)
      setIsAnalyzing(true)

      // Process each question
      const processQuestions = async () => {
        const newResults: Record<string, QuestionResult> = {}

        // Process questions in parallel
        await Promise.all(
          questions.map(async (question) => {
            try {
              const result = await analyzeCV(cvText, question, customInstructions)
              newResults[question.id] = result
            } catch (error) {
              console.error(`Error analyzing question ${question.id}:`, error)
              newResults[question.id] = {
                type: question.type,
                value: question.type === "score" ? 0 : false,
                explanation: "Error analyzing this question",
              }
            } finally {
              setLoading((prev) => ({
                ...prev,
                [question.id]: false,
              }))
            }
          }),
        )

        setResults(newResults)
        setIsAnalyzing(false)
      }

      if (questions.length > 0) {
        processQuestions()
      } else {
        setLoading({})
        setIsAnalyzing(false)
      }
    }
  }, [cvText, questions, customInstructions])

  return { results, loading, isAnalyzing }
}

