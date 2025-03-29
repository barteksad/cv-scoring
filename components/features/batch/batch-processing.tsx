"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { Loader2, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BatchFilters } from "./batch-filters"
import { CandidateCard } from "./candidate-card"
import { CandidatePreview } from "./candidate-preview"
import { useBatchProcessing } from "@/lib/hooks/use-batch-processing"
import type { CV, Question, CandidateResult } from "@/lib/types"

interface BatchProcessingProps {
  cvs: CV[]
  questions: Question[]
  customInstructions: string
  onClearBatch: () => void
}

/**
 * Component for batch processing multiple CVs
 */
export function BatchProcessing({ cvs, questions, customInstructions, onClearBatch }: BatchProcessingProps) {
  // Use custom hook for batch processing logic
  const {
    candidates,
    filteredCandidates,
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
  } = useBatchProcessing(cvs, questions, customInstructions)

  // State for candidate preview
  const [previewCandidate, setPreviewCandidate] = useState<CandidateResult | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Open CV preview dialog
  const openPreview = (candidate: CandidateResult) => {
    setPreviewCandidate(candidate)
    setIsPreviewOpen(true)
  }

  // Handle batch processing
  const handleProcessBatch = async () => {
    if (questions.length === 0) {
      alert("Please add at least one question before processing CVs.")
      return
    }

    await processBatch()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Batch Processing</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={onClearBatch} disabled={isProcessing}>
                Clear Batch
              </Button>
              <Button
                size="sm"
                onClick={handleProcessBatch}
                disabled={isProcessing || candidates.length === 0 || questions.length === 0}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Process All CVs"
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {candidates.length > 0 ? (
            <div className="space-y-4">
              {/* Progress Bar */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing CVs...</span>
                    <span>
                      {processedCount}/{candidates.length} ({Math.round((processedCount / candidates.length) * 100)}%)
                    </span>
                  </div>
                  <Progress value={(processedCount / candidates.length) * 100} className="h-2" />
                </div>
              )}

              {/* Filters */}
              <BatchFilters
                filterOptions={filterOptions}
                sortField={sortField}
                sortDirection={sortDirection}
                onFilterChange={updateFilterOptions}
                onSortFieldChange={setSortField}
                onSortDirectionToggle={toggleSortDirection}
              />

              {/* Show/Hide Excluded Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show-excluded"
                  checked={filterOptions.showExcluded}
                  onChange={(e) => updateFilterOptions({ showExcluded: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="show-excluded" className="text-sm cursor-pointer">
                  Show excluded candidates (failed filter criteria)
                </Label>
              </div>

              {/* Tabs */}
              <Tabs
                value={filterOptions.statusFilter}
                onValueChange={(value) => updateFilterOptions({ statusFilter: value as any })}
              >
                <TabsList className="grid grid-cols-5">
                  <TabsTrigger value="all">All ({candidates.length})</TabsTrigger>
                  <TabsTrigger value="completed">
                    Completed ({candidates.filter((c) => c.status === "completed").length})
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending ({candidates.filter((c) => c.status === "pending" || c.status === "processing").length})
                  </TabsTrigger>
                  <TabsTrigger value="error">
                    Error ({candidates.filter((c) => c.status === "error").length})
                  </TabsTrigger>
                  <TabsTrigger value="excluded">
                    Excluded ({candidates.filter((c) => c.totalScore.excluded).length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={filterOptions.statusFilter} className="mt-4">
                  {filteredCandidates.length > 0 ? (
                    <div className="space-y-4">
                      {/* Export Button */}
                      {candidates.filter((c) => c.status === "completed").length > 0 && (
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm" onClick={exportResults} className="flex items-center">
                            <Download className="h-4 w-4 mr-2" />
                            Export Results (CSV)
                          </Button>
                        </div>
                      )}

                      {/* Candidate List */}
                      <div className="space-y-2">
                        {filteredCandidates.map((candidate) => (
                          <CandidateCard
                            key={candidate.id}
                            candidate={candidate}
                            onViewDetails={() => openPreview(candidate)}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 text-gray-500">No candidates match the current filters</div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center p-8 text-gray-500">
              No CVs uploaded. Use the batch upload to add multiple CVs.
            </div>
          )}
          {candidates.length > 0 && questions.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-700 text-sm">
                No questions have been added. Please add questions in the left panel before processing CVs.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidate Preview Dialog */}
      <CandidatePreview
        candidate={previewCandidate}
        questions={questions}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  )
}

