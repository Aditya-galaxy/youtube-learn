import { parseWithRepair, type UsageTotals } from "@/lib/ai/parse";
import {
  SyllabusSchema,
  type SkillLevel,
  type Syllabus,
} from "@/lib/ai/schemas";
import {
  SYLLABUS_SYSTEM,
  buildSyllabusUserMessage,
} from "@/lib/ai/prompts/syllabus";
import { applyOrder, topologicalOrder } from "./topology";

export interface SyllabusRequest {
  topic: string;
  skillLevel: SkillLevel;
  weeklyHours?: number;
  learningGoal?: string;
}

export interface SyllabusResult {
  syllabus: Syllabus;
  /** Module keys in dependency order — the order `syllabus.modules` is already in. */
  order: string[];
  usage: UsageTotals;
  attempts: number;
}

/**
 * Stage A of the pipeline: topic in, validated and dependency-ordered
 * curriculum out. No YouTube calls, no database — which is what makes this
 * runnable from the CLI with nothing but an API key.
 */
export async function generateSyllabus(
  request: SyllabusRequest
): Promise<SyllabusResult> {
  const { data, usage, attempts } = await parseWithRepair({
    stage: "syllabus",
    schema: SyllabusSchema,
    system: SYLLABUS_SYSTEM,
    userMessage: buildSyllabusUserMessage(request),
    semanticCheck: checkSyllabus,
  });

  // Safe to unwrap: checkSyllabus already rejected anything unorderable.
  const topo = topologicalOrder(data.modules);
  const order = topo.ok ? topo.order : data.modules.map((m) => m.key);

  return {
    syllabus: { ...data, modules: applyOrder(data.modules, order) },
    order,
    usage,
    attempts,
  };
}

/** Constraints the JSON schema cannot express. */
function checkSyllabus(syllabus: Syllabus): string[] {
  const violations: string[] = [];

  const topo = topologicalOrder(syllabus.modules);
  if (!topo.ok) violations.push(...topo.violations);

  for (const mod of syllabus.modules) {
    const seen = new Set<string>();
    for (const lesson of mod.lessonIntents) {
      if (seen.has(lesson.key)) {
        violations.push(
          `Module "${mod.key}" uses the lesson key "${lesson.key}" more than once.`
        );
      }
      seen.add(lesson.key);
    }
  }

  // A "curriculum" whose modules are all independent is a list, not a sequence.
  const withPrereqs = syllabus.modules.filter(
    (m) => m.prerequisiteKeys.length > 0
  ).length;
  if (syllabus.modules.length >= 3 && withPrereqs === 0) {
    violations.push(
      "No module declares any prerequisite, so the curriculum has no teaching order. Add prerequisiteKeys reflecting what must be learned first."
    );
  }

  return violations;
}
