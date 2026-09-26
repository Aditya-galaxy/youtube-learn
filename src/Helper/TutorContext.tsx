"use client";

import type { TutorAction } from "@/lib/tutor/actions";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";

export interface TutorMessage {
  id: string;
  sender: "tutor" | "user";
  text: string;
  timestamp: Date;
  suggestions?: string[];
  /** A failure notice rather than tutoring, rendered so the learner can tell. */
  isError?: boolean;
  /** One thing the tutor offers to do in the classroom, rendered as a button. */
  action?: TutorAction | null;
}

/**
 * What the classroom tells the tutor. Only the lesson id travels: the server
 * looks the rest up from the learner's account, so the tutor cannot be told it
 * is teaching something it is not.
 */
export interface TutorLearningContext {
  lessonId?: string;
  lessonTitle?: string;
}

/** Performs a tutor action in the classroom. Registered by ClassroomPlayer. */
export type TutorActionHandler = (action: TutorAction) => void;

interface TutorContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  messages: TutorMessage[];
  isTyping: boolean;
  learningContext: TutorLearningContext;
  setLearningContext: (ctx: Partial<TutorLearningContext>) => void;
  sendMessage: (content: string) => Promise<void>;
  /** Asks the tutor to open the lesson with a plan. Runs once per lesson. */
  startLesson: (lessonId: string, lessonTitle: string) => void;
  performAction: (action: TutorAction) => void;
  registerActionHandler: (handler: TutorActionHandler | null) => void;
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

  const actionHandlerRef = useRef<TutorActionHandler | null>(null);
  const openedLessonRef = useRef<string | null>(null);

  const registerActionHandler = useCallback(
    (handler: TutorActionHandler | null) => {
      actionHandlerRef.current = handler;
    },
    []
  );

  const performAction = useCallback((action: TutorAction) => {
    actionHandlerRef.current?.(action);
  }, []);

  const pushError = useCallback((err: unknown) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `tutor-error-${Date.now()}`,
        sender: "tutor",
        text:
          err instanceof Error
            ? err.message
            : "The tutor is unavailable right now. Please try again.",
        timestamp: new Date(),
        isError: true,
      },
    ]);
  }, []);

  const callTutor = useCallback(
    async (path: string, body: Record<string, unknown>) => {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(
          typeof payload.error === "string"
            ? payload.error
            : res.status === 401
              ? "Sign in to work with the tutor."
              : "The tutor could not answer just now. Please try again."
        );
      }
      return (await res.json()) as {
        reply?: string;
        suggestions?: string[];
        action?: TutorAction | null;
      };
    },
    []
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      const lessonId = learningContext.lessonId;
      if (!lessonId) {
        pushError(
          new Error("Open a lesson and I can work through it with you.")
        );
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          sender: "user",
          text: content.trim(),
          timestamp: new Date(),
        },
      ]);
      setIsTyping(true);

      try {
        const data = await callTutor("/api/tutor/chat", {
          lessonId,
          message: content,
          history: messages.slice(-8).map((m) => ({
            role: m.sender === "user" ? ("user" as const) : ("model" as const),
            text: m.text,
          })),
        });
        setMessages((prev) => [
          ...prev,
          {
            id: `tutor-${Date.now()}`,
            sender: "tutor",
            text: data.reply || "Could you say a little more about that?",
            timestamp: new Date(),
            suggestions: data.suggestions,
            action: data.action ?? null,
          },
        ]);
      } catch (err) {
        pushError(err);
      } finally {
        setIsTyping(false);
      }
    },
    [callTutor, learningContext.lessonId, messages, pushError]
  );

  /** The tutor's opening move for a lesson: fired once when it is opened. */
  const startLesson = useCallback(
    (lessonId: string, lessonTitle: string) => {
      setContextState({ lessonId, lessonTitle });
      if (openedLessonRef.current === lessonId) return;
      openedLessonRef.current = lessonId;

      setIsTyping(true);
      callTutor("/api/tutor/opener", { lessonId })
        .then((data) => {
          setMessages((prev) => [
            ...prev,
            {
              id: `tutor-open-${lessonId}`,
              sender: "tutor",
              text: data.reply || "",
              timestamp: new Date(),
              suggestions: data.suggestions,
              action: data.action ?? null,
            },
          ]);
        })
        // Silent: the learner did not ask for this, so a failure banner on
        // every lesson would be noise. Their own questions still report.
        .catch(() => undefined)
        .finally(() => setIsTyping(false));
    },
    [callTutor]
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
        startLesson,
        performAction,
        registerActionHandler,
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
