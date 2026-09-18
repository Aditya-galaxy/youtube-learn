"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  GraduationCap,
  PlayCircle,
  Plus,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useCourseContext } from "@/Helper/CourseContext";
import { CourseCard } from "@/components/Courses/CourseCard";
import SignOutButton from "@/components/auth/SignOutButton";

interface DashboardClientProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export const DashboardClient: React.FC<DashboardClientProps> = ({ user }) => {
  const { courses, enrollments, userProfile } = useCourseContext();

  const enrolledCourseIds = Object.keys(enrollments);
  const enrolledCourses = courses.filter((c) =>
    enrolledCourseIds.includes(c.id)
  );

  // Find most recently accessed course
  const activeEnrollment = Object.values(enrollments).sort(
    (a, b) =>
      new Date(b.lastAccessedAt).getTime() -
      new Date(a.lastAccessedAt).getTime()
  )[0];

  const activeCourse = activeEnrollment
    ? courses.find((c) => c.id === activeEnrollment.courseId)
    : null;

  // Calculate stats
  let totalLessonsCompleted = 0;
  let totalHoursCompleted = 0;

  Object.values(enrollments).forEach((enr) => {
    totalLessonsCompleted += enr.completedLessonIds.length;
    const crs = courses.find((c) => c.id === enr.courseId);
    if (crs && crs.estimatedHours) {
      totalHoursCompleted += (enr.progressPct / 100) * crs.estimatedHours;
    }
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-8 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          {user?.image ? (
            <Image
              src={user.image}
              alt=""
              width={64}
              height={64}
              className="rounded-full ring-2 ring-primary/20"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary font-display text-xl font-bold text-foreground">
              {user?.name?.[0] || "U"}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="eyebrow">My Learning Workspace</p>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                {userProfile.skillLevel}
              </span>
            </div>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Welcome back, {user?.name || "Learner"}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Goal: {userProfile.learningGoal}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/courses"
            className="flex items-center gap-2 rounded-lg bg-secondary px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-border"
          >
            <Compass className="h-4 w-4" />
            Explore Courses
          </Link>
          {user && <SignOutButton />}
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">Enrolled Courses</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-foreground">
            {enrolledCourses.length}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium">Lessons Completed</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-foreground">
            {totalLessonsCompleted}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium">Hours Learned</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-foreground">
            {totalHoursCompleted.toFixed(1)}h
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-medium">Target Pace</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-foreground">
            {userProfile.weeklyHours}h / week
          </p>
        </div>
      </div>

      {/* Hero Continue Learning Banner */}
      {activeCourse && activeEnrollment && (
        <div className="mt-10 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="min-w-0 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  In Progress · {activeEnrollment.progressPct}% Complete
                </span>
                <span className="text-xs text-muted-foreground">
                  Continue where you left off
                </span>
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold text-foreground">
                {activeCourse.title}
              </h2>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {activeCourse.description}
              </p>

              <div className="mt-4 h-2 w-full max-w-md overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-[width] duration-500"
                  style={{ width: `${activeEnrollment.progressPct}%` }}
                />
              </div>
            </div>

            <Link
              href={`/learn/${activeCourse.slug || activeCourse.id}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-md transition-transform hover:opacity-90 active:scale-95 shrink-0"
            >
              <PlayCircle className="h-5 w-5" />
              <span>Resume Lesson</span>
            </Link>
          </div>
        </div>
      )}

      {/* Enrolled Courses Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              My Courses
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Your personalized curriculum sequences
            </p>
          </div>
          <Link
            href="/courses"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Browse All Courses →
          </Link>
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-border py-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <h3 className="mt-3 font-display text-base font-semibold text-foreground">
              You haven&apos;t enrolled in any courses yet
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Browse our catalog or import your favorite YouTube playlist into a
              structured course.
            </p>
            <Link
              href="/courses"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              <Compass className="h-4 w-4" />
              Explore Structured Courses
            </Link>
          </div>
        )}
      </div>

      {/* Personalized Recommendations Section */}
      <div className="mt-14">
        <div className="border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-display text-2xl font-bold text-foreground">
              Recommended for Your Learning Goal
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Curated YouTube sequences matching your{" "}
            {userProfile.skillLevel.toLowerCase()} profile
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses
            .filter((c) => !enrolledCourseIds.includes(c.id))
            .slice(0, 3)
            .map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
        </div>
      </div>
    </div>
  );
};
