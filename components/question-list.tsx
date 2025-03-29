"use client"

import { useState, useEffect } from "react"
import type { Question, QuestionResult, TotalScore } from "@/lib/types"
import { QuestionItem } from "@/components/question-item"
import { analyzeCV } from "@/lib/ai"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface QuestionListProps {
  questions: Question[]
  cvText: string
  customInstructions: string
  onDelete: (id: string) => void
}

export function QuestionList({ questions, cvText, customInstructions, onDelete }: QuestionListProps) {
  const [results, setResults] = useState<Record<string, QuestionResult>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [totalScore, setTotalScore] = useState<TotalScore | null>(null)

  // Calculate total score whenever results change
  useEffect(() => {
    if (Object.keys(results).length === 0 || questions.length === 0) {
      setTotalScore(null)
      return
    }

    let totalPoints = 0
    let totalPossiblePoints = 0

    questions.forEach((question) => {
      const result = results[question.id]
      if (!result) return

      if (question.type === "score") {
        // For score questions, multiply by weight
        totalPoints += Number(result.value) * question.weight
        totalPossiblePoints += 10 * question.weight // Max score is 10
      } else {
        // For yes/no questions, true = 10 points, false = 0 points
        totalPoints += result.value ? 10 : 0
        totalPossiblePoints += 10
      }
    })

    const percentage = totalPossiblePoints > 0 ? (totalPoints / totalPossiblePoints) * 100 : 0

    setTotalScore({
      score: totalPoints,
      maxPossibleScore: totalPossiblePoints,
      percentage,
    })
  }, [results, questions])

  // Function to get color based on percentage
  const getTotalScoreColor = (percentage: number): string => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 60) return "bg-blue-500"
    if (percentage >= 40) return "bg-yellow-500"
    if (percentage >= 20) return "bg-orange-500"
    return "bg-red-500"
  }

  useEffect(() => {
    // When CV text changes, reset all results
    if (cvText) {
      const newLoading: Record<string, boolean> = {}

      // Set all questions to loading
      questions.forEach((question) => {
        newLoading[question.id] = true
      })

      setLoading(newLoading)

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
      }

      if (questions.length > 0) {
        processQuestions()
      } else {
        setLoading({})
      }
    }
  }, [cvText, questions, customInstructions])

  if (questions.length === 0) {
    return (
      <div className="text-center p-6 border border-dashed rounded-md text-gray-500">
        No questions added yet. Click "Add Question" to get started.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Total Score Card */}
      {totalScore && (
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Total Score</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                {totalScore.score} / {totalScore.maxPossibleScore} points
              </span>
              <span className="text-sm font-medium">{Math.round(totalScore.percentage)}%</span>
            </div>
            <Progress
              value={totalScore.percentage}
              className="h-3"
              indicatorClassName={getTotalScoreColor(totalScore.percentage)}
            />
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      {questions.map((question) => (
        <QuestionItem
          key={question.id}
          question={question}
          result={results[question.id]}
          isLoading={loading[question.id] || false}
          onDelete={() => onDelete(question.id)}
        />
      ))}

      {Object.values(loading).some((isLoading) => isLoading) && (
        <div className="flex items-center justify-center p-4 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Analyzing CV...
        </div>
      )}
    </div>
  )
}

