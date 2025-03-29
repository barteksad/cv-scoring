"use client"

import { useState } from "react"
import { CVUpload } from "@/components/cv-upload"
import { QuestionList } from "@/components/question-list"
import { AddQuestionForm } from "@/components/add-question-form"
import type { Question } from "@/lib/types"
import { CustomInstructions } from "@/components/custom-instructions"

export default function Home() {
  const [cvText, setCvText] = useState<string>("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [customInstructions, setCustomInstructions] = useState<string>(
    "When evaluating CVs, focus on relevant experience, skills, and qualifications. Consider both the quality and quantity of experience.",
  )

  const addQuestion = (question: Question) => {
    setQuestions([...questions, question])
    setShowAddForm(false)
  }

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  return (
    <main className="flex min-h-screen flex-col">
      <header className="bg-primary p-4 text-white">
        <h1 className="text-2xl font-bold">CV Scoring Assistant</h1>
      </header>

      <div className="flex flex-col md:flex-row flex-1">
        {/* Left Panel */}
        <div className="w-full md:w-1/2 p-4 border-r">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload CV</h2>
            <CVUpload onCvTextExtracted={setCvText} />
          </div>

          <div className="mb-6">
            <CustomInstructions instructions={customInstructions} onSave={setCustomInstructions} />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Questions</h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
              >
                Add Question
              </button>
            </div>

            {showAddForm && <AddQuestionForm onAdd={addQuestion} onCancel={() => setShowAddForm(false)} />}

            <QuestionList
              questions={questions}
              cvText={cvText}
              customInstructions={customInstructions}
              onDelete={deleteQuestion}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 p-4">
          <h2 className="text-xl font-semibold mb-4">CV Preview</h2>
          {cvText ? (
            <div className="border p-4 rounded-md h-[calc(100vh-12rem)] overflow-auto whitespace-pre-wrap">
              {cvText}
            </div>
          ) : (
            <div className="border border-dashed p-8 rounded-md text-center text-gray-500">
              Upload a CV to see the preview here
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

