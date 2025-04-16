Link- https://memzy-ai-1-amulyaponnalas-projects.vercel.app/

///Enjoy the funny Meme Captions by MemezyAI///
Framework: Next.js (App Router) - Handles both frontend rendering (React components) and the backend API route.
Language: TypeScript - Used for type safety in both frontend and backend code.
Frontend UI Library: React (via Next.js).
Styling:
Tailwind CSS: For utility-first CSS styling.
Shadcn UI: (Likely, based on imports like @/components/ui/button, @/components/ui/card) Provides reusable UI components built on top of Tailwind.
AI Service: Google Gemini API
Specifically using the gemini-1.5-flash-latest model (via its REST API endpoint).
Accessed directly using the native fetch API in the Next.js API route.
API Route: Next.js API Route (app/api/generate-caption/route.ts) - Serves as the backend endpoint to handle requests from the frontend, interact with the Gemini API, and return results.
Package Manager: npm - Used for managing project dependencies.
Environment Variables: .env.local - Used to store the GEMINI_API_KEY securely.
