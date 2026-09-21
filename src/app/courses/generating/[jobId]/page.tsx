"use client";

import React, { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobStatus {
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";
  topic: string;
  step: number;
  totalSteps: number;
  progressPct: number;
  stageLabel: string | null;
  courseTitle: string | null;
  moduleTitles: string[];
  warnings: string[];
  error: string | null;
  courseSlug: string | null;
}

const POLL_MS = 2_500;

export default function GeneratingPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const router = useRouter();
  const [job, setJob] = useState<JobStatus | null>(null);
  const [notFound, setNotFound] = useState(false);
  const redirected = useRef(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/courses/generate/${jobId}`, {
          cache: "no-store",
        });
        if (res.status === 404 || res.status === 401) {
          if (!cancelled) setNotFound(true);
          return;
        }
        const data = (await res.json()) as JobStatus;
        if (cancelled) return;
        setJob(data);
        if (
          data.status === "COMPLETED" &&
          data.courseSlug &&
          !redirected.current
        ) {
          redirected.current = true;
          setTimeout(() => router.push(`/courses/${data.courseSlug}`), 1_200);
          return;
        }
        if (data.status === "FAILED") return;
      } catch {
        // Transient network error: keep polling.
      }
      if (!cancelled) timer = setTimeout(poll, POLL_MS);
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [jobId, router]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl tracking-display">
          Build not found
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This course build does not exist or belongs to another account.
        </p>
        <Link
          href="/courses"
          className="mt-6 inline-block text-sm underline underline-offset-4"
        >
          Back to courses
        </Link>
      </div>
    );
  }

  // Steps: 0 = syllabus, 1..n = modules, n+1 = save. Module titles appear once
  // the syllabus exists, so the checklist fills in as the build progresses.
  const steps = [
    "Designing your curriculum",
    ...(job?.moduleTitles.length
      ? job.moduleTitles.map((t) => `Finding and sequencing videos: ${t}`)
      : ["Finding and sequencing videos"]),
    "Saving your course",
  ];
  const current = job?.status === "COMPLETED" ? steps.length : (job?.step ?? 0);

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 sm:py-24">
      <p className="eyebrow">Building a learning path</p>
      <h1 className="mt-3 font-display text-4xl tracking-display sm:text-5xl">
        {job?.courseTitle ?? job?.topic ?? "…"}
      </h1>
      <p className="mt-4 text-sm leading-relaxed tracking-tightish text-muted-foreground">
        Designing a curriculum, then searching YouTube and choosing the video
        that best teaches each lesson. This usually takes three to six minutes.
        You can leave this page and come back.
      </p>

      <div className="mt-8 h-1 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700"
          style={{ width: `${job?.progressPct ?? 2}%` }}
        />
      </div>

      <ol className="mt-10 space-y-4">
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current && job?.status !== "FAILED";
          return (
            <li key={label} className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  done ? "bg-primary text-primary-foreground" : "bg-secondary"
                )}
              >
                {done ? (
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                ) : active ? (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                ) : null}
              </span>
              <span
                className={cn(
                  "text-sm tracking-tightish",
                  done || active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {job?.warnings && job.warnings.length > 0 && (
        <div className="mt-10 rounded-md bg-secondary p-5">
          <p className="eyebrow">Gaps</p>
          <ul className="mt-3 space-y-1.5">
            {job.warnings.map((w) => (
              <li
                key={w}
                className="text-sm tracking-tightish text-muted-foreground"
              >
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {job?.status === "FAILED" && (
        <div role="alert" className="mt-10 rounded-md bg-secondary p-5">
          <p className="flex items-center gap-2 text-sm text-foreground">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            {job.error ?? "The build failed."}
          </p>
          <Link
            href="/courses"
            className="mt-4 inline-block text-sm underline underline-offset-4"
          >
            Back to courses
          </Link>
        </div>
      )}

      {job?.status === "COMPLETED" && (
        <p className="mt-10 text-sm text-foreground">
          Done — opening your course…
        </p>
      )}
    </div>
  );
}
