"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Sparkles, Video, ListVideo, Loader2, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCourseContext } from "@/Helper/CourseContext";
import { extractPlaylistId, extractVideoId } from "@/lib/youtube/playlistUrl";
import {
  parseChaptersFromDescription,
  chaptersToLessons,
} from "@/lib/youtube/chapterParser";
import { startCourseGeneration } from "@/lib/generation/start";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import type { Course, SkillLevel } from "../../../types/course";

interface CourseImporterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated?: (course: Course) => void;
}

export const CourseImporterDialog: React.FC<CourseImporterDialogProps> = ({
  isOpen,
  onClose,
  onCourseCreated,
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const { importCourse, enrollInCourse } = useCourseContext();

  const [activeTab, setActiveTab] = useState<"playlist" | "chapters" | "ai">(
    "ai"
  );
  const [loading, setLoading] = useState(false);

  // Tab 1: Playlist
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [playlistCategory, setPlaylistCategory] = useState("Computer Science");

  // Tab 2: Chapters
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [chaptersText, setChaptersText] = useState("");

  // Tab 3: AI Learning Path
  const [aiTopic, setAiTopic] = useState("");
  const [aiLevel, setAiLevel] = useState<SkillLevel>("BASIC");
  const [prioritizeAcademic, setPrioritizeAcademic] = useState(false);

  const handlePlaylistImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      toast({
        title: "Invalid Playlist URL",
        description: "Please enter a valid YouTube playlist link or ID.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Ingest playlist
      const res = await fetch("/api/courses/import-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistId, category: playlistCategory }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to import playlist");
      }

      const importedCourse: Course = data.course;
      importCourse(importedCourse);
      enrollInCourse(importedCourse.id);

      toast({
        title: "Course Imported Successfully!",
        description: `Imported "${importedCourse.title}" with sequenced lessons.`,
      });

      onCourseCreated?.(importedCourse);
      onClose();
    } catch (err: unknown) {
      // This used to fabricate a two-lesson course from hardcoded video IDs and
      // toast success, so a failed import was indistinguishable from a real one.
      toast({
        variant: "destructive",
        title: "Could not import playlist",
        description:
          err instanceof Error
            ? err.message
            : "Check that the playlist is public and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChaptersImport = (e: React.FormEvent) => {
    e.preventDefault();
    const vid = extractVideoId(videoUrl);
    if (!vid) {
      toast({
        title: "Invalid Video URL",
        description: "Please enter a valid YouTube video link.",
        variant: "destructive",
      });
      return;
    }

    if (!chaptersText.trim()) {
      toast({
        title: "Chapters Required",
        description:
          "Paste timestamped chapters from the video description (e.g. 00:00 Intro).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const parsed = parseChaptersFromDescription(chaptersText);
      if (parsed.length === 0) {
        throw new Error(
          "Could not find any timestamps (e.g. 00:00 Title) in the text."
        );
      }

      const courseId = `course-chap-${Date.now()}`;
      const moduleId = `${courseId}-mod-1`;
      const lessons = chaptersToLessons(
        parsed,
        vid,
        moduleId,
        "YouTube Educator"
      );

      const totalSec = lessons.reduce((acc, l) => acc + l.durationSec, 0);

      const newCourse: Course = {
        id: courseId,
        slug: `chapters-${vid}-${Date.now().toString().slice(-4)}`,
        title:
          videoTitle.trim() ||
          `Course: ${parsed[0]?.title || "Full Video Curriculum"}`,
        description: `Structured multi-lesson course split from long-form YouTube tutorial into ${lessons.length} sequential chapters.`,
        thumbnail: `https://i.ytimg.com/vi/${vid}/mqdefault.jpg`,
        category: "Computer Science",
        difficulty: "BEGINNER",
        estimatedHours: Math.max(0.5, Math.round((totalSec / 3600) * 10) / 10),
        instructor: "YouTube Creator",
        isPublic: false,
        modules: [
          {
            id: moduleId,
            courseId,
            title: "Course Modules & Chapters",
            orderIndex: 1,
            description: `Sequenced chapters with direct timestamp cues.`,
            lessons,
          },
        ],
      };

      importCourse(newCourse);
      enrollInCourse(newCourse.id);

      toast({
        title: "Course Created from Chapters!",
        description: `Successfully created ${lessons.length} structured lessons!`,
      });

      onCourseCreated?.(newCourse);
      onClose();
    } catch (err: unknown) {
      toast({
        title: "Chapter Parsing Error",
        description:
          err instanceof Error ? err.message : "Failed to parse chapters",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Runs the real pipeline. This used to call generatePersonalizedCourse, a
  // template that returned the same four hardcoded videos for any topic behind
  // a fake 600ms delay and a "Personalized Course Generated!" toast.
  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) {
      toast({
        title: "Topic Required",
        description:
          "Please specify what you want to learn (e.g., 'Rust Systems Programming').",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const result = await startCourseGeneration({
      topic: aiTopic.trim(),
      difficulty: aiLevel,
      prioritizeAcademic,
    });
    setLoading(false);

    if (result.kind === "job") {
      onClose();
      router.push(`/courses/generating/${result.jobId}`);
    } else if (result.kind === "existing") {
      onClose();
      toast({
        title: "A path for this already exists",
        description: result.title,
      });
      router.push(`/courses/${result.slug}`);
    } else if (result.kind === "signin") {
      signIn("google", { callbackUrl: window.location.href });
    } else {
      toast({
        title: "Could not start building the course",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overflow-hidden border-border bg-card p-0 sm:max-w-xl">
        <div className="border-b border-border px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl tracking-tight text-foreground">
              Create a Structured Learning Path
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Transform YouTube videos into an organized, sequenced course like
              Coursera or Udemy.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="w-full px-6 py-4">
          <div className="grid w-full grid-cols-3 rounded-lg bg-secondary p-1">
            <button
              type="button"
              onClick={() => setActiveTab("ai")}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-all ${
                activeTab === "ai"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Custom Goal
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("playlist")}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-all ${
                activeTab === "playlist"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListVideo className="h-3.5 w-3.5" />
              YT Playlist
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("chapters")}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-all ${
                activeTab === "chapters"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              Video Chapters
            </button>
          </div>

          {/* AI Custom Goal */}
          {activeTab === "ai" && (
            <form onSubmit={handleAiGenerate} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground">
                  What topic do you want to learn?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems, Rust, Machine Learning, Go Concurrency"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">
                  Curriculum Mastery Tier
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(
                    [
                      { key: "BASIC", label: "Basic", desc: "Foundations & 101" },
                      { key: "INTERMEDIATE", label: "Intermediate", desc: "Practical & Applied" },
                      { key: "ADVANCED", label: "Advanced", desc: "Scale & Architecture" },
                      { key: "EXPERT", label: "Expert", desc: "Deep Internals & Theory" },
                    ] as const
                  ).map((tier) => (
                    <button
                      key={tier.key}
                      type="button"
                      onClick={() => setAiLevel(tier.key as SkillLevel)}
                      className={`flex flex-col items-start rounded-lg border p-2.5 text-left transition-colors ${
                        aiLevel === tier.key
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      <span className="text-xs font-semibold text-foreground">
                        {tier.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground line-clamp-1">
                        {tier.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10 text-amber-500">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      Prioritize OpenCourseWare & University Lectures
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Target MIT OCW, Harvard CS50, Stanford, & freeCodeCamp
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="prioritizeAcademic"
                  checked={prioritizeAcademic}
                  onChange={(e) => setPrioritizeAcademic(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !aiTopic.trim()}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate Structured Curriculum
              </button>
            </form>
          )}

          {/* Playlist Importer */}
          {activeTab === "playlist" && (
            <form onSubmit={handlePlaylistImport} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground">
                  YouTube Playlist Link or ID
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/playlist?list=PL4cUxeGkcC9g..."
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Cost: only 1 API quota unit to ingest up to 50 videos in exact
                  sequence.
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">
                  Subject Category
                </label>
                <select
                  value={playlistCategory}
                  onChange={(e) => setPlaylistCategory(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Artificial Intelligence">
                    Artificial Intelligence
                  </option>
                  <option value="Science">Science</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !playlistUrl.trim()}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ListVideo className="h-4 w-4" />
                )}
                Import as Structured Course
              </button>
            </form>
          )}

          {/* Chapters Slicer */}
          {activeTab === "chapters" && (
            <form onSubmit={handleChaptersImport} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground">
                  YouTube Video Link
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=kqtD5dpn9C8"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">
                  Course Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Complete Docker Crash Course"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">
                  Timestamps / Chapters (from description or comments)
                </label>
                <textarea
                  rows={4}
                  placeholder={`00:00 - Introduction\n04:15 - Setting up Dockerfile\n18:30 - Container Networking\n45:00 - Multi-stage Builds`}
                  value={chaptersText}
                  onChange={(e) => setChaptersText(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background p-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !videoUrl.trim() || !chaptersText.trim()}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
                Slice into Structured Course
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
