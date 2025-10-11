'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Trophy, Award, Medal } from 'lucide-react';

interface EmployeeLeaderboardData {
  employee: string;
  amount: number;
  count: number;
  department: string;
}

interface EmployeeLeaderboardChartProps {
  data: EmployeeLeaderboardData[];
}

const COLORS = ['#fbbf24', '#f59e0b', '#d97706', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#f97316'];

const getRankIcon = (index: number) => {
  switch (index) {
    case 0:
      return <Trophy className="h-4 w-4 text-yellow-500" />;
    case 1:
      return <Award className="h-4 w-4 text-gray-400" />;
    case 2:
      return <Medal className="h-4 w-4 text-amber-600" />;
    default:
      return <span className="text-sm font-bold text-gray-500">#{index + 1}</span>;
  }
};

export function EmployeeLeaderboardChart({ data }: EmployeeLeaderboardChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No employee data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSpend = data.reduce((sum, item) => sum + item.amount, 0);
  const topEmployee = data[0];
  const avgPerEmployee = totalSpend / data.length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTooltip = (value: number, name: string) => {
    if (name === 'amount') {
      return [formatCurrency(value), 'Total Spend'];
    }
    if (name === 'count') {
      return [value, 'Receipt Count'];
    }
    return [value, name];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Employee Leaderboard
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span>Top Spender:</span>
            <span className="font-semibold">{topEmployee.employee}</span>
            <span className="text-green-600">
              ({formatCurrency(topEmployee.amount)})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>Department:</span>
            <span className="font-semibold">{topEmployee.department}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="horizontal"
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 100,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                type="number"
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency}
              />
              <YAxis 
                type="category"
                dataKey="employee"
                tick={{ fontSize: 12 }}
                width={80}
              />
              <Tooltip 
                formatter={formatTooltip}
                labelFormatter={(label) => `Employee: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar 
                dataKey="amount" 
                name="Total Spend"
                radius={[0, 4, 4, 0]}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Top 3 Employees */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Top Performers</h4>
          <div className="space-y-2">
            {data.slice(0, 3).map((employee, index) => (
              <div key={employee.employee} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getRankIcon(index)}
                  <div>
                    <div className="font-medium text-gray-900">{employee.employee}</div>
                    <div className="text-sm text-gray-500">{employee.department}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatCurrency(employee.amount)}</div>
                  <div className="text-sm text-gray-500">{employee.count} receipts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Employees</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {data.length}
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Avg per Employee</span>
            </div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {formatCurrency(avgPerEmployee)}
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Total Receipts</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 mt-1">
              {data.reduce((sum, item) => sum + item.count, 0)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
