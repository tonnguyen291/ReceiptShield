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
