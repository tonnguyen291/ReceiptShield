
'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserCircle, Shield, UserCog, KeyRound, ChevronDown, Bell, Bot, LogOut } from 'lucide-react';
import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/shared/theme-toggle';

export default function AppHeader({ onChatbotClick }: { onChatbotClick?: () => void }) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden"/>
          <Link href={user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'} className="flex items-center gap-2 text-xl font-headline font-semibold text-primary">
            <Shield className="w-7 h-7" />
            <span className="hidden sm:inline">Receipt Shield</span>
          </Link>
        </div>
        
        {user && (
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="rounded-full" onClick={onChatbotClick}>
              <Bot className="h-5 w-5" />
              <span className="sr-only">AI Assistant</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 p-1 pr-2 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage 
                      src={`https://placehold.co/40x40.png?text=${user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}`} 
                      alt={user.name || user.email}
                      data-ai-hint="abstract letter" 
                    />
                    <AvatarFallback>
                      <UserCircle className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.role}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile" passHref>
                  <DropdownMenuItem>
                    <UserCog className="mr-2 h-4 w-4" />
                    <span>Manage Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/profile/change-password" passHref>
                  <DropdownMenuItem>
                    <KeyRound className="mr-2 h-4 w-4" />
                    <span>Change Password</span>
                  </DropdownMenuItem>
                </Link>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
