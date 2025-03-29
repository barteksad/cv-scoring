"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileText, Loader2 } from "lucide-react"
import { CV2text } from "@/lib/services/ai-service"

interface CVUploadProps {
  onCvTextExtracted: (text: string) => void
}

/**
 * Component for uploading and processing a single CV
 */
export function CVUpload({ onCvTextExtracted }: CVUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setFileName(file.name)

    try {
      const text = await CV2text(file)
      onCvTextExtracted(text)
    } catch (error) {
      console.error("Error extracting text from PDF:", error)
      alert("Failed to extract text from the PDF. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          id="cv-upload"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        <label htmlFor="cv-upload" className="cursor-pointer flex flex-col items-center justify-center">
          {isLoading ? (
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          ) : (
            <Upload className="h-10 w-10 text-primary" />
          )}
          <span className="mt-2 text-sm font-medium text-gray-700">
            {isLoading
              ? "Processing..."
              : fileName
                ? `${fileName} (Click to change)`
                : "Click to upload CV (PDF, DOC, DOCX)"}
          </span>
        </label>
      </div>

      {fileName && !isLoading && (
        <div className="mt-4 flex items-center text-sm text-gray-600">
          <FileText className="h-4 w-4 mr-2" />
          <span>{fileName} uploaded successfully</span>
        </div>
      )}
    </div>
  )
}

