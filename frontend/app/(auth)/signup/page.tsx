import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Create your account</h1>
        <p className="mt-2" style={{ color: 'var(--muted-foreground)' }}>
          Start your productivity journey today
        </p>
      </div>
      <SignupForm />
    </>
  );
}
