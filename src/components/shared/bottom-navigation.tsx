"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  ReceiptText, 
  BarChart3, 
  Bot, 
  User,
  Shield,
  Users,
  Settings,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const bottomNavItems: BottomNavItem[] = [
  {
    href: "/employee/dashboard",
    label: "Home",
    icon: Home,
    roles: ["employee"]
  },
  {
    href: "/manager/dashboard", 
    label: "Home",
    icon: Home,
    roles: ["manager"]
  },
  {
    href: "/admin/dashboard",
    label: "Home", 
    icon: Home,
    roles: ["admin"]
  },
  {
    href: "/employee/receipts",
    label: "Receipts",
    icon: ReceiptText,
    roles: ["employee"]
  },
  {
    href: "/manager/receipts",
    label: "Receipts", 
    icon: ReceiptText,
    roles: ["manager"]
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: BarChart3,
    roles: ["admin"]
  },
  {
    href: "/manager/analytics",
    label: "Analytics",
    icon: BarChart3, 
    roles: ["manager"]
  },
  {
    href: "/employee/ai-assistant",
    label: "AI",
    icon: Bot,
    roles: ["employee"]
  },
  {
    href: "/manager/ai-assistant", 
    label: "AI",
    icon: Bot,
    roles: ["manager"]
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    roles: ["admin"]
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: Bell,
    roles: ["employee", "manager", "admin"]
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    roles: ["employee", "manager", "admin"]
  }
];

interface BottomNavigationProps {
  userRole?: string;
}

export function BottomNavigation({ userRole }: BottomNavigationProps) {
  const pathname = usePathname();
  
  // Filter items based on user role
  const visibleItems = bottomNavItems.filter(item => 
    !item.roles || item.roles.includes(userRole || "")
  );

  return (
    <nav className="bottom-nav md:hidden">
      <div className="flex h-16 items-center justify-around px-4">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("nav-item", isActive && "active")}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
