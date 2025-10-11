'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface StatusBreakdownChartProps {
  data: { status: string; count: number; amount: number }[];
  className?: string;
}

const STATUS_COLORS = {
  'Approved': '#10b981', // Green
  'Pending': '#f59e0b', // Amber
  'Rejected': '#ef4444', // Red
  'Draft': '#6b7280', // Gray
  'Processing': '#3b82f6', // Blue
};

const STATUS_ICONS = {
  'Approved': CheckCircle,
  'Pending': Clock,
  'Rejected': XCircle,
  'Draft': AlertCircle,
  'Processing': AlertCircle,
};

export function StatusBreakdownChart({ data, className }: StatusBreakdownChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base font-medium">Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium">No status data available</p>
              <p className="text-sm">Submit receipts to see status breakdown</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for the chart
  const chartData = data.map(item => ({
    ...item,
    fill: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || '#6b7280'
  }));

  const totalReceipts = data.reduce((sum, item) => sum + item.count, 0);
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-medium">Status Breakdown</CardTitle>
        <div className="text-sm text-gray-600">
          {totalReceipts} total receipts • ${totalAmount.toFixed(2)} total amount
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="status" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#6b7280' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#6b7280' }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const percentage = totalReceipts > 0 ? ((data.count / totalReceipts) * 100).toFixed(1) : '0';
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-medium text-gray-900">{data.status}</p>
                        <p className="text-blue-600">
                          Count: <span className="font-semibold">{data.count}</span>
                        </p>
                        <p className="text-green-600">
                          Amount: <span className="font-semibold">${data.amount.toFixed(2)}</span>
                        </p>
                        <p className="text-gray-600">
                          Percentage: <span className="font-semibold">{percentage}%</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Status Summary */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => {
            const IconComponent = STATUS_ICONS[item.status as keyof typeof STATUS_ICONS] || AlertCircle;
            const percentage = totalReceipts > 0 ? ((item.count / totalReceipts) * 100).toFixed(1) : '0';
            
            return (
              <div key={item.status} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <IconComponent 
                  className="h-5 w-5" 
                  style={{ color: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.status}</p>
                  <p className="text-xs text-gray-500">{item.count} receipts ({percentage}%)</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">${item.amount.toFixed(2)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
