import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/requireUser";
import { importLocalSchedules } from "@/lib/reviews";

export const dynamic = "force-dynamic";

/** Bounded so one import cannot turn into thousands of writes. */
const ImportSchema = z.object({
  schedules: z.record(
    z.string().min(1).max(200),
    z.object({
      repetitionLevel: z.number().int().min(0).max(20),
      lastReviewedAt: z.number().int().min(0).max(4_102_444_800_000),
      nextDueTime: z.number().int().min(0).max(4_102_444_800_000),
      reviewCount: z.number().int().min(0).max(10_000),
      lapseCount: z.number().int().min(0).max(10_000),
    })
  ),
});

export async function POST(request: Request) {
  const auth = await requireUserId();
  if ("response" in auth) return auth.response;

  const parsed = ImportSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid import" }, { status: 400 });

  return NextResponse.json({
    imported: await importLocalSchedules(auth.userId, parsed.data.schedules),
  });
}
