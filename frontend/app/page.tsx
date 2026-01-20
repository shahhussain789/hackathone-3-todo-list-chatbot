"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { checkAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/lib/theme-context";

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsAuthenticated(checkAuth());
  }, []);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'}`}>
      {/* Navigation */}
      <nav className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">TaskFlow</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:block px-6 py-2.5 font-medium transition-colors"
                  style={{ color: 'var(--foreground)' }}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <div
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 sm:mb-8"
            style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.1)',
              color: theme === 'dark' ? '#a5b4fc' : '#4f46e5'
            }}
          >
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            Now with AI-powered chatbot
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ color: 'var(--foreground)' }}>
            Organize your life,
            <span className="block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              one task at a time
            </span>
          </h1>

          <p className="text-lg sm:text-xl mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            TaskFlow helps you stay organized, focused, and in control. Manage your tasks effortlessly with our beautiful and intuitive interface.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-full hover:opacity-90 transition-all duration-300 shadow-xl hover:shadow-indigo-500/25 hover:scale-105 flex items-center justify-center"
            >
              Get Started Free
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 border-2 font-semibold text-lg rounded-full transition-all duration-300 flex items-center justify-center"
              style={{
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(99, 102, 241, 0.3)',
                color: 'var(--foreground)'
              }}
            >
              I have an account
            </Link>
          </div>
        </div>

        {/* App Preview */}
        <div className="mt-12 sm:mt-20 max-w-5xl mx-auto">
          <div className="relative">
            <div
              className="rounded-2xl p-4 sm:p-8 border shadow-2xl"
              style={{
                background: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center p-3 sm:p-4 rounded-xl" style={{ background: 'var(--secondary)' }}>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="line-through text-sm sm:text-base" style={{ color: 'var(--muted-foreground)' }}>Design new landing page</span>
                </div>
                <div className="flex items-center p-3 sm:p-4 rounded-xl" style={{ background: 'var(--secondary)' }}>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 mr-3 sm:mr-4 flex-shrink-0" style={{ borderColor: 'var(--primary)' }}></div>
                  <span className="text-sm sm:text-base" style={{ color: 'var(--foreground)' }}>Build task management API</span>
                </div>
                <div className="flex items-center p-3 sm:p-4 rounded-xl" style={{ background: 'var(--secondary)' }}>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 mr-3 sm:mr-4 flex-shrink-0" style={{ borderColor: 'var(--primary)' }}></div>
                  <span className="text-sm sm:text-base" style={{ color: 'var(--foreground)' }}>Deploy to production</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-16 sm:py-24" style={{ background: 'var(--background)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Everything you need to stay productive</h2>
            <p className="text-base sm:text-xl max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>Powerful features to help you manage tasks, collaborate with teams, and achieve your goals.</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto">
            <div
              className="p-6 sm:p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border"
              style={{
                background: theme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'linear-gradient(to bottom right, #eef2ff, #f3e8ff)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3" style={{ color: 'var(--foreground)' }}>Lightning Fast</h3>
              <p style={{ color: 'var(--muted-foreground)' }}>Add, edit, and complete tasks in seconds. Our interface is designed for speed and efficiency.</p>
            </div>

            <div
              className="p-6 sm:p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border"
              style={{
                background: theme === 'dark' ? 'rgba(236, 72, 153, 0.1)' : 'linear-gradient(to bottom right, #fdf2f8, #fff1f2)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3" style={{ color: 'var(--foreground)' }}>Secure & Private</h3>
              <p style={{ color: 'var(--muted-foreground)' }}>Your data is encrypted and secure. Only you can access your tasks and personal information.</p>
            </div>

            <div
              className="p-6 sm:p-8 rounded-2xl hover:shadow-xl transition-all duration-300 border sm:col-span-2 md:col-span-1"
              style={{
                background: theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'linear-gradient(to bottom right, #fffbeb, #fef3c7)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3" style={{ color: 'var(--foreground)' }}>Works Everywhere</h3>
              <p style={{ color: 'var(--muted-foreground)' }}>Access your tasks from any device. Desktop, tablet, or phone - we've got you covered.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">Ready to get organized?</h2>
          <p className="text-base sm:text-xl text-indigo-100 mb-6 sm:mb-10 max-w-2xl mx-auto">Join thousands of users who have transformed their productivity with TaskFlow.</p>
          <Link
            href="/signup"
            className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-indigo-600 font-bold text-base sm:text-lg rounded-full hover:bg-opacity-90 transition-all duration-300 shadow-2xl hover:scale-105"
          >
            Start for Free
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 sm:py-12 border-t"
        style={{
          background: theme === 'dark' ? '#0f172a' : 'var(--card)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">TaskFlow</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>© 2026 TaskFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
