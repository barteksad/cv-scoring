export type QuestionType = "score" | "yesno"

export interface Question {
  id: string
  text: string
  type: QuestionType
  examples?: string
  weight: number // Default to 1 for equal weighting
}

export interface QuestionResult {
  type: QuestionType
  value: number | boolean
  explanation?: string
}

export interface TotalScore {
  score: number
  maxPossibleScore: number
  percentage: number
}

