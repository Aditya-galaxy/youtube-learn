"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  HelpCircle,
  Menu,
  Play,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import type { Course, Lesson } from "../../../types/course";
import { useCourseContext } from "@/Helper/CourseContext";
import { formatSecondsToTime } from "@/lib/youtube/chapterParser";
import { getNextLessonInSequence, getCourseTotalLessons } from "@/lib/courseService";
import { useToast } from "@/hooks/use-toast";

interface ClassroomPlayerProps {
  course: Course;
  initialLessonId?: string;
}

export const ClassroomPlayer: React.FC<ClassroomPlayerProps> = ({
  course,
  initialLessonId,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const {
    getCourseEnrollment,
    enrollInCourse,
    markLessonComplete,
  } = useCourseContext();

  const enrollment = getCourseEnrollment(course.id) || enrollInCourse(course.id);
  const completedIds = new Set(enrollment.completedLessonIds || []);

  // Find all lessons flat
  const allLessons: Lesson[] = [];
  course.modules.forEach((m) => {
    m.lessons.forEach((l) => allLessons.push(l));
  });

  // Determine current active lesson
  const activeLesson =
    allLessons.find((l) => l.id === initialLessonId) ||
    allLessons.find((l) => l.id === enrollment.lastLessonId) ||
    allLessons[0];

  const [currentLesson, setCurrentLesson] = useState<Lesson>(activeLesson || allLessons[0]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    course.modules.forEach((m) => {
      map[m.id] = true;
    });
    return map;
  });

  // Notes state
  const [noteContent, setNoteContent] = useState("");
  const [activeTab, setActiveTab] = useState<"summary" | "notes">("summary");

  // Auto-advance countdown
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isCurrentCompleted = completedIds.has(currentLesson.id);
  const nextInfo = getNextLessonInSequence(course, currentLesson.id);
  const totalLessons = getCourseTotalLessons(course);
  const completedCount = completedIds.size;
  const progressPct = Math.round((completedCount / totalLessons) * 100);

  // Load saved note for this lesson
  useEffect(() => {
    try {
      const savedNote = localStorage.getItem(`ytlearn.note.${currentLesson.id}`);
      setNoteContent(savedNote || "");
    } catch {
      setNoteContent("");
    }
  }, [currentLesson.id]);

  const saveNote = (val: string) => {
    setNoteContent(val);
    try {
      localStorage.setItem(`ytlearn.note.${currentLesson.id}`, val);
    } catch {}
  };

  const handleLessonSelect = (lesson: Lesson) => {
    cancelCountdown();
    setCurrentLesson(lesson);
  };

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const toggleCompleteCurrent = () => {
    const nextState = !isCurrentCompleted;
    markLessonComplete(course.id, currentLesson.id, nextState);

    if (nextState) {
      toast({
        title: "Lesson Completed! 🎉",
        description: `Great job! You finished "${currentLesson.title}".`,
      });

      // If there is a next lesson, start 5s countdown to auto-advance
      if (nextInfo.nextLesson) {
        startAutoAdvance();
      }
    } else {
      cancelCountdown();
    }
  };

  const startAutoAdvance = () => {
    cancelCountdown();
    setCountdown(5);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          cancelCountdown();
          if (nextInfo.nextLesson) {
            setCurrentLesson(nextInfo.nextLesson);
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
  };

  const advanceNow = () => {
    cancelCountdown();
    if (nextInfo.nextLesson) {
      setCurrentLesson(nextInfo.nextLesson);
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col bg-background">
      {/* Top Classroom Navigation Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/courses/${course.slug || course.id}`}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Syllabus</span>
          </Link>
          <div className="h-4 w-[1px] bg-border" />
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-foreground">
              {course.title}
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              {currentLesson.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress badge */}
          <div className="hidden items-center gap-2 sm:flex">
            <div className="text-right">
              <span className="text-xs font-semibold text-foreground">
                {progressPct}%
              </span>
              <span className="text-[11px] text-muted-foreground"> complete</span>
            </div>
            <div className="h-2 w-20 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-[width] duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            aria-label="Toggle Syllabus Sidebar"
          >
            <Menu className="h-4 w-4" />
            <span className="hidden md:inline">
              {sidebarOpen ? "Hide Syllabus" : "Show Syllabus"}
            </span>
          </button>
        </div>
      </header>

      {/* Main Learning Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Center: Video Player & Tabs */}
        <main className="flex flex-1 flex-col overflow-y-auto">
          {/* Auto-advance banner */}
          {countdown !== null && nextInfo.nextLesson && (
            <div className="flex items-center justify-between bg-primary/10 px-6 py-2.5 text-xs text-primary border-b border-primary/20">
              <span className="flex items-center gap-2 font-medium">
                <Sparkles className="h-4 w-4 animate-pulse" />
                Next lesson starting in {countdown} seconds: &quot;{nextInfo.nextLesson.title}&quot;
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={advanceNow}
                  className="rounded bg-primary px-2.5 py-1 font-semibold text-primary-foreground hover:opacity-90"
                >
                  Play Now
                </button>
                <button
                  onClick={cancelCountdown}
                  className="rounded border border-primary/30 px-2 py-1 text-primary hover:bg-primary/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* YouTube Video Embed */}
          <div className="relative aspect-video w-full bg-black">
            <iframe
              key={`${currentLesson.id}-${currentLesson.videoId}`}
              src={`https://www.youtube.com/embed/${currentLesson.videoId}?autoplay=1&enablejsapi=1&start=${currentLesson.startSeconds || 0}${
                currentLesson.endSeconds ? `&end=${currentLesson.endSeconds}` : ""
              }`}
              title={currentLesson.title}
              className="absolute left-0 top-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Player Controls & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-card px-6 py-4">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                {currentLesson.title}
              </h2>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                {currentLesson.channelName && (
                  <span>Instructor: {currentLesson.channelName}</span>
                )}
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatSecondsToTime(currentLesson.durationSec)}
                </span>
                {currentLesson.startSeconds > 0 && (
                  <>
                    <span>·</span>
                    <span>Starts at {formatSecondsToTime(currentLesson.startSeconds)}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleCompleteCurrent}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition-all ${
                  isCurrentCompleted
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                    : "border-primary bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                {isCurrentCompleted ? "Completed ✓" : "Mark as Complete"}
              </button>

              {nextInfo.nextLesson && (
                <button
                  onClick={() => handleLessonSelect(nextInfo.nextLesson!)}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-border"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Lower Workspace: Overview & Notes */}
          <div className="flex-1 p-6">
            <div className="mb-4 flex items-center gap-4 border-b border-border pb-2">
              <button
                onClick={() => setActiveTab("summary")}
                className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider pb-2 border-b-2 transition-colors ${
                  activeTab === "summary"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Lesson Summary
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider pb-2 border-b-2 transition-colors ${
                  activeTab === "notes"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                My Notes
              </button>
            </div>

            {activeTab === "summary" ? (
              <div className="space-y-4 max-w-3xl">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {currentLesson.summary ||
                    "Watch this lesson attentively and follow along with the exercises to master the core concept."}
                </p>

                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Pedagogical Takeaway
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This lesson prepares you for subsequent concepts in this track. Completing this video will update your personalized skill matrix.
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl space-y-2">
                <p className="text-xs text-muted-foreground">
                  Jot down important timestamps, insights, or code snippets for this lesson. Notes persist automatically.
                </p>
                <textarea
                  rows={6}
                  value={noteContent}
                  onChange={(e) => saveNote(e.target.value)}
                  placeholder="e.g. At 04:30 - Key formula for derivative rate..."
                  className="w-full rounded-lg border border-border bg-card p-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar: Sequenced Syllabus */}
        {sidebarOpen && (
          <aside className="w-80 shrink-0 flex flex-col border-l border-border bg-card">
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-foreground">
                  Course Content
                </h3>
                <span className="text-xs text-muted-foreground">
                  {completedCount}/{totalLessons} ({progressPct}%)
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-[width] duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Scrollable list of modules & lessons */}
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {course.modules.map((mod) => {
                const isExpanded = expandedModules[mod.id] ?? true;
                const modCompleted = mod.lessons.every((l) => completedIds.has(l.id));

                return (
                  <div key={mod.id} className="bg-card">
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-secondary/50"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {mod.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {mod.lessons.length} lessons
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="space-y-0.5 bg-muted/20 pb-1">
                        {mod.lessons.map((lesson) => {
                          const isActive = lesson.id === currentLesson.id;
                          const isDone = completedIds.has(lesson.id);

                          return (
                            <button
                              key={lesson.id}
                              onClick={() => handleLessonSelect(lesson)}
                              className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition-all ${
                                isActive
                                  ? "bg-primary/10 border-l-2 border-primary text-primary"
                                  : "hover:bg-secondary/40 text-foreground"
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {isDone ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                ) : isActive ? (
                                  <Play className="h-4 w-4 text-primary fill-primary" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full border border-muted-foreground/40" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p
                                  className={`line-clamp-2 text-xs leading-snug ${
                                    isActive
                                      ? "font-semibold text-primary"
                                      : isDone
                                      ? "text-muted-foreground"
                                      : "text-foreground"
                                  }`}
                                >
                                  {lesson.title}
                                </p>
                                <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                                  <span className="flex items-center gap-0.5">
                                    <Clock className="h-3 w-3" />
                                    {formatSecondsToTime(lesson.durationSec)}
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
