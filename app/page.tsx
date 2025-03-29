"use client"

import { useState } from "react"
import { CVUpload } from "@/components/cv-upload"
import { BatchUpload } from "@/components/features/batch/batch-upload"
import { QuestionList } from "@/components/features/questions/question-list"
import { BatchProcessing } from "@/components/features/batch/batch-processing"
import { AddQuestionForm } from "@/components/features/questions/add-question-form"
import { CustomInstructions } from "@/components/custom-instructions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Question, CV } from "@/lib/types"

/**
 * Main application page component
 */
export default function Home() {
  // CV state
  const [cvText, setCvText] = useState<string>("")
  const [batchCvs, setBatchCvs] = useState<CV[]>([])

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([])
  const [showAddForm, setShowAddForm] = useState(false)

  // Instructions state
  const [customInstructions, setCustomInstructions] = useState<string>(
    "When evaluating CVs, focus on relevant experience, skills, and qualifications. Consider both the quality and quantity of experience.",
  )

  // UI state
  const [activeTab, setActiveTab] = useState<"single" | "batch">("single")

  /**
   * Add a new question to the list
   */
  const addQuestion = (question: Question) => {
    setQuestions([...questions, question])
    setShowAddForm(false)

    // If we're in batch mode and have CVs, reset the batch processing
    if (activeTab === "batch" && batchCvs.length > 0) {
      // This will trigger a re-render of the BatchProcessing component
      setBatchCvs([...batchCvs])
    }
  }

  /**
   * Delete a question from the list
   */
  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  /**
   * Handle batch upload of CVs
   */
  const handleBatchUpload = (cvs: CV[]) => {
    setBatchCvs(cvs)
    setActiveTab("batch")
  }

  /**
   * Clear the batch of CVs
   */
  const clearBatch = () => {
    setBatchCvs([])
  }

  return (
    <main className="flex min-h-screen flex-col">
      <header className="bg-primary p-4 text-white">
        <h1 className="text-2xl font-bold">CV Scoring Assistant</h1>
      </header>

      <div className="flex flex-col md:flex-row flex-1">
        {/* Left Panel */}
        <div className="w-full md:w-1/2 p-4 border-r">
          {/* CV Upload Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload CV</h2>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "single" | "batch")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Single CV</TabsTrigger>
                <TabsTrigger value="batch">Batch Processing</TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="mt-4">
                <CVUpload onCvTextExtracted={setCvText} />
              </TabsContent>

              <TabsContent value="batch" className="mt-4">
                <BatchUpload onCvsExtracted={handleBatchUpload} isProcessing={false} />

                {batchCvs.length > 0 && (
                  <div className="mt-6">
                    <BatchProcessing
                      cvs={batchCvs}
                      questions={questions}
                      customInstructions={customInstructions}
                      onClearBatch={clearBatch}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Custom Instructions Section */}
          <div className="mb-6">
            <CustomInstructions instructions={customInstructions} onSave={setCustomInstructions} />
          </div>

          {/* Questions Section */}
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

            {activeTab === "single" ? (
              <QuestionList
                questions={questions}
                cvText={cvText}
                customInstructions={customInstructions}
                onDelete={deleteQuestion}
              />
            ) : (
              <div className="border border-dashed rounded-md p-4">
                <h3 className="font-medium mb-2">Questions for Batch Processing ({questions.length})</h3>
                {questions.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    No questions added yet. Add questions to evaluate CVs in batch mode.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {questions.map((question) => (
                      <div key={question.id} className="bg-gray-50 p-3 rounded-md text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{question.text}</span>
                          <span className="text-gray-500">
                            {question.type === "score" ? `Score (Weight: ${question.weight})` : "Yes/No"}
                          </span>
                        </div>
                        {question.examples && <p className="text-gray-600 text-xs mt-1 italic">{question.examples}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 p-4">
          <h2 className="text-xl font-semibold mb-4">CV Preview</h2>
          {activeTab === "single" ? (
            cvText ? (
              <div className="border p-4 rounded-md h-[calc(100vh-12rem)] overflow-auto whitespace-pre-wrap">
                {cvText}
              </div>
            ) : (
              <div className="border border-dashed p-8 rounded-md text-center text-gray-500">
                Upload a CV to see the preview here
              </div>
            )
          ) : (
            <div className="border border-dashed p-8 rounded-md text-center text-gray-500">
              CV preview is not available in batch mode. Use the batch processing tab to view results.
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

