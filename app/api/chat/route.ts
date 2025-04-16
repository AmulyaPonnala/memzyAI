import { OpenAI } from "openai"
import { NextResponse } from "next/server"

// Initialize the OpenAI client with Azure configuration
const client = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: process.env.AZURE_OPENAI_ENDPOINT,
  defaultQuery: { "api-version": "2024-02-15-preview" },
  defaultHeaders: { "api-key": process.env.AZURE_OPENAI_API_KEY },
})

if (!process.env.AZURE_OPENAI_API_KEY) {
  throw new Error("AZURE_OPENAI_API_KEY is not set in environment variables")
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    console.log("Received messages:", messages)

    // Get the last message
    const lastMessage = messages[messages.length - 1]
    console.log("Last message:", lastMessage)

    // Prepare the prompt with context from previous messages
    const prompt = `You are Memezy.ai, a hilarious AI meme caption generator. You create funny, witty, and sometimes sarcastic captions for memes. Keep your responses short, punchy, and internet-culture savvy.

Previous context: ${messages.slice(0, -1).map(m => m.content).join('\n')}

User's request: ${lastMessage.content}`

    console.log("Sending prompt to Azure OpenAI:", prompt)

    // Create a stream from the Azure OpenAI API
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are Memezy.ai, a hilarious AI meme caption generator. You create funny, witty, and sometimes sarcastic captions for memes. Keep your responses short, punchy, and internet-culture savvy." },
        ...messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 150,
    })

    // Create a TransformStream to handle the streaming response
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()
    const encoder = new TextEncoder()

    // Process the stream
    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content || ""
      if (content) {
        await writer.write(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
      }
    }

    // Send the [DONE] message
    await writer.write(encoder.encode(`data: [DONE]\n\n`))
    await writer.close()

    return new NextResponse(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
  } catch (error) {
    console.error("Error in chat route:", error)
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    )
  }
}

