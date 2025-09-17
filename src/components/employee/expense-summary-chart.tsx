
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { ProcessedReceipt } from '@/types';

const COLORS = ['#3F51B5', '#7E57C2', '#42A5F5', '#AB47BC', '#26A69A', '#FF7043', '#8D6E63', '#78909C'];

// Function to categorize receipts based on vendor and items
function categorizeReceipt(receipt: ProcessedReceipt): string {
  const vendor = receipt.items.find(item => 
    item.label.toLowerCase().includes('vendor')
  )?.value.toLowerCase() || '';
  
  const allText = receipt.items.map(item => 
    `${item.label} ${item.value}`
  ).join(' ').toLowerCase();

  // Category detection logic
  if (vendor.includes('restaurant') || vendor.includes('cafe') || vendor.includes('diner') || 
      vendor.includes('pizza') || vendor.includes('burger') || vendor.includes('coffee') ||
      allText.includes('food') || allText.includes('meal') || allText.includes('dining')) {
    return 'Meals';
  }
  
  if (vendor.includes('gas') || vendor.includes('fuel') || vendor.includes('uber') || 
      vendor.includes('lyft') || vendor.includes('taxi') || vendor.includes('parking') ||
      allText.includes('transportation') || allText.includes('travel')) {
    return 'Travel';
  }
  
  if (vendor.includes('hotel') || vendor.includes('motel') || vendor.includes('inn') ||
      allText.includes('lodging') || allText.includes('accommodation')) {
    return 'Lodging';
  }
  
  if (vendor.includes('office') || vendor.includes('supplies') || vendor.includes('stationery') ||
      allText.includes('office supplies') || allText.includes('paper') || allText.includes('ink')) {
    return 'Office Supplies';
  }
  
  if (vendor.includes('pharmacy') || vendor.includes('medical') || vendor.includes('doctor') ||
      allText.includes('medical') || allText.includes('prescription')) {
    return 'Medical';
  }
  
  if (vendor.includes('movie') || vendor.includes('theater') || vendor.includes('concert') ||
      allText.includes('entertainment') || allText.includes('ticket')) {
    return 'Entertainment';
  }
  
  return 'Other';
}

// Function to calculate expense totals by category
function calculateExpenseByCategory(receipts: ProcessedReceipt[]): Array<{name: string, value: number}> {
  const categoryTotals: Record<string, number> = {};
  
  receipts.forEach(receipt => {
    // Only include approved receipts or pending ones (exclude rejected)
    if (receipt.status === 'rejected') return;
    
    const category = categorizeReceipt(receipt);
    const amountItem = receipt.items.find(item => 
      item.label.toLowerCase().includes('total amount')
    );
    
    if (amountItem) {
      const amount = parseFloat(amountItem.value.replace(/[^0-9.-]+/g, "") || "0");
      if (!isNaN(amount)) {
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      }
    }
  });
  
  // Convert to array and sort by value
  return Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

interface ExpenseSummaryChartProps {
  receipts: ProcessedReceipt[];
}

export function ExpenseSummaryChart({ receipts }: ExpenseSummaryChartProps) {
  const data = calculateExpenseByCategory(receipts);
  
  // If no data, show a placeholder
  if (data.length === 0) {
    return (
      <div style={{ width: '100%', height: 250 }} className="flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No expense data available</p>
          <p className="text-sm">Submit receipts to see expense breakdown</p>
        </div>
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
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              color: 'hsl(var(--foreground))',
            }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
