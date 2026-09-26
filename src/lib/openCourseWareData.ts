import type { Course } from "../../types/course";

export const OPEN_COURSEWARE_COURSES: Course[] = [
  {
    id: "course-harvard-cs50x",
    slug: "harvard-cs50x-computer-science",
    title: "CS50x: Introduction to Computer Science",
    description:
      "Harvard University's legendary introduction to the intellectual enterprises of computer science and the art of programming. Learn algorithmic thinking, problem-solving, memory, and software design from scratch.",
    thumbnail: "https://i.ytimg.com/vi/3LPJfIKxwWc/maxresdefault.jpg",
    category: "Computer Science",
    difficulty: "BASIC",
    tier: "BASIC",
    estimatedHours: 12.0,
    instructor: "Prof. David J. Malan",
    institution: "Harvard University (CS50)",
    sourceUrl: "https://cs50.harvard.edu/x/",
    isPublic: true,
    modules: [
      {
        id: "cs50mod-1",
        courseId: "course-harvard-cs50x",
        title: "Module 1: Computational Thinking & The C Language",
        orderIndex: 1,
        description:
          "Binary, algorithms, Boolean logic, data types, loops, and compiled languages.",
        lessons: [
          {
            id: "cs50less-1",
            moduleId: "cs50mod-1",
            title: "Lecture 0: Computational Thinking, Binary & Scratch",
            orderIndex: 1,
            videoId: "3LPJfIKxwWc",
            channelName: "CS50",
            durationSec: 7495,
            startSeconds: 0,
            summary:
              "How computers represent information using binary, ASCII, and RGB, and introductory programming mental models.",
          },
          {
            id: "cs50less-2",
            moduleId: "cs50mod-1",
            title: "Lecture 1: The C Programming Language & Syntax",
            orderIndex: 2,
            videoId: "cwtpLIWylAw",
            channelName: "CS50",
            durationSec: 8861,
            startSeconds: 0,
            summary:
              "Source code, compilation, variables, conditionals, loops, and terminal workflows.",
          },
        ],
      },
      {
        id: "cs50mod-2",
        courseId: "course-harvard-cs50x",
        title: "Module 2: Memory, Arrays & Pointers",
        orderIndex: 2,
        description:
          "How computers store data in RAM, array layouts, strings as pointers, and memory safety.",
        lessons: [
          {
            id: "cs50less-3",
            moduleId: "cs50mod-2",
            title: "Lecture 2: Arrays, Strings & Compilation",
            orderIndex: 1,
            videoId: "4vU4aEFmTSo",
            channelName: "CS50",
            durationSec: 7924,
            startSeconds: 0,
            summary:
              "Contiguous blocks of memory, character arrays, string termination (null byte), and command line arguments.",
          },
          {
            id: "cs50less-4",
            moduleId: "cs50mod-2",
            title: "Lecture 4: Memory, Hexadecimal & Pointers",
            orderIndex: 2,
            videoId: "F9-yqoS7b8w",
            channelName: "CS50",
            durationSec: 8243,
            startSeconds: 0,
            summary:
              "Pointers, addresses, hexadecimal notation, malloc, free, and avoiding segmentation faults.",
          },
        ],
      },
      {
        id: "cs50mod-3",
        courseId: "course-harvard-cs50x",
        title: "Module 3: Algorithms & Data Structures",
        orderIndex: 3,
        description:
          "Linear search, binary search, sorting algorithms, linked lists, hash tables, and tries.",
        lessons: [
          {
            id: "cs50less-5",
            moduleId: "cs50mod-3",
            title: "Lecture 3: Algorithms, Asymptotic Notation & Recursion",
            orderIndex: 1,
            videoId: "jZzyERW7h1A",
            channelName: "CS50",
            durationSec: 7332,
            startSeconds: 0,
            summary:
              "Big O, Omega, Theta notation, bubble sort, selection sort, merge sort, and recursion.",
          },
          {
            id: "cs50less-6",
            moduleId: "cs50mod-3",
            title: "Lecture 5: Data Structures, Hash Tables & Trees",
            orderIndex: 2,
            videoId: "0euvEdPwQnQ",
            channelName: "CS50",
            durationSec: 7369,
            startSeconds: 0,
            summary:
              "Dynamically growing memory, linked list operations, binary search trees, hash tables, and collision handling.",
          },
        ],
      },
      {
        id: "cs50mod-4",
        courseId: "course-harvard-cs50x",
        title: "Module 4: High-Level Programming & Databases",
        orderIndex: 4,
        description:
          "Transitioning from C to Python, object-oriented concepts, and relational SQL queries.",
        lessons: [
          {
            id: "cs50less-7",
            moduleId: "cs50mod-4",
            title: "Lecture 6: Python Programming & Rapid Prototyping",
            orderIndex: 1,
            videoId: "EHi0RDZ31VA",
            channelName: "CS50",
            durationSec: 7743,
            startSeconds: 0,
            summary:
              "Python syntax, dictionaries, exceptions, file I/O, third-party libraries, and audio/image processing.",
          },
          {
            id: "cs50less-8",
            moduleId: "cs50mod-4",
            title: "Lecture 7: SQL, Relational Databases & Indexing",
            orderIndex: 2,
            videoId: "1RCMYG8RUSE",
            channelName: "CS50",
            durationSec: 8045,
            startSeconds: 0,
            summary:
              "Relational database schemas, primary and foreign keys, SQL joins, indexes, and race condition transactions.",
          },
        ],
      },
    ],
  },
  {
    id: "course-mit-1806-linear-algebra",
    slug: "mit-1806-linear-algebra",
    title: "MIT 18.06: Linear Algebra",
    description:
      "The world-renowned MIT mathematics curriculum taught by Prof. Gilbert Strang. Covers vector spaces, matrix factorizations, orthogonal projections, eigenvalues, and positive definite systems with deep geometric intuition.",
    thumbnail: "https://i.ytimg.com/vi/J7DzL2_Na80/hqdefault.jpg",
    category: "Mathematics",
    difficulty: "INTERMEDIATE",
    tier: "INTERMEDIATE",
    estimatedHours: 8.5,
    instructor: "Prof. Gilbert Strang",
    institution: "MIT OpenCourseWare",
    sourceUrl: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/",
    isPublic: true,
    modules: [
      {
        id: "mit1806-mod-1",
        courseId: "course-mit-1806-linear-algebra",
        title: "Module 1: The Geometry of Linear Equations & Elimination",
        orderIndex: 1,
        description:
          "Row view vs column view, Gaussian elimination, matrix multiplication, and LU factorization.",
        lessons: [
          {
            id: "mit1806-less-1",
            moduleId: "mit1806-mod-1",
            title: "Lecture 1: The Geometry of Linear Equations",
            orderIndex: 1,
            videoId: "J7DzL2_Na80",
            channelName: "MIT OpenCourseWare",
            durationSec: 2389,
            startSeconds: 0,
            summary:
              "Row picture, column picture, and matrix form of linear equations Ax = b.",
          },
          {
            id: "mit1806-less-2",
            moduleId: "mit1806-mod-1",
            title: "Lecture 2: Elimination with Matrices",
            orderIndex: 2,
            videoId: "QVKj3LADCnA",
            channelName: "MIT OpenCourseWare",
            durationSec: 2862,
            startSeconds: 0,
            summary:
              "Success and failure of elimination, pivots, and elementary elimination matrices.",
          },
          {
            id: "mit1806-less-3",
            moduleId: "mit1806-mod-1",
            title: "Lecture 3: Multiplication and Inverse Matrices",
            orderIndex: 3,
            videoId: "FX4C-JpTFgY",
            channelName: "MIT OpenCourseWare",
            durationSec: 2809,
            startSeconds: 0,
            summary:
              "Five ways to multiply matrices, Gauss-Jordan elimination for matrix inverses.",
          },
        ],
      },
      {
        id: "mit1806-mod-2",
        courseId: "course-mit-1806-linear-algebra",
        title: "Module 2: Vector Spaces, Subspaces & The 4 Fundamental Spaces",
        orderIndex: 2,
        description:
          "Column space, nullspace, basis, dimension, and solving Ax = 0 and Ax = b.",
        lessons: [
          {
            id: "mit1806-less-4",
            moduleId: "mit1806-mod-2",
            title: "Lecture 6: Column Space and Nullspace",
            orderIndex: 1,
            videoId: "8o5Cmfpeo6g",
            channelName: "MIT OpenCourseWare",
            durationSec: 2761,
            startSeconds: 0,
            summary:
              "Definitions of vector spaces and subspaces, spanning vectors, and linear independence.",
          },
          {
            id: "mit1806-less-5",
            moduleId: "mit1806-mod-2",
            title:
              "Lecture 7: Solving Ax = 0 — Pivot Variables & Special Solutions",
            orderIndex: 2,
            videoId: "VqP2tREMvt0",
            channelName: "MIT OpenCourseWare",
            durationSec: 2600,
            startSeconds: 0,
            summary:
              "Row reduced echelon form R, rank, free variables, and the nullspace matrix.",
          },
          {
            id: "mit1806-less-6",
            moduleId: "mit1806-mod-2",
            title: "Lecture 14: Orthogonal Vectors and Subspaces",
            orderIndex: 3,
            videoId: "YzZUIYRCE38",
            channelName: "MIT OpenCourseWare",
            durationSec: 2988,
            startSeconds: 0,
            summary:
              "Orthogonality of the four fundamental subspaces, row space orthogonal to nullspace.",
          },
        ],
      },
      {
        id: "mit1806-mod-3",
        courseId: "course-mit-1806-linear-algebra",
        title:
          "Module 3: Eigenvalues, Eigenvectors & Positive Definite Systems",
        orderIndex: 3,
        description:
          "Characteristic equations, diagonalizing matrices, differential equations, and SVD.",
        lessons: [
          {
            id: "mit1806-less-7",
            moduleId: "mit1806-mod-3",
            title: "Lecture 21: Eigenvalues and Eigenvectors",
            orderIndex: 1,
            videoId: "cdZnhQjJu4I",
            channelName: "MIT OpenCourseWare",
            durationSec: 3083,
            startSeconds: 0,
            summary:
              "Ax = lambda x, det(A - lambda I) = 0, trace and determinant relationships.",
          },
          {
            id: "mit1806-less-8",
            moduleId: "mit1806-mod-3",
            title: "Lecture 22: Diagonalization and Powers of A",
            orderIndex: 2,
            videoId: "13r9QY6cmjc",
            channelName: "MIT OpenCourseWare",
            durationSec: 3110,
            startSeconds: 0,
            summary:
              "Tests for positive definiteness, energy curves, saddle points, and quadratic forms.",
          },
        ],
      },
    ],
  },
  {
    id: "course-mit-6006-algorithms",
    slug: "mit-6006-introduction-to-algorithms",
    title: "MIT 6.006: Introduction to Algorithms",
    description:
      "MIT's rigorous, fast-paced algorithmic curriculum taught by Erik Demaine and Srini Devadas. Master sorting, self-balancing trees, hashing invariants, graph traversal, and dynamic programming.",
    thumbnail: "https://i.ytimg.com/vi/HtSuA80QTyo/hqdefault.jpg",
    category: "Computer Science",
    difficulty: "ADVANCED",
    tier: "ADVANCED",
    estimatedHours: 9.0,
    instructor: "Prof. Erik Demaine & Prof. Srini Devadas",
    institution: "MIT OpenCourseWare",
    sourceUrl:
      "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/",
    isPublic: true,
    modules: [
      {
        id: "mit6006-mod-1",
        courseId: "course-mit-6006-algorithms",
        title: "Module 1: Algorithmic Thinking & Peak Finding",
        orderIndex: 1,
        description:
          "Divide and conquer invariants, asymptotic analysis, and 1D/2D peak finding algorithms.",
        lessons: [
          {
            id: "mit6006-less-1",
            moduleId: "mit6006-mod-1",
            title: "Lecture 1: Algorithmic Thinking & Peak Finding",
            orderIndex: 1,
            videoId: "HtSuA80QTyo",
            channelName: "MIT OpenCourseWare",
            durationSec: 3202,
            startSeconds: 0,
            summary:
              "1D and 2D peak finding, dividing problem space in half, and O(log n) efficiency.",
          },
          {
            id: "mit6006-less-2",
            moduleId: "mit6006-mod-1",
            title: "Lecture 3: Insertion Sort & Merge Sort",
            orderIndex: 2,
            videoId: "Kg4bqzAqRBM",
            channelName: "MIT OpenCourseWare",
            durationSec: 3080,
            startSeconds: 0,
            summary:
              "Why sorting matters, recurrence trees, and proving O(n log n) merge sort bounds.",
          },
          {
            id: "mit6006-less-3",
            moduleId: "mit6006-mod-1",
            title: "Lecture 4: Heaps and Heap Sort",
            orderIndex: 3,
            videoId: "B7hVxCmfPtM",
            channelName: "MIT OpenCourseWare",
            durationSec: 3152,
            startSeconds: 0,
            summary:
              "Binary heaps, max-heap invariant, max-heapify, build-max-heap in O(n), and heapsort.",
          },
        ],
      },
      {
        id: "mit6006-mod-2",
        courseId: "course-mit-6006-algorithms",
        title: "Module 2: Self-Balancing Trees & Universal Hashing",
        orderIndex: 2,
        description:
          "Binary Search Trees, AVL balance invariants, rotations, and hash table collisions.",
        lessons: [
          {
            id: "mit6006-less-4",
            moduleId: "mit6006-mod-2",
            title: "Lecture 5: Binary Search Trees & BST Sort",
            orderIndex: 1,
            videoId: "9Jry5-82I68",
            channelName: "MIT OpenCourseWare",
            durationSec: 3160,
            startSeconds: 0,
            summary:
              "BST property, find, insert, delete, successor operations, and worst-case skews.",
          },
          {
            id: "mit6006-less-5",
            moduleId: "mit6006-mod-2",
            title: "Lecture 6: AVL Trees & AVL Sort",
            orderIndex: 2,
            videoId: "FNeL18KsWPc",
            channelName: "MIT OpenCourseWare",
            durationSec: 3119,
            startSeconds: 0,
            summary:
              "Height balance invariant (|left - right| <= 1), left and right rotations in O(1).",
          },
          {
            id: "mit6006-less-6",
            moduleId: "mit6006-mod-2",
            title: "Lecture 8: Hashing with Chaining",
            orderIndex: 3,
            videoId: "0M_kIqhwbFo",
            channelName: "MIT OpenCourseWare",
            durationSec: 3076,
            startSeconds: 0,
            summary:
              "Direct access tables, collision resolution via chaining, simple uniform hashing.",
          },
        ],
      },
      {
        id: "mit6006-mod-3",
        courseId: "course-mit-6006-algorithms",
        title: "Module 3: Graph Traversal & Dynamic Programming",
        orderIndex: 3,
        description:
          "BFS shortest paths, DFS topological sort, cycle detection, and subproblem memoization.",
        lessons: [
          {
            id: "mit6006-less-7",
            moduleId: "mit6006-mod-3",
            title: "Lecture 13: Breadth-First Search (BFS)",
            orderIndex: 1,
            videoId: "s-CYnVz-uh4",
            channelName: "MIT OpenCourseWare",
            durationSec: 3048,
            startSeconds: 0,
            summary:
              "Adjacency lists vs matrices, queue exploration, frontier sets, and unweighted shortest paths.",
          },
          {
            id: "mit6006-less-8",
            moduleId: "mit6006-mod-3",
            title: "Lecture 14: Depth-First Search (DFS) & Topological Sort",
            orderIndex: 2,
            videoId: "AfSk24UTFS8",
            channelName: "MIT OpenCourseWare",
            durationSec: 3031,
            startSeconds: 0,
            summary:
              "Recursive graph traversal, discovery/finishing times, edge classification, and DAG ordering.",
          },
          {
            id: "mit6006-less-9",
            moduleId: "mit6006-mod-3",
            title:
              "Lecture 19: Dynamic Programming I — Fibonacci & Shortest Paths",
            orderIndex: 3,
            videoId: "OQ5jsbhAv_M",
            channelName: "MIT OpenCourseWare",
            durationSec: 3107,
            startSeconds: 0,
            summary:
              "The 5-step DP recipe: define subproblems, guess choices, relate subproblems, topological order, and solve.",
          },
        ],
      },
    ],
  },
  {
    id: "course-stanford-cs229-ml",
    slug: "stanford-cs229-machine-learning",
    title: "Stanford CS229: Machine Learning",
    description:
      "Stanford University's definitive, mathematically rigorous course on machine learning by Prof. Andrew Ng. Features deep derivations of supervised learning, SVM duals, kernel tricks, and Markov decision processes.",
    thumbnail: "https://i.ytimg.com/vi/UzxYlbK2c7E/hqdefault.jpg",
    category: "Artificial Intelligence",
    difficulty: "EXPERT",
    tier: "EXPERT",
    estimatedHours: 9.5,
    instructor: "Prof. Andrew Ng",
    institution: "Stanford University",
    sourceUrl: "https://cs229.stanford.edu/",
    isPublic: true,
    modules: [
      {
        id: "cs229-mod-1",
        courseId: "course-stanford-cs229-ml",
        title: "Module 1: Supervised Learning & Gradient Optimization",
        orderIndex: 1,
        description:
          "Linear regression, normal equations, batch vs stochastic gradient descent, and logistic regression.",
        lessons: [
          {
            id: "cs229-less-1",
            moduleId: "cs229-mod-1",
            title: "Lecture 1: Introduction & Course Overview",
            orderIndex: 1,
            videoId: "UzxYlbK2c7E",
            channelName: "Stanford",
            durationSec: 4120,
            startSeconds: 0,
            summary:
              "Supervised vs unsupervised learning, reinforcement learning, problem formulation, and course logistics.",
          },
          {
            id: "cs229-less-2",
            moduleId: "cs229-mod-1",
            title:
              "Lecture 2: Linear Regression, Gradient Descent & Normal Equations",
            orderIndex: 2,
            videoId: "5u4G23_OohI",
            channelName: "Stanford",
            durationSec: 4576,
            startSeconds: 0,
            summary:
              "LMS algorithm, derivation of gradient descent update rules, matrix derivative derivation of normal equations.",
          },
          {
            id: "cs229-less-3",
            moduleId: "cs229-mod-1",
            title: "Lecture 3: Locally Weighted & Logistic Regression",
            orderIndex: 3,
            videoId: "HZ4cvaztQEs",
            channelName: "Stanford",
            durationSec: 4394,
            startSeconds: 0,
            summary:
              "Parametric vs non-parametric algorithms, bandwidth parameter tau, sigmoid function, and maximum likelihood.",
          },
        ],
      },
      {
        id: "cs229-mod-2",
        courseId: "course-stanford-cs229-ml",
        title: "Module 2: Support Vector Machines & Kernel Methods",
        orderIndex: 2,
        description:
          "Functional and geometric margins, Lagrange duality, KKT conditions, and Mercer's theorem.",
        lessons: [
          {
            id: "cs229-less-4",
            moduleId: "cs229-mod-2",
            title: "Lecture 7: Optimal Margin Classifiers & Kernels",
            orderIndex: 1,
            videoId: "s8B4A5ubw6c",
            channelName: "Stanford",
            durationSec: 4545,
            startSeconds: 0,
            summary:
              "Maximizing geometric margins, primal optimization problem, Lagrange multipliers, and the dual optimization problem.",
          },
          {
            id: "cs229-less-5",
            moduleId: "cs229-mod-2",
            title: "Lecture 8: Support Vector Machines, Soft Margin & SMO",
            orderIndex: 2,
            videoId: "bUv9bfMPMb4",
            channelName: "Stanford",
            durationSec: 4639,
            startSeconds: 0,
            summary:
              "Implicit high-dimensional feature mappings, polynomial and Gaussian kernels, Mercer's theorem, and L1 soft-margins.",
          },
        ],
      },
      {
        id: "cs229-mod-3",
        courseId: "course-stanford-cs229-ml",
        title: "Module 3: Deep Architectures & Reinforcement Learning",
        orderIndex: 3,
        description:
          "Computational graphs, backpropagation calculus, Markov Decision Processes, and value iteration.",
        lessons: [
          {
            id: "cs229-less-6",
            moduleId: "cs229-mod-3",
            title: "Lecture 12: Unsupervised Learning, k-means & EM",
            orderIndex: 1,
            videoId: "ZZGTuAkF-Hw",
            channelName: "Stanford",
            durationSec: 4463,
            startSeconds: 0,
            summary:
              "Clustering with k-means, mixture of Gaussians, and the Expectation-Maximization algorithm.",
          },
          {
            id: "cs229-less-7",
            moduleId: "cs229-mod-3",
            title: "Lecture 16: Reinforcement Learning & MDPs",
            orderIndex: 2,
            videoId: "RtxI449ZjSc",
            channelName: "Stanford",
            durationSec: 4386,
            startSeconds: 0,
            summary:
              "Markov Decision Processes (S, A, P, gamma, R), policy iteration, value iteration, and Bellman optimality equations.",
          },
        ],
      },
    ],
  },
  {
    id: "course-mit-6824-distributed-systems",
    slug: "mit-6824-distributed-systems",
    title: "MIT 6.824: Distributed Systems & Consensus",
    description:
      "MIT's elite graduate-level distributed systems course by Prof. Robert Morris. Focuses on fault tolerance, the Raft consensus protocol, replicated state machines, GFS, distributed key-value databases, and transaction commit protocols.",
    thumbnail: "https://i.ytimg.com/vi/cQP8WApzIQQ/maxresdefault.jpg",
    category: "Computer Science",
    difficulty: "EXPERT",
    tier: "EXPERT",
    estimatedHours: 8.0,
    instructor: "Prof. Robert Morris",
    institution: "MIT OpenCourseWare",
    sourceUrl: "https://pdos.csail.mit.edu/6.824/",
    isPublic: true,
    modules: [
      {
        id: "mit6824-mod-1",
        courseId: "course-mit-6824-distributed-systems",
        title: "Module 1: Distributed Foundations & Storage Architecture",
        orderIndex: 1,
        description:
          "Scalability, performance, fault tolerance, RPC semantics, and Google File System (GFS).",
        lessons: [
          {
            id: "mit6824-less-1",
            moduleId: "mit6824-mod-1",
            title: "Lecture 1: Introduction",
            orderIndex: 1,
            videoId: "cQP8WApzIQQ",
            channelName: "MIT OpenCourseWare",
            durationSec: 4775,
            startSeconds: 0,
            summary:
              "Core motivations: parallelism, fault tolerance, physical locality. Linearizability vs eventual consistency.",
          },
          {
            id: "mit6824-less-2",
            moduleId: "mit6824-mod-1",
            title: "Lecture 3: GFS — The Google File System",
            orderIndex: 2,
            videoId: "EpIgvowZr00",
            channelName: "MIT OpenCourseWare",
            durationSec: 4942,
            startSeconds: 0,
            summary:
              "Big data workloads, single coordinator/master design, chunkservers, append consistency, and replication.",
          },
        ],
      },
      {
        id: "mit6824-mod-2",
        courseId: "course-mit-6824-distributed-systems",
        title: "Module 2: The Raft Consensus Protocol & Replication",
        orderIndex: 2,
        description:
          "State machine replication, split brain prevention, leader elections, and log matching invariants.",
        lessons: [
          {
            id: "mit6824-less-3",
            moduleId: "mit6824-mod-2",
            title: "Lecture 6: Fault Tolerance — Raft (1)",
            orderIndex: 1,
            videoId: "64Zp3tzNbpE",
            channelName: "MIT OpenCourseWare",
            durationSec: 4801,
            startSeconds: 0,
            summary:
              "Split-brain scenarios, majority quorums (2F+1), randomized election timeouts, and requestVote RPCs.",
          },
          {
            id: "mit6824-less-4",
            moduleId: "mit6824-mod-2",
            title: "Lecture 7: Fault Tolerance — Raft (2)",
            orderIndex: 2,
            videoId: "4r8Mz3MMivY",
            channelName: "MIT OpenCourseWare",
            durationSec: 4657,
            startSeconds: 0,
            summary:
              "Log matching property, handling split networks, committing entries from previous terms, and snapshotting.",
          },
        ],
      },
      {
        id: "mit6824-mod-3",
        courseId: "course-mit-6824-distributed-systems",
        title: "Module 3: Distributed Transactions & Two-Phase Commit",
        orderIndex: 3,
        description:
          "Atomicity across partitions, transaction coordinators, 2PC protocol, and failure recovery.",
        lessons: [
          {
            id: "mit6824-less-5",
            moduleId: "mit6824-mod-3",
            title: "Lecture 12: Distributed Transactions",
            orderIndex: 1,
            videoId: "aDp99WDIM_4",
            channelName: "MIT OpenCourseWare",
            durationSec: 4644,
            startSeconds: 0,
            summary:
              "ACID semantics across machines, prepare and commit phases, write-ahead logs, and coordinator timeout recovery.",
          },
        ],
      },
    ],
  },
];
