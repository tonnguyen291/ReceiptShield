
'use client';

import { useRouter } from 'next/navigation';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SubmissionHistoryTable } from '@/components/employee/submission-history-table';
import { Wallet, FileText, ShieldAlert, Hourglass, PlusCircle, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data - in a real app, this would come from an API
const chartData = [
  { name: 'Jan', total: 2300 }, { name: 'Feb', total: 3100 }, { name: 'Mar', total: 4200 },
  { name: 'Apr', total: 2800 }, { name: 'May', total: 5100 }, { name: 'Jun', total: 4700 },
];
const keyStats = {
  totalExpenses: 4700,
  receiptsUploaded: 12,
  fraudFlags: 1,
  reimbursementPending: 1250.55
};

export default function EmployeeDashboardPage() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your expense overview for this month.</p>
        </div>
        <Button onClick={() => router.push('/employee/upload')} size="lg" className="shadow-sm w-full sm:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" />
          Upload New Receipt
        </Button>
      </div>

      {/* Key Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses This Month</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${keyStats.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receipts Uploaded</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{keyStats.receiptsUploaded}</div>
            <p className="text-xs text-muted-foreground">in June 2024</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Flags Detected</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyStats.fraudFlags}</div>
            <p className="text-xs text-muted-foreground">Requiring manager review</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reimbursement Pending</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${keyStats.reimbursementPending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across 3 submissions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Recent Activity Table */}
        <Card className="shadow-md lg:col-span-3">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recently uploaded receipts.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                 <Filter className="w-4 h-4 text-muted-foreground" />
                 <Select defaultValue="30">
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <SubmissionHistoryTable />
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="shadow-md lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Your expense totals over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
