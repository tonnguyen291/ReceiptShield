
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserManagementTable } from '@/components/admin/user-management-table';
import { GlobalAnalyticsCards } from '@/components/admin/global-analytics-cards';
import { Button } from '@/components/ui/button';
import { LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Separator } from '@/components/ui/separator';

export default function AdminDashboardPage() {
  const { logout } = useAuth();
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Global overview and management of the entire organization.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button size="lg" className="shadow-sm w-full sm:w-auto" disabled>
                <UserPlus className="mr-2 h-5 w-5" />
                Invite New User
            </Button>
        </div>
      </div>

      <GlobalAnalyticsCards />

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View, edit, and manage all users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserManagementTable />
        </CardContent>
      </Card>
      
       <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Security & Access</CardTitle>
          <CardDescription>Placeholder for security logs and access control settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-md">
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

    </div>
  );
}
