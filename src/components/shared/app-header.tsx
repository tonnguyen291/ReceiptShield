'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Shield, UserCircle } from 'lucide-react';
import Link from 'next/link';

export default function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'} className="flex items-center gap-2 text-xl font-headline font-semibold text-primary">
          <Shield className="w-7 h-7" />
          <span>Receipt Shield</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={`https://placehold.co/40x40.png?text=${user.email[0].toUpperCase()}`} alt={user.email} data-ai-hint="abstract letter" />
                <AvatarFallback>
                  <UserCircle className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-foreground hidden md:inline">{user.email} ({user.role})</span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout">
            <LogOut className="w-5 h-5 text-foreground" />
          </Button>
        </div>
      </div>
    </header>
  );
}
