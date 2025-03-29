/**
 * Core application types for the CV scoring system
 */

// Question types
export type QuestionType = "score" | "yesno"

/**
 * Represents a question used to evaluate a CV
 */
export interface Question {
  id: string
  text: string
  type: QuestionType
  examples?: string
  weight: number // Default to 1 for equal weighting
  isFilter?: boolean // For yes/no questions: if true, this is a filtering condition
  expectedAnswer?: boolean // For yes/no questions: the expected answer for filtering
  points?: number // For yes/no questions: custom points (default: yes=10, no=0)
}

/**
 * Result of evaluating a CV against a question
 */
export interface QuestionResult {
  type: QuestionType
  value: number | boolean
  explanation?: string
}

/**
 * Represents the total score for a CV evaluation
 */
export interface TotalScore {
  score: number
  maxPossibleScore: number
  percentage: number
  excluded?: boolean // Indicates if the candidate is excluded by a filter question
  excludedReason?: string // Reason for exclusion
}

/**
 * Represents a CV document with extracted text
 */
export interface CV {
  id: string
  name: string
  text: string
}

/**
 * Represents a candidate's CV with evaluation results
 */
export interface CandidateResult {
  id: string
  name: string
  text: string
  results: Record<string, QuestionResult>
  totalScore: TotalScore
  status: "pending" | "processing" | "completed" | "error"
  error?: string
}

/**
 * Sort options for candidate results
 */
export type SortField = "name" | "score"
export type SortDirection = "asc" | "desc"

/**
 * Filter options for candidate results
 */
export interface FilterOptions {
  searchTerm: string
  scoreRange: number | null
  showExcluded: boolean
  statusFilter: "all" | "completed" | "pending" | "error" | "excluded"
}

