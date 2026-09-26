/**
 * Automated Real-World Backend Verification & Smoke Test Suite
 * Run with: npx tsx --require ./scripts/load-env.cjs scripts/verify-backend.ts
 */

import {
  getAllCourses,
  getCourseTotalLessons,
  calculateCourseProgress,
  getNextLessonInSequence,
} from "../src/lib/courseService";
import { OPEN_COURSEWARE_COURSES } from "../src/lib/openCourseWareData";
import { CURATED_COURSES } from "../src/lib/coursesData";
import { resolveLessonPedagogy } from "../src/lib/pedagogyEngine";
import type { Course, Lesson } from "../types/course";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}${detail ? ` - ${detail}` : ""}`);
    failedCount++;
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("   🚀 RUNNING BACKEND VERIFICATION & REAL-WORLD TESTS  ");
  console.log("=======================================================\n");

  // -------------------------------------------------------------------------
  // 1. DATA INTEGRITY: Curated & OpenCourseWare Courses
  // -------------------------------------------------------------------------
  console.log("1. Verifying Course Catalogs & Data Invariants...");
  const allCourses = CURATED_COURSES;
  assert(
    allCourses.length >= 8,
    "Combined catalog count >= 8",
    `Found ${allCourses.length} courses`
  );

  for (const course of allCourses) {
    assert(
      Boolean(course.id && course.title),
      `Course valid id & title: "${course.title}"`
    );
    assert(
      ["BASIC", "BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].includes(
        course.difficulty
      ),
      `Course valid difficulty level: ${course.difficulty}`
    );
    assert(
      course.modules.length > 0,
      `Course has modules (${course.modules.length})`
    );

    let totalLessons = 0;
    for (const mod of course.modules) {
      assert(mod.lessons.length > 0, `Module "${mod.title}" has lessons`);
      for (const lesson of mod.lessons) {
        totalLessons++;
        assert(
          Boolean(lesson.videoId && lesson.videoId.length >= 5),
          `Lesson has valid YouTube videoId: ${lesson.title} (${lesson.videoId})`
        );
        assert(
          lesson.durationSec > 0,
          `Lesson has positive duration (${lesson.durationSec}s): ${lesson.title}`
        );
      }
    }
    assert(
      totalLessons > 0,
      `Course "${course.title}" has ${totalLessons} total lessons`
    );
  }

  // -------------------------------------------------------------------------
  // 2. PEDAGOGY RESOLUTION & COGNITIVE WORKBENCH ENGINE
  // -------------------------------------------------------------------------
  console.log("\n2. Testing Pedagogy Engine & 4-Tier Heuristics...");

  // Test Curated Harvard CS50x Memory lesson
  const cs50Course = OPEN_COURSEWARE_COURSES.find(
    (c) => c.id === "course-harvard-cs50x"
  )!;
  const cs50Lesson = cs50Course.modules[1].lessons.find(
    (l) => l.id === "cs50less-4"
  )!;
  const cs50Pedagogy = resolveLessonPedagogy(
    cs50Lesson,
    cs50Course,
    cs50Course.modules[1]
  );

  assert(
    cs50Pedagogy.challenge.title.includes("Memory Allocation & Swap"),
    "Curated CS50x challenge resolved correctly"
  );
  assert(
    cs50Pedagogy.challenge.starterCode.includes("swap(int *a, int *b)"),
    "CS50x challenge contains pointer starter code"
  );
  assert(
    cs50Pedagogy.diagram.nodes.length >= 3,
    "CS50x visual memory layout diagram contains 3+ nodes"
  );
  assert(
    cs50Pedagogy.quiz.length >= 2,
    "CS50x active recall quiz contains 2+ questions"
  );
  assert(
    cs50Pedagogy.resources.some((r) => r.type === "ocw"),
    "CS50x resources include official Harvard problem set"
  );

  // Test Dynamic Heuristic Generation across all 4 tiers
  const tiers: ("BASIC" | "INTERMEDIATE" | "ADVANCED" | "EXPERT")[] = [
    "BASIC",
    "INTERMEDIATE",
    "ADVANCED",
    "EXPERT",
  ];

  for (const tier of tiers) {
    const syntheticCourse: Course = {
      id: `synth-${tier.toLowerCase()}`,
      slug: `synth-${tier.toLowerCase()}`,
      title: `Scalable Systems Architecture (${tier})`,
      description: "Synthetic test course",
      thumbnail: "https://i.ytimg.com/vi/test/mqdefault.jpg",
      category: "Computer Science",
      difficulty: tier,
      tier,
      estimatedHours: 5,
      isPublic: true,
      modules: [
        {
          id: "mod-1",
          courseId: `synth-${tier.toLowerCase()}`,
          title: "Core Mechanics",
          orderIndex: 1,
          lessons: [
            {
              id: `les-${tier.toLowerCase()}`,
              moduleId: "mod-1",
              title: "Distributed Consensus & State Machines",
              orderIndex: 1,
              videoId: "d16c5",
              durationSec: 1800,
              startSeconds: 0,
            },
          ],
        },
      ],
    };

    const synthPedagogy = resolveLessonPedagogy(
      syntheticCourse.modules[0].lessons[0],
      syntheticCourse,
      syntheticCourse.modules[0]
    );

    assert(
      Boolean(
        synthPedagogy.challenge.title && synthPedagogy.challenge.starterCode
      ),
      `Dynamic challenge generated for ${tier} tier`
    );
    assert(
      synthPedagogy.diagram.nodes.length >= 3,
      `Dynamic visual diagram generated for ${tier} tier`
    );
    assert(
      synthPedagogy.quiz.length >= 3,
      `Active recall quiz (3 questions) generated for ${tier} tier`
    );
  }

  // -------------------------------------------------------------------------
  // 3. COURSE SERVICE & TRAVERSAL LOGIC
  // -------------------------------------------------------------------------
  console.log(
    "\n3. Testing Course Service, Progression & Next-Lesson Traversal..."
  );

  // Progress computation
  const sampleCourse = allCourses[0];
  const total = getCourseTotalLessons(sampleCourse);
  const halfLessons = sampleCourse.modules[0].lessons.map((l) => l.id);
  const progress50 = calculateCourseProgress(sampleCourse, halfLessons);
  assert(
    progress50 > 0 && progress50 <= 100,
    `Calculated progress: ${progress50}%`
  );

  // Next-lesson traversal
  const firstLesson = sampleCourse.modules[0].lessons[0];
  const nextInfo = getNextLessonInSequence(sampleCourse, firstLesson.id);
  assert(
    nextInfo.nextLesson !== null ||
      sampleCourse.modules[0].lessons.length === 1,
    `Next lesson resolved from first lesson (${nextInfo.nextLesson?.title || "end"})`
  );

  // -------------------------------------------------------------------------
  // 4. API ROUTES
  // -------------------------------------------------------------------------
  // The route handlers are deliberately NOT imported and called here. Calling
  // them as functions skips the HTTP layer, which is exactly where auth and
  // rate limiting live — an earlier version of this suite "passed" while both
  // AI routes were open to anonymous callers. It also billed a real model call
  // on every run. Exercise those routes over HTTP against a running server,
  // where a signed-out request must come back 401.
  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(
    `   TOTAL TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`
  );
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
