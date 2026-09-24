"use client";

export type StartResult =
  | { kind: "job"; jobId: string }
  | { kind: "existing"; slug: string; title: string }
  | { kind: "signin" }
  | { kind: "error"; message: string };

/** Client entry point shared by the search banner and the courses dialog. */
export async function startCourseGeneration(input: {
  topic: string;
  difficulty?: "BASIC" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  prioritizeAcademic?: boolean;
  force?: boolean;
}): Promise<StartResult> {
  let res: Response;
  try {
    res = await fetch("/api/courses/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    return { kind: "error", message: "Network error. Check your connection." };
  }
  if (res.status === 401) return { kind: "signin" };
  const data = await res.json().catch(() => ({}));
  if (data.existingCourse) {
    return {
      kind: "existing",
      slug: data.existingCourse.slug,
      title: data.existingCourse.title,
    };
  }
  if (data.jobId) return { kind: "job", jobId: data.jobId };
  return {
    kind: "error",
    message: data.error ?? "Could not start building the course.",
  };
}
