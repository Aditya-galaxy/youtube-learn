"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Sparkles,
  Filter,
  BookOpen,
  Landmark,
  GraduationCap,
} from "lucide-react";
import { CourseCard } from "@/components/Courses/CourseCard";
import { CourseImporterDialog } from "@/components/Courses/CourseImporterDialog";
import { useCourseContext } from "@/Helper/CourseContext";

const CATEGORIES = [
  "All Categories",
  "Computer Science",
  "Programming",
  "Mathematics",
  "Artificial Intelligence",
  "Web Development",
];

const TIERS: Array<{ label: string; value: string }> = [
  { label: "All Tiers", value: "ALL" },
  { label: "Basic (Foundations)", value: "BASIC" },
  { label: "Intermediate", value: "INTERMEDIATE" },
  { label: "Advanced", value: "ADVANCED" },
  { label: "Expert (Research/Systems)", value: "EXPERT" },
];

const SOURCES: Array<{ label: string; value: string }> = [
  { label: "All Sources", value: "ALL" },
  { label: "MIT OpenCourseWare", value: "MIT" },
  { label: "Harvard (CS50)", value: "Harvard" },
  { label: "Stanford Online", value: "Stanford" },
  { label: "freeCodeCamp", value: "freeCodeCamp" },
];

export default function CoursesPage() {
  const { courses } = useCourseContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedTier, setSelectedTier] = useState("ALL");
  const [selectedSource, setSelectedSource] = useState("ALL");
  const [isImporterOpen, setIsImporterOpen] = useState(false);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.instructor && c.instructor.toLowerCase().includes(q)) ||
        (c.institution && c.institution.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === "All Categories" ||
        c.category.toLowerCase() === selectedCategory.toLowerCase();

      const cTier = (c.tier || c.difficulty || "BEGINNER").toUpperCase();
      const matchesTier =
        selectedTier === "ALL" ||
        cTier === selectedTier ||
        (selectedTier === "BASIC" &&
          (cTier === "BASIC" || cTier === "BEGINNER"));

      const matchesSource =
        selectedSource === "ALL" ||
        (c.institution &&
          c.institution.toLowerCase().includes(selectedSource.toLowerCase())) ||
        (c.instructor &&
          c.instructor.toLowerCase().includes(selectedSource.toLowerCase()));

      return matchesSearch && matchesCat && matchesTier && matchesSource;
    });
  }, [courses, searchQuery, selectedCategory, selectedTier, selectedSource]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      {/* Header with Title and Create Action */}
      <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <p className="eyebrow">4-Tier Structured Mastery</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              <Sparkles className="h-3 w-3" />
              MIT OCW & University Hub
            </span>
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Educational Courses & OpenCourseWare
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Master subjects step-by-step through sequenced university lectures
            from MIT, Harvard, Stanford, and premier educators—progressing from
            Basic to Intermediate, Advanced, and Expert.
          </p>
        </div>

        <button
          onClick={() => setIsImporterOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-transform hover:opacity-90 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Build Custom / Import Course
        </button>
      </div>

      {/* Primary Tier Tabs */}
      <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-border pb-4">
        {TIERS.map((tier) => (
          <button
            key={tier.value}
            onClick={() => setSelectedTier(tier.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              selectedTier === tier.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-muted-foreground hover:bg-border hover:text-foreground"
            }`}
          >
            {tier.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-foreground text-background"
                  : "bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Source & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1">
            <Landmark className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-transparent text-xs font-medium text-foreground focus:outline-none"
              aria-label="Filter by OpenCourseWare source"
            >
              {SOURCES.map((s) => (
                <option
                  key={s.value}
                  value={s.value}
                  className="bg-card text-foreground"
                >
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses, professors, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-card py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="mt-10">
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/50" />
            <h3 className="mt-4 font-display text-lg font-medium text-foreground">
              No matching courses found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Try adjusting your tier or institution filter, or generate a
              customized course for this subject right now.
            </p>
            <button
              onClick={() => setIsImporterOpen(true)}
              className="mt-5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
            >
              Generate Course with AI
            </button>
          </div>
        )}
      </div>

      <CourseImporterDialog
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
      />
    </div>
  );
}
