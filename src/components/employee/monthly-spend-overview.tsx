'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getAllReceiptsForUser } from '@/lib/receipt-store';
import { startOfMonth, endOfMonth, isWithinInterval, format, subMonths, eachDayOfInterval } from 'date-fns';
import type { ProcessedReceipt } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface MonthlySpendData {
  date: string;
  amount: number;
  count: number;
}

export function MonthlySpendOverview() {
  const { user } = useAuth();
  const [data, setData] = useState<MonthlySpendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMonthlyData = async () => {
      if (user?.email) {
        try {
          const allReceipts = await Promise.race([
            getAllReceiptsForUser(user.email),
            new Promise<ProcessedReceipt[]>((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 8000)
            )
          ]) as ProcessedReceipt[];

          const now = new Date();
          const startOfCurrentMonth = startOfMonth(now);
          const endOfCurrentMonth = endOfMonth(now);

          // Get last 6 months of data
          const months = [];
          for (let i = 5; i >= 0; i--) {
            const monthStart = startOfMonth(subMonths(now, i));
            const monthEnd = endOfMonth(subMonths(now, i));
            months.push({ start: monthStart, end: monthEnd, label: format(monthStart, 'MMM yyyy') });
          }

          const getAmountFromReceipt = (receipt: ProcessedReceipt) => {
            if (!receipt.items) return 0;
            
            // Priority order: look for final totals first, then fallback to any total
            const finalTotalPatterns = [
              'balance due', 'final total', 'grand total', 'amount due', 'total due'
            ];
            
            // First, try to find final total amounts
            for (const pattern of finalTotalPatterns) {
              const finalTotalItem = receipt.items.find(i => 
                i.label.toLowerCase().includes(pattern)
              );
              if (finalTotalItem) {
                const amountValue = parseFloat(finalTotalItem.value.replace(/[^0-9.-]+/g, "") || "0");
                if (!isNaN(amountValue) && amountValue > 0) {
                  return amountValue;
                }
              }
            }
            
            // Fallback: look for any "total amount" (but prefer the last one found)
            const totalAmountItems = receipt.items.filter(i => 
              i.label.toLowerCase().includes('total amount')
            );
            
            if (totalAmountItems.length > 0) {
              // Get the last total amount found (likely the final one)
              const lastTotalItem = totalAmountItems[totalAmountItems.length - 1];
              const amountValue = parseFloat(lastTotalItem.value.replace(/[^0-9.-]+/g, "") || "0");
              if (!isNaN(amountValue) && amountValue > 0) {
                return amountValue;
              }
            }
            
            // Final fallback: any item with "total" in the label
            const anyTotalItem = receipt.items.find(i => 
              i.label.toLowerCase().includes('total') && 
              !i.label.toLowerCase().includes('subtotal')
            );
            if (anyTotalItem) {
              const amountValue = parseFloat(anyTotalItem.value.replace(/[^0-9.-]+/g, "") || "0");
              return isNaN(amountValue) ? 0 : amountValue;
            }
            
            return 0;
          };

          const monthlyData = months.map(month => {
            const receiptsInMonth = allReceipts.filter(r => 
              isWithinInterval(new Date(r.uploadedAt), { start: month.start, end: month.end })
            );
            
            const totalAmount = receiptsInMonth.reduce((acc, r) => acc + getAmountFromReceipt(r), 0);
            
            return {
              date: month.label,
              amount: Math.round(totalAmount * 100) / 100,
              count: receiptsInMonth.length
            };
          });

          setData(monthlyData);
        } catch (error) {
          console.error('Error loading monthly spend data:', error);
          setData([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadMonthlyData();
  }, [user]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Spend Overview</CardTitle>
          <CardDescription>Your spending trends over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0 || data.every(item => item.amount === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Spend Overview</CardTitle>
          <CardDescription>Your spending trends over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <div className="text-6xl mb-4">📈</div>
            <p className="text-muted-foreground text-sm">No spending data available</p>
            <p className="text-xs text-muted-foreground mt-1">Upload receipts to see your spending trends</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Spend Overview</CardTitle>
        <CardDescription>Your spending trends over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'amount' ? `$${value.toFixed(2)}` : value,
                  name === 'amount' ? 'Amount' : 'Receipts'
                ]}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  color: 'hsl(var(--foreground))',
                }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                name="Spending"
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#10B981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                name="Receipt Count"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
