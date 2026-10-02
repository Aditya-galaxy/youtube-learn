import { describe, expect, it } from "vitest";
import { sanitizeAction } from "./actions";
import { groundTimes } from "./respond";
import type { TutorLessonContext } from "./context";
import type { LessonGroundingData } from "./grounding";

const grounding: LessonGroundingData = {
  sections: [
    { startSeconds: 105, title: "Installing Python & PyCharm", summary: "s" },
    { startSeconds: 400, title: "Setup & Hello World", summary: "s" },
  ],
  keyConcepts: [],
};

const ctx = (over: Partial<TutorLessonContext> = {}): TutorLessonContext => ({
  courseId: "c",
  courseTitle: "Course",
  courseTier: "BEGINNER",
  moduleTitle: "Module",
  lessonId: "l",
  lessonTitle: "Lesson",
  lessonSummary: "",
  startSeconds: 0,
  endSeconds: null,
  durationSec: 600,
  isCompleted: false,
  position: 1,
  totalLessons: 3,
  completedCount: 0,
  previousLessonTitle: null,
  nextLessonTitle: "Next lesson",
  recentlyCompleted: [],
  ...over,
});

describe("sanitizeAction", () => {
  it("allows a jump to a section the grounding actually contains", () => {
    const action = sanitizeAction(
      { type: "seek", seconds: 105, label: "Jump to about 1:45" },
      ctx(),
      grounding
    );
    expect(action).toEqual({
      type: "seek",
      seconds: 105,
      label: "Jump to about 1:45",
    });
  });

  it("drops a timestamp the model composed itself", () => {
    expect(
      sanitizeAction(
        { type: "seek", seconds: 247, label: "Jump to about 4:07" },
        ctx(),
        grounding
      )
    ).toBeNull();
  });

  it("drops any jump when the lesson has no grounding", () => {
    expect(
      sanitizeAction(
        { type: "seek", seconds: 105, label: "Jump to about 1:45" },
        ctx(),
        null
      )
    ).toBeNull();
  });

  it("refuses to advance past the last lesson, or to re-complete a finished one", () => {
    expect(
      sanitizeAction(
        { type: "nextLesson", label: "Next" },
        ctx({ nextLessonTitle: null })
      )
    ).toBeNull();
    expect(
      sanitizeAction(
        { type: "markComplete", label: "Done" },
        ctx({ isCompleted: true })
      )
    ).toBeNull();
  });
});

describe("groundTimes", () => {
  it("keeps a time the grounding supports and reports the section for the jump", () => {
    const { reply, citedSection } = groundTimes(
      "He starts installing Python around 1:45.",
      grounding
    );
    expect(reply).toContain("1:45");
    expect(citedSection?.title).toBe("Installing Python & PyCharm");
  });

  it("strips a time the grounding does not support", () => {
    const { reply, citedSection } = groundTimes(
      "He explains pointers at 23:44.",
      grounding
    );
    expect(reply).toBe("He explains pointers at later in the video.");
    expect(citedSection).toBeUndefined();
  });

  it("strips every time when there is no grounding at all", () => {
    const { reply } = groundTimes("Watch from 4:10 and then 9:30.", null);
    expect(reply).not.toMatch(/\d{1,3}:\d\d/);
  });

  it("accepts the rounded minute of a section start", () => {
    // A learner reads 6:40 and 6:41 as the same moment; both map to the section.
    const { citedSection } = groundTimes(
      "Around 6:40 he writes Hello World.",
      grounding
    );
    expect(citedSection?.startSeconds).toBe(400);
  });
});
