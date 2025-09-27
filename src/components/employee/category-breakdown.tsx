'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getAllReceiptsForUser } from '@/lib/receipt-store';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import type { ProcessedReceipt } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CategoryData {
  name: string;
  value: number;
  color: string;
  count: number;
}

export function CategoryBreakdown() {
  const { user } = useAuth();
  const [data, setData] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategoryData = async () => {
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

          // Filter receipts for current month
          const receiptsThisMonth = allReceipts.filter(r => 
            isWithinInterval(new Date(r.uploadedAt), { start: startOfCurrentMonth, end: endOfCurrentMonth })
          );

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

          const categorizeReceipt = (receipt: ProcessedReceipt) => {
            const vendor = receipt.items?.find(i => 
              i.label.toLowerCase().includes('vendor') || 
              i.label.toLowerCase().includes('merchant') ||
              i.label.toLowerCase().includes('store')
            )?.value.toLowerCase() || 'other';
            
            // Enhanced categorization logic
            if (vendor.includes('hotel') || vendor.includes('travel') || vendor.includes('flight') || 
                vendor.includes('airline') || vendor.includes('uber') || vendor.includes('taxi') ||
                vendor.includes('rental') || vendor.includes('car')) {
              return 'Travel';
            } else if (vendor.includes('restaurant') || vendor.includes('food') || vendor.includes('meal') ||
                       vendor.includes('cafe') || vendor.includes('coffee') || vendor.includes('bar') ||
                       vendor.includes('pizza') || vendor.includes('burger') || vendor.includes('mexican') ||
                       vendor.includes('chinese') || vendor.includes('italian') || vendor.includes('asian')) {
              return 'Meals';
            } else if (vendor.includes('office') || vendor.includes('supplies') || vendor.includes('stationery') ||
                       vendor.includes('staples') || vendor.includes('office depot') || vendor.includes('amazon') ||
                       vendor.includes('computer') || vendor.includes('software') || vendor.includes('tech')) {
              return 'Supplies';
            } else if (vendor.includes('gas') || vendor.includes('fuel') || vendor.includes('transport') ||
                       vendor.includes('parking') || vendor.includes('toll')) {
              return 'Transportation';
            } else if (vendor.includes('entertainment') || vendor.includes('movie') || vendor.includes('event') ||
                       vendor.includes('theater') || vendor.includes('concert') || vendor.includes('sports')) {
              return 'Entertainment';
            } else if (vendor.includes('medical') || vendor.includes('health') || vendor.includes('pharmacy') ||
                       vendor.includes('doctor') || vendor.includes('hospital')) {
              return 'Healthcare';
            } else if (vendor.includes('training') || vendor.includes('education') || vendor.includes('course') ||
                       vendor.includes('book') || vendor.includes('conference') || vendor.includes('seminar')) {
              return 'Training';
            } else {
              return 'Other';
            }
          };

          const categoryMap = new Map<string, { amount: number; count: number }>();
          
          receiptsThisMonth.forEach(receipt => {
            const amount = getAmountFromReceipt(receipt);
            if (amount === 0) return;
            
            const category = categorizeReceipt(receipt);
            const existing = categoryMap.get(category) || { amount: 0, count: 0 };
            categoryMap.set(category, {
              amount: existing.amount + amount,
              count: existing.count + 1
            });
          });

          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];
          const chartData = Array.from(categoryMap.entries())
            .map(([name, data], index) => ({
              name,
              value: Math.round(data.amount * 100) / 100,
              color: colors[index % colors.length],
              count: data.count
            }))
            .sort((a, b) => b.value - a.value);

          setData(chartData);
        } catch (error) {
          console.error('Error loading category data:', error);
          setData([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadCategoryData();
  }, [user]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Your spending distribution by category this month</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0 || data.every(item => item.value === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Your spending distribution by category this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-muted-foreground text-sm">No category data available</p>
            <p className="text-xs text-muted-foreground mt-1">Upload receipts to see your spending breakdown</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>Your spending distribution by category this month</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pie" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pie" className="mt-4">
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      color: 'hsl(var(--foreground))',
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: "12px" }}
                    formatter={(value) => (
                      <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="bar" className="mt-4">
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === 'value' ? `$${value.toFixed(2)}` : value,
                      name === 'value' ? 'Amount' : 'Receipts'
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
                  <Bar dataKey="value" fill="#3B82F6" name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
