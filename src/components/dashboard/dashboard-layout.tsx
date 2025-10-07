"use client";

import { ReactNode } from 'react';
import { SidebarNavigation } from '@/components/ui/sidebar-navigation';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Bot, Menu, Shield } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  user?: {
    name?: string;
    email: string;
    role: string;
  };
  onLogout?: () => void;
  onChatbotClick?: () => void;
}

export function DashboardLayout({ 
  children, 
  showSidebar = true, 
  user,
  onLogout,
  onChatbotClick 
}: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-64 flex-shrink-0">
            <SidebarNavigation user={user} onLogout={onLogout} />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Custom Header */}
          <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-40 shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href={user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'} className="flex items-center gap-2 text-xl font-semibold text-foreground">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <span className="hidden sm:inline">Receipt Shield</span>
                </Link>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <ThemeToggle />
                <Button variant="ghost" size="icon" className="rounded-full" onClick={onChatbotClick}>
                  <Bot className="h-5 w-5" />
                  <span className="sr-only">AI Assistant</span>
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col h-screen">
        {/* Mobile Header */}
        <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-40 shadow-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Link href={user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'} className="flex items-center gap-2 text-xl font-semibold text-foreground">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <span>Receipt Shield</span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="rounded-full" onClick={onChatbotClick}>
                <Bot className="h-5 w-5" />
                <span className="sr-only">AI Assistant</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-[var(--color-bg)]/80" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-64">
              <SidebarNavigation user={user} onLogout={onLogout} />
            </div>
          </div>
        )}

        <main className="flex-1 overflow-auto p-4 pb-20">
          {children}
        </main>
        <BottomNavigation />
      </div>

      {/* Floating AI Button - Mobile Only */}
      <Button
        onClick={onChatbotClick}
        className="lg:hidden fixed bottom-20 right-4 h-12 w-12 rounded-full shadow-lg z-50 origin-button"
        size="icon"
      >
        <Bot className="h-5 w-5" />
        <span className="sr-only">Open AI Assistant</span>
      </Button>
    </div>
  );
}
