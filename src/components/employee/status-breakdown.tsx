'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line } from 'recharts';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getAllReceiptsForUser } from '@/lib/receipt-store';
import { startOfMonth, endOfMonth, isWithinInterval, format, subMonths } from 'date-fns';
import type { ProcessedReceipt } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StatusData {
  month: string;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  total: number;
}

export function StatusBreakdown() {
  const { user } = useAuth();
  const [data, setData] = useState<StatusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStatusData = async () => {
      if (user?.email) {
        try {
          const allReceipts = await Promise.race([
            getAllReceiptsForUser(user.email),
            new Promise<ProcessedReceipt[]>((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 8000)
            )
          ]) as ProcessedReceipt[];

          const now = new Date();

          // Get last 6 months of data
          const months = [];
          for (let i = 5; i >= 0; i--) {
            const monthStart = startOfMonth(subMonths(now, i));
            const monthEnd = endOfMonth(subMonths(now, i));
            months.push({ 
              start: monthStart, 
              end: monthEnd, 
              label: format(monthStart, 'MMM yyyy'),
              key: format(monthStart, 'yyyy-MM')
            });
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
            
            // Categorize by status
            const pendingReceipts = receiptsInMonth.filter(r => r.status === 'pending_approval');
            const approvedReceipts = receiptsInMonth.filter(r => r.status === 'approved');
            const rejectedReceipts = receiptsInMonth.filter(r => r.status === 'rejected');
            const draftReceipts = receiptsInMonth.filter(r => r.status === 'draft' || r.isDraft);
            
            // Calculate amounts for each status
            const pendingAmount = pendingReceipts.reduce((acc, r) => acc + getAmountFromReceipt(r), 0);
            const approvedAmount = approvedReceipts.reduce((acc, r) => acc + getAmountFromReceipt(r), 0);
            const rejectedAmount = rejectedReceipts.reduce((acc, r) => acc + getAmountFromReceipt(r), 0);
            const draftAmount = draftReceipts.reduce((acc, r) => acc + getAmountFromReceipt(r), 0);
            
            return {
              month: month.label,
              pending: Math.round(pendingAmount * 100) / 100,
              approved: Math.round(approvedAmount * 100) / 100,
              rejected: Math.round(rejectedAmount * 100) / 100,
              draft: Math.round(draftAmount * 100) / 100,
              total: Math.round((pendingAmount + approvedAmount + rejectedAmount + draftAmount) * 100) / 100
            };
          });

          setData(monthlyData);
        } catch (error) {
          console.error('Error loading status data:', error);
          setData([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadStatusData();
  }, [user]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Breakdown</CardTitle>
          <CardDescription>Your receipt processing status over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0 || data.every(item => item.total === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Breakdown</CardTitle>
          <CardDescription>Your receipt processing status over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-muted-foreground text-sm">No status data available</p>
            <p className="text-xs text-muted-foreground mt-1">Submit receipts to see processing status</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Breakdown</CardTitle>
        <CardDescription>Your receipt processing status over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stacked" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stacked">Stacked Bar</TabsTrigger>
            <TabsTrigger value="combined">Combined View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stacked" className="mt-4">
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
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
                      `$${value.toFixed(2)}`,
                      name.charAt(0).toUpperCase() + name.slice(1)
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      color: 'hsl(var(--foreground))',
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Bar dataKey="approved" stackId="a" fill="#10B981" name="Approved" />
                  <Bar dataKey="pending" stackId="a" fill="#F59E0B" name="Pending" />
                  <Bar dataKey="draft" stackId="a" fill="#6B7280" name="Draft" />
                  <Bar dataKey="rejected" stackId="a" fill="#EF4444" name="Rejected" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="combined" className="mt-4">
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <ComposedChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
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
                      `$${value.toFixed(2)}`,
                      name.charAt(0).toUpperCase() + name.slice(1)
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      color: 'hsl(var(--foreground))',
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Bar dataKey="approved" fill="#10B981" name="Approved" />
                  <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
                  <Bar dataKey="draft" fill="#6B7280" name="Draft" />
                  <Bar dataKey="rejected" fill="#EF4444" name="Rejected" />
                  <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={3} name="Total" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
