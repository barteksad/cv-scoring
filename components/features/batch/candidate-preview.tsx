"use client"

import { AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { CandidateResult, Question } from "@/lib/types"

interface CandidatePreviewProps {
  candidate: CandidateResult | null
  questions: Question[]
  isOpen: boolean
  onClose: () => void
}

/**
 * Dialog component for previewing a candidate's CV and results
 */
export function CandidatePreview({ candidate, questions, isOpen, onClose }: CandidatePreviewProps) {
  if (!candidate) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{candidate.name}</DialogTitle>
          <DialogDescription>
            {candidate.totalScore.excluded ? (
              <div className="flex items-center text-red-600 mt-2">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span>This candidate was excluded: {candidate.totalScore.excludedReason}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 mt-2">
                <span>
                  Score: {candidate.totalScore.score}/{candidate.totalScore.maxPossibleScore}
                </span>
                <span>({Math.round(candidate.totalScore.percentage || 0)}%)</span>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-auto flex-1 p-1">
          {/* CV Text */}
          <div className="border rounded-md p-4 overflow-auto h-[60vh]">
            <h3 className="font-medium mb-2 sticky top-0 bg-white py-2">CV Content</h3>
            <pre className="text-sm whitespace-pre-wrap">{candidate.text}</pre>
          </div>

          {/* Question Results */}
          <div className="border rounded-md p-4 overflow-auto h-[60vh]">
            <h3 className="font-medium mb-2 sticky top-0 bg-white py-2">Evaluation Results</h3>
            <div className="space-y-4">
              {questions.map((question) => {
                const result = candidate.results[question.id]
                if (!result) return null

                return (
                  <div key={question.id} className="border-b pb-3">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{question.text}</h4>
                      {question.type === "score" ? (
                        <span className="font-medium">{result.value}/10</span>
                      ) : (
                        <Badge variant={result.value ? "success" : "destructive"}>{result.value ? "Yes" : "No"}</Badge>
                      )}
                    </div>

                    {question.type === "yesno" && question.isFilter && (
                      <div
                        className={`text-xs mt-1 ${result.value === question.expectedAnswer ? "text-green-600" : "text-red-600"}`}
                      >
                        {result.value === question.expectedAnswer
                          ? "✓ Meets filter criteria"
                          : "✗ Does not meet filter criteria"}
                      </div>
                    )}

                    {result.explanation && <p className="text-sm text-gray-600 mt-2">{result.explanation}</p>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

