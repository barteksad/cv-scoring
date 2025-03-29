"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { Question, QuestionResult } from "./types"

export async function analyzeCV(cvText: string, question: Question, customInstructions = ""): Promise<QuestionResult> {
  try {
    let prompt = ""
    let systemPrompt = ""

    if (question.type === "score") {
      systemPrompt = `
        You are an expert HR assistant that analyzes CVs. 
        You will be given a CV and a question about the candidate.
        Evaluate the CV based on the question and provide a score from 0 to 10, 
        where 0 means the candidate doesn't meet the criteria at all and 10 means they exceed expectations.
        Also provide a brief explanation for your score.
        
        ${customInstructions ? `Custom instructions: ${customInstructions}` : ""}
        
        Your response must be in raw JSON format with the following structure:
        {
          "score": number between 0 and 10,
          "explanation": "brief explanation for the score"
        }
        
        IMPORTANT: Do not include markdown formatting, code block markers, or any text outside the JSON object.
      `

      prompt = `
        CV:
        ${cvText}
        
        Question: ${question.text}
        
        ${question.examples ? `Examples/Guidance: ${question.examples}` : ""}
        
        Analyze the CV and provide a score from 0 to 10 for this question, along with a brief explanation.
      `
    } else {
      systemPrompt = `
        You are an expert HR assistant that analyzes CVs. 
        You will be given a CV and a yes/no question about the candidate.
        Evaluate the CV based on the question and provide a yes or no answer.
        Also provide a brief explanation for your answer.
        
        ${customInstructions ? `Custom instructions: ${customInstructions}` : ""}
        
        Your response must be in raw JSON format with the following structure:
        {
          "answer": boolean (true for yes, false for no),
          "explanation": "brief explanation for your answer"
        }
        
        IMPORTANT: Do not include markdown formatting, code block markers, or any text outside the JSON object.
      `

      prompt = `
        CV:
        ${cvText}
        
        Question: ${question.text}
        
        ${question.examples ? `Examples/Guidance: ${question.examples}` : ""}
        
        Analyze the CV and provide a yes or no answer to this question, along with a brief explanation.
      `
    }

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: prompt,
    })

    // Parse the response
    try {
      // Extract JSON from potential markdown code blocks
      let jsonText = text

      // Check if the response contains markdown code block
      const jsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```/
      const match = text.match(jsonRegex)

      if (match && match[1]) {
        // Extract just the JSON part from the code block
        jsonText = match[1].trim()
      }

      const parsedResponse = JSON.parse(jsonText)

      if (question.type === "score") {
        return {
          type: "score",
          value: parsedResponse.score,
          explanation: parsedResponse.explanation,
        }
      } else {
        return {
          type: "yesno",
          value: parsedResponse.answer,
          explanation: parsedResponse.explanation,
        }
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)

      // Fallback in case of parsing error
      return {
        type: question.type,
        value: question.type === "score" ? 5 : false,
        explanation: "Could not analyze properly. Please try again.",
      }
    }
  } catch (error) {
    console.error("Error calling AI service:", error)
    throw error
  }
}

export async function CV2text(file: File): Promise<string> {
  const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Parse and extract all information from the CV file and write it in a text format. Write only the text content of the CV without any additional comments or formatting.',
          },
          {
            type: 'file',
            data: await file.arrayBuffer(),
            mimeType: 'application/pdf',
          },
        ],
      },
    ],
    });

  return text
}
