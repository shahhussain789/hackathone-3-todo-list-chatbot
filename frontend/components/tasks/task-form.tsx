"use client";

import { useState } from "react";

interface TaskFormProps {
  onSubmit: (title: string, description: string | null) => void;
  loading?: boolean;
}

export function TaskForm({ onSubmit, loading = false }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim(), description.trim() || null);
      setTitle("");
      setDescription("");
      setShowDescription(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`p-3 sm:p-5 rounded-2xl border-2 shadow-sm transition-all duration-200 ${
        isFocused ? "shadow-md" : ""
      }`}
      style={{
        background: 'var(--card)',
        borderColor: isFocused ? 'var(--primary)' : 'var(--border)'
      }}
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-3 flex-1">
          <div className="hidden sm:block flex-shrink-0 w-6 h-6 mt-2.5 rounded-full border-2 border-dashed" style={{ borderColor: 'var(--border)' }}></div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="What needs to be done?"
            className="flex-1 px-0 py-2 border-none focus:outline-none focus:ring-0 text-base sm:text-lg bg-transparent"
            style={{ color: 'var(--foreground)' }}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="flex-shrink-0 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </>
          )}
        </button>
      </div>

      {!showDescription ? (
        <button
          type="button"
          onClick={() => setShowDescription(true)}
          className="mt-3 sm:ml-9 text-sm transition-colors flex items-center hover:text-indigo-500"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add description
        </button>
      ) : (
        <div className="mt-3 sm:ml-9">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all duration-200 border text-sm sm:text-base"
            style={{ background: 'var(--secondary)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
            rows={2}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => {
              setShowDescription(false);
              setDescription("");
            }}
            className="mt-2 text-sm transition-colors hover:text-red-500"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Remove description
          </button>
        </div>
      )}
    </form>
  );
}
