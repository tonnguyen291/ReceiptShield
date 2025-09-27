'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ComposedChart } from 'recharts';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getAllReceiptsForUser } from '@/lib/receipt-store';
import { startOfMonth, endOfMonth, isWithinInterval, format, subMonths } from 'date-fns';
import type { ProcessedReceipt } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface ComparisonData {
  month: string;
  userAmount: number;
  averageAmount: number;
  difference: number;
  percentage: number;
}

export function UserVsAverage() {
  const { user } = useAuth();
  const [data, setData] = useState<ComparisonData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [overallStats, setOverallStats] = useState({
    userTotal: 0,
    averageTotal: 0,
    userReceipts: 0,
    averageReceipts: 0
  });

  useEffect(() => {
    const loadComparisonData = async () => {
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

          // Calculate user data for each month
          const userMonthlyData = months.map(month => {
            const receiptsInMonth = allReceipts.filter(r => 
              isWithinInterval(new Date(r.uploadedAt), { start: month.start, end: month.end })
            );
            
            const userAmount = receiptsInMonth.reduce((acc, r) => acc + getAmountFromReceipt(r), 0);
            
            return {
              month: month.label,
              userAmount: Math.round(userAmount * 100) / 100,
              userReceipts: receiptsInMonth.length
            };
          });

          // Simulate company average data (in a real app, this would come from an API)
          // For demo purposes, we'll create realistic average data
          const averageMonthlyData = months.map((month, index) => {
            // Simulate realistic company averages with some variation
            const baseAmount = 800 + (Math.sin(index * 0.5) * 200); // Varying between 600-1000
            const baseReceipts = 8 + Math.floor(Math.random() * 5); // 8-12 receipts
            
            return {
              month: month.label,
              averageAmount: Math.round(baseAmount * 100) / 100,
              averageReceipts: baseReceipts
            };
          });

          // Combine user and average data
          const comparisonData = months.map((month, index) => {
            const userData = userMonthlyData[index];
            const averageData = averageMonthlyData[index];
            
            const difference = userData.userAmount - averageData.averageAmount;
            const percentage = averageData.averageAmount > 0 
              ? Math.round((difference / averageData.averageAmount) * 100 * 100) / 100 
              : 0;
            
            return {
              month: month.label,
              userAmount: userData.userAmount,
              averageAmount: averageData.averageAmount,
              difference: Math.round(difference * 100) / 100,
              percentage
            };
          });

          // Calculate overall stats
          const userTotal = userMonthlyData.reduce((acc, d) => acc + d.userAmount, 0);
          const averageTotal = averageMonthlyData.reduce((acc, d) => acc + d.averageAmount, 0);
          const userReceipts = userMonthlyData.reduce((acc, d) => acc + d.userReceipts, 0);
          const averageReceipts = averageMonthlyData.reduce((acc, d) => acc + d.averageReceipts, 0);

          setData(comparisonData);
          setOverallStats({
            userTotal: Math.round(userTotal * 100) / 100,
            averageTotal: Math.round(averageTotal * 100) / 100,
            userReceipts,
            averageReceipts
          });
        } catch (error) {
          console.error('Error loading comparison data:', error);
          setData([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadComparisonData();
  }, [user]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User vs Company Average</CardTitle>
          <CardDescription>Compare your spending with company averages</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User vs Company Average</CardTitle>
          <CardDescription>Compare your spending with company averages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-muted-foreground text-sm">No comparison data available</p>
            <p className="text-xs text-muted-foreground mt-1">Submit receipts to see your comparison</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallDifference = overallStats.userTotal - overallStats.averageTotal;
  const overallPercentage = overallStats.averageTotal > 0 
    ? Math.round((overallDifference / overallStats.averageTotal) * 100 * 100) / 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>User vs Company Average</CardTitle>
        <CardDescription>Compare your spending with company averages</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-blue-600">${overallStats.userTotal.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Your Total</div>
            <div className="text-xs text-muted-foreground">{overallStats.userReceipts} receipts</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">${overallStats.averageTotal.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Company Average</div>
            <div className="text-xs text-muted-foreground">{overallStats.averageReceipts} receipts</div>
          </div>
        </div>

        {/* Performance Badge */}
        <div className="flex justify-center mb-6">
          <Badge 
            variant={overallPercentage > 0 ? "destructive" : overallPercentage < -10 ? "default" : "secondary"}
            className="text-lg px-4 py-2"
          >
            {overallPercentage > 0 ? `+${overallPercentage.toFixed(1)}%` : `${overallPercentage.toFixed(1)}%`} 
            {overallPercentage > 0 ? ' above' : ' below'} average
          </Badge>
        </div>

        <Tabs defaultValue="comparison" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="trend">Trend Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="comparison" className="mt-4">
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
                      name === 'userAmount' ? 'Your Amount' : 'Company Average'
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
                  <Bar dataKey="userAmount" fill="#3B82F6" name="Your Amount" />
                  <Bar dataKey="averageAmount" fill="#10B981" name="Company Average" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="trend" className="mt-4">
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
                      name === 'difference' ? `$${value.toFixed(2)}` : `$${value.toFixed(2)}`,
                      name === 'userAmount' ? 'Your Amount' : 
                      name === 'averageAmount' ? 'Company Average' : 'Difference'
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
                  <Bar dataKey="userAmount" fill="#3B82F6" name="Your Amount" />
                  <Bar dataKey="averageAmount" fill="#10B981" name="Company Average" />
                  <Line 
                    type="monotone" 
                    dataKey="difference" 
                    stroke="#EF4444" 
                    strokeWidth={3}
                    name="Difference"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
