import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Welcome back</h1>
        <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>
          Sign in to continue to your tasks
        </p>
      </div>
      <Suspense fallback={<div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>
        <LoginForm />
      </Suspense>
    </>
  );
}
