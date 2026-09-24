export type SkillLevel =
  "BASIC" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export type CourseTier = "BASIC" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export type CourseStatus =
  "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";

export interface TestCase {
  id: string;
  description: string;
  input?: string;
  expectedOutput: string;
}

export interface LessonChallenge {
  id: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  description: string;
  objective: string;
  starterCode: string;
  solutionCode: string;
  hints: string[];
  testCases: TestCase[];
  language?: string;
}

export interface LessonQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DiagramNode {
  id: string;
  label: string;
  subtext?: string;
  category?: "concept" | "input" | "process" | "output" | "storage" | "network";
}

export interface DiagramConnection {
  from: string;
  to: string;
  label?: string;
}

export interface LessonDiagram {
  id: string;
  title: string;
  caption: string;
  type: "flowchart" | "architecture" | "sequence" | "concept_map";
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  takeaways: string[];
}

export interface DeepDiveResource {
  id: string;
  title: string;
  url: string;
  type: "github" | "docs" | "paper" | "playground" | "ocw";
  description: string;
  badge?: string;
}

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
  challenge?: LessonChallenge;
  quiz?: LessonQuizQuestion[];
  diagram?: LessonDiagram;
  resources?: DeepDiveResource[];
  keyTakeaways?: string[];
}

export interface ProjectMilestone {
  title: string;
  description: string;
  deliverables: string[];
  suggestedRepoTemplate?: string;
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
  projectMilestone?: ProjectMilestone;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  difficulty: SkillLevel;
  tier?: CourseTier;
  estimatedHours: number;
  instructor?: string;
  institution?: string;
  sourceUrl?: string;
  prerequisites?: string[];
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
