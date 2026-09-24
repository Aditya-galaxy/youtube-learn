"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startCourseGeneration } from "@/lib/generation/start";

type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

/**
 * Offers a structured course for whatever the user searched. Layered on top of
 * the video feed rather than replacing it: search still shows videos, and this
 * turns the same query into a sequenced path.
 */
export function BuildCourseBanner({ topic }: { topic: string }) {
  const router = useRouter();
  const { status } = useSession();
  const [level, setLevel] = useState<Level>("BEGINNER");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!topic.trim()) return null;

  async function build() {
    if (status !== "authenticated") {
      signIn("google", { callbackUrl: window.location.href });
      return;
    }
    setBusy(true);
    setError(null);
    const result = await startCourseGeneration({ topic, difficulty: level });
    if (result.kind === "job")
      router.push(`/courses/generating/${result.jobId}`);
    else if (result.kind === "existing") router.push(`/courses/${result.slug}`);
    else if (result.kind === "signin")
      signIn("google", { callbackUrl: window.location.href });
    else {
      setError(result.message);
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-[1400px] px-5 pt-10 sm:px-10">
      <div className="flex flex-col gap-5 rounded-lg bg-secondary p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">Learning path</p>
          <h2 className="mt-2 font-display text-2xl tracking-display text-foreground">
            Learn <em>{topic}</em> in order.
          </h2>
          <p className="mt-2 text-sm tracking-tightish text-muted-foreground">
            A sequenced course built from real videos, from Basic fundamentals
            to Expert depth.
          </p>
          {error && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <select
            aria-label="Your level"
            value={level}
            onChange={(e) => setLevel(e.target.value as Level)}
            disabled={busy}
            className="h-10 rounded-full border border-border bg-card px-4 text-sm tracking-tightish"
          >
            <option value="BEGINNER">Basic / Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
            <option value="EXPERT">Expert</option>
          </select>
          <Button onClick={build} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : null}
            Build a learning path
          </Button>
        </div>
      </div>
    </section>
  );
}
