import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

// Keep the payload small and typed; the client used to be able to post
// arbitrary JSON, including a userId/email for somebody else.
const LogSchema = z.object({
  event: z.string().min(1).max(64),
  timestamp: z.coerce.date().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = LogSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid log payload" },
        { status: 400 }
      );
    }

    // Identity comes from the session, never from the request body.
    console.log("User activity logged:", {
      userId: session.user.id,
      event: parsed.data.event,
      timestamp: (parsed.data.timestamp ?? new Date()).toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging user activity:", error);
    return NextResponse.json(
      { error: "Failed to log user activity" },
      { status: 500 }
    );
  }
}
