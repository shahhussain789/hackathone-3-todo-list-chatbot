"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { sendMessage, getConversation } from "@/lib/chat-api";
import type { Message } from "@/lib/types";
import { ChatMessage } from "./chat-message";

interface ChatPanelProps {
  conversationId?: string;
  onConversationCreated?: (id: string) => void;
}

export function ChatPanel({
  conversationId: initialConversationId,
  onConversationCreated,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load conversation history
  const loadConversation = useCallback(async () => {
    if (!conversationId) return;

    const response = await getConversation(conversationId);
    if (response.error) {
      setError(response.error.detail);
    } else if (response.data) {
      setMessages(response.data.messages);
    }
  }, [conversationId]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message
  const handleSend = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || loading) return;

    setError("");
    setLoading(true);

    // Optimistically add user message
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: trimmedInput,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);
    setInputValue("");

    // Focus back on input
    inputRef.current?.focus();

    const response = await sendMessage(trimmedInput, conversationId);

    if (response.error) {
      setError(response.error.detail);
      // Remove the optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
      setInputValue(trimmedInput); // Restore the input
    } else if (response.data) {
      // Update conversation ID if this is a new conversation
      if (!conversationId) {
        setConversationId(response.data.conversation_id);
        onConversationCreated?.(response.data.conversation_id);
      }

      // Add the AI response
      const assistantMessage: Message = {
        id: `response-${Date.now()}`,
        role: "assistant",
        content: response.data.response,
        tool_calls:
          response.data.tool_calls.length > 0
            ? response.data.tool_calls
            : undefined,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // If any task tools were called, refresh the task list
      if (response.data.tool_calls.length > 0) {
        window.dispatchEvent(new CustomEvent("tasks-updated"));
      }
    }

    setLoading(false);
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* Floating Chat Button - shown when closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-105"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}

      {/* Chat Panel - shown when open */}
      {isOpen && (
        <div className="flex flex-col w-[calc(100vw-2rem)] sm:w-96 h-[70vh] sm:h-[500px] max-h-[600px] rounded-2xl border shadow-2xl overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          {/* Header */}
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'linear-gradient(to right, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>Task Assistant</h3>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Ask me to manage your tasks
                  </p>
                </div>
              </div>
              {/* Minimize button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--muted-foreground)' }}
                title="Minimize"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.length === 0 && !loading && (
              <div className="rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]" style={{ background: 'var(--secondary)' }}>
                <p className="whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>
                  Hey there! 👋 I&apos;m TaskBot, your personal task assistant!
                  {"\n\n"}I can help you:
                  {"\n"}• Add new tasks
                  {"\n"}• Show your task list
                  {"\n"}• Mark tasks as complete
                  {"\n"}• Update or delete tasks
                  {"\n\n"}What would you like to do today?
                </p>
              </div>
            )}

            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="rounded-2xl rounded-bl-md px-4 py-3" style={{ background: 'var(--secondary)' }}>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--muted-foreground)' }} />
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s", background: 'var(--muted-foreground)' }}
                    />
                    <div
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s", background: 'var(--muted-foreground)' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error display */}
          {error && (
            <div className="mx-4 mb-2 p-3 text-sm rounded-xl border flex items-center" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              <svg
                className="w-4 h-4 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: '#ef4444' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="flex-1">{error}</span>
              <button
                onClick={() => setError("")}
                className="ml-2 hover:opacity-70"
                style={{ color: '#ef4444' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Input area */}
          <div className="p-3 sm:p-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={loading}
                className="flex-1 px-3 sm:px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                style={{ background: 'var(--secondary)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || loading}
                className="p-2 sm:px-4 sm:py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
