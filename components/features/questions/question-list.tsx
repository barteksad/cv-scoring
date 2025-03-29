"use client"

import { Loader2, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QuestionItem } from "./question-item"
import { useCVAnalysis } from "@/lib/hooks/use-cv-analysis"
import { useScoring } from "@/lib/hooks/use-scoring"
import { getScoreColorClass } from "@/lib/utils/score-utils"
import type { Question } from "@/lib/types"

interface QuestionListProps {
  questions: Question[]
  cvText: string
  customInstructions: string
  onDelete: (id: string) => void
}

/**
 * Component for displaying a list of questions and their results
 */
export function QuestionList({ questions, cvText, customInstructions, onDelete }: QuestionListProps) {
  // Use custom hooks for analysis and scoring
  const { results, loading, isAnalyzing } = useCVAnalysis(cvText, questions, customInstructions)
  const { totalScore, isExcluded, excludedReason } = useScoring(questions, results)

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
        <Card className={isExcluded ? "bg-red-50" : "bg-gray-50"}>
          <CardContent className="pt-6">
            {isExcluded ? (
              <div className="space-y-2">
                <div className="flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <h3 className="text-lg font-semibold">Candidate Excluded</h3>
                </div>
                <p className="text-sm text-red-600">{excludedReason}</p>
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>
                    This candidate does not meet one or more of the required filter criteria.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <>
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
                  indicatorClassName={getScoreColorClass(totalScore.percentage)}
                />
              </>
            )}
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

      {isAnalyzing && (
        <div className="flex items-center justify-center p-4 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Analyzing CV...
        </div>
      )}
    </div>
  )
}

