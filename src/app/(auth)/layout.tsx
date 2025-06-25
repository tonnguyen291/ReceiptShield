
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col items-center bg-background p-4">
      <div className="flex-grow flex items-center justify-center w-full">
        {children}
      </div>
      <p className="text-xs text-muted-foreground py-4 text-center">
        CSE 423
      </p>
    </main>
  );
}
