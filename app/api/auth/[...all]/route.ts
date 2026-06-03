// Auth API route handler
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

// Export handlers
export const { GET, POST } = toNextJsHandler(auth.handler)
