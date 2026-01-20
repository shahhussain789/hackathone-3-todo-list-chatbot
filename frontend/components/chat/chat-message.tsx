"use client";

import type { Message } from "@/lib/types";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3 sm:mb-4`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
          isUser
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-md"
            : "rounded-bl-md"
        }`}
        style={!isUser ? { background: 'var(--secondary)', color: 'var(--foreground)' } : undefined}
      >
        {/* Message content */}
        <p className="whitespace-pre-wrap break-words text-sm sm:text-base" style={{ color: isUser ? 'white' : 'var(--foreground)' }}>
          {message.content}
        </p>

        {/* Tool calls indicator (for assistant messages) */}
        {!isUser && message.tool_calls && message.tool_calls.length > 0 && (
          <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {message.tool_calls.length} action
              {message.tool_calls.length > 1 ? "s" : ""} performed
            </div>
          </div>
        )}

        {/* Timestamp */}
        <p
          className="text-xs mt-1"
          style={{ color: isUser ? 'rgba(255,255,255,0.7)' : 'var(--muted-foreground)' }}
        >
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
