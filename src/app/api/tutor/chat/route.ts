import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getGeminiClient, GENERATION_MODEL } from "@/lib/ai/client";
import type { GoogleGenAI } from "@google/genai";

interface ChatRequest {
  message: string;
  history?: { role: "user" | "model"; text: string }[];
  context?: {
    courseTitle?: string;
    lessonTitle?: string;
    moduleTitle?: string;
    tier?: string;
    summary?: string;
    videoId?: string;
  };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions).catch(() => null);
    const body: ChatRequest = await request
      .json()
      .catch(() => ({ message: "" }));
    const { message, history = [], context = {} } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const {
      courseTitle = "General Learning Track",
      lessonTitle = "Current Concept",
      moduleTitle,
      tier = "INTERMEDIATE",
      summary,
    } = context;

    let ai: GoogleGenAI;
    try {
      ai = getGeminiClient();
    } catch {
      // Fallback response generator if Gemini key/Vertex is not configured
      const lower = message.toLowerCase();
      let reply = `I'm your AI Tutor for **${courseTitle}**!`;
      let suggestions = [
        "Explain this concept with an analogy",
        "How do I solve the hands-on challenge?",
        "Quiz me on this lesson",
      ];

      if (
        lower.includes("explain") ||
        lower.includes("what is") ||
        lower.includes("how does")
      ) {
        reply = `Here is how to think about **${lessonTitle}** at the **${tier}** tier:\n\n1. **Core Intuition**: Imagine this as a state transition system where every action has an invariant.\n2. **The Mechanism**: In the lecture video, observe how the instructor breaks this down into modular components.\n3. **Practical Application**: Rather than just memorizing, open the **Hands-on Lab** tab below the video and test the starter template!\n\nWould you like me to walk through a concrete example or test you with a quick check question?`;
      } else if (
        lower.includes("challenge") ||
        lower.includes("code") ||
        lower.includes("lab")
      ) {
        reply = `Let's conquer the hands-on challenge for **${lessonTitle}** together!\n\n💡 **Tutor Guidance**: Start by defining the edge cases before writing the main loop. In the Challenge Workbench, review Hint 1. What data structure or variable are you planning to use to store intermediate state?`;
        suggestions = [
          "I'm stuck on edge cases",
          "What time complexity is expected?",
          "Can you review my code?",
        ];
      } else if (lower.includes("quiz") || lower.includes("test")) {
        reply = `Let's test your active recall on **${lessonTitle}**:\n\n**Quick Question**: What is the most critical invariant or condition that must hold true when this concept executes, and what happens if boundary inputs are null or empty?\n\nTake a moment to formulate your answer, and tell me your thoughts!`;
        suggestions = [
          "It would cause a runtime panic or wrong output",
          "Boundary inputs should be validated first",
          "Tell me the official answer",
        ];
      } else {
        reply = `Regarding **${lessonTitle}**: you're making steady progress in this track! A great next step is to watch through the core demonstration in the video, check the **Mental Model & Diagram** tab to visualize the dataflow, and then test yourself in the **Active Recall Quiz**.\n\nWhat specific doubt or question do you have about this topic?`;
      }

      return NextResponse.json({ reply, suggestions });
    }

    const systemInstruction = `You are 'Socrates / Nova', a world-class, empathetic, encouraging 1-on-1 AI Tutor and Learning Mentor on the YouTube Learn platform.
Your mission is to guide learners to true mastery through cognitive science principles (Bloom's 2 Sigma tutoring, active retrieval, scaffolding, intuitive analogies, and hands-on building).

LEARNING CONTEXT:
- Course: "${courseTitle}"
- Module: "${moduleTitle || "Active Module"}"
- Current Lesson: "${lessonTitle}"
- Mastery Tier: "${tier}"
- Lesson Summary: "${summary || "Interactive learning sequence"}"

TUTORING GUIDELINES:
1. Socratic Scaffolding: When asked for solutions, don't just dump raw code answers without explanation. Guide the student step-by-step so they learn by doing.
2. Tier-Appropriate Explanations:
   - If BASIC: Use relatable real-world analogies, mental models, 0-to-1 fundamentals.
   - If INTERMEDIATE: Focus on idiomatic patterns, design principles, standard library usage.
   - If ADVANCED: Focus on architecture, trade-offs, performance, scaling bottlenecks.
   - If EXPERT: Focus on formal proofs, distributed invariants, consensus algorithms, low-level mechanics.
3. Be concise and conversational: Don't overwhelm the student with 10-paragraph essays. Use bullet points, bold key terms, and short readable code snippets when relevant.
4. Encourage hands-on building: Recommend checking the lesson's "Hands-on Lab", "Mental Model & Diagram", or "Active Recall Quiz" tabs.

OUTPUT FORMAT:
Respond strictly in valid JSON matching this schema:
{
  "reply": "your conversational, encouraging response in clean markdown",
  "suggestions": ["3 actionable follow-up prompt chips for the user"]
}`;

    const formattedHistory = history.slice(-6).map((h) => ({
      role: h.role,
      parts: [{ text: h.text }],
    }));

    const contents = [
      ...formattedHistory,
      {
        role: "user" as const,
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: GENERATION_MODEL,
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text?.trim() || "{}";
    let parsed: { reply?: string; suggestions?: string[] };
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = {
        reply: rawText,
        suggestions: [
          "Explain this another way",
          "Help me with the challenge",
          "Test my knowledge",
        ],
      };
    }

    return NextResponse.json({
      reply:
        parsed.reply ||
        "Let's explore that together. What part is on your mind?",
      suggestions: parsed.suggestions || [
        "Explain this concept with an analogy",
        "Help me with the challenge",
        "Test my understanding with a quiz question",
      ],
    });
  } catch (error) {
    console.error("[tutor-chat] API error:", error);
    return NextResponse.json({
      reply:
        "I'm here to help! Could you rephrase your question or let me know if you want an analogy, challenge hint, or concept quiz?",
      suggestions: [
        "Explain this concept simply",
        "Give me a challenge hint",
        "What should I watch next?",
      ],
    });
  }
}
