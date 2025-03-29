"use client"

import type React from "react"

import { useState } from "react"
import type { Question } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"

interface AddQuestionFormProps {
  onAdd: (question: Question) => void
  onCancel: () => void
}

export function AddQuestionForm({ onAdd, onCancel }: AddQuestionFormProps) {
  const [questionText, setQuestionText] = useState("")
  const [questionType, setQuestionType] = useState<"score" | "yesno">("score")
  const [examples, setExamples] = useState("")
  const [weight, setWeight] = useState(1)

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

    onAdd(newQuestion)
    setQuestionText("")
    setQuestionType("score")
    setExamples("")
    setWeight(1)
  }

  return (
    <Card className="mb-4">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-lg">Add New Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

