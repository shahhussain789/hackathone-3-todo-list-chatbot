export function TaskEmpty() {
  return (
    <div className="text-center py-10 sm:py-16 px-4">
      <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 sm:mb-6" style={{ background: 'linear-gradient(to bottom right, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))' }}>
        <svg
          className="w-10 h-10 sm:w-12 sm:h-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{ color: 'var(--primary)' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      </div>
      <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>No tasks yet</h3>
      <p className="text-sm sm:text-base max-w-sm mx-auto mb-4 sm:mb-6" style={{ color: 'var(--muted-foreground)' }}>
        Your task list is empty. Add your first task above and start getting things done!
      </p>
      <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm" style={{ color: 'var(--primary)' }}>
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        <span>Type in the box above to add a task</span>
      </div>
    </div>
  );
}
