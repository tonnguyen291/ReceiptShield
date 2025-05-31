'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import AppHeader from '@/components/shared/app-header';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    const isEmployeeRoute = pathname.startsWith('/employee');
    const isManagerRoute = pathname.startsWith('/manager');

    if (isEmployeeRoute && user.role !== 'employee') {
      router.replace('/login'); // Or an unauthorized page
    } else if (isManagerRoute && user.role !== 'manager') {
      router.replace('/login'); // Or an unauthorized page
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Role & auth check passed or route is not role-specific under /app
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
