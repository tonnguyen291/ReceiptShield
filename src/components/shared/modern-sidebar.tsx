"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { Chatbot } from "@/components/shared/chatbot";
import {
  Home,
  ReceiptText,
  BarChart3,
  Users,
  ShieldAlert,
  Settings,
  User,
  Bell,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bot,
  Sun,
  Moon,
  Monitor
} from "lucide-react";

interface ModernSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  className?: string;
  userRole?: string;
}

export function ModernSidebar({ 
  isCollapsed = false, 
  onToggle,
  className,
  userRole = "employee"
}: ModernSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const { user, logout } = useAuth();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    // Apply theme to document
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
  };

  const handleChatbotToggle = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      handleThemeChange(savedTheme);
    }
  }, []);

  const getNavigationItems = () => {
    const basePath = userRole === "employee" ? "/employee" : 
                    userRole === "manager" ? "/manager" : 
                    userRole === "admin" ? "/admin" : "/employee";

    switch (userRole) {
      case "employee":
        return [
          {
            href: `${basePath}/dashboard`,
            label: "Dashboard",
            icon: Home,
            badge: null
          },
          {
            href: `${basePath}/receipts`,
            label: "My Receipts",
            icon: ReceiptText,
            badge: null
          },
          {
            href: `${basePath}/submit-receipt`,
            label: "Submit Receipt",
            icon: ReceiptText,
            badge: null
          },
          {
            href: `${basePath}/analytics`,
            label: "Analytics",
            icon: BarChart3,
            badge: null
          },
          {
            href: `${basePath}/insights`,
            label: "AI Insights",
            icon: ShieldAlert,
            badge: null
          }
        ];
      
      case "manager":
        return [
          {
            href: `${basePath}/dashboard`,
            label: "Team Dashboard",
            icon: Home,
            badge: null
          },
          {
            href: `${basePath}/team`,
            label: "Team Management",
            icon: Users,
            badge: null
          },
          {
            href: `${basePath}/analytics`,
            label: "Team Analytics",
            icon: BarChart3,
            badge: null
          },
          {
            href: `${basePath}/fraud-alerts`,
            label: "Fraud Alerts",
            icon: ShieldAlert,
            badge: 3
          }
        ];
      
      case "admin":
        return [
          {
            href: `${basePath}/dashboard`,
            label: "Overview",
            icon: Home,
            badge: null
          },
          {
            href: `${basePath}/users`,
            label: "User Management",
            icon: Users,
            badge: null
          },
          {
            href: `${basePath}/analytics`,
            label: "Organization Analytics",
            icon: BarChart3,
            badge: null
          },
          {
            href: `${basePath}/fraud-alerts`,
            label: "Fraud Detection",
            icon: ShieldAlert,
            badge: 5
          }
        ];
      
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  const utilityItems = [
    {
      href: "/profile",
      label: "Profile",
      icon: User,
      badge: null
    },
    {
      href: "/notifications",
      label: "Notifications",
      icon: Bell,
      badge: 5
    },
    {
      href: "/help",
      label: "Help",
      icon: HelpCircle,
      badge: null
    }
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const NavItem = ({ 
    href, 
    label, 
    icon: Icon, 
    badge, 
    onClick 
  }: {
    href: string;
    label: string;
    icon: any;
    badge: number | null;
    onClick?: () => void;
  }) => {
    const active = isActive(href);
    
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
          "hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]",
          active && "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-l-4 border-[var(--color-primary)]",
          isCollapsed && "justify-center px-2"
        )}
      >
        {/* Active indicator */}
        {active && !isCollapsed && (
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-[var(--color-primary)] rounded-r-full" />
        )}
        
        <div className="flex items-center space-x-3 flex-1">
          <Icon className={cn(
            "h-5 w-5 flex-shrink-0 text-[var(--color-text-secondary)]",
            active && "text-[var(--color-primary)]"
          )} />
          
          {!isCollapsed && (
            <>
              <span className="font-medium text-sm text-[var(--color-text)]">{label}</span>
              {badge && badge > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-auto h-5 w-5 flex items-center justify-center text-xs"
                >
                  {badge > 99 ? "99+" : badge}
                </Badge>
              )}
            </>
          )}
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[var(--color-bg)] bg-opacity-80 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out",
        "bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)]",
        "lg:translate-x-0 lg:static lg:inset-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "w-16" : "w-60",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--color-border)]">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                <ShieldAlert className="h-6 w-6 text-[var(--color-primary)]" />
              </div>
              <span className="text-xl font-bold text-[var(--color-text)]">Receipt Shield</span>
            </div>
          )}
          
          {isCollapsed && (
            <div className="flex items-center justify-center w-full">
              <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                <ShieldAlert className="h-6 w-6 text-[var(--color-primary)]" />
              </div>
            </div>
          )}

          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigationItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              badge={item.badge}
              onClick={() => setIsMobileOpen(false)}
            />
          ))}
        </nav>

        {/* Divider */}
        <div className="px-3">
          <div className="border-t border-[var(--color-border)]" />
        </div>

        {/* Utility Items */}
        <nav className="px-3 py-4 space-y-1">
          {utilityItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              badge={item.badge}
              onClick={() => setIsMobileOpen(false)}
            />
          ))}
        </nav>

        {/* AI Assistant Button */}
        <div className="px-3 py-2">
          <Button
            onClick={handleChatbotToggle}
            className={cn(
              "w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 text-white",
              isCollapsed && "px-2"
            )}
            size="sm"
          >
            <Bot className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">AI Assistant</span>}
          </Button>
        </div>

        {/* Theme Toggle */}
        <div className="px-3 py-2">
          <div className={cn(
            "flex items-center space-x-2 p-2 rounded-lg bg-[var(--color-bg)]",
            isCollapsed && "justify-center"
          )}>
            {!isCollapsed && (
              <span className="text-sm font-medium text-[var(--color-text)]">Theme</span>
            )}
            <div className="flex space-x-1">
              <Button
                variant={theme === 'light' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleThemeChange('light')}
                className={cn(
                  "p-1 h-6 w-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 text-white",
                  theme !== 'light' && "bg-[var(--color-bg)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text)]"
                )}
              >
                <Sun className="h-3 w-3" />
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleThemeChange('dark')}
                className={cn(
                  "p-1 h-6 w-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 text-white",
                  theme !== 'dark' && "bg-[var(--color-bg)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text)]"
                )}
              >
                <Moon className="h-3 w-3" />
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleThemeChange('system')}
                className={cn(
                  "p-1 h-6 w-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 text-white",
                  theme !== 'system' && "bg-[var(--color-bg)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text)]"
                )}
              >
                <Monitor className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* User Profile */}
        {user && (
          <div className="p-3 border-t border-[var(--color-border)]">
            <div className={cn(
              "flex items-center space-x-3 p-2 rounded-lg hover:bg-[var(--color-bg)] transition-colors",
              isCollapsed && "justify-center"
            )}>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] truncate capitalize">
                    {user.role}
                  </p>
                </div>
              )}
            </div>

            {/* Sign Out Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className={cn(
                "w-full mt-2 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10",
                isCollapsed && "px-2"
              )}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Sign Out</span>}
            </Button>
          </div>
        )}

        {/* Collapse Toggle (Desktop) */}
        {onToggle && (
          <div className="hidden lg:block p-3 border-t border-[var(--color-border)]">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="w-full text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
              {!isCollapsed && <span className="ml-2">Collapse</span>}
            </Button>
          </div>
        )}
      </div>

      {/* Chatbot Component */}
      <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </>
  );
}

// Mobile Menu Button Component
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}

// Tooltip Component for Collapsed State
export function SidebarTooltip({ 
  children, 
  content 
}: { 
  children: React.ReactNode; 
  content: string; 
}) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-[var(--color-card)] text-[var(--color-text)] text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-[var(--color-border)]">
        {content}
      </div>
    </div>
  );
}
