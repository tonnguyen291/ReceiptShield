# UI/UX Component Prompts - ReceiptShield

This document contains comprehensive UI/UX component prompts extracted from the studio test project. These components follow the Origin-style design system with professional teal-green primary colors and modern UX patterns.

## 🎨 Design System Overview

### Color Palette
- **Primary**: Teal-green (#25B07D) - Actions, links, highlights
- **Secondary**: Muted blue-gray (#6C7A8A) - Subtle accents  
- **Success**: Green (#4CAF50) - Positive states
- **Warning**: Orange (#FF9800) - Caution states
- **Error**: Red (#F44336) - Error states
- **Neutral**: Grays for text and backgrounds

### Typography
- **Headlines**: Poppins font family
- **Body Text**: Inter font family
- **Scale**: Display (4xl), Large (xl), Body (base), Caption (sm), Small (xs)

### Spacing & Layout
- **Grid System**: 8px base unit
- **Border Radius**: 8px soft corners
- **Shadows**: Subtle elevation with hover states
- **Transitions**: 200ms ease transitions

## 🧩 Core UI Components

### 1. Theme Toggle Component

**File**: `src/components/ui/theme-toggle.tsx`

```tsx
"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>('system');

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-lg shadow-sm border-border hover:border-primary/50 micro-interaction"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="origin-card border-border shadow-md"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Features**:
- Light/Dark/System mode selection
- Smooth icon transitions
- Origin-style dropdown with hover effects
- Screen reader support
- Keyboard navigation

### 2. Bottom Navigation Component

**File**: `src/components/ui/bottom-navigation.tsx`

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, DollarSign, BarChart, Lightbulb, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/employee/dashboard", icon: Home, label: "Home" },
    { href: "/employee/spending", icon: DollarSign, label: "Spending" },
    { href: "/employee/budget", icon: BarChart, label: "Budget" },
    { href: "/employee/insights", icon: Lightbulb, label: "Insights" },
    { href: "/profile", icon: UserCircle, label: "Profile" },
  ];

  // Hide bottom nav on auth pages
  const hideNavRoutes = ['/login', '/auth', '/register', '/forgot-password', '/reset-password'];
  if (hideNavRoutes.some(route => pathname.startsWith(route))) {
    return null;
  }

  return (
    <nav className="bottom-nav md:hidden">
      <div className="flex h-16 items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("nav-item", isActive && "active")}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

**Features**:
- Mobile-first navigation
- Active state indicators
- Responsive design (hidden on desktop)
- Smooth transitions
- Icon + label layout

### 3. Empty State Component

**File**: `src/components/ui/empty-state.tsx`

```tsx
"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
}

export function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  buttonText,
  buttonLink,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <Icon className="empty-state-icon" />
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {buttonText && buttonLink && (
        <Button asChild className="origin-button">
          <Link href={buttonLink}>{buttonText}</Link>
        </Button>
      )}
    </div>
  );
}
```

**Usage Example**:
```tsx
<EmptyState
  icon={FileText}
  title="No Receipts Found"
  description="Upload your first receipt to get started"
  buttonText="Upload Receipt"
  buttonLink="/upload"
/>
```

**Features**:
- Customizable icon, title, description
- Optional action button
- Consistent styling with Origin design
- Flexible for any empty state scenario

### 4. Sidebar Navigation Component

**File**: `src/components/ui/sidebar-navigation.tsx`

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, BarChart3, Users, User, Bell, HelpCircle, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  roles?: string[];
  badge?: string;
}

const getNavItems = (userRole: string): NavItem[] => {
  const baseItems = [
    {
      href: `/${userRole}/dashboard`,
      icon: Home,
      label: 'Dashboard',
      roles: [userRole]
    },
    {
      href: `/${userRole}/receipts`,
      icon: Receipt,
      label: 'Receipts',
      roles: [userRole]
    },
    {
      href: `/${userRole}/analytics`,
      icon: BarChart3,
      label: 'Analytics',
      roles: [userRole]
    }
  ];

  // Add role-specific items
  if (userRole === 'manager' || userRole === 'admin') {
    baseItems.push({
      href: `/${userRole}/team`,
      icon: Users,
      label: 'Team',
      roles: [userRole]
    });
  }

  return baseItems;
};

const getBottomNavItems = (userRole: string): NavItem[] => [
  {
    href: `/${userRole}/profile`,
    icon: User,
    label: 'Profile',
    roles: [userRole]
  },
  {
    href: '/notifications',
    icon: Bell,
    label: 'Notifications',
    roles: [userRole],
    badge: '3'
  },
  {
    href: '/help',
    icon: HelpCircle,
    label: 'Help',
    roles: [userRole]
  }
];

interface SidebarNavigationProps {
  className?: string;
  user?: {
    name?: string;
    email: string;
    role: string;
  };
  onLogout?: () => void;
}

export function SidebarNavigation({ className, user, onLogout }: SidebarNavigationProps) {
  const pathname = usePathname();

  if (!user) return null;

  // Get navigation items based on user role
  const userNavItems = getNavItems(user.role);
  const userBottomNavItems = getBottomNavItems(user.role);

  return (
    <div className={cn("flex flex-col h-full bg-card border-r border-border", className)}>
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <Link href={`/${user.role}/dashboard`} className="flex items-center gap-3 text-2xl font-headline font-bold text-foreground">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          Receipt Shield
        </Link>
        <p className="text-sm text-muted-foreground mt-1 ml-12">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {userNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation / User Actions */}
      <div className="p-4 border-t border-border space-y-2">
        {userBottomNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full flex justify-start items-center gap-3 p-3 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://placehold.co/40x40.png?text=${user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}`}
                  alt={user.name || user.email}
                />
                <AvatarFallback>
                  {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 origin-card border-border shadow-md" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${user.role}/profile`} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
```

**Features**:
- Role-based navigation
- User avatar with dropdown
- Badge notifications
- Active state indicators
- Responsive design
- Logo and branding

### 5. Dashboard Layout Component

**File**: `src/components/dashboard/dashboard-layout.tsx`

```tsx
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
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
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
```

**Features**:
- Responsive layout (desktop sidebar, mobile hamburger)
- Header with logo, theme toggle, chatbot button
- Mobile overlay sidebar
- Bottom navigation for mobile
- Floating AI button for mobile
- Flexible content area

## 🎯 Loading States Components

### Loading States Component

**File**: `src/components/ui/loading-states.tsx`

```tsx
"use client";

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <Card className={cn("origin-card", className)}>
      <CardHeader>
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}

interface LoadingGridProps {
  count?: number;
  className?: string;
}

export function LoadingGrid({ count = 4, className }: LoadingGridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}

interface LoadingTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function LoadingTable({ rows = 5, columns = 4, className }: LoadingTableProps) {
  return (
    <Card className={cn("origin-card", className)}>
      <CardHeader>
        <Skeleton className="h-6 w-1/4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex items-center space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton 
                  key={colIndex} 
                  className={cn(
                    "h-4",
                    colIndex === 0 ? "w-1/4" : 
                    colIndex === 1 ? "w-1/3" : 
                    colIndex === 2 ? "w-1/6" : "w-1/5"
                  )} 
                />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface LoadingListProps {
  items?: number;
  className?: string;
}

export function LoadingList({ items = 5, className }: LoadingListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

interface LoadingChartProps {
  className?: string;
}

export function LoadingChart({ className }: LoadingChartProps) {
  return (
    <Card className={cn("origin-card", className)}>
      <CardHeader>
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end space-x-2 h-32">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton 
                key={i} 
                className="w-8 bg-primary/20" 
                style={{ height: `${Math.random() * 80 + 20}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary",
        sizeClasses[size]
      )} />
    </div>
  );
}

interface LoadingButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function LoadingButton({ loading, children, className }: LoadingButtonProps) {
  return (
    <div className={cn("relative", className)}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
          <LoadingSpinner size="sm" />
        </div>
      )}
      {children}
    </div>
  );
}

interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ loading, children, message = "Loading...", className }: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center space-y-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Available Loading Components**:
- `LoadingCard` - Individual card skeleton
- `LoadingGrid` - Grid of loading cards
- `LoadingTable` - Table skeleton with rows/columns
- `LoadingList` - List items skeleton
- `LoadingChart` - Chart skeleton with bars
- `LoadingSpinner` - Spinning loader
- `LoadingButton` - Button with loading state
- `LoadingOverlay` - Full overlay with message

## 🎨 CSS Design System

### Global Styles

**File**: `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Origin-Style Light Theme */
    --background: 0 0% 97.6%; /* #F9F9F9 */
    --foreground: 0 0% 20%; /* #333333 */

    --card: 0 0% 100%;
    --card-foreground: 0 0% 20%;

    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 20%;

    --primary: 158 64% 52%; /* #25B07D - Origin teal-green */
    --primary-foreground: 0 0% 100%;

    --secondary: 0 0% 96%;
    --secondary-foreground: 0 0% 20%;

    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 47%; /* #777777 */

    --accent: 200 20% 45%; /* #6C7A8A - muted blue-gray */
    --accent-foreground: 0 0% 100%;

    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    --border: 0 0% 90%;
    --input: 0 0% 90%;
    --ring: 158 64% 52%;

    --radius: 0.5rem; /* 8px soft corners */

    /* Origin-Style Chart Colors */
    --chart-1: 158 64% 52%; /* Primary teal */
    --chart-2: 200 20% 45%; /* Muted blue */
    --chart-3: 30 80% 60%; /* Subtle orange for alerts */
    --chart-4: 120 40% 50%; /* Success green */
    --chart-5: 280 30% 60%; /* Purple accent */

    /* Sidebar */
    --sidebar-background: 0 0% 100%;
    --sidebar-foreground: 0 0% 20%;
    --sidebar-border: 0 0% 90%;
    --sidebar-accent: 0 0% 96%;
    --sidebar-accent-foreground: 0 0% 20%;
    --sidebar-primary: 158 64% 52%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-ring: 158 64% 52%;

    /* Origin-Style Gradients */
    --gradient-primary: linear-gradient(135deg, hsl(158 64% 52%) 0%, hsl(158 64% 45%) 100%);
    --gradient-secondary: linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(0 0% 96%) 100%);
    --gradient-accent: linear-gradient(135deg, hsl(200 20% 45%) 0%, hsl(200 20% 35%) 100%);
  }

  .dark {
    /* Origin-Style Dark Theme */
    --background: 0 0% 8%; /* Dark background */
    --foreground: 0 0% 95%;

    --card: 0 0% 12%;
    --card-foreground: 0 0% 95%;

    --popover: 0 0% 12%;
    --popover-foreground: 0 0% 95%;

    --primary: 158 64% 52%; /* Keep teal accent in dark mode */
    --primary-foreground: 0 0% 8%;

    --secondary: 0 0% 16%;
    --secondary-foreground: 0 0% 95%;

    --muted: 0 0% 16%;
    --muted-foreground: 0 0% 65%;

    --accent: 200 20% 45%; /* Keep muted blue */
    --accent-foreground: 0 0% 95%;

    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 95%;

    --border: 0 0% 20%;
    --input: 0 0% 20%;
    --ring: 158 64% 52%;

    /* Origin-Style Chart Colors - Dark */
    --chart-1: 158 64% 52%; /* Primary teal */
    --chart-2: 200 20% 45%; /* Muted blue */
    --chart-3: 30 80% 60%; /* Subtle orange for alerts */
    --chart-4: 120 40% 50%; /* Success green */
    --chart-5: 280 30% 60%; /* Purple accent */

    /* Sidebar - Dark */
    --sidebar-background: 0 0% 8%;
    --sidebar-foreground: 0 0% 95%;
    --sidebar-border: 0 0% 20%;
    --sidebar-accent: 0 0% 16%;
    --sidebar-accent-foreground: 0 0% 95%;
    --sidebar-primary: 158 64% 52%;
    --sidebar-primary-foreground: 0 0% 8%;
    --sidebar-ring: 158 64% 52%;

    /* Origin-Style Gradients - Dark */
    --gradient-primary: linear-gradient(135deg, hsl(158 64% 52%) 0%, hsl(158 64% 45%) 100%);
    --gradient-secondary: linear-gradient(135deg, hsl(0 0% 12%) 0%, hsl(0 0% 16%) 100%);
    --gradient-accent: linear-gradient(135deg, hsl(200 20% 45%) 0%, hsl(200 20% 35%) 100%);
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-body);
    font-feature-settings: "rlig" 1, "calt" 1;
    line-height: 1.6;
  }

  /* Origin-Style Typography Hierarchy */
  h1 {
    @apply text-3xl font-semibold text-foreground;
    font-family: var(--font-headline);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  h2 {
    @apply text-2xl font-semibold text-foreground;
    font-family: var(--font-headline);
    letter-spacing: -0.01em;
    line-height: 1.3;
  }

  h3 {
    @apply text-xl font-medium text-foreground;
    font-family: var(--font-headline);
    line-height: 1.4;
  }

  h4 {
    @apply text-lg font-medium text-foreground;
    line-height: 1.4;
  }

  h5 {
    @apply text-base font-medium text-foreground;
    line-height: 1.5;
  }

  h6 {
    @apply text-sm font-medium text-foreground;
    line-height: 1.5;
  }

  /* Origin-Style Text Sizes */
  .text-display {
    @apply text-4xl font-semibold text-foreground;
    font-family: var(--font-headline);
    letter-spacing: -0.03em;
    line-height: 1.1;
  }

  .text-large {
    @apply text-xl text-foreground;
    line-height: 1.4;
  }

  .text-body {
    @apply text-base text-foreground;
    line-height: 1.6;
  }

  .text-caption {
    @apply text-sm text-muted-foreground;
    line-height: 1.5;
  }

  .text-small {
    @apply text-xs text-muted-foreground;
    line-height: 1.4;
  }
}

@layer components {
  /* Origin-Style Card Components */
  .origin-card {
    @apply bg-card border border-border/30 shadow-sm rounded-lg;
    transition: all 0.2s ease;
  }

  .origin-card-hover {
    @apply hover:shadow-md hover:border-primary/20 transition-all duration-200;
  }

  /* Origin-Style Button Components */
  .origin-button {
    @apply relative transition-all duration-200;
    background: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
    border-radius: 8px;
  }

  .origin-button:hover {
    @apply transform scale-[1.02];
    background: hsl(var(--primary) / 0.9);
  }

  .origin-button-secondary {
    @apply bg-secondary text-secondary-foreground border border-border;
    transition: all 0.2s ease;
  }

  .origin-button-secondary:hover {
    @apply bg-secondary/80 border-primary/20;
  }

  /* Origin-Style Input Components */
  .origin-input {
    @apply border-border bg-background;
    transition: all 0.2s ease;
    border-radius: 8px;
  }

  .origin-input:focus {
    @apply border-primary ring-2 ring-primary/20;
  }

  /* Origin-Style Data Visualization */
  .data-card {
    @apply origin-card origin-card-hover p-4;
    background: linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.95) 100%);
  }

  .data-summary {
    @apply text-2xl font-semibold text-foreground;
    font-variant-numeric: tabular-nums;
  }

  .data-subtitle {
    @apply text-sm text-muted-foreground;
  }

  /* Origin-Style Micro-interactions */
  .micro-interaction {
    @apply transition-all duration-200 ease-out;
  }

  .micro-interaction:hover {
    @apply transform scale-[1.02];
  }

  .micro-interaction:active {
    @apply transform scale-[0.98];
  }

  /* Origin-Style Loading States */
  .loading-skeleton {
    @apply bg-muted animate-pulse rounded;
  }

  .loading-shimmer {
    background: linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted) / 0.5) 50%, hsl(var(--muted)) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  /* Origin-Style Empty States */
  .empty-state {
    @apply flex flex-col items-center justify-center p-8 text-center;
  }

  .empty-state-icon {
    @apply w-16 h-16 text-muted-foreground mb-4;
  }

  .empty-state-title {
    @apply text-lg font-medium text-foreground mb-2;
  }

  .empty-state-description {
    @apply text-sm text-muted-foreground mb-4;
  }

  /* Origin-Style Navigation */
  .bottom-nav {
    @apply fixed bottom-0 left-0 right-0 bg-card border-t border-border;
    backdrop-filter: blur(10px);
  }

  .nav-item {
    @apply flex flex-col items-center justify-center p-2 text-xs;
    transition: all 0.2s ease;
  }

  .nav-item.active {
    @apply text-primary;
  }

  .nav-item:not(.active) {
    @apply text-muted-foreground;
  }

  /* Origin-Style Scrollbar */
  .origin-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .origin-scrollbar::-webkit-scrollbar-track {
    background: hsl(var(--muted));
    border-radius: 3px;
  }

  .origin-scrollbar::-webkit-scrollbar-thumb {
    background: hsl(var(--primary) / 0.3);
    border-radius: 3px;
    transition: background 0.2s ease;
  }

  .origin-scrollbar::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--primary) / 0.5);
  }
}
```

## 📱 Responsive Design System

### Breakpoints
- **Mobile**: < 768px (Bottom navigation, hamburger menu)
- **Tablet**: 768px - 1024px (Adaptive layout)
- **Desktop**: > 1024px (Sidebar navigation, full layout)

### Mobile-First Approach
- **Touch Targets**: Minimum 44px touch targets
- **Navigation**: Bottom navigation for mobile, sidebar for desktop
- **Typography**: Responsive text sizes
- **Spacing**: Consistent padding and margins

## 🎯 Usage Examples

### Basic Dashboard Page
```tsx
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';

export default function MyDashboardPage() {
  const user = {
    name: 'John Doe',
    email: 'john@company.com',
    role: 'employee'
  };

  return (
    <DashboardLayout 
      user={user}
      onLogout={() => console.log('Logout')}
      onChatbotClick={() => console.log('Chatbot')}
    >
      <div className="space-y-6">
        <h1>My Dashboard</h1>
        {/* Your content here */}
      </div>
    </DashboardLayout>
  );
}
```

### Empty State Usage
```tsx
import { EmptyState } from '@/components/ui/empty-state';
import { FileText } from 'lucide-react';

<EmptyState
  icon={FileText}
  title="No Receipts Found"
  description="Upload your first receipt to get started"
  buttonText="Upload Receipt"
  buttonLink="/upload"
/>
```

### Loading States Usage
```tsx
import { LoadingGrid, LoadingTable, LoadingOverlay } from '@/components/ui/loading-states';

// Grid of loading cards
<LoadingGrid count={6} />

// Table skeleton
<LoadingTable rows={10} columns={5} />

// Overlay loading
<LoadingOverlay loading={isLoading} message="Processing receipts...">
  <YourContent />
</LoadingOverlay>
```

## 🔧 Customization

### Color Customization
Update CSS variables in `globals.css`:
```css
:root {
  --primary: 158 64% 52%; /* Your primary color */
  --secondary: 200 20% 45%; /* Your secondary color */
}
```

### Component Styling
All components use CSS classes that can be overridden:
```css
.origin-card {
  /* Your custom card styling */
}
```

## 📚 Component Props

### DashboardLayout Props
```tsx
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
```

### EmptyState Props
```tsx
interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
}
```

### SidebarNavigation Props
```tsx
interface SidebarNavigationProps {
  className?: string;
  user?: {
    name?: string;
    email: string;
    role: string;
  };
  onLogout?: () => void;
}
```

## 🚀 Implementation Checklist

### Files to Include
```
src/components/ui/
├── theme-toggle.tsx
├── bottom-navigation.tsx
├── empty-state.tsx
├── sidebar-navigation.tsx
├── loading-states.tsx
├── button.tsx
├── card.tsx
├── input.tsx
└── skeleton.tsx

src/components/dashboard/
└── dashboard-layout.tsx

src/app/
└── globals.css
```

### Dependencies Required
- `lucide-react` - Icons
- `@radix-ui/react-*` - UI primitives
- `class-variance-authority` - Button variants
- `clsx` - Class name utilities
- `tailwind-merge` - Tailwind class merging

This comprehensive UI/UX component system provides a solid foundation for building modern, accessible, and responsive web applications with the Origin-style design system.

