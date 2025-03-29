"use client"

import type React from "react"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Question } from "@/lib/types"

interface AddQuestionFormProps {
  onAdd: (question: Question) => void
  onCancel: () => void
}

/**
 * Form for adding a new question
 */
export function AddQuestionForm({ onAdd, onCancel }: AddQuestionFormProps) {
  const [questionText, setQuestionText] = useState("")
  const [questionType, setQuestionType] = useState<"score" | "yesno">("score")
  const [examples, setExamples] = useState("")
  const [weight, setWeight] = useState(1)

  // Fields for yes/no questions
  const [isFilter, setIsFilter] = useState(false)
  const [expectedAnswer, setExpectedAnswer] = useState<boolean>(true)
  const [customPoints, setCustomPoints] = useState<number>(10)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!questionText.trim()) {
      return
    }

    const newQuestion: Question = {
      id: uuidv4(),
      text: questionText.trim(),
      type: questionType,
      examples: examples.trim() || undefined,
      weight: weight,
    }

    // Add yes/no specific properties if applicable
    if (questionType === "yesno") {
      newQuestion.isFilter = isFilter
      if (isFilter) {
        newQuestion.expectedAnswer = expectedAnswer
      } else {
        newQuestion.points = customPoints
      }
    }

    onAdd(newQuestion)
    resetForm()
  }

  const resetForm = () => {
    setQuestionText("")
    setQuestionType("score")
    setExamples("")
    setWeight(1)
    setIsFilter(false)
    setExpectedAnswer(true)
    setCustomPoints(10)
  }

  return (
    <Card className="mb-4">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-lg">Add New Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="question-text">Question</Label>
            <Input
              id="question-text"
              placeholder="e.g., How many years of React experience?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
            />
          </div>

          {/* Question Type */}
          <div className="space-y-2">
            <Label>Question Type</Label>
            <RadioGroup
              value={questionType}
              onValueChange={(value) => setQuestionType(value as "score" | "yesno")}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="score" id="score" />
                <Label htmlFor="score" className="cursor-pointer">
                  Score (0-10)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yesno" id="yesno" />
                <Label htmlFor="yesno" className="cursor-pointer">
                  Yes/No
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Score-specific options */}
          {questionType === "score" && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="weight">Weight</Label>
                <span className="text-sm text-gray-500">{weight}</span>
              </div>
              <Slider
                id="weight"
                min={1}
                max={5}
                step={1}
                value={[weight]}
                onValueChange={(values) => setWeight(values[0])}
              />
              <p className="text-xs text-gray-500">
                Higher weight gives this question more importance in the total score
              </p>
            </div>
          )}

          {/* Yes/No-specific options */}
          {questionType === "yesno" && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is-filter" className="block mb-1">
                    Use as Filter
                  </Label>
                  <p className="text-xs text-gray-500">
                    If enabled, CVs that don't meet this criteria will be excluded
                  </p>
                </div>
                <Switch id="is-filter" checked={isFilter} onCheckedChange={setIsFilter} />
              </div>

              {isFilter ? (
                <div className="space-y-2">
                  <Label>Required Answer</Label>
                  <Select
                    value={expectedAnswer ? "yes" : "no"}
                    onValueChange={(value) => setExpectedAnswer(value === "yes")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">CVs that don't have this answer will be excluded from results</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="custom-points">Points for "Yes" Answer</Label>
                    <span className="text-sm text-gray-500">{customPoints}</span>
                  </div>
                  <Slider
                    id="custom-points"
                    min={0}
                    max={20}
                    step={1}
                    value={[customPoints]}
                    onValueChange={(values) => setCustomPoints(values[0])}
                  />
                  <p className="text-xs text-gray-500">Points awarded for "Yes" answer (0 points for "No")</p>
                </div>
              )}
            </div>
          )}

          {/* Examples */}
          <div className="space-y-2">
            <Label htmlFor="examples">Examples (Optional)</Label>
            <Textarea
              id="examples"
              placeholder="Provide examples to guide the AI evaluation, e.g., 'A good candidate should have 3+ years of experience...'"
              value={examples}
              onChange={(e) => setExamples(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!questionText.trim()}>
            Add Question
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

