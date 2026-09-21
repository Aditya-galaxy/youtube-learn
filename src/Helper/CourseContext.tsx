"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Course,
  CourseEnrollment,
  SkillLevel,
  UserLearningProfile,
} from "../../types/course";
import { CURATED_COURSES } from "@/lib/coursesData";
import { calculateCourseProgress } from "@/lib/courseService";

interface CourseContextType {
  courses: Course[];
  enrollments: Record<string, CourseEnrollment>;
  userProfile: UserLearningProfile;
  enrollInCourse: (courseId: string) => CourseEnrollment;
  markLessonComplete: (
    courseId: string,
    lessonId: string,
    isCompleted: boolean
  ) => void;
  updateLessonPosition: (
    courseId: string,
    lessonId: string,
    positionSec: number
  ) => void;
  importCourse: (course: Course) => void;
  updateUserProfile: (profile: Partial<UserLearningProfile>) => void;
  getCourseEnrollment: (courseId: string) => CourseEnrollment | undefined;
  getCourseById: (courseIdOrSlug: string) => Course | undefined;
  /**
   * Fetches a course from the database when it is not already loaded — a
   * direct link to a freshly generated course must work before the catalogue
   * fetch finishes. Resolves to null when it genuinely does not exist.
   */
  loadCourse: (courseIdOrSlug: string) => Promise<Course | null>;
  /** True once the database catalogue fetch has settled (success or not). */
  catalogueLoaded: boolean;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const STORAGE_KEYS = {
  enrollments: "ytlearn.course.enrollments",
  customCourses: "ytlearn.course.custom",
  userProfile: "ytlearn.user.learning_profile",
} as const;

const DEFAULT_PROFILE: UserLearningProfile = {
  learningGoal: "Master Python & Modern Full-Stack Web Development",
  skillLevel: "BEGINNER",
  weeklyHours: 4,
  interests: ["Python", "React", "Calculus", "Machine Learning"],
};

export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const [customCourses, setCustomCourses] = useState<Course[]>([]);
  const [remoteCourses, setRemoteCourses] = useState<Course[]>([]);
  const [catalogueLoaded, setCatalogueLoaded] = useState(false);

  // Generated courses live in Postgres. The catalogue fetch degrades to an
  // empty list on failure (the route returns [] when the DB is down), so the
  // curated courses still render.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/courses")
      .then((r) => (r.ok ? r.json() : { courses: [] }))
      .then((d: { courses?: Course[] }) => {
        if (!cancelled) setRemoteCourses(d.courses ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setCatalogueLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const [enrollments, setEnrollments] = useState<
    Record<string, CourseEnrollment>
  >({});
  const [userProfile, setUserProfile] =
    useState<UserLearningProfile>(DEFAULT_PROFILE);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedEnrollments = localStorage.getItem(STORAGE_KEYS.enrollments);
      if (storedEnrollments) {
        setEnrollments(JSON.parse(storedEnrollments));
      }
      const storedCustom = localStorage.getItem(STORAGE_KEYS.customCourses);
      if (storedCustom) {
        setCustomCourses(JSON.parse(storedCustom));
      }
      const storedProfile = localStorage.getItem(STORAGE_KEYS.userProfile);
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      }
    } catch {
      // Storage unavailable or parsing error
    } finally {
      setHydrated(true);
    }
  }, []);

  // Save enrollments
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(
          STORAGE_KEYS.enrollments,
          JSON.stringify(enrollments)
        );
      } catch {}
    }
  }, [enrollments, hydrated]);

  // Save custom courses
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(
          STORAGE_KEYS.customCourses,
          JSON.stringify(customCourses)
        );
      } catch {}
    }
  }, [customCourses, hydrated]);

  // Save user profile
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(
          STORAGE_KEYS.userProfile,
          JSON.stringify(userProfile)
        );
      } catch {}
    }
  }, [userProfile, hydrated]);

  const allCourses = useMemo(() => {
    const seen = new Set<string>();
    return [...remoteCourses, ...CURATED_COURSES, ...customCourses].filter(
      (c) => (seen.has(c.id) ? false : (seen.add(c.id), true))
    );
  }, [remoteCourses, customCourses]);

  const getCourseById = useCallback(
    (idOrSlug: string): Course | undefined => {
      return allCourses.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
    },
    [allCourses]
  );

  const loadCourse = useCallback(
    async (idOrSlug: string): Promise<Course | null> => {
      const known = allCourses.find(
        (c) => c.id === idOrSlug || c.slug === idOrSlug
      );
      if (known) return known;
      try {
        const res = await fetch(`/api/courses/${encodeURIComponent(idOrSlug)}`);
        if (!res.ok) return null;
        const { course } = (await res.json()) as { course: Course };
        setRemoteCourses((prev) =>
          prev.some((c) => c.id === course.id) ? prev : [course, ...prev]
        );
        return course;
      } catch {
        return null;
      }
    },
    [allCourses]
  );

  const getCourseEnrollment = useCallback(
    (courseId: string): CourseEnrollment | undefined => {
      return enrollments[courseId];
    },
    [enrollments]
  );

  const enrollInCourse = useCallback(
    (courseId: string): CourseEnrollment => {
      const course = allCourses.find((c) => c.id === courseId);
      const existing = enrollments[courseId];
      if (existing) return existing;

      const firstLessonId = course?.modules[0]?.lessons[0]?.id;
      const newEnrollment: CourseEnrollment = {
        id: `enroll-${Date.now()}`,
        courseId,
        status: "IN_PROGRESS",
        progressPct: 0,
        completedLessonIds: [],
        lastLessonId: firstLessonId,
        lastPositionSec: 0,
        enrolledAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
      };

      setEnrollments((prev) => ({ ...prev, [courseId]: newEnrollment }));
      return newEnrollment;
    },
    [allCourses, enrollments]
  );

  const markLessonComplete = useCallback(
    (courseId: string, lessonId: string, isCompleted: boolean) => {
      const course = allCourses.find((c) => c.id === courseId);
      if (!course) return;

      setEnrollments((prev) => {
        const current = prev[courseId] || {
          id: `enroll-${Date.now()}`,
          courseId,
          status: "IN_PROGRESS",
          progressPct: 0,
          completedLessonIds: [],
          lastLessonId: lessonId,
          lastPositionSec: 0,
          enrolledAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString(),
        };

        const existingSet = new Set(current.completedLessonIds);
        if (isCompleted) {
          existingSet.add(lessonId);
        } else {
          existingSet.delete(lessonId);
        }

        const newCompleted = Array.from(existingSet);
        const progressPct = calculateCourseProgress(course, newCompleted);
        const isAllDone = progressPct === 100;

        return {
          ...prev,
          [courseId]: {
            ...current,
            completedLessonIds: newCompleted,
            progressPct,
            status: isAllDone ? "COMPLETED" : "IN_PROGRESS",
            lastLessonId: lessonId,
            lastAccessedAt: new Date().toISOString(),
          },
        };
      });
    },
    [allCourses]
  );

  const updateLessonPosition = useCallback(
    (courseId: string, lessonId: string, positionSec: number) => {
      setEnrollments((prev) => {
        const current = prev[courseId];
        if (!current) return prev;

        return {
          ...prev,
          [courseId]: {
            ...current,
            lastLessonId: lessonId,
            lastPositionSec: positionSec,
            lastAccessedAt: new Date().toISOString(),
          },
        };
      });
    },
    []
  );

  const importCourse = useCallback((course: Course) => {
    setCustomCourses((prev) => {
      const filtered = prev.filter((c) => c.id !== course.id);
      return [course, ...filtered];
    });
  }, []);

  const updateUserProfile = useCallback(
    (partial: Partial<UserLearningProfile>) => {
      setUserProfile((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  const value = useMemo<CourseContextType>(
    () => ({
      courses: allCourses,
      enrollments,
      userProfile,
      enrollInCourse,
      markLessonComplete,
      updateLessonPosition,
      importCourse,
      updateUserProfile,
      getCourseEnrollment,
      getCourseById,
      loadCourse,
      catalogueLoaded,
    }),
    [
      allCourses,
      enrollments,
      userProfile,
      enrollInCourse,
      markLessonComplete,
      updateLessonPosition,
      importCourse,
      updateUserProfile,
      getCourseEnrollment,
      getCourseById,
      loadCourse,
      catalogueLoaded,
    ]
  );

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
};

export const useCourseContext = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourseContext must be used within a CourseProvider");
  }
  return context;
};
