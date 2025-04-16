import { NextResponse } from "next/server"

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // Allow larger request bodies for images
    },
  },
}

const API_KEY = process.env.GEMINI_API_KEY || ""
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`
// Note: Switched to gemini-1.5-flash-latest as gemini-pro-vision REST API might have issues or be deprecated.
// If you specifically need gemini-pro-vision, the URL would be:
// const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=${API_KEY}`

// Helper function to parse and clean Gemini response text into a list
const parseAndCleanCaptions = (text: string | undefined): string[] => {
  if (!text) return []

  // Split by asterisk, potentially preceded/followed by whitespace
  const captions = text.split(/\s*\*\s*/)

  // Clean up each caption
  return captions
    .map(caption => caption.replace(/^\*+|\*+$/g, '').trim()) // Remove extra asterisks and trim
    .filter(caption => caption.length > 0) // Remove empty strings resulting from splits
    // Optional: Remove introductory phrases if the model consistently adds them
    .map(caption => caption.replace(/^Here are some.*? captions for the image:/i, '').trim())
    .filter(caption => caption.length > 0) // Filter again after removing intro
}

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Only POST allowed' }, { status: 405 })
  }

  if (!API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  try {
    const { imageBase64, mimeType } = await req.json()
    console.log("Received image data")

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: "Missing imageBase64 or mimeType" }, { status: 400 })
    }

    const requestBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: imageBase64,
              },
            },
            {
              // Updated prompt to ask for a list directly
              text: "Generate a list of 5-7 funny and clever meme captions for this image. Keep them short, witty, and internet-savvy. Separate each caption with an asterisk (*).",
            },
          ],
        },
      ],
    }

    console.log("Sending request to Gemini REST API...")
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    console.log("Received response from Gemini REST API")
    const responseData = await response.json()

    if (!response.ok) {
      console.error("Gemini REST API Error:", responseData)
      const errorMessage = responseData?.error?.message || `HTTP error! status: ${response.status}`
      throw new Error(`Gemini API Error: ${errorMessage}`)
    }

    // Extract raw text
    const rawText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text
    // Parse and clean into an array
    const captions = parseAndCleanCaptions(rawText)

    if (!captions || captions.length === 0) {
      console.error("Could not extract or parse captions from Gemini response:", responseData)
      throw new Error("No captions generated or parsed from response")
    }

    console.log("Returning captions:", captions)
    // Return the array of captions
    return NextResponse.json({ captions })
  } catch (error) {
    console.error("Error generating caption with Gemini REST API:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate caption" },
      { status: 500 }
    )
  }
} 