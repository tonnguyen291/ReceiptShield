import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {children}
    </main>
  );
}
