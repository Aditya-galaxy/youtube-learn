"use client";

import React, { use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useResolvedCourse } from "@/hooks/useResolvedCourse";
import { ClassroomPlayer } from "@/components/Classroom/ClassroomPlayer";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default function LearnPage({ params }: PageProps) {
  const { courseId } = use(params);
  const searchParams = useSearchParams();
  const lessonId = searchParams?.get("lesson") || undefined;

  const { course, status } = useResolvedCourse(courseId);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-4xl px-5 py-24 text-center text-sm text-muted-foreground">
        Loading course…
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-20 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Classroom not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Could not find the requested course curriculum.
        </p>
        <Link
          href="/courses"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>
      </div>
    );
  }

  return <ClassroomPlayer course={course} initialLessonId={lessonId} />;
}
