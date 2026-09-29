/**
 * Scaffolding Fading Engine based on Cognitive Load Theory
 * Grounded in:
 * - Sweller (1988): Cognitive Load Theory
 * - Renkl & Atkinson (2003): Transition from worked examples to problem solving
 * - Kalyuga et al. (2003): The Expertise Reversal Effect
 */

import type { LessonChallenge } from "../../types/course";

export type ScaffoldingLevel = "worked_example" | "completion" | "independent";

export interface CodeAnnotation {
  lineQuery: string;
  concept: string;
  rationale: string;
}

export interface ScaffoldVariant {
  level: ScaffoldingLevel;
  label: string;
  badge: string;
  cognitiveRationale: string;
  code: string;
  annotations: CodeAnnotation[];
  keyInvariants: string[];
}

export const SCAFFOLDING_LEVEL_CONFIG: Record<
  ScaffoldingLevel,
  {
    title: string;
    badge: string;
    icon: string;
    scaffoldPct: number;
    description: string;
    pedagogicalTarget: string;
  }
> = {
  worked_example: {
    title: "Worked Example",
    badge: "Level 1 · 100% Scaffold",
    icon: "GraduationCap",
    scaffoldPct: 100,
    description:
      "Full reference architecture with structural reasoning and cognitive annotations.",
    pedagogicalTarget:
      "Reduces extraneous cognitive load for learners encountering the concept for the first time (Renkl & Atkinson, 2003).",
  },
  completion: {
    title: "Completion Problem",
    badge: "Level 2 · 50% Scaffold",
    icon: "Puzzle",
    scaffoldPct: 50,
    description:
      "Scaffolded boilerplate with target blanks for the core algorithmic pivot.",
    pedagogicalTarget:
      "Promotes active schema acquisition while preventing cognitive freeze on routine syntax (Sweller, 1988).",
  },
  independent: {
    title: "Independent Synthesis",
    badge: "Level 3 · Free Recall",
    icon: "Zap",
    scaffoldPct: 0,
    description:
      "Minimal signature stub. Synthesize logic, invariants, and edge cases from scratch.",
    pedagogicalTarget:
      "Prevents expertise reversal where heavy scaffolds impede fluent problem-solvers (Kalyuga et al., 2003).",
  },
};

/**
 * Derives the 3 cognitive scaffolding variants for any LessonChallenge.
 */
export function buildScaffoldVariants(
  challenge: LessonChallenge
): Record<ScaffoldingLevel, ScaffoldVariant> {
  const language = challenge.language || "typescript";
  const solution = challenge.solutionCode || "";
  const starter = challenge.starterCode || "";

  // 1. Level 1: Full Worked Example with cognitive annotations
  const annotations: CodeAnnotation[] = [];
  const lines = solution.split("\n");

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (
      (trimmed.startsWith("if") || trimmed.includes("=== null")) &&
      annotations.length < 1
    ) {
      annotations.push({
        lineQuery: trimmed.slice(0, 30),
        concept: "Base Case & Boundary Guard",
        rationale:
          "Ensures input validity and halts recursion or null pointer dereference before processing.",
      });
    } else if (
      (trimmed.startsWith("for") ||
        trimmed.startsWith("while") ||
        trimmed.includes(".map") ||
        trimmed.includes(".reduce")) &&
      annotations.length < 2
    ) {
      annotations.push({
        lineQuery: trimmed.slice(0, 30),
        concept: "Traversal Invariant",
        rationale:
          "Maintains loop invariant over each element to guarantee termination and correct bounds.",
      });
    } else if (
      (trimmed.startsWith("return") || trimmed.includes("->")) &&
      annotations.length < 3
    ) {
      annotations.push({
        lineQuery: trimmed.slice(0, 30),
        concept: "Deterministic Output",
        rationale:
          "Returns the fully resolved transformation adhering to the target signature.",
      });
    }
  });

  const keyInvariants = [
    `Target Objective: ${challenge.objective || "Adhere to strict invariant requirements"}`,
    challenge.hints[0]
      ? `Structural Hint: ${challenge.hints[0]}`
      : "Verify boundary cases before executing core operations",
  ];

  const workedExample: ScaffoldVariant = {
    level: "worked_example",
    label: "Level 1: Worked Example",
    badge: "100% Scaffolding",
    cognitiveRationale:
      "Study the annotated reference implementation before writing code to build initial mental schemas.",
    code: solution,
    annotations,
    keyInvariants,
  };

  // 2. Level 2: Completion Problem (Parsons / Partial Blank)
  let completionCode = starter;
  if (!completionCode.includes("TODO")) {
    // If starter has no explicit TODO, create a scaffolded completion template
    const commentPrefix = language === "python" ? "#" : "//";
    completionCode = `${starter}\n\n${commentPrefix} [SCAFFOLD STEP]: Implement the core algorithmic mechanism below:\n${commentPrefix} Target: ${challenge.objective}\n`;
  }

  const completion: ScaffoldVariant = {
    level: "completion",
    label: "Level 2: Completion Problem",
    badge: "50% Scaffolding",
    cognitiveRationale:
      "Routine boilerplate is provided. Focus cognitive effort on filling the critical algorithmic pivot.",
    code: completionCode,
    annotations: [
      {
        lineQuery: "TODO",
        concept: "Cognitive Pivot Slot",
        rationale:
          "Implement the central mechanism here while leveraging the surrounding boilerplate.",
      },
    ],
    keyInvariants,
  };

  // 3. Level 3: Independent Synthesis (Minimal stub)
  let independentCode = "";
  const starterLines = starter.split("\n");
  const nonCommentLines = starterLines.filter(
    (l) =>
      !l.trim().startsWith("//") &&
      !l.trim().startsWith("#") &&
      !l.trim().startsWith("/*") &&
      !l.trim().startsWith("*")
  );

  if (nonCommentLines.length > 0) {
    const firstSignatureLine =
      nonCommentLines.find(
        (l) =>
          l.includes("function") ||
          l.includes("def ") ||
          l.includes("const ") ||
          l.includes("let ") ||
          l.includes("class ")
      ) || nonCommentLines[0];

    const commentPrefix = language === "python" ? "#" : "//";
    independentCode = `${firstSignatureLine}\n  ${commentPrefix} Synthesize full implementation independently from scratch\n  ${commentPrefix} Guard against edge cases and maintain invariants\n`;
  } else {
    independentCode = starter;
  }

  const independent: ScaffoldVariant = {
    level: "independent",
    label: "Level 3: Independent Synthesis",
    badge: "0% Scaffolding",
    cognitiveRationale:
      "Free recall mode. No boilerplate hints. Synthesize architecture and boundary checks from first principles.",
    code: independentCode,
    annotations: [],
    keyInvariants,
  };

  return {
    worked_example: workedExample,
    completion,
    independent,
  };
}
