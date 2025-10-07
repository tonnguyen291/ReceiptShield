"use client";

import { useState } from "react";
import { ModernSidebar, MobileMenuButton } from "./modern-sidebar";

interface SidebarLayoutProps {
  children: React.ReactNode;
  className?: string;
  userRole?: string;
}

export function SidebarLayout({ children, className, userRole = "employee" }: SidebarLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <div className="flex h-screen bg-[var(--color-bg)]">
      {/* Sidebar */}
      <ModernSidebar
        isCollapsed={isCollapsed}
        onToggle={toggleCollapse}
        className={isMobileOpen ? "translate-x-0" : ""}
        userRole={userRole}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-[var(--color-card)] border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <MobileMenuButton onClick={toggleMobile} />
            <h1 className="text-lg font-semibold text-[var(--color-text)]">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-[var(--color-bg)] text-[var(--color-text)]"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] rounded-lg">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6z" />
              </svg>
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-[var(--color-text)]">John Doe</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Manager</p>
              </div>
              <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary">JD</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[var(--color-bg)]">
          <div className={className}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
