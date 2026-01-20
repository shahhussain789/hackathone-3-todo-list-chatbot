import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "TaskFlow - Smart Todo App",
  description: "A modern todo application with AI-powered task management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
