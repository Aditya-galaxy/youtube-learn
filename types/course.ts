export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type CourseStatus =
  "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  orderIndex: number;
  videoId: string;
  channelName?: string;
  durationSec: number;
  startSeconds: number;
  endSeconds?: number;
  summary?: string;
  isCompleted?: boolean;
}

export interface Module {
  /** Lessons the syllabus planned but no good video was found for. */
  unfilledLessons?: string[];
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  description?: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  difficulty: SkillLevel;
  estimatedHours: number;
  instructor?: string;
  isPublic: boolean;
  isAiGenerated?: boolean;
  modules: Module[];
  createdAt?: string;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  userId?: string;
  status: CourseStatus;
  progressPct: number;
  completedLessonIds: string[];
  lastLessonId?: string;
  lastPositionSec?: number;
  enrolledAt: string;
  lastAccessedAt: string;
}

export interface UserLearningProfile {
  learningGoal: string;
  skillLevel: SkillLevel;
  weeklyHours: number;
  interests: string[];
}
