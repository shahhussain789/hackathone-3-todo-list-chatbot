"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, title: string, description: string | null) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggle = () => {
    onToggle(task.id);
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(task.id, editTitle.trim(), editDescription.trim() || null);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(task.id);
    setShowDeleteConfirm(false);
  };

  if (isEditing) {
    return (
      <div className="p-3 sm:p-5 rounded-2xl shadow-sm ring-2 ring-indigo-500" style={{ background: 'var(--card)' }}>
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:outline-none focus:ring-2 mb-3 font-medium text-sm sm:text-base"
          style={{ background: 'var(--secondary)', color: 'var(--foreground)', borderColor: 'var(--border)' }}
          placeholder="Task title"
          autoFocus
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl focus:outline-none focus:ring-2 mb-4 resize-none text-sm sm:text-base"
          style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }}
          placeholder="Description (optional)"
          rows={2}
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition-opacity font-medium flex items-center text-sm sm:text-base"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-3 sm:px-4 py-2 rounded-xl font-medium transition-colors text-sm sm:text-base"
            style={{ background: 'var(--secondary)', color: 'var(--foreground)' }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group p-3 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border ${task.is_completed ? "opacity-60" : ""}`}
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <button
          onClick={handleToggle}
          className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 mt-0.5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            task.is_completed
              ? "bg-green-500 border-green-500"
              : "hover:border-indigo-500"
          }`}
          style={{ borderColor: task.is_completed ? undefined : 'var(--border)' }}
        >
          {task.is_completed && (
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-sm sm:text-base break-words ${task.is_completed ? "line-through" : ""}`}
            style={{ color: task.is_completed ? 'var(--muted-foreground)' : 'var(--foreground)' }}
          >
            {task.title}
          </h3>
          {task.description && (
            <p
              className={`mt-1 text-xs sm:text-sm break-words ${task.is_completed ? "line-through" : ""}`}
              style={{ color: 'var(--muted-foreground)' }}
            >
              {task.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 sm:p-2 rounded-lg transition-colors hover:bg-indigo-500/10"
            style={{ color: 'var(--muted-foreground)' }}
            title="Edit task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          {showDeleteConfirm ? (
            <div className="flex items-center gap-1 bg-red-500/10 rounded-lg p-1">
              <button
                onClick={handleDelete}
                className="px-2 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 text-xs font-medium rounded-md transition-colors"
                style={{ color: 'var(--foreground)' }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 sm:p-2 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-500"
              style={{ color: 'var(--muted-foreground)' }}
              title="Delete task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
