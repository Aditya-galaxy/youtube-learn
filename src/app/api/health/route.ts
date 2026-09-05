import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Reports whether the app can reach its database.
 *
 * Sign-in is the only user-facing flow that writes to Postgres, so when the
 * database is unreachable every page still renders and only authentication
 * fails — which is hard to tell apart from an OAuth misconfiguration. This
 * separates the two without needing to trigger a sign-in.
 *
 * Deliberately reports only up/down: the connection error text contains the
 * database host and credentials.
 */
export async function GET() {
  let database: "up" | "down" = "down";

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "up";
  } catch (error) {
    console.error("[health] database check failed:", error);
  }

  return NextResponse.json(
    { status: database === "up" ? "ok" : "degraded", database },
    {
      status: database === "up" ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
