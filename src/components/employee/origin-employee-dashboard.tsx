"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  DollarSign, 
  BarChart, 
  AlertTriangle, 
  Bot, 
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
  Upload,
  Target,
  Award,
  Zap,
  ReceiptText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { getAllReceiptsForUser } from '@/lib/receipt-store';
import type { ProcessedReceipt } from '@/types';
import { subMonths, isWithinInterval, format, startOfMonth, endOfMonth } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  OriginDashboardCard, 
  OriginSummaryCard, 
  OriginInsightCard 
} from '@/components/shared/origin-dashboard-card';
import { OriginMiniChart } from '@/components/shared/origin-mini-chart';

export function OriginEmployeeDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [receipts, setReceipts] = useState<ProcessedReceipt[]>([]);
  const [monthlyData, setMonthlyData] = useState<number[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.email) return;
      
      try {
        const userReceipts = await getAllReceiptsForUser(user.email);
        setReceipts(userReceipts);
        
        // Generate monthly data for mini chart
        const monthlyAmounts = [];
        for (let i = 5; i >= 0; i--) {
          const monthStart = startOfMonth(subMonths(new Date(), i));
          const monthEnd = endOfMonth(monthStart);
          const monthReceipts = userReceipts.filter(receipt => 
            isWithinInterval(new Date(receipt.uploadedAt), { start: monthStart, end: monthEnd })
          );
          const totalAmount = monthReceipts.reduce((sum, receipt) => {
            return sum + receipt.items.reduce((itemSum, item) => {
              const priceMatch = item.value.match(/\$?(\d+\.?\d*)/);
              return itemSum + (priceMatch ? parseFloat(priceMatch[1]) : 0);
            }, 0);
          }, 0);
          monthlyAmounts.push(totalAmount);
        }
        setMonthlyData(monthlyAmounts);
      } catch (error) {
        console.error('Error loading receipts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.email]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const currentMonthReceipts = receipts.filter(receipt => 
    isWithinInterval(new Date(receipt.uploadedAt), { start: monthStart, end: monthEnd })
  );
  
  const totalAmount = currentMonthReceipts.reduce((sum, receipt) => {
    return sum + receipt.items.reduce((itemSum, item) => {
      const priceMatch = item.value.match(/\$?(\d+\.?\d*)/);
      return itemSum + (priceMatch ? parseFloat(priceMatch[1]) : 0);
    }, 0);
  }, 0);
  const pendingReceipts = receipts.filter(r => r.status === 'pending_approval').length;
  const approvedReceipts = receipts.filter(r => r.status === 'approved').length;
  const flaggedReceipts = receipts.filter(r => r.isFraudulent).length;

  const monthlyTrend = monthlyData.length > 1 
    ? ((monthlyData[monthlyData.length - 1] - monthlyData[monthlyData.length - 2]) / monthlyData[monthlyData.length - 2]) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-muted-foreground">
          Here's your expense overview for {format(currentMonth, 'MMMM yyyy')}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <OriginSummaryCard
          title="Total Expenses"
          amount={`$${totalAmount.toFixed(2)}`}
          subtitle="This month"
          trend={{
            value: monthlyTrend,
            period: "vs last month"
          }}
          icon={<DollarSign className="h-5 w-5" />}
        />
        
        <OriginSummaryCard
          title="Receipts Submitted"
          amount={currentMonthReceipts.length}
          subtitle="This month"
          icon={<ReceiptText className="h-5 w-5" />}
        />
        
        <OriginSummaryCard
          title="Pending Approval"
          amount={pendingReceipts}
          subtitle="Awaiting review"
          icon={<Clock className="h-5 w-5" />}
        />
        
        <OriginSummaryCard
          title="Approved"
          amount={approvedReceipts}
          subtitle="This month"
          icon={<CheckCircle className="h-5 w-5" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <OriginDashboardCard
          title="Submit New Receipt"
          subtitle="Upload and process a receipt"
          icon={<Upload className="h-5 w-5" />}
          onClick={() => router.push('/employee/submit-receipt')}
          className="hover:shadow-lg"
        >
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">Quick upload</span>
            <ArrowUpRight className="h-4 w-4 text-primary" />
          </div>
        </OriginDashboardCard>

        <OriginDashboardCard
          title="View All Receipts"
          subtitle="Check submission history"
          icon={<FileText className="h-5 w-5" />}
          onClick={() => router.push('/employee/receipts')}
          className="hover:shadow-lg"
        >
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">View history</span>
            <ArrowUpRight className="h-4 w-4 text-primary" />
          </div>
        </OriginDashboardCard>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OriginInsightCard
          title="Monthly Trend"
          description="Your spending pattern over the last 6 months"
          value={`${monthlyTrend > 0 ? '+' : ''}${monthlyTrend.toFixed(1)}%`}
          status={monthlyTrend > 0 ? "warning" : "success"}
          icon={<TrendingUp className="h-4 w-4" />}
        />

        <OriginInsightCard
          title="Receipt Status"
          description="Current approval status"
          value={`${approvedReceipts}/${receipts.length} approved`}
          status={approvedReceipts === receipts.length ? "success" : "info"}
          icon={<CheckCircle className="h-4 w-4" />}
        />
      </div>

      {/* Mini Chart */}
      <div className="origin-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Spending Trend</h3>
            <p className="text-sm text-muted-foreground">Last 6 months</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {monthlyTrend > 0 ? "Increasing" : "Decreasing"}
          </Badge>
        </div>
        <OriginMiniChart 
          data={monthlyData} 
          type="line" 
          height={60}
          showTrend={false}
        />
      </div>

      {/* Recent Activity */}
      <div className="origin-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {currentMonthReceipts.slice(0, 3).map((receipt, index) => (
            <div key={receipt.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <ReceiptText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {receipt.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(receipt.uploadedAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  ${receipt.items.reduce((sum, item) => {
                    const priceMatch = item.value.match(/\$?(\d+\.?\d*)/);
                    return sum + (priceMatch ? parseFloat(priceMatch[1]) : 0);
                  }, 0).toFixed(2)}
                </p>
                <Badge 
                  variant={receipt.status === 'approved' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {receipt.status || 'pending'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
