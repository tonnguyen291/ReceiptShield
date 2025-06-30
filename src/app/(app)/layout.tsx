
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import AppHeader from '@/components/shared/app-header';
import { Loader2, LayoutDashboard, ReceiptText, BarChart3, Settings, ShieldAlert, Users, LogOut } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import Link from 'next/link';

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

    if (user.role === 'employee' && !isEmployeeRoute && pathname !== '/profile' && pathname !== '/profile/change-password') {
        router.replace('/employee/dashboard');
    } else if (user.role === 'manager' && !isManagerRoute && pathname !== '/profile' && pathname !== '/profile/change-password') {
        router.replace('/manager/dashboard');
    }

  }, [user, isLoading, router, pathname]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const employeeNav = (
    <>
      <SidebarMenuItem>
        <Link href="/employee/dashboard" passHref>
          <SidebarMenuButton isActive={pathname === '/employee/dashboard'} tooltip={{children: 'Dashboard'}}>
            <LayoutDashboard />
            <span>Dashboard</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/employee/dashboard" passHref>
          <SidebarMenuButton isActive={pathname.startsWith('/employee/receipt')} tooltip={{children: 'My Receipts'}}>
            <ReceiptText />
            <span>My Receipts</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
       <SidebarMenuItem>
          <SidebarMenuButton tooltip={{children: 'Reports'}} disabled>
            <BarChart3 />
            <span>Reports</span>
          </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/profile" passHref>
          <SidebarMenuButton isActive={pathname.startsWith('/profile')} tooltip={{children: 'Settings'}}>
            <Settings />
            <span>Settings</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </>
  );

  const managerNav = (
    <>
      <SidebarMenuItem>
        <Link href="/manager/dashboard" passHref>
          <SidebarMenuButton isActive={pathname === '/manager/dashboard'} tooltip={{children: 'Dashboard'}}>
            <LayoutDashboard />
            <span>Dashboard</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/manager/dashboard" passHref>
          <SidebarMenuButton tooltip={{children: 'Review Queue'}}>
            <ShieldAlert />
            <span>Review Queue</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
       <SidebarMenuItem>
          <SidebarMenuButton tooltip={{children: 'Team Management'}} disabled>
            <Users />
            <span>Team</span>
          </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton tooltip={{children: 'Reports'}} disabled>
            <BarChart3 />
            <span>Reports</span>
          </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/profile" passHref>
          <SidebarMenuButton isActive={pathname.startsWith('/profile')} tooltip={{children: 'Settings'}}>
            <Settings />
            <span>Settings</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </>
  );

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarMenu className="flex flex-col h-full p-2">
            <div className="flex-grow">
                {user.role === 'employee' ? employeeNav : managerNav}
            </div>
            <SidebarFooter>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={logout} tooltip={{children: 'Sign Out'}}>
                        <LogOut />
                        <span>Sign Out</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarFooter>
        </SidebarMenu>
      </Sidebar>
      <SidebarInset>
        <div className="min-h-screen flex flex-col bg-background/95">
          <AppHeader />
          <main className="flex-grow p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
