"use client"

import type { Question, QuestionResult } from "@/lib/types"
import { Trash2, Loader2, Info } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface QuestionItemProps {
  question: Question
  result?: QuestionResult
  isLoading: boolean
  onDelete: () => void
}

export function QuestionItem({ question, result, isLoading, onDelete }: QuestionItemProps) {
  // Function to get color based on score
  const getScoreColor = (score: number): string => {
    if (score >= 8) return "bg-green-500"
    if (score >= 6) return "bg-blue-500"
    if (score >= 4) return "bg-yellow-500"
    if (score >= 2) return "bg-orange-500"
    return "bg-red-500"
  }

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div className="flex-1 pr-4">
          <div className="flex items-center">
            <CardTitle className="text-base font-medium">{question.text}</CardTitle>
            {question.examples && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="ml-2 text-gray-400 hover:text-gray-600">
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">{question.examples}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="flex items-center mt-1 space-x-2">
            <Badge variant={question.type === "score" ? "default" : "outline"}>
              {question.type === "score" ? "Score" : "Yes/No"}
            </Badge>
            {question.type === "score" && question.weight > 1 && (
              <Badge variant="secondary">Weight: {question.weight}</Badge>
            )}
          </div>
        </div>
        <button
          onClick={onDelete}
          className="text-gray-500 hover:text-red-500 transition-colors"
          aria-label="Delete question"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-5 w-5 mr-2 animate-spin text-primary" />
            <span className="text-sm text-gray-500">Analyzing...</span>
          </div>
        ) : !result ? (
          <div className="text-sm text-gray-500 p-2">Upload a CV to see results</div>
        ) : (
          <div className="space-y-2">
            {question.type === "score" ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Score: {result.value}/10</span>
                  <span className="text-sm font-medium">{result.value}/10</span>
                </div>
                <Progress
                  value={Number(result.value) * 10}
                  className="h-2"
                  indicatorClassName={getScoreColor(Number(result.value))}
                />
              </>
            ) : (
              <div className="flex items-center">
                <Badge variant={result.value ? "success" : "destructive"} className="mr-2">
                  {result.value ? "Yes" : "No"}
                </Badge>
              </div>
            )}

            {result.explanation && (
              <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{result.explanation}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

