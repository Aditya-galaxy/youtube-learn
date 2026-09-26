import type { Course } from "../../types/course";
import { OPEN_COURSEWARE_COURSES } from "./openCourseWareData";

const CORE_COURSES: Course[] = [
  {
    id: "course-python-masterclass",
    slug: "python-masterclass",
    title: "Complete Python Masterclass: Zero to Engineer",
    description:
      "A structured, sequential curriculum covering Python from syntax fundamentals and data structures to object-oriented architecture and real-world scripting.",
    thumbnail: "https://i.ytimg.com/vi/rfscVS0vtbw/mqdefault.jpg",
    category: "Programming",
    difficulty: "BEGINNER",
    tier: "BASIC",
    institution: "freeCodeCamp",
    estimatedHours: 4.5,
    instructor: "FreeCodeCamp & Corey Schafer",
    isPublic: true,
    modules: [
      {
        id: "pymod-1",
        courseId: "course-python-masterclass",
        title: "Module 1: Foundations & Core Syntax",
        orderIndex: 1,
        description:
          "Variables, numeric types, strings, conditionals, and logical expressions.",
        lessons: [
          {
            id: "pyless-1",
            moduleId: "pymod-1",
            title: "1. Python Installation, Environment & Your First Script",
            orderIndex: 1,
            videoId: "rfscVS0vtbw",
            channelName: "freeCodeCamp.org",
            durationSec: 16012,
            startSeconds: 0,
            summary:
              "Learn how the Python interpreter executes code, setting up VS Code, and writing clean print statements.",
          },
          {
            id: "pyless-2",
            moduleId: "pymod-1",
            title: "2. Variables, Dynamic Typing & String Manipulation",
            orderIndex: 2,
            videoId: "kqtD5dpn9C8",
            channelName: "Corey Schafer",
            durationSec: 3606,
            startSeconds: 0,
            summary:
              "Mastering f-strings, string methods, slicing, and memory referencing in Python.",
          },
          {
            id: "pyless-3",
            moduleId: "pymod-1",
            title: "3. Conditionals, Boolean Logic & Control Flow",
            orderIndex: 3,
            videoId: "DZwmZ8Usvnk",
            channelName: "Corey Schafer",
            durationSec: 988,
            startSeconds: 0,
            summary:
              "Using if, elif, else statements and short-circuit boolean evaluations.",
          },
        ],
      },
      {
        id: "pymod-2",
        courseId: "course-python-masterclass",
        title: "Module 2: Data Structures & Iteration",
        orderIndex: 2,
        description:
          "Lists, tuples, sets, dictionaries, comprehensions, and efficient loops.",
        lessons: [
          {
            id: "pyless-4",
            moduleId: "pymod-2",
            title: "4. Lists & Tuples: Ordered Collections and Mutability",
            orderIndex: 1,
            videoId: "W8KRzm-HUcc",
            channelName: "Corey Schafer",
            durationSec: 1745,
            startSeconds: 0,
            summary:
              "Array-like behavior in Python, sorting, mutating lists, and immutable tuples.",
          },
          {
            id: "pyless-5",
            moduleId: "pymod-2",
            title: "5. Dictionaries & Sets: Hash Maps & Uniqueness",
            orderIndex: 2,
            videoId: "daefaLgNkw0",
            channelName: "Corey Schafer",
            durationSec: 599,
            startSeconds: 0,
            summary:
              "O(1) key-value lookups, dictionary methods, set intersections, and differences.",
          },
          {
            id: "pyless-6",
            moduleId: "pymod-2",
            title:
              "6. Loops & Iterations: For Loops, While Loops & Comprehensions",
            orderIndex: 3,
            videoId: "6iF8Xb7Z3wQ",
            channelName: "Corey Schafer",
            durationSec: 614,
            startSeconds: 0,
            summary:
              "Looping patterns, enumerate, zip, and idiomatic Python list comprehensions.",
          },
        ],
      },
      {
        id: "pymod-3",
        courseId: "course-python-masterclass",
        title: "Module 3: Functions & Object-Oriented Architecture",
        orderIndex: 3,
        description:
          "Modular functions, closures, class structures, inheritance, and dunder methods.",
        lessons: [
          {
            id: "pyless-7",
            moduleId: "pymod-3",
            title: "7. Writing Modular Functions, *args & **kwargs",
            orderIndex: 1,
            videoId: "9Os0o3wzS_I",
            channelName: "Corey Schafer",
            durationSec: 1308,
            startSeconds: 0,
            summary:
              "Pure functions, positional arguments, keyword arguments, and scope rules.",
          },
          {
            id: "pyless-8",
            moduleId: "pymod-3",
            title: "8. Object-Oriented Python: Classes & Instance Variables",
            orderIndex: 2,
            videoId: "ZDa-Z5JzLYM",
            channelName: "Corey Schafer",
            durationSec: 924,
            startSeconds: 0,
            summary:
              "Understanding self, __init__ constructor, instance vs class variables.",
          },
          {
            id: "pyless-9",
            moduleId: "pymod-3",
            title: "9. Class Inheritance, Polymorphism & Super()",
            orderIndex: 3,
            videoId: "RSl87lqOXDE",
            channelName: "Corey Schafer",
            durationSec: 1180,
            startSeconds: 0,
            summary:
              "Subclasses, method overriding, super() patterns, and modular OOP design.",
          },
        ],
      },
      {
        id: "pymod-4",
        courseId: "course-python-masterclass",
        title: "Module 4: Error Handling & File Systems",
        orderIndex: 4,
        description:
          "Robust exception management, context managers, and file reading/writing.",
        lessons: [
          {
            id: "pyless-11",
            moduleId: "pymod-4",
            title: "11. Exception Handling: Try, Except, Else & Finally",
            orderIndex: 1,
            videoId: "NIWwJbo-9_8",
            channelName: "Corey Schafer",
            durationSec: 634,
            startSeconds: 0,
            summary:
              "Handling runtime crashes gracefully and creating custom exception classes.",
          },
        ],
      },
    ],
  },
  {
    id: "course-calculus-3blue1brown",
    slug: "essence-of-calculus",
    title: "Essence of Calculus & Visual Mathematics",
    description:
      "A visually intuitive, conceptual voyage through differential and integral calculus, Taylor series, and mathematical intuition by 3Blue1Brown.",
    thumbnail: "https://i.ytimg.com/vi/WUvTyaaNkzM/mqdefault.jpg",
    category: "Mathematics",
    difficulty: "INTERMEDIATE",
    tier: "INTERMEDIATE",
    institution: "3Blue1Brown",
    sourceUrl: "https://www.3blue1brown.com/topics/calculus",
    estimatedHours: 3.2,
    instructor: "Grant Sanderson (3Blue1Brown)",
    isPublic: true,
    modules: [
      {
        id: "calcmod-1",
        courseId: "course-calculus-3blue1brown",
        title: "Module 1: The Intuition of Derivatives",
        orderIndex: 1,
        description:
          "Visualizing instantaneous rate of change and geometric slopes.",
        lessons: [
          {
            id: "calcless-1",
            moduleId: "calcmod-1",
            title: "1. The Essence of Calculus",
            orderIndex: 1,
            videoId: "WUvTyaaNkzM",
            channelName: "3Blue1Brown",
            durationSec: 1025,
            startSeconds: 0,
            summary:
              "How finding the area of a circle naturally bridges algebra and calculus.",
          },
          {
            id: "calcless-2",
            moduleId: "calcmod-1",
            title: "2. The Paradox of the Derivative",
            orderIndex: 2,
            videoId: "9vKqVkMQHKk",
            channelName: "3Blue1Brown",
            durationSec: 1010,
            startSeconds: 0,
            summary:
              "Instantaneous velocity and the geometric meaning of dx and dt.",
          },
          {
            id: "calcless-3",
            moduleId: "calcmod-1",
            title: "3. Derivative Formulas from First Geometric Principles",
            orderIndex: 3,
            videoId: "S0_qX4VJhMQ",
            channelName: "3Blue1Brown",
            durationSec: 1054,
            startSeconds: 0,
            summary:
              "Powers, squares, and geometric nudges that produce polynomial derivatives.",
          },
        ],
      },
      {
        id: "calcmod-2",
        courseId: "course-calculus-3blue1brown",
        title: "Module 2: Product, Chain Rules & Integration",
        orderIndex: 2,
        description:
          "Composite functions and the Fundamental Theorem of Calculus.",
        lessons: [
          {
            id: "calcless-4",
            moduleId: "calcmod-2",
            title: "4. Visualizing the Product Rule and Chain Rule",
            orderIndex: 1,
            videoId: "YG15m2VwSjA",
            channelName: "3Blue1Brown",
            durationSec: 956,
            startSeconds: 0,
            summary:
              "Why product rules look like expanding rectangles, and how chain rules compose rates.",
          },
          {
            id: "calcless-5",
            moduleId: "calcmod-2",
            title: "5. What Does Integration Really Mean?",
            orderIndex: 2,
            videoId: "FnJqaIESC2s",
            channelName: "3Blue1Brown",
            durationSec: 759,
            startSeconds: 0,
            summary:
              "Accumulation, continuous addition, Riemann sums, and visual areas under curves.",
          },
          {
            id: "calcless-6",
            moduleId: "calcmod-2",
            title: "6. The Fundamental Theorem of Calculus",
            orderIndex: 3,
            videoId: "rfG8ce4nNh0",
            channelName: "3Blue1Brown",
            durationSec: 1246,
            startSeconds: 0,
            summary:
              "Why differentiation and integration are inverse operations.",
          },
        ],
      },
      {
        id: "calcmod-3",
        courseId: "course-calculus-3blue1brown",
        title: "Module 3: Higher Orders & Approximations",
        orderIndex: 3,
        description: "Higher derivatives, Taylor polynomials, and limits.",
        lessons: [
          {
            id: "calcless-7",
            moduleId: "calcmod-3",
            title:
              "7. Taylor Series: Approximating Any Function with Polynomials",
            orderIndex: 1,
            videoId: "3d6DsjIBzJ4",
            channelName: "3Blue1Brown",
            durationSec: 1340,
            startSeconds: 0,
            summary:
              "How matching higher-order derivatives allows polynomial approximations of functions.",
          },
          {
            id: "calcless-8",
            moduleId: "calcmod-3",
            title: "8. What are Limits, Really? (Epsilon-Delta Intuition)",
            orderIndex: 2,
            videoId: "kfF40MiS7zA",
            channelName: "3Blue1Brown",
            durationSec: 1107,
            startSeconds: 0,
            summary:
              "A rigorous yet intuitive definition of limits in calculus.",
          },
        ],
      },
    ],
  },
  {
    id: "course-nextjs-fullstack",
    slug: "nextjs-fullstack-mastery",
    title: "Next.js 15 & React 19 Full-Stack Architecture",
    description:
      "Build production-grade web applications with Server Components, Server Actions, Prisma, NextAuth, and scalable deployment pipelines.",
    thumbnail: "https://i.ytimg.com/vi/rGPpQdbDbwo/mqdefault.jpg",
    category: "Web Development",
    difficulty: "INTERMEDIATE",
    tier: "INTERMEDIATE",
    institution: "Vercel & Community",
    sourceUrl: "https://nextjs.org/learn",
    estimatedHours: 3.8,
    instructor: "Jack Herrington & Lee Robinson",
    isPublic: true,
    modules: [
      {
        id: "nextmod-1",
        courseId: "course-nextjs-fullstack",
        title: "Module 1: React 19 & Server Component Foundations",
        orderIndex: 1,
        description:
          "Mental model shifts from client SPAs to hybrid Server Component architectures.",
        lessons: [
          {
            id: "nextless-2",
            moduleId: "nextmod-1",
            title: "2. Server Components vs Client Components in Next.js 15",
            orderIndex: 1,
            videoId: "rGPpQdbDbwo",
            channelName: "Lee Robinson",
            durationSec: 948,
            startSeconds: 0,
            summary:
              "Network boundary rules, serialization, and keeping sensitive code on the server.",
          },
        ],
      },
      {
        id: "nextmod-2",
        courseId: "course-nextjs-fullstack",
        title: "Module 2: App Router Routing & Data Flow",
        orderIndex: 2,
        description:
          "Layouts, nested routes, route handlers, and server actions.",
        lessons: [
          {
            id: "nextless-3",
            moduleId: "nextmod-2",
            title:
              "3. App Router Deep Dive: Layouts, Templates & Parallel Routes",
            orderIndex: 1,
            videoId: "wm5gMKuwSYk",
            channelName: "Jack Herrington",
            durationSec: 12389,
            startSeconds: 0,
            summary:
              "Advanced layout hierarchies, error boundaries, loading skeletons, and intercepting routes.",
          },
          {
            id: "nextless-4",
            moduleId: "nextmod-2",
            title: "4. Server Actions: Form Handling & Safe Mutations",
            orderIndex: 2,
            videoId: "dDpZfOQBMaU",
            channelName: "Jack Herrington",
            durationSec: 627,
            startSeconds: 0,
            summary:
              "Mutating data without API boilerplate, Zod schema validation, and revalidatePath.",
          },
        ],
      },
      {
        id: "nextmod-3",
        courseId: "course-nextjs-fullstack",
        title: "Module 3: Database & Authentication",
        orderIndex: 3,
        description:
          "PostgreSQL integration with Prisma and NextAuth sessions.",
        lessons: [
          {
            id: "nextless-7",
            moduleId: "nextmod-3",
            title: "7. NextAuth.js Authentication & Role-Based Access Control",
            orderIndex: 1,
            videoId: "1MTyCvS05V4",
            channelName: "CodeWithAntonio",
            durationSec: 28857,
            startSeconds: 0,
            summary:
              "Google OAuth, JWT session strategy, middleware protection, and user associations.",
          },
        ],
      },
    ],
  },
  {
    id: "course-ai-ml-fundamentals",
    slug: "ai-machine-learning-fundamentals",
    title: "Artificial Intelligence & Neural Networks from Scratch",
    description:
      "A rigorous, visual introduction to machine learning principles, gradient descent, loss landscapes, and neural network architectures.",
    thumbnail: "https://i.ytimg.com/vi/Rt6beTKDtqY/mqdefault.jpg",
    category: "Artificial Intelligence",
    difficulty: "ADVANCED",
    tier: "ADVANCED",
    institution: "DeepLearning.AI & 3Blue1Brown",
    sourceUrl: "https://www.deeplearning.ai/",
    estimatedHours: 3.5,
    instructor: "Grant Sanderson & Zach Star",
    isPublic: true,
    modules: [
      {
        id: "aimod-1",
        courseId: "course-ai-ml-fundamentals",
        title: "Module 1: Machine Learning Foundations",
        orderIndex: 1,
        description:
          "The core paradigm shift from heuristic programming to learning from data.",
        lessons: [
          {
            id: "ailess-1",
            moduleId: "aimod-1",
            title: "1. The Mathematics of Machine Learning",
            orderIndex: 1,
            videoId: "Rt6beTKDtqY",
            channelName: "Zach Star",
            durationSec: 994,
            startSeconds: 0,
            summary:
              "Overview of linear algebra, calculus, and probability matrices used in ML models.",
          },
          {
            id: "ailess-2",
            moduleId: "aimod-1",
            title:
              "2. Supervised vs Unsupervised Learning & Feature Engineering",
            orderIndex: 2,
            videoId: "Gv9_4yMHFhI",
            channelName: "StatQuest with Josh Starmer",
            durationSec: 765,
            startSeconds: 0,
            summary:
              "Classification, regression, clustering, overfitting, and test/train validation splits.",
          },
        ],
      },
      {
        id: "aimod-2",
        courseId: "course-ai-ml-fundamentals",
        title: "Module 2: Neural Networks & Backpropagation",
        orderIndex: 2,
        description:
          "Visualizing artificial neurons, activation functions, and gradient descent.",
        lessons: [
          {
            id: "ailess-3",
            moduleId: "aimod-2",
            title: "3. But What is a Neural Network? (Deep Learning Chapter 1)",
            orderIndex: 1,
            videoId: "aircAruvnKk",
            channelName: "3Blue1Brown",
            durationSec: 1120,
            startSeconds: 0,
            summary:
              "Layers, weights, biases, and activation functions for digit recognition.",
          },
          {
            id: "ailess-4",
            moduleId: "aimod-2",
            title: "4. Gradient Descent: How Neural Networks Learn",
            orderIndex: 2,
            videoId: "IHZwWFHWa-w",
            channelName: "3Blue1Brown",
            durationSec: 1233,
            startSeconds: 0,
            summary:
              "Loss functions, high-dimensional gradient vectors, and optimization landscapes.",
          },
          {
            id: "ailess-5",
            moduleId: "aimod-2",
            title: "5. What is Backpropagation Really Doing?",
            orderIndex: 3,
            videoId: "Ilg3gGewQ5U",
            channelName: "3Blue1Brown",
            durationSec: 767,
            startSeconds: 0,
            summary:
              "The chain rule applied backward through computational graphs to compute weight gradients.",
          },
        ],
      },
    ],
  },
];

export const CURATED_COURSES: Course[] = [
  ...OPEN_COURSEWARE_COURSES,
  ...CORE_COURSES,
];
