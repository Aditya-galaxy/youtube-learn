"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, PlayCircle } from "lucide-react";
import type { Course } from "../../../types/course";
import { useCourseContext } from "@/Helper/CourseContext";
import { getCourseTotalLessons } from "@/lib/courseService";

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { getCourseEnrollment } = useCourseContext();
  const enrollment = getCourseEnrollment(course.id);
  const totalLessons = getCourseTotalLessons(course);
  const isEnrolled = Boolean(enrollment);
  const progressPct = enrollment?.progressPct ?? 0;

  const difficultyColors = {
    BEGINNER: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    INTERMEDIATE: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    ADVANCED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      <Link href={`/courses/${course.slug || course.id}`} className="relative block aspect-[16/9] w-full overflow-hidden bg-muted">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
        
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-medium text-white">
          <span className="flex items-center gap-1 drop-shadow">
            <BookOpen className="h-3.5 w-3.5" />
            {totalLessons} lessons
          </span>
          <span className="flex items-center gap-1 drop-shadow">
            <Clock className="h-3.5 w-3.5" />
            {course.estimatedHours}h
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {course.category}
          </span>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${difficultyColors[course.difficulty] || difficultyColors.BEGINNER}`}
          >
            {course.difficulty}
          </span>
        </div>

        <h3 className="line-clamp-2 font-display text-lg font-bold leading-snug tracking-tight text-foreground group-hover:text-primary">
          <Link href={`/courses/${course.slug || course.id}`}>
            {course.title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {course.description}
        </p>

        {course.instructor && (
          <p className="mt-3 text-xs text-muted-foreground">
            By <span className="font-medium text-foreground">{course.instructor}</span>
          </p>
        )}

        <div className="mt-auto pt-4">
          {isEnrolled ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">{progressPct}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-[width] duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <Link
                href={`/learn/${course.slug || course.id}`}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <PlayCircle className="h-4 w-4" />
                {progressPct === 100 ? "Review Course" : "Resume Learning"}
              </Link>
            </div>
          ) : (
            <Link
              href={`/courses/${course.slug || course.id}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary py-2 text-xs font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <BookOpen className="h-4 w-4" />
              View Syllabus
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
