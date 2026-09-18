/**
 * Prerequisite ordering for a generated syllabus.
 *
 * The model is asked for `prerequisiteKeys`, but its answer is never trusted —
 * "modules come in the right order" is the core promise of the product, so it
 * is checked here rather than hoped for. Violations are phrased concretely
 * enough to hand straight back to the model as a repair instruction.
 */

export interface OrderableModule {
  key: string;
  prerequisiteKeys: string[];
}

export type TopoResult =
  { ok: true; order: string[] } | { ok: false; violations: string[] };

/**
 * Kahn's algorithm. Ties are broken by the model's declared order, so a
 * syllabus with no prerequisites at all keeps the sequence it was written in.
 */
export function topologicalOrder(modules: OrderableModule[]): TopoResult {
  const violations: string[] = [];
  const declaredOrder = new Map(modules.map((m, i) => [m.key, i]));

  if (modules.length === 0) {
    return { ok: false, violations: ["The syllabus contains no modules."] };
  }

  const seen = new Set<string>();
  for (const m of modules) {
    if (seen.has(m.key)) {
      violations.push(`Module key "${m.key}" is used more than once.`);
    }
    seen.add(m.key);
  }

  for (const m of modules) {
    for (const p of m.prerequisiteKeys) {
      if (p === m.key) {
        violations.push(
          `Module "${m.key}" lists itself as its own prerequisite.`
        );
      } else if (!declaredOrder.has(p)) {
        violations.push(
          `Module "${m.key}" lists prerequisite "${p}", which is not a module in this syllabus.`
        );
      }
    }
  }

  if (violations.length > 0) return { ok: false, violations };

  const indegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();
  for (const m of modules) {
    indegree.set(m.key, m.prerequisiteKeys.length);
    for (const p of m.prerequisiteKeys) {
      dependents.set(p, [...(dependents.get(p) ?? []), m.key]);
    }
  }

  // Ready set kept in declared order so output is deterministic.
  const ready = modules
    .filter((m) => indegree.get(m.key) === 0)
    .map((m) => m.key)
    .sort((a, b) => declaredOrder.get(a)! - declaredOrder.get(b)!);

  const order: string[] = [];
  while (ready.length > 0) {
    const key = ready.shift()!;
    order.push(key);
    for (const dep of dependents.get(key) ?? []) {
      const next = indegree.get(dep)! - 1;
      indegree.set(dep, next);
      if (next === 0) {
        ready.push(dep);
        ready.sort((a, b) => declaredOrder.get(a)! - declaredOrder.get(b)!);
      }
    }
  }

  if (order.length !== modules.length) {
    const stuck = modules.filter((m) => !order.includes(m.key));
    const cycle = findCycle(stuck);
    violations.push(
      cycle
        ? `Prerequisites form a cycle: ${cycle.join(" -> ")}. Break it by removing one of those prerequisite links.`
        : `Prerequisites form a cycle among: ${stuck.map((m) => m.key).join(", ")}.`
    );
    return { ok: false, violations };
  }

  return { ok: true, order };
}

/** Returns one concrete cycle path so the repair prompt can quote it. */
function findCycle(modules: OrderableModule[]): string[] | null {
  const byKey = new Map(modules.map((m) => [m.key, m]));
  const state = new Map<string, "visiting" | "done">();
  const stack: string[] = [];

  function walk(key: string): string[] | null {
    const current = state.get(key);
    if (current === "done") return null;
    if (current === "visiting") {
      return [...stack.slice(stack.indexOf(key)), key];
    }

    state.set(key, "visiting");
    stack.push(key);
    for (const p of byKey.get(key)?.prerequisiteKeys ?? []) {
      if (!byKey.has(p)) continue;
      const found = walk(p);
      if (found) return found;
    }
    stack.pop();
    state.set(key, "done");
    return null;
  }

  for (const m of modules) {
    const found = walk(m.key);
    if (found) return found;
  }
  return null;
}

/** Reorders modules into dependency order. Caller must have checked `ok` first. */
export function applyOrder<T extends OrderableModule>(
  modules: T[],
  order: string[]
): T[] {
  const byKey = new Map(modules.map((m) => [m.key, m]));
  return order.map((k) => byKey.get(k)!);
}
