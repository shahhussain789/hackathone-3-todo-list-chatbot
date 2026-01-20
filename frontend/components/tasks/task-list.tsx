"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { Task, TaskListResponse, TaskResponse } from "@/lib/types";
import { TaskItem } from "./task-item";
import { TaskEmpty } from "./task-empty";
import { TaskForm } from "./task-form";

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingTask, setAddingTask] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError("");

    const response = await api.get<TaskListResponse>("/api/tasks");

    if (response.error) {
      setError(response.error.detail);
    } else if (response.data) {
      setTasks(response.data.tasks);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();

    // Listen for task changes from chatbot
    const handleTaskChange = () => {
      fetchTasks();
    };

    window.addEventListener("tasks-updated", handleTaskChange);
    return () => {
      window.removeEventListener("tasks-updated", handleTaskChange);
    };
  }, [fetchTasks]);

  const handleCreateTask = async (title: string, description: string | null) => {
    setAddingTask(true);
    setError("");

    const response = await api.post<TaskResponse>("/api/tasks", {
      title,
      description,
    });

    if (response.error) {
      setError(response.error.detail);
    } else if (response.data) {
      setTasks((prev) => [response.data!, ...prev]);
    }

    setAddingTask(false);
  };

  const handleToggle = async (id: string) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, is_completed: !task.is_completed } : task
      )
    );

    const response = await api.patch<TaskResponse>(`/api/tasks/${id}/toggle`);

    if (response.error) {
      // Rollback on error
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, is_completed: !task.is_completed } : task
        )
      );
      setError(response.error.detail);
    }
  };

  const handleUpdate = async (id: string, title: string, description: string | null) => {
    const response = await api.put<TaskResponse>(`/api/tasks/${id}`, {
      title,
      description,
    });

    if (response.error) {
      setError(response.error.detail);
    } else if (response.data) {
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? response.data! : task))
      );
    }
  };

  const handleDelete = async (id: string) => {
    const response = await api.delete(`/api/tasks/${id}`);

    if (response.error) {
      setError(response.error.detail);
    } else {
      setTasks((prev) => prev.filter((task) => task.id !== id));
    }
  };

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const totalCount = tasks.length;

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mx-auto" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}></div>
        <p className="mt-4 font-medium" style={{ color: 'var(--muted-foreground)' }}>Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <TaskForm onSubmit={handleCreateTask} loading={addingTask} />

      {error && (
        <div className="p-3 sm:p-4 text-sm rounded-xl border flex items-center" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="break-words">{error}</span>
        </div>
      )}

      {tasks.length === 0 ? (
        <TaskEmpty />
      ) : (
        <>
          {/* Progress Bar */}
          <div className="p-3 sm:p-4 rounded-2xl border shadow-sm" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--foreground)' }}>Progress</span>
              <span className="text-xs sm:text-sm" style={{ color: 'var(--muted-foreground)' }}>{completedCount} of {totalCount} completed</span>
            </div>
            <div className="w-full h-1.5 sm:h-2 rounded-full overflow-hidden" style={{ background: 'var(--secondary)' }}>
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-2 sm:space-y-3">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
