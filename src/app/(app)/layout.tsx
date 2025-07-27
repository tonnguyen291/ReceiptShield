
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, type ReactNode, useState } from 'react';
import AppHeader from '@/components/shared/app-header';
import { Loader2, LayoutDashboard, ReceiptText, BarChart3, Settings, ShieldAlert, Users, LogOut, FileText, FileUp, HelpCircle, FileBarChart, Download, Bot, FileWarning, Briefcase, ListCollapse } from 'lucide-react';
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
import { Chatbot } from '@/components/shared/chatbot';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChatbotOpen, setChatbotOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    const isEmployeeRoute = pathname.startsWith('/employee');
    const isManagerRoute = pathname.startsWith('/manager');
    const isAdminRoute = pathname.startsWith('/admin');
    const isSharedRoute = pathname.startsWith('/profile');

    if (user.role === 'employee' && !isEmployeeRoute && !isSharedRoute) {
        router.replace('/employee/dashboard');
    } else if (user.role === 'manager' && !isManagerRoute && !isSharedRoute) {
        router.replace('/manager/dashboard');
    } else if (user.role === 'admin' && !isAdminRoute && !isSharedRoute) {
        router.replace('/admin/dashboard');
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
        <Link href="/employee/submit-receipt" passHref>
          <SidebarMenuButton isActive={pathname.startsWith('/employee/submit-receipt')} tooltip={{children: 'Submit New Receipt'}}>
            <FileUp />
            <span>Submit Receipt</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
          <SidebarMenuButton tooltip={{children: 'Reimbursement Status'}} disabled>
            <FileBarChart />
            <span>Reimbursements</span>
          </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
          <SidebarMenuButton onClick={() => setChatbotOpen(true)} tooltip={{children: 'AI Help Center'}}>
            <Bot />
            <span>Help Center</span>
          </SidebarMenuButton>
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
          <SidebarMenuButton tooltip={{children: 'Team Receipts'}}>
            <Users />
            <span>Team Receipts</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <Link href="/manager/dashboard" passHref>
          <SidebarMenuButton tooltip={{children: 'Audit & Approvals'}}>
            <ShieldAlert />
            <span>Audit & Approvals</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton tooltip={{children: 'Fraud Reports'}} disabled>
            <FileWarning />
            <span>Fraud Reports</span>
          </SidebarMenuButton>
      </SidebarMenuItem>
        <SidebarMenuItem>
        <SidebarMenuButton tooltip={{children: 'Export Data'}} disabled>
            <Download />
            <span>Export Data</span>
          </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
          <SidebarMenuButton onClick={() => setChatbotOpen(true)} tooltip={{children: 'AI Help Center'}}>
            <Bot />
            <span>Help Center</span>
          </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );

  const adminNav = (
    <>
        <SidebarMenuItem>
            <Link href="/admin/dashboard" passHref>
            <SidebarMenuButton isActive={pathname === '/admin/dashboard'} tooltip={{children: 'Overview Dashboard'}}>
                <LayoutDashboard />
                <span>Overview</span>
            </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
            <Link href="/admin/dashboard" passHref>
            <SidebarMenuButton tooltip={{children: 'All Users'}}>
                <Users />
                <span>All Users</span>
            </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
            <Link href="/admin/dashboard" passHref>
            <SidebarMenuButton tooltip={{children: 'Receipts Overview'}}>
                <ReceiptText />
                <span>All Receipts</span>
            </SidebarMenuButton>
            </Link>
        </SidebarMenuItem>
        <SidebarMenuItem>
            <SidebarMenuButton tooltip={{children: 'Fraud Detection Logs'}} disabled>
                <FileWarning />
                <span>Fraud Logs</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
            <SidebarMenuButton tooltip={{children: 'Approvals & Audits'}} disabled>
                <ShieldAlert />
                <span>Audits</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
            <SidebarMenuButton onClick={() => setChatbotOpen(true)} tooltip={{children: 'AI Help Center'}}>
                <Bot />
                <span>Help Center</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    </>
  );

  const renderNav = () => {
    switch(user?.role) {
        case 'admin':
            return adminNav;
        case 'manager':
            return managerNav;
        case 'employee':
            return employeeNav;
        default:
            return null;
    }
  }

  const sharedNavBottom = (
    <>
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
                {renderNav()}
            </div>
            <SidebarFooter>
                {sharedNavBottom}
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
          <AppHeader onChatbotClick={() => setChatbotOpen(true)} />
          <main className="flex-grow p-8">
            {children}
            <Chatbot isOpen={isChatbotOpen} onClose={() => setChatbotOpen(false)} />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
