"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, type ReactNode, useState } from "react";
import { SidebarLayout } from "@/components/shared/sidebar-layout";
import { BottomNavigation } from "@/components/shared/bottom-navigation";
import { NoSSR } from "@/components/shared/no-ssr";
import { Chatbot } from "@/components/shared/chatbot";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChatbotOpen, setChatbotOpen] = useState(false);

  useEffect(() => {
    if (isLoading) {
      return; // Wait until authentication state is resolved
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    const currentBaseRoute = pathname.split('/')[1]; // e.g., "employee", "manager", "admin", "profile"
    const userBaseRoute = user.role;

    // Allow access to profile pages for any role
    if (currentBaseRoute === 'profile') {
      return;
    }

    // Allow access to notifications page for any role
    if (currentBaseRoute === 'notifications') {
      return;
    }

    // Allow managers and admins to access employee verify-receipt pages
    if (currentBaseRoute === 'employee' && pathname.includes('/verify-receipt/') && (userBaseRoute === 'manager' || userBaseRoute === 'admin')) {
      return;
    }

    // If the user is on a page that doesn't match their role, redirect them
    if (currentBaseRoute !== userBaseRoute) {
      router.replace(`/${userBaseRoute}/dashboard`);
    }

  }, [user, isLoading, router, pathname]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <SidebarLayout userRole={user?.role}>
      {children}
      
      {/* Bottom Navigation for Mobile */}
      <NoSSR>
        <BottomNavigation userRole={user?.role} />
      </NoSSR>

      {/* Chatbot */}
      <NoSSR>
        <Chatbot isOpen={isChatbotOpen} onClose={() => setChatbotOpen(false)} />
      </NoSSR>

      {/* Floating AI Button */}
      <NoSSR>
        <Button
          onClick={() => setChatbotOpen(true)}
          className="fixed bottom-20 right-4 z-50 h-12 w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
          size="icon"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </NoSSR>
    </SidebarLayout>
  );
}