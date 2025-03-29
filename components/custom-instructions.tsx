"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Check, X } from "lucide-react"

interface CustomInstructionsProps {
  instructions: string
  onSave: (instructions: string) => void
}

export function CustomInstructions({ instructions, onSave }: CustomInstructionsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedInstructions, setEditedInstructions] = useState(instructions)

  const handleSave = () => {
    onSave(editedInstructions)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedInstructions(instructions)
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">AI Evaluation Instructions</CardTitle>
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Edit instructions</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={editedInstructions}
            onChange={(e) => setEditedInstructions(e.target.value)}
            placeholder="Enter custom instructions for the AI model..."
            className="min-h-[120px]"
          />
        ) : (
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {instructions ? (
              instructions
            ) : (
              <span className="text-gray-500 italic">
                No custom instructions set. Click the settings icon to add instructions.
              </span>
            )}
          </div>
        )}
      </CardContent>
      {isEditing && (
        <CardFooter className="flex justify-end space-x-2 pt-0">
          <Button variant="outline" size="sm" onClick={handleCancel} className="h-8">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="h-8">
            <Check className="h-4 w-4 mr-2" />
            Save
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

