
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SubmissionHistoryTable } from '@/components/employee/submission-history-table';
import { ExpenseSummaryChart } from '@/components/employee/expense-summary-chart';
import { PlusCircle, FileUp, DollarSign, BarChart, AlertTriangle, Bot, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Separator } from '@/components/ui/separator';

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Employee Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Manage your expenses and receipts here.</p>
        </div>
        <Button onClick={() => router.push('/employee/upload')} size="lg" className="shadow-sm w-full sm:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" />
          Upload New Receipt
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$450.75</div>
            <p className="text-xs text-muted-foreground">(mock data)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receipts Uploaded</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+3 from last month (mock data)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reimbursement Status</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$250.00 Pending</div>
            <p className="text-xs text-muted-foreground">2 receipts awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="md:col-span-2">
            <Card className="shadow-md h-full">
                <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recently uploaded receipts.</CardDescription>
                </CardHeader>
                <CardContent>
                <SubmissionHistoryTable />
                </CardContent>
            </Card>
        </div>

        {/* Expense Summary & Quick Actions */}
        <div className="space-y-6">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>Expense Summary</CardTitle>
                    <CardDescription>Spending by category this month.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ExpenseSummaryChart />
                </CardContent>
            </Card>
            <Card className="shadow-md bg-accent/20 border-accent/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bot className="text-accent"/>Guided Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Remember to tag your hotel receipt from last week's trip for faster processing!</p>
                 <Button variant="link" className="px-0">Dismiss</Button>
              </CardContent>
            </Card>
        </div>
      </div>
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
