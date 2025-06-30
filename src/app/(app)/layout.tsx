
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import AppHeader from '@/components/shared/app-header';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut } from 'lucide-react';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth();
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
      <main className="flex-grow container mx-auto px-6 sm:px-8 md:px-10 lg:px-16 py-8 md:py-12">
        {children}
      </main>
      <footer className="py-4 border-t border-border bg-card">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 flex justify-center">
          <Button variant="outline" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </footer>
    </div>
  );
}
