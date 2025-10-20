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
