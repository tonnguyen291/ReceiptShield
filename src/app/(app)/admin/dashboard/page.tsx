
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserManagementTable } from '@/components/admin/user-management-table';
import { GlobalAnalyticsCards } from '@/components/admin/global-analytics-cards';
import { InviteUserDialog } from '@/components/admin/invite-user-dialog';
import { InvitationManagementTable } from '@/components/admin/invitation-management-table';
import { Button } from '@/components/ui/button';
import { LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Separator } from '@/components/ui/separator';

export default function AdminDashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const router = useRouter();

  console.log('🔍 AdminDashboard rendered:', { user: !!user, isInviteDialogOpen, isLoading });

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('❌ No user found, redirecting to login');
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleInvitationSent = () => {
    // Refresh invitation list by triggering a re-render
    // The InvitationManagementTable will automatically refresh when the dialog closes
    window.dispatchEvent(new Event('invitation-sent'));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-4 bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 p-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight text-[var(--color-text)]">
            Admin Dashboard
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-2">Global overview and management of the entire organization.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button 
              size="lg" 
              className="shadow-sm w-full sm:w-auto"
              onClick={() => setIsInviteDialogOpen(true)}
            >
                <UserPlus className="mr-2 h-5 w-5" />
                Invite New User
            </Button>
        </div>
      </div>

      <GlobalAnalyticsCards />

      <Card className="shadow-md bg-[var(--color-card)] border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--color-text)]">User Management</CardTitle>
          <CardDescription className="text-[var(--color-text-secondary)]">View, edit, and manage all users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserManagementTable />
        </CardContent>
      </Card>

      <Card className="shadow-md bg-[var(--color-card)] border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--color-text)]">Invitation Management</CardTitle>
          <CardDescription className="text-[var(--color-text-secondary)]">View and manage pending invitations sent to new users.</CardDescription>
        </CardHeader>
        <CardContent>
          <InvitationManagementTable />
        </CardContent>
      </Card>
      
       <Card className="shadow-md bg-[var(--color-card)] border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--color-text)]">Security & Access</CardTitle>
          <CardDescription className="text-[var(--color-text-secondary)]">Placeholder for security logs and access control settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-[var(--color-text-secondary)] border-2 border-dashed border-[var(--color-border)] rounded-md">
            <p>Access Logs & Security Panel (Coming Soon)</p>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={logout}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <InviteUserDialog
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        onInvitationSent={handleInvitationSent}
      />
    </div>
  );
}
