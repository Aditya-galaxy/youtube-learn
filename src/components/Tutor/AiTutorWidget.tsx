"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Minimize2,
  Maximize2,
  ChevronDown,
  Lightbulb,
  HelpCircle,
  Code2,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { useTutorContext } from "@/Helper/TutorContext";

export const AiTutorWidget: React.FC = () => {
  const {
    isOpen,
    setIsOpen,
    toggleOpen,
    messages,
    isTyping,
    learningContext,
    sendMessage,
    clearMessages,
  } = useTutorContext();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // focus input when opened
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isTyping]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={toggleOpen}
            className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary/30"
            aria-label="Open AI Learning Tutor"
          >
            {/* Ambient Pulse Ring */}
            <span className="absolute -inset-1 rounded-full bg-primary/30 animate-ping opacity-75 duration-1000" />

            <div className="relative flex items-center justify-center">
              <Bot className="h-6 w-6 transition-transform group-hover:rotate-6" />
            </div>

            {/* Online Status Dot */}
            <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500" />

            {/* Badge pill */}
            <span className="absolute -top-2 -left-2 rounded-full border border-primary/20 bg-background px-2 py-0.5 text-[10px] font-bold text-foreground shadow-sm group-hover:scale-105">
              AI Tutor
            </span>
          </button>
        </div>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[580px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 sm:w-[420px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-secondary/50 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                <Bot className="h-4 w-4" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display text-sm font-bold text-foreground leading-none">
                    AI Learning Tutor
                  </h3>
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary uppercase tracking-wider">
                    Socrates
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Your 1-on-1 pedagogical mentor
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearMessages}
                title="Restart Session"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={toggleOpen}
                title="Minimize Tutor"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Active Context Banner */}
          {learningContext.lessonTitle && (
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5 truncate pr-2">
                <GraduationCap className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">
                  Context:{" "}
                  <strong className="text-foreground">
                    {learningContext.lessonTitle}
                  </strong>
                </span>
              </div>
              {learningContext.tier && (
                <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                  {learningContext.tier}
                </span>
              )}
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "tutor" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-xs"
                      : "bg-secondary/60 text-foreground border border-border/40 rounded-bl-xs shadow-2xs"
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>

                  {/* Suggestion Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-border/40 flex flex-wrap gap-1.5">
                      {msg.suggestions.map((suggestion, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="rounded-full border border-primary/20 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground mt-0.5">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs pl-2">
                <Bot className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span className="flex gap-1 items-center font-medium">
                  Tutor is thinking
                  <span className="inline-flex gap-0.5">
                    <span className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1 w-1 rounded-full bg-primary animate-bounce" />
                  </span>
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Short-Cuts */}
          <div className="border-t border-border/40 bg-secondary/20 px-3 py-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
              <button
                onClick={() =>
                  sendMessage(
                    `Explain the core concept of ${
                      learningContext.lessonTitle || "this lesson"
                    } using an intuitive real-world analogy.`
                  )
                }
                className="flex items-center gap-1 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Lightbulb className="h-3 w-3 text-amber-500" />
                Explain with Analogy
              </button>

              <button
                onClick={() =>
                  sendMessage(
                    `Give me a progressive hint for the hands-on challenge in ${
                      learningContext.lessonTitle || "this lesson"
                    } without spoiling the answer.`
                  )
                }
                className="flex items-center gap-1 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Code2 className="h-3 w-3 text-sky-500" />
                Challenge Hint
              </button>

              <button
                onClick={() =>
                  sendMessage(
                    `Test my understanding of ${
                      learningContext.lessonTitle || "this topic"
                    } with a Socratic question.`
                  )
                }
                className="flex items-center gap-1 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <HelpCircle className="h-3 w-3 text-emerald-500" />
                Quiz Me
              </button>
            </div>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-border bg-card p-3"
          >
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-1.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your tutor any doubt…"
                className="max-h-24 flex-1 resize-none bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {isTyping ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
              Press Enter to send · Shift+Enter for new line
            </p>
          </form>
        </div>
      )}
    </>
  );
};
