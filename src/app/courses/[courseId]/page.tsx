"use client";

import React, { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  PlayCircle,
  Share2,
  Sparkles,
} from "lucide-react";
import { useCourseContext } from "@/Helper/CourseContext";
import { formatSecondsToTime } from "@/lib/youtube/chapterParser";
import { getCourseTotalLessons } from "@/lib/courseService";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default function CourseDetailPage({ params }: PageProps) {
  const { courseId } = use(params);
  const { getCourseById, getCourseEnrollment, enrollInCourse } = useCourseContext();

  const course = getCourseById(courseId);

  if (!course) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-20 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Course not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The requested educational sequence could not be found.
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

  const enrollment = getCourseEnrollment(course.id);
  const isEnrolled = Boolean(enrollment);
  const completedIds = new Set(enrollment?.completedLessonIds || []);
  const totalLessons = getCourseTotalLessons(course);
  const progressPct = enrollment?.progressPct ?? 0;

  const firstLessonId = course.modules[0]?.lessons[0]?.id;
  const resumeLessonId = enrollment?.lastLessonId || firstLessonId;

  const handleEnroll = () => {
    if (!isEnrolled) {
      enrollInCourse(course.id);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      {/* Back link */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Courses
      </Link>

      {/* Course Hero Banner */}
      <div className="grid grid-cols-1 gap-8 rounded-2xl border border-border bg-card p-6 sm:p-8 md:grid-cols-3">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted md:aspect-auto md:h-full">
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-between md:col-span-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {course.category}
              </span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                {course.difficulty}
              </span>
              {course.isAiGenerated && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-3 w-3" />
                  Personalized
                </span>
              )}
            </div>

            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {course.title}
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {course.description}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              {course.instructor && (
                <div>
                  Instructor: <span className="font-medium text-foreground">{course.instructor}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {totalLessons} lessons
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                ~{course.estimatedHours} hours
              </div>
            </div>
          </div>

          {/* CTAs & Progress */}
          <div className="mt-8 border-t border-border pt-5">
            {isEnrolled ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Your Course Progress</span>
                  <span className="font-semibold text-foreground">{progressPct}% Complete</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary transition-[width] duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href={`/learn/${course.slug || course.id}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <PlayCircle className="h-4 w-4" />
                    {progressPct === 100 ? "Review Classroom" : "Continue Learning"}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href={`/learn/${course.slug || course.id}`}
                  onClick={handleEnroll}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                >
                  <GraduationCap className="h-4 w-4" />
                  Enroll & Start Learning
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum / Syllabus breakdown */}
      <div className="mt-12">
        <div className="border-b border-border pb-4">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Course Curriculum
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {course.modules.length} modules · {totalLessons} sequenced lessons
          </p>
        </div>

        <div className="mt-6 space-y-6">
          {course.modules.map((mod, modIdx) => (
            <div
              key={mod.id}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="border-b border-border bg-muted/40 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-foreground">
                    {mod.title}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {mod.lessons.length} lessons
                  </span>
                </div>
                {mod.description && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {mod.description}
                  </p>
                )}
              </div>

              <div className="divide-y divide-border">
                {mod.lessons.map((lesson) => {
                  const isDone = completedIds.has(lesson.id);

                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-secondary/40"
                    >
                      <div className="flex items-start gap-3.5 min-w-0 pr-4">
                        <div className="mt-0.5 shrink-0">
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-medium ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
                            {lesson.title}
                          </p>
                          {lesson.channelName && (
                            <p className="text-[11px] text-muted-foreground">
                              {lesson.channelName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatSecondsToTime(lesson.durationSec)}
                        </span>
                        <Link
                          href={`/learn/${course.slug || course.id}?lesson=${lesson.id}`}
                          onClick={handleEnroll}
                          className="rounded-md border border-border bg-secondary px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          Play
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
