"use client";

import React, { useState, useMemo } from "react";
import { Plus, Search, Sparkles, Filter, BookOpen } from "lucide-react";
import { CourseCard } from "@/components/Courses/CourseCard";
import { CourseImporterDialog } from "@/components/Courses/CourseImporterDialog";
import { useCourseContext } from "@/Helper/CourseContext";
import type { SkillLevel } from "../../../types/course";

const CATEGORIES = [
  "All",
  "Programming",
  "Web Development",
  "Mathematics",
  "Artificial Intelligence",
];

const DIFFICULTIES: Array<{ label: string; value: string }> = [
  { label: "All Levels", value: "ALL" },
  { label: "Beginner", value: "BEGINNER" },
  { label: "Intermediate", value: "INTERMEDIATE" },
  { label: "Advanced", value: "ADVANCED" },
];

export default function CoursesPage() {
  const { courses } = useCourseContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");
  const [isImporterOpen, setIsImporterOpen] = useState(false);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === "All" ||
        c.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesDiff =
        selectedDifficulty === "ALL" || c.difficulty === selectedDifficulty;

      return matchesSearch && matchesCat && matchesDiff;
    });
  }, [courses, searchQuery, selectedCategory, selectedDifficulty]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      {/* Header with Title and Create Action */}
      <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <p className="eyebrow">Structured Pathways</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              <Sparkles className="h-3 w-3" />
              LMS Experience
            </span>
          </div>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Educational Courses
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Learn with purpose. Master subjects step-by-step through carefully
            sequenced video curricula, modules, and auto-tracked progress.
          </p>
        </div>

        <button
          onClick={() => setIsImporterOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-transform hover:opacity-90 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Create / Import Course
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-border hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Difficulty Filter */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-card py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
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
              Try adjusting your filters, or create a personalized learning path
              right now.
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
