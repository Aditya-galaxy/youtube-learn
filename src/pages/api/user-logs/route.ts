import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    // Log to your preferred analytics service
    // Example: Google Analytics, Firebase, or your own database
    console.log("User activity logged:", {
      userId: data.userId,
      email: data.email,
      event: data.event,
      timestamp: data.timestamp
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error logging user activity:", error)
    return NextResponse.json(
      { error: "Failed to log user activity" },
      { status: 500 }
    )
  }
}