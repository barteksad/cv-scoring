"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CV2text } from "@/lib/services/ai-service"
import type { CV } from "@/lib/types"

interface BatchUploadProps {
  onCvsExtracted: (cvs: CV[]) => void
  isProcessing: boolean
}

/**
 * Component for uploading and processing multiple CVs
 */
export function BatchUpload({ onCvsExtracted, isProcessing }: BatchUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const fileArray = Array.from(e.target.files)
    setFiles((prev) => [...prev, ...fileArray])

    // Reset the input so the same file can be selected again
    e.target.value = ""
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const extractTextFromFiles = async () => {
    if (files.length === 0) return

    setIsExtracting(true)
    setProgress(0)
    setError(null)

    try {
      const extractedCvs: CV[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Update progress
        setProgress(Math.round((i / files.length) * 100))

        try {
          // Use the CV2text function to extract text
          const text = await CV2text(file)

          extractedCvs.push({
            id: `cv-${Date.now()}-${i}`,
            name: file.name,
            text,
          })
        } catch (err) {
          console.error(`Error extracting text from ${file.name}:`, err)
          setError(`Failed to process ${file.name}. Please try again or check the file format.`)
        }
      }

      setProgress(100)
      onCvsExtracted(extractedCvs)

      // Clear files after successful extraction
      setTimeout(() => {
        setFiles([])
        setProgress(0)
      }, 1000)
    } catch (err) {
      console.error("Error in batch processing:", err)
      setError("An error occurred during batch processing. Please try again.")
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          id="cv-batch-upload"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileChange}
          multiple
          disabled={isExtracting || isProcessing}
        />
        <label htmlFor="cv-batch-upload" className="cursor-pointer flex flex-col items-center justify-center">
          {isExtracting ? (
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          ) : (
            <Upload className="h-10 w-10 text-primary" />
          )}
          <span className="mt-2 text-sm font-medium text-gray-700">
            {isExtracting ? "Processing files..." : "Click to upload multiple CVs (PDF, DOC, DOCX)"}
          </span>
        </label>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Selected Files ({files.length})</h3>
              <Button variant="outline" size="sm" onClick={() => setFiles([])} disabled={isExtracting}>
                Clear All
              </Button>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-500 hover:text-red-500"
                    disabled={isExtracting}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          {isExtracting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing files...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Process Button */}
          <Button
            onClick={extractTextFromFiles}
            disabled={isExtracting || files.length === 0 || isProcessing}
            className="w-full"
          >
            {isExtracting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Process Files"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

