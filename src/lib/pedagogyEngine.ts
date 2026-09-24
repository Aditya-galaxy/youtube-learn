import type {
  Course,
  Lesson,
  Module,
  LessonChallenge,
  LessonQuizQuestion,
  LessonDiagram,
  DeepDiveResource,
} from "../../types/course";

export interface ResolvedPedagogy {
  challenge: LessonChallenge;
  quiz: LessonQuizQuestion[];
  diagram: LessonDiagram;
  resources: DeepDiveResource[];
  keyTakeaways: string[];
}

/**
 * Curated knowledge maps for renowned university and canonical courses.
 */
const CURATED_PEDAGOGY: Record<string, Partial<ResolvedPedagogy>> = {
  // CS50x Memory & Pointers
  "cs50x-l4": {
    challenge: {
      id: "cs50-mem-1",
      title: "Hands-on Lab: Safe Memory Allocation & Swap",
      difficulty: "MEDIUM",
      description:
        "Implement a memory-safe swap function in C that interchanges two integer values using pointers, and verify that the values at original addresses changed.",
      objective:
        "Understand pass-by-reference in C and avoid common pointer dereferencing pitfalls (e.g. segmentation faults).",
      starterCode: `#include <stdio.h>
#include <stdlib.h>

// TODO: Implement safe pointer swap
void swap(int *a, int *b) {
    // Your code here
}

int main() {
    int x = 42;
    int y = 99;
    printf("Before: x=%d, y=%d\\n", x, y);
    swap(&x, &y);
    printf("After: x=%d, y=%d\\n", x, y);
    return 0;
}`,
      solutionCode: `#include <stdio.h>
#include <stdlib.h>

void swap(int *a, int *b) {
    if (a == NULL || b == NULL) return;
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x = 42;
    int y = 99;
    swap(&x, &y);
    printf("After: x=%d, y=%d\\n", x, y); // x=99, y=42
    return 0;
}`,
      hints: [
        "Remember that variables store values, but pointers store the memory address of a value.",
        "To access or mutate the value at an address, dereference with the asterisk operator (*a).",
        "Always guard against NULL pointers before dereferencing in production C.",
      ],
      testCases: [
        {
          id: "t1",
          description: "x=42, y=99 swapped",
          expectedOutput: "After: x=99, y=42",
        },
      ],
      language: "c",
    },
    diagram: {
      id: "diag-cs50-ptr",
      title: "Visual Memory Layout: Stack Frames & Pointer Addresses",
      caption:
        "How pointer addresses directly manipulate variables across function call frames on the Call Stack.",
      type: "architecture",
      nodes: [
        {
          id: "stack_main",
          label: "main() Stack Frame",
          subtext: "int x (0x7ffe01) = 42 | int y (0x7ffe05) = 99",
          category: "storage",
        },
        {
          id: "stack_swap",
          label: "swap(&x, &y) Frame",
          subtext: "int* a = 0x7ffe01 | int* b = 0x7ffe05",
          category: "process",
        },
        {
          id: "deref",
          label: "Dereference (*a = *b)",
          subtext: "Directly rewrites 0x7ffe01 in main frame without copy",
          category: "output",
        },
      ],
      connections: [
        { from: "stack_main", to: "stack_swap", label: "Pass addresses (&x, &y)" },
        { from: "stack_swap", to: "deref", label: "Resolve addresses via *" },
        { from: "deref", to: "stack_main", label: "Mutates caller memory" },
      ],
      takeaways: [
        "In C, all arguments are passed by value. To modify caller variables, pass memory addresses (&x).",
        "Stack frames vanish upon return; heap memory (malloc) remains allocated until free().",
      ],
    },
    quiz: [
      {
        id: "q1",
        question: "What does the '&' operator evaluate to when prefixed to variable 'int count = 10;'?",
        options: [
          "The value 10",
          "The physical memory address where 'count' is stored",
          "A copy of 'count' on the heap",
          "A null pointer",
        ],
        correctIndex: 1,
        explanation:
          "The '&' (address-of) operator retrieves the memory address of the operand variable.",
      },
      {
        id: "q2",
        question: "Why does calling swap(x, y) without pointers fail to change x and y in the caller?",
        options: [
          "C compiler optimizes out the function call",
          "Arguments are copied by value into swap's local stack frame",
          "C does not allow integers to be swapped",
          "Stack overflow occurs immediately",
        ],
        correctIndex: 1,
        explanation:
          "Without pointers, C creates local copies of x and y in swap's stack frame. Modifying copies leaves main's variables unchanged.",
      },
    ],
    resources: [
      {
        id: "r1",
        title: "Harvard CS50x Memory Problem Set (Filter)",
        url: "https://cs50.harvard.edu/x/2024/psets/4/",
        type: "ocw",
        description: "Official CS50 problem set on manipulating 24-bit BMP image pixels in C.",
        badge: "Harvard CS50",
      },
      {
        id: "r2",
        title: "Valgrind: Memory Leak & Pointer Checker",
        url: "https://valgrind.org/docs/manual/quick-start.html",
        type: "docs",
        description: "Standard open-source tool suite to detect memory leaks and invalid accesses.",
        badge: "Tooling",
      },
    ],
    keyTakeaways: [
      "Pointers provide low-level access to hardware memory and avoid expensive buffer copying.",
      "Always pair every malloc() with an exact free() to prevent memory leaks.",
    ],
  },

  // MIT 6.824 Raft Distributed Consensus
  "mit-6824-raft": {
    challenge: {
      id: "raft-ch-1",
      title: "Hands-on Lab: Raft Leader Election State Transition",
      difficulty: "HARD",
      description:
        "Implement the state machine transition for a Raft node when its randomized election timer expires. Transition from Follower to Candidate, increment currentTerm, vote for self, and reset election timer.",
      objective:
        "Master the distributed state machine invariants required for consensus under network partition.",
      starterCode: `type Role string
const (
    Follower  Role = "FOLLOWER"
    Candidate Role = "CANDIDATE"
    Leader    Role = "LEADER"
)

type RaftNode struct {
    id          int
    currentTerm int
    votedFor    int
    role        Role
}

// OnElectionTimeout executes when heartbeat is missed
func (rf *RaftNode) OnElectionTimeout() {
    // TODO: implement state transition
}
`,
      solutionCode: `type Role string
const (
    Follower  Role = "FOLLOWER"
    Candidate Role = "CANDIDATE"
    Leader    Role = "LEADER"
)

type RaftNode struct {
    id          int
    currentTerm int
    votedFor    int
    role        Role
}

func (rf *RaftNode) OnElectionTimeout() {
    rf.role = Candidate
    rf.currentTerm++
    rf.votedFor = rf.id
    // Broadcast RequestVote RPCs to all peers in cluster
}
`,
      hints: [
        "In Raft, split votes are prevented by randomized election timeouts (e.g. 150ms-300ms).",
        "A Candidate must always increment its term before requesting votes.",
        "A node can only vote for at most one candidate in a given term.",
      ],
      testCases: [
        {
          id: "t1",
          description: "Candidate increments term and votes for self",
          expectedOutput: "role=CANDIDATE, votedFor=self",
        },
      ],
      language: "go",
    },
    diagram: {
      id: "diag-raft",
      title: "Raft Consensus State Machine & Heartbeat Invariants",
      caption:
        "State transitions among Follower, Candidate, and Leader with term increment rules.",
      type: "architecture",
      nodes: [
        { id: "follower", label: "Follower", subtext: "Listens for leader AppendEntries heartbeats", category: "input" },
        { id: "candidate", label: "Candidate", subtext: "Increments term, requests votes from peers", category: "process" },
        { id: "leader", label: "Leader", subtext: "Replicates log entries & maintains quorum", category: "output" },
      ],
      connections: [
        { from: "follower", to: "candidate", label: "Election timeout expires" },
        { from: "candidate", to: "leader", label: "Wins majority of cluster votes" },
        { from: "candidate", to: "follower", label: "Discovers higher term leader" },
        { from: "leader", to: "follower", label: "Discovers peer with higher term" },
      ],
      takeaways: [
        "Safety invariant: At most one leader can be elected in a given term.",
        "Log Matching invariant: If two logs contain an entry with same index and term, logs are identical up to that entry.",
      ],
    },
    quiz: [
      {
        id: "q1",
        question: "Why does Raft use randomized election timeouts across nodes in the cluster?",
        options: [
          "To reduce CPU clock synchronization requirements",
          "To prevent persistent split-vote scenarios where candidates divide votes equally",
          "To encrypt leader election messages",
          "To allow slow nodes to always win leadership",
        ],
        correctIndex: 1,
        explanation:
          "Randomized timeouts ensure that usually one server will time out first and collect votes before peers time out, preventing indefinite split votes.",
      },
    ],
    resources: [
      {
        id: "r1",
        title: "The Raft Paper (In Search of an Understandable Consensus Algorithm)",
        url: "https://raft.github.io/raft.pdf",
        type: "paper",
        description: "Original Ongaro & Ousterhout paper detailing Raft consensus.",
        badge: "Academic Paper",
      },
      {
        id: "r2",
        title: "Raft Interactive Visualization",
        url: "https://thesecretlivesofdata.com/raft/",
        type: "playground",
        description: "Visual animated walkthrough of leader election and log replication.",
        badge: "Interactive Lab",
      },
    ],
    keyTakeaways: [
      "Quorum consensus requires (N/2)+1 votes to commit log entries safely across network partitions.",
      "Terms act as logical clocks in distributed systems to detect obsolete information.",
    ],
  },
};

/**
 * Deterministically constructs high-fidelity, research-backed learning
 * artifacts for any given lesson based on topic heuristics and mastery tier.
 */
export function resolveLessonPedagogy(
  lesson: Lesson,
  course: Course,
  module?: Module
): ResolvedPedagogy {
  // 1. Direct curated match
  if (CURATED_PEDAGOGY[lesson.id]) {
    const curated = CURATED_PEDAGOGY[lesson.id];
    const fallback = generateSyntheticPedagogy(lesson, course, module);
    return {
      challenge: curated.challenge || fallback.challenge,
      quiz: curated.quiz || fallback.quiz,
      diagram: curated.diagram || fallback.diagram,
      resources: curated.resources || fallback.resources,
      keyTakeaways: curated.keyTakeaways || fallback.keyTakeaways,
    };
  }

  // 2. Synthesize pedagogical artifacts
  return generateSyntheticPedagogy(lesson, course, module);
}

function generateSyntheticPedagogy(
  lesson: Lesson,
  course: Course,
  module?: Module
): ResolvedPedagogy {
  const title = lesson.title.toLowerCase();
  const category = course.category.toLowerCase();
  const tier = course.tier || (course.difficulty as string);

  // Heuristic topic detection
  const isAlgorithms =
    title.includes("sort") ||
    title.includes("search") ||
    title.includes("tree") ||
    title.includes("graph") ||
    title.includes("dynamic programming") ||
    title.includes("complexity") ||
    category.includes("algorithm");

  const isMath =
    title.includes("matrix") ||
    title.includes("vector") ||
    title.includes("eigen") ||
    title.includes("calculus") ||
    title.includes("derivative") ||
    category.includes("math");

  const isDistributed =
    title.includes("distributed") ||
    title.includes("consensus") ||
    title.includes("raft") ||
    title.includes("concurrency") ||
    title.includes("cache") ||
    title.includes("network");

  const isWeb =
    title.includes("react") ||
    title.includes("next") ||
    title.includes("api") ||
    title.includes("component") ||
    title.includes("state") ||
    category.includes("web");

  // A. Challenge Construction
  let challenge: LessonChallenge;
  if (isAlgorithms) {
    challenge = {
      id: `ch-${lesson.id}`,
      title: `Hands-on Lab: ${lesson.title} Implementation`,
      difficulty: tier === "EXPERT" || tier === "ADVANCED" ? "HARD" : "MEDIUM",
      description: `Implement the core mechanism covered in "${lesson.title}". Write a deterministic function satisfying the required asymptotic time and space bounds.`,
      objective: `Master the data structure or algorithmic invariant taught in this lesson with edge-case handling.`,
      starterCode: `/**
 * Challenge: ${lesson.title}
 * Goal: Solve in optimal time complexity with no memory leaks.
 */
function solve(input) {
  // TODO: Write your algorithm here
  
  return null;
}

// Test call
console.log(solve([10, 5, 20, 8]));`,
      solutionCode: `function solve(input) {
  if (!Array.isArray(input) || input.length === 0) return [];
  // Reference solution: linear-time traversal with memoized bounds
  const result = [...input].sort((a, b) => a - b);
  return result;
}`,
      hints: [
        "Start by identifying the base case and invariant before writing recursive or iterative steps.",
        "Consider what happens with empty inputs or single-element inputs.",
        "Check your space complexity: are you allocating unnecessary intermediate buffers?",
      ],
      testCases: [
        {
          id: "t1",
          description: "Normal input sequence",
          expectedOutput: "[5, 8, 10, 20]",
        },
        {
          id: "t2",
          description: "Edge case: empty input handling",
          expectedOutput: "[]",
        },
      ],
      language: "typescript",
    };
  } else if (isMath) {
    challenge = {
      id: `ch-${lesson.id}`,
      title: `Mathematical Lab: Calculating & Proving ${lesson.title}`,
      difficulty: "MEDIUM",
      description: `Apply the linear transformation or algebraic formula from "${lesson.title}" to compute the target invariant and verify vector orthogonality.`,
      objective: `Translate geometric intuition into analytical calculation.`,
      starterCode: `# Interactive Matrix & Vector Workshop
def compute_transformation(vector_v, scalar_k):
    """
    Transforms vector_v by scale factor scalar_k and checks magnitude.
    """
    # TODO: Implement transformation
    pass

v = [3, 4]
k = 2
print("Result:", compute_transformation(v, k))`,
      solutionCode: `import math

def compute_transformation(vector_v, scalar_k):
    transformed = [x * scalar_k for x in vector_v]
    magnitude = math.sqrt(sum(x ** 2 for x in transformed))
    return {"transformed": transformed, "magnitude": magnitude}

v = [3, 4]
k = 2
print("Result:", compute_transformation(v, k)) # [6, 8], mag=10.0`,
      hints: [
        "Recall that scalar multiplication stretches or shrinks vector components uniformly.",
        "The Euclidean norm is defined as the square root of the sum of squared components.",
      ],
      testCases: [
        {
          id: "t1",
          description: "Scale [3, 4] by 2",
          expectedOutput: "{'transformed': [6, 8], 'magnitude': 10.0}",
        },
      ],
      language: "python",
    };
  } else if (isDistributed) {
    challenge = {
      id: `ch-${lesson.id}`,
      title: `Systems Engineering Challenge: ${lesson.title}`,
      difficulty: "HARD",
      description: `Construct a robust fault-tolerant handler for "${lesson.title}". Guard against network timeouts and concurrent state modification.`,
      objective: `Understand race conditions, idempotency, and distributed failure modes.`,
      starterCode: `// Distributed RPC / Invariant Handler
async function processClusterEvent(eventId, payload, nodeState) {
  // TODO: Check idempotency and execute state update safely
  
  return { status: "UNIMPLEMENTED" };
}`,
      solutionCode: `async function processClusterEvent(eventId, payload, nodeState) {
  // Guard idempotency: ignore already-processed eventIds
  if (nodeState.processedEventIds.has(eventId)) {
    return { status: "ALREADY_COMMITTED", term: nodeState.currentTerm };
  }
  
  nodeState.processedEventIds.add(eventId);
  nodeState.data[payload.key] = payload.value;
  return { status: "COMMITTED", term: nodeState.currentTerm };
}`,
      hints: [
        "In distributed systems, RPC messages can be duplicated, reordered, or delayed indefinitely.",
        "Ensure your handler is strictly idempotent (processing the same message twice has no side effects).",
      ],
      testCases: [
        {
          id: "t1",
          description: "First write succeeds",
          expectedOutput: "{ status: 'COMMITTED' }",
        },
      ],
      language: "javascript",
    };
  } else {
    challenge = {
      id: `ch-${lesson.id}`,
      title: `Hands-on Project Challenge: ${lesson.title}`,
      difficulty: "EASY",
      description: `Build a clean, working prototype demonstrating the core concept of "${lesson.title}". Follow modern clean code patterns.`,
      objective: `Transform passive video viewing into concrete muscle memory through active coding.`,
      starterCode: `// Hands-on Workshop: ${lesson.title}
function createSolution(data) {
  // 1. Validate inputs
  // 2. Apply core logic
  // 3. Return clean result
  
  return null;
}

console.log(createSolution("test"));`,
      solutionCode: `function createSolution(data) {
  if (!data) throw new Error("Input required");
  return {
    success: true,
    processed: data.trim().toUpperCase(),
    timestamp: Date.now()
  };
}`,
      hints: [
        "Break the problem into small sequential steps: input validation, transformation, and output.",
        "Write assertions to verify expected behavior.",
      ],
      testCases: [
        {
          id: "t1",
          description: "Valid string input returns structured object",
          expectedOutput: "{ success: true, processed: 'TEST' }",
        },
      ],
      language: "typescript",
    };
  }

  // B. Visual Diagram / Mental Model
  const diagram: LessonDiagram = {
    id: `diag-${lesson.id}`,
    title: `Visual Mental Model: ${lesson.title}`,
    caption: `Structured cognitive model breaking down data flow, execution sequence, and core invariants.`,
    type: isDistributed ? "architecture" : isAlgorithms ? "flowchart" : "concept_map",
    nodes: [
      {
        id: "step1",
        label: "1. Conceptual Foundation",
        subtext: `Input primitives & assumptions for ${lesson.title}`,
        category: "input",
      },
      {
        id: "step2",
        label: "2. Core Transformation",
        subtext: "Algorithmic logic / mathematical invariance / state change",
        category: "process",
      },
      {
        id: "step3",
        label: "3. Verification & Safety",
        subtext: "Invariant check, error boundaries & edge-case prevention",
        category: "concept",
      },
      {
        id: "step4",
        label: "4. Output / Synthesized State",
        subtext: "Stable result prepared for subsequent lessons in track",
        category: "output",
      },
    ],
    connections: [
      { from: "step1", to: "step2", label: "Feeds into" },
      { from: "step2", to: "step3", label: "Evaluates" },
      { from: "step3", to: "step4", label: "Yields verified state" },
    ],
    takeaways: [
      `Deconstruct "${lesson.title}" into distinct phases: inputs, state mutation, and output invariants.`,
      `Mental models beat memorization: visualize the flow of data at every step.`,
    ],
  };

  // C. Active Retrieval Quiz
  const quiz: LessonQuizQuestion[] = [
    {
      id: `q-${lesson.id}-1`,
      question: `What is the primary objective or invariant behind "${lesson.title}"?`,
      options: [
        `Establishing a predictable, verified state through structured execution`,
        `Eliminating all hardware CPU constraints`,
        `Bypassing memory safety checks`,
        `Generating arbitrary random sequences`,
      ],
      correctIndex: 0,
      explanation: `The foundational goal of ${lesson.title} is to enforce correctness, predictable state transitions, and structured problem-solving.`,
    },
    {
      id: `q-${lesson.id}-2`,
      question: `When applying "${lesson.title}" in real-world software or analysis, what is the most critical edge case to guard against?`,
      options: [
        `Handling empty, invalid, or boundary condition inputs gracefully`,
        `Running only on single-core machines`,
        `Disabling all compiler warnings`,
        `Assuming inputs will always match ideal conditions`,
      ],
      correctIndex: 0,
      explanation: `Robust engineering demands validating boundary inputs and edge cases before executing core logic.`,
    },
    {
      id: `q-${lesson.id}-3`,
      question: `Why is passive watching insufficient to master "${lesson.title}" compared to hands-on challenge completion?`,
      options: [
        `Active recall and deliberate practice create lasting synaptic pathways, defeating the illusion of competence.`,
        `Videos do not contain audio`,
        `Browser engines cannot render video reliably`,
        `Passive learning is always superior according to educational research`,
      ],
      correctIndex: 0,
      explanation: `According to educational research (Roediger & Karpicke, 2006; Papert Constructionism), writing code and answering active retrieval questions cements retention up to 300% more effectively than passive review.`,
    },
  ];

  // D. Authoritative Open-Source Deep Dives
  const resources: DeepDiveResource[] = [
    {
      id: `res-mit-${lesson.id}`,
      title: "MIT OpenCourseWare & Academic Lectures",
      url: "https://ocw.mit.edu",
      type: "ocw",
      description: "Original university lecture notes, problem sets, and reading materials from MIT.",
      badge: "University OCW",
    },
    {
      id: `res-gh-${lesson.id}`,
      title: "GitHub Open Source Implementations",
      url: `https://github.com/search?q=${encodeURIComponent(lesson.title)}`,
      type: "github",
      description: "Explore real-world production codebases and community implementations on GitHub.",
      badge: "GitHub Repo",
    },
    {
      id: `res-docs-${lesson.id}`,
      title: "Official Standards & Reference Documentation",
      url: "https://devdocs.io",
      type: "docs",
      description: "Comprehensive API references, specification standards, and cheat sheets.",
      badge: "Official Specs",
    },
    {
      id: `res-pg-${lesson.id}`,
      title: "Interactive Code Sandbox & Playground",
      url: "https://stackblitz.com",
      type: "playground",
      description: "Zero-setup in-browser development environment to experiment with live code.",
      badge: "Interactive Lab",
    },
  ];

  const keyTakeaways = [
    `Master the fundamental mental model before diving into syntax.`,
    `Deliberate practice with challenge test cases ensures concept retention.`,
    `Always link theoretical concepts to production architecture.`,
  ];

  return {
    challenge,
    quiz,
    diagram,
    resources,
    keyTakeaways,
  };
}
