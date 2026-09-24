"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export interface TutorMessage {
  id: string;
  sender: "tutor" | "user";
  text: string;
  timestamp: Date;
  suggestions?: string[];
}

export interface TutorLearningContext {
  courseTitle?: string;
  lessonTitle?: string;
  moduleTitle?: string;
  tier?: string;
  summary?: string;
  videoId?: string;
}

interface TutorContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  messages: TutorMessage[];
  isTyping: boolean;
  learningContext: TutorLearningContext;
  setLearningContext: (ctx: Partial<TutorLearningContext>) => void;
  sendMessage: (content: string) => Promise<void>;
  askTutorWithPrompt: (
    prompt: string,
    contextOverride?: Partial<TutorLearningContext>
  ) => void;
  clearMessages: () => void;
}

const TutorContext = createContext<TutorContextType | undefined>(undefined);

export const TutorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [learningContext, setContextState] = useState<TutorLearningContext>({});

  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: "initial-welcome",
      sender: "tutor",
      text: "👋 Hi there! I'm your **AI Learning Tutor & Mentor**.\n\nWhether you need an intuitive breakdown of a tough video, step-by-step guidance on a hands-on coding challenge, or a quick concept quiz, I'm here right alongside you. What are you working on today?",
      timestamp: new Date(),
      suggestions: [
        "Explain this video simply",
        "Help me with this coding challenge",
        "Quiz me on what I just watched",
        "What's my next learning step?",
      ],
    },
  ]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const setLearningContext = useCallback(
    (ctx: Partial<TutorLearningContext>) => {
      setContextState((prev) => ({ ...prev, ...ctx }));
    },
    []
  );

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "tutor",
        text: "✨ Fresh session started! Ask me any doubt about your current lesson, video, or challenge.",
        timestamp: new Date(),
        suggestions: [
          "Explain the core concept",
          "Give me an analogy for this",
          "Test my understanding",
        ],
      },
    ]);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMsg: TutorMessage = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      try {
        const historyForApi = messages
          .slice(-8)
          .map((m) => ({
            role: m.sender === "user" ? ("user" as const) : ("model" as const),
            text: m.text,
          }));

        const res = await fetch("/api/tutor/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            history: historyForApi,
            context: learningContext,
          }),
        });

        if (!res.ok) {
          throw new Error("Chat request failed");
        }

        const data = await res.json();
        const tutorReply: TutorMessage = {
          id: `tutor-${Date.now()}`,
          sender: "tutor",
          text: data.reply || "Let's explore that! Could you elaborate on what part felt tricky?",
          timestamp: new Date(),
          suggestions: data.suggestions || [
            "Explain it another way",
            "Give me a concrete code example",
            "Test me with a quick question",
          ],
        };

        setMessages((prev) => [...prev, tutorReply]);
      } catch (err) {
        console.error("[TutorContext] Error sending message:", err);
        // Fallback pedagogical response
        const fallbackReply: TutorMessage = {
          id: `tutor-${Date.now()}`,
          sender: "tutor",
          text: `Great question regarding **${
            learningContext.lessonTitle || "this topic"
          }**!\n\nHere is how I recommend breaking it down:\n1. **First, grasp the mental model**: Think of this concept as a system with defined inputs and invariants.\n2. **Next, check the hands-on lab**: Try modifying the starter code or reviewing the visual diagram tab.\n3. **Active retrieval**: Can you explain to me in your own words what happens when this executes?`,
          timestamp: new Date(),
          suggestions: [
            "Break down the challenge for me",
            "Show me an analogy",
            "What should I watch next?",
          ],
        };
        setMessages((prev) => [...prev, fallbackReply]);
      } finally {
        setIsTyping(false);
      }
    },
    [learningContext, messages]
  );

  const askTutorWithPrompt = useCallback(
    (prompt: string, contextOverride?: Partial<TutorLearningContext>) => {
      if (contextOverride) {
        setLearningContext(contextOverride);
      }
      setIsOpen(true);
      sendMessage(prompt);
    },
    [sendMessage, setLearningContext]
  );

  return (
    <TutorContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleOpen,
        messages,
        isTyping,
        learningContext,
        setLearningContext,
        sendMessage,
        askTutorWithPrompt,
        clearMessages,
      }}
    >
      {children}
    </TutorContext.Provider>
  );
};

export const useTutorContext = (): TutorContextType => {
  const context = useContext(TutorContext);
  if (!context) {
    throw new Error("useTutorContext must be used within a TutorProvider");
  }
  return context;
};
