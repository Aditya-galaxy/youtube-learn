"use client";

import { useEffect, useState } from "react";
import { useCourseContext } from "@/Helper/CourseContext";
import type { Course } from "../../types/course";

/**
 * Resolves a course by id or slug from memory, falling back to the database.
 * Distinguishes "still loading" from "does not exist" — a freshly generated
 * course is not in the catalogue yet, and flashing "not found" at the moment
 * generation finishes would be exactly wrong.
 */
export function useResolvedCourse(idOrSlug: string): {
  course: Course | undefined;
  status: "loading" | "found" | "missing";
} {
  const { getCourseById, loadCourse } = useCourseContext();
  const inMemory = getCourseById(idOrSlug);
  const [fetched, setFetched] = useState<{
    key: string;
    course: Course | null;
  } | null>(null);

  useEffect(() => {
    if (inMemory || fetched?.key === idOrSlug) return;
    let cancelled = false;
    loadCourse(idOrSlug).then((course) => {
      if (!cancelled) setFetched({ key: idOrSlug, course });
    });
    return () => {
      cancelled = true;
    };
  }, [idOrSlug, inMemory, fetched?.key, loadCourse]);

  if (inMemory) return { course: inMemory, status: "found" };
  if (fetched?.key !== idOrSlug)
    return { course: undefined, status: "loading" };
  return fetched.course
    ? { course: fetched.course, status: "found" }
    : { course: undefined, status: "missing" };
}
