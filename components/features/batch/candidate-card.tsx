"use client"

import { Loader2, XCircle, Eye, Filter } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getScoreColorClass } from "@/lib/utils/score-utils"
import type { CandidateResult } from "@/lib/types"

interface CandidateCardProps {
  candidate: CandidateResult
  onViewDetails: () => void
}

/**
 * Card component for displaying a candidate in the batch processing list
 */
export function CandidateCard({ candidate, onViewDetails }: CandidateCardProps) {
  return (
    <Card className={`overflow-hidden ${candidate.totalScore.excluded ? "border-red-300 bg-red-50" : ""}`}>
      <div className="flex items-center p-4">
        <div className="flex-1">
          {/* Candidate Name and Status */}
          <div className="flex items-center">
            <h3 className="font-medium truncate">{candidate.name}</h3>
            {candidate.status === "completed" && !candidate.totalScore.excluded && (
              <Badge className="ml-2" variant="outline">
                {Math.round(candidate.totalScore.percentage)}%
              </Badge>
            )}
            {candidate.status === "processing" && <Badge className="ml-2 bg-blue-500 text-white">Processing</Badge>}
            {candidate.status === "error" && (
              <Badge className="ml-2" variant="destructive">
                Error
              </Badge>
            )}
            {candidate.totalScore.excluded && (
              <Badge className="ml-2 bg-red-500 text-white flex items-center gap-1">
                <Filter className="h-3 w-3" />
                Excluded
              </Badge>
            )}
          </div>

          {/* Progress Bar for Completed Candidates */}
          {candidate.status === "completed" && !candidate.totalScore.excluded && (
            <div className="mt-2">
              <Progress
                value={candidate.totalScore.percentage}
                className="h-2"
                indicatorClassName={getScoreColorClass(candidate.totalScore.percentage)}
              />
            </div>
          )}

          {/* Error Messages */}
          {candidate.totalScore.excluded && (
            <p className="text-sm text-red-600 mt-1">{candidate.totalScore.excludedReason}</p>
          )}
          {candidate.status === "error" && <p className="text-sm text-red-500 mt-1">{candidate.error}</p>}
        </div>

        {/* Status Indicators and Actions */}
        <div className="ml-4 flex items-center space-x-2">
          {candidate.status === "pending" && (
            <Badge variant="outline" className="bg-gray-100">
              Pending
            </Badge>
          )}
          {candidate.status === "processing" && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
          {candidate.status === "completed" && (
            <Button variant="ghost" size="sm" onClick={onViewDetails} className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          )}
          {candidate.status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
        </div>
      </div>
    </Card>
  )
}

