import { TaskList } from "@/components/tasks/task-list";
import { ChatPanel } from "@/components/chat";

export default function DashboardPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>My Tasks</h2>
            <p className="mt-1 text-sm sm:text-base" style={{ color: 'var(--muted-foreground)' }}>Stay organized and get things done</p>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-xl" style={{ background: 'var(--secondary)' }}>
              <svg className="w-5 h-5" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Task List - Full width */}
      <TaskList />

      {/* Floating Chat Panel */}
      <ChatPanel />
    </div>
  );
}
