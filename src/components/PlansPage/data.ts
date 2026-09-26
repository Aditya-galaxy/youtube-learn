import { Plan } from "./types";

/**
 * Everything listed under Free exists today. Pro and Team are marked as
 * planned and cannot be bought: there is no payment integration, and listing
 * features the app does not have (offline downloads, a community forum, a
 * mobile app, an API) as if they were on sale is a promise nothing keeps.
 */
export const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    period: "while in development",
    features: [
      "The full course catalogue, including MIT, Harvard and Stanford courseware",
      "Build a course on any topic from YouTube",
      "The AI tutor alongside every lesson",
      "Hands-on challenges, recall quizzes and diagrams",
      "Progress and notes saved to your account",
      "Fair-use limits on search and course building",
    ],
    buttonText: "Current Plan",
    isPopular: false,
  },
  {
    name: "Pro",
    price: "Planned",
    period: "not available yet",
    features: [
      "Everything in Free",
      "Higher daily limits on building courses",
      "Spaced review that schedules what you revisit",
      "Export a course to Notion",
      "Deeper progress analytics",
    ],
    buttonText: "Not available yet",
    isPopular: true,
  },
  {
    name: "Team",
    price: "Planned",
    period: "not available yet",
    features: [
      "Everything in Pro",
      "Shared courses across a group",
      "Group progress overview",
      "Central billing",
    ],
    buttonText: "Not available yet",
    isPopular: false,
  },
];
