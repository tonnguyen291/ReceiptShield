'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MonthlySpendChartProps {
  data: { month: string; amount: number }[];
  className?: string;
}

export function MonthlySpendChart({ data, className }: MonthlySpendChartProps) {
  // Format data for display
  const formattedData = data.map(item => ({
    ...item,
    displayMonth: formatMonth(item.month),
    amount: Math.round(item.amount * 100) / 100 // Round to 2 decimal places
  }));

  // Calculate trend
  const trend = calculateTrend(data);
  const isPositiveTrend = trend > 0;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Monthly Spend Overview</CardTitle>
        <div className="flex items-center space-x-1">
          {isPositiveTrend ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
          <span className={`text-sm font-medium ${
            isPositiveTrend ? 'text-green-600' : 'text-red-600'
          }`}>
            {Math.abs(trend).toFixed(1)}%
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="displayMonth" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#6b7280' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#6b7280' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-medium text-gray-900">{label}</p>
                        <p className="text-blue-600">
                          Amount: <span className="font-semibold">${typeof payload[0].value === 'number' ? payload[0].value.toFixed(2) : payload[0].value}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Showing spending trends over the last {data.length} months</p>
        </div>
      </CardContent>
    </Card>
  );
}

function formatMonth(monthString: string): string {
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function calculateTrend(data: { month: string; amount: number }[]): number {
  if (data.length < 2) return 0;
  
  const firstAmount = data[0].amount;
  const lastAmount = data[data.length - 1].amount;
  
  if (firstAmount === 0) return 0;
  
  return ((lastAmount - firstAmount) / firstAmount) * 100;
}
