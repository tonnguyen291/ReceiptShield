
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getAllReceiptsForUser } from '@/lib/receipt-store';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import type { ProcessedReceipt } from '@/types';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export function ExpenseSummaryChart() {
  const { user } = useAuth();
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExpenseData = async () => {
      if (user?.email) {
        try {
          // Add timeout to prevent hanging
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

          // Optimized amount calculation
          const getAmountFromReceipt = (receipt: ProcessedReceipt) => {
            const amountItem = receipt.items?.find(i => 
              i.label.toLowerCase().includes('total amount') || 
              i.label.toLowerCase().includes('amount') ||
              i.label.toLowerCase().includes('total')
            );
            if (!amountItem) return 0;
            const amountValue = parseFloat(amountItem.value.replace(/[^0-9.-]+/g, "") || "0");
            return isNaN(amountValue) ? 0 : amountValue;
          };

          // Process categories in batches to avoid blocking
          setTimeout(() => {
            const categoryMap = new Map<string, number>();
            
            // Limit processing to first 50 receipts for performance
            const receiptsToProcess = receiptsThisMonth.slice(0, 50);
            
            receiptsToProcess.forEach(receipt => {
              const amount = getAmountFromReceipt(receipt);
              if (amount === 0) return; // Skip zero amounts
              
              const vendor = receipt.items?.find(i => 
                i.label.toLowerCase().includes('vendor') || 
                i.label.toLowerCase().includes('merchant') ||
                i.label.toLowerCase().includes('store')
              )?.value.toLowerCase() || 'other';
              
              let category = 'Other';
              if (vendor.includes('hotel') || vendor.includes('travel') || vendor.includes('flight')) {
                category = 'Travel';
              } else if (vendor.includes('restaurant') || vendor.includes('food') || vendor.includes('meal')) {
                category = 'Meals';
              } else if (vendor.includes('office') || vendor.includes('supplies') || vendor.includes('stationery')) {
                category = 'Supplies';
              } else if (vendor.includes('gas') || vendor.includes('fuel') || vendor.includes('transport')) {
                category = 'Transportation';
              } else if (vendor.includes('entertainment') || vendor.includes('movie') || vendor.includes('event')) {
                category = 'Entertainment';
              }
              
              categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
            });

            const colors = ['#3F51B5', '#7E57C2', '#42A5F5', '#AB47BC', '#26A69A', '#FF7043'];
            const chartData = Array.from(categoryMap.entries())
              .map(([name, value], index) => ({
                name,
                value: Math.round(value * 100) / 100,
                color: colors[index % colors.length]
              }))
              .sort((a, b) => b.value - a.value)
              .slice(0, 6); // Limit to 6 categories for better performance

            setData(chartData);
          }, 50);

        } catch (error) {
          console.error('Error loading expense data:', error);
          // Fallback to default data
          setData([
            { name: 'Travel', value: 0, color: '#3F51B5' },
            { name: 'Meals', value: 0, color: '#7E57C2' },
            { name: 'Supplies', value: 0, color: '#42A5F5' },
            { name: 'Other', value: 0, color: '#AB47BC' },
          ]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadExpenseData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[250px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (data.length === 0 || data.every(item => item.value === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-[250px] text-center">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-muted-foreground text-sm">No expenses this month</p>
        <p className="text-xs text-muted-foreground mt-1">Upload receipts to see your spending breakdown</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
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
  );
}
