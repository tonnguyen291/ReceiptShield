
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, FileWarning, CheckCircle2 } from 'lucide-react';

// Sample data - replace with actual data fetching and processing logic in a real application
const totalExpensesData = [
  { name: 'Jan', total: 4000 }, { name: 'Feb', total: 3000 }, { name: 'Mar', total: 5000 },
  { name: 'Apr', total: 4500 }, { name: 'May', total: 6000 }, { name: 'Jun', total: 5500 },
];

export function ManagerOverviewCharts() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="shadow-lg col-span-1 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses This Period</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$23,580.00</div>
          <p className="text-xs text-muted-foreground">+10.2% from last period (mock data)</p>
        </CardContent>
      </Card>
       <Card className="shadow-lg col-span-1 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Approved Receipts</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">125</div>
          <p className="text-xs text-muted-foreground">85% of total submissions (mock data)</p>
        </CardContent>
      </Card>
       <Card className="shadow-lg col-span-1 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Flagged for Review</CardTitle>
          <FileWarning className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">15</div>
          <p className="text-xs text-muted-foreground">Action required (mock data)</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Monthly Expense Trends</CardTitle>
          <CardDescription>Overview of expenses over the last 6 months (mock data).</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={totalExpensesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                itemStyle={{ color: 'hsl(var(--primary))' }}
              />
              <Legend wrapperStyle={{fontSize: "12px", paddingTop: '10px'}} />
              <Bar dataKey="total" fill="hsl(var(--primary))" activeBar={{ fill: 'hsl(var(--primary), 0.8)' }} radius={[4, 4, 0, 0]} name="Total Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
