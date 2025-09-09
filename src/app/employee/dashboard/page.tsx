
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SubmissionHistoryTable } from '@/components/employee/submission-history-table';
import { ExpenseSummaryChart } from '@/components/employee/expense-summary-chart';
import { PlusCircle, DollarSign, BarChart, AlertTriangle, Bot, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Separator } from '@/components/ui/separator';
import { getAllReceiptsForUser } from '@/lib/receipt-store';
import type { ProcessedReceipt } from '@/types';
import { subMonths, isWithinInterval } from 'date-fns';

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalExpensesThisMonth: 0,
    receiptsUploadedThisMonth: 0,
    pendingAmount: 0,
    pendingCount: 0,
  });

  useEffect(() => {
    if (user?.email) {
      const allReceipts = getAllReceiptsForUser(user.email);
      const now = new Date();
      const oneMonthAgo = subMonths(now, 1);

      const receiptsThisMonth = allReceipts.filter(r => 
        isWithinInterval(new Date(r.uploadedAt), { start: oneMonthAgo, end: now })
      );

      const totalExpensesThisMonth = receiptsThisMonth.reduce((acc, r) => {
        const amountItem = r.items.find(i => i.label.toLowerCase().includes('total amount'));
        const amountValue = parseFloat(amountItem?.value.replace(/[^0-9.-]+/g, "") || "0");
        return acc + (isNaN(amountValue) ? 0 : amountValue);
      }, 0);

      const pendingReceipts = allReceipts.filter(r => r.status === 'pending_approval');
      const draftReceipts = allReceipts.filter(r => r.status === 'draft' || r.isDraft);
      const totalPendingReceipts = [...pendingReceipts, ...draftReceipts];
      const pendingAmount = totalPendingReceipts.reduce((acc, r) => {
        const amountItem = r.items.find(i => i.label.toLowerCase().includes('total amount'));
        const amountValue = parseFloat(amountItem?.value.replace(/[^0-9.-]+/g, "") || "0");
        return acc + (isNaN(amountValue) ? 0 : amountValue);
      }, 0);

      setStats({
        totalExpensesThisMonth,
        receiptsUploadedThisMonth: receiptsThisMonth.length,
        pendingAmount,
        pendingCount: totalPendingReceipts.length,
      });
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Employee Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}! Manage your expenses and receipts here.</p>
        </div>
        <Button onClick={() => router.push('/employee/submit-receipt')} size="lg" className="shadow-sm w-full sm:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" />
          Submit New Receipt
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalExpensesThisMonth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Based on your uploads in last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receipts Uploaded (Month)</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.receiptsUploadedThisMonth}</div>
            <p className="text-xs text-muted-foreground">Receipts submitted in last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reimbursement</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingCount} receipts awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="md:col-span-2">
            <Card className="shadow-md h-full">
                <CardHeader>
                <CardTitle>Submission History</CardTitle>
                <CardDescription>Your recently uploaded receipts and their status.</CardDescription>
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
