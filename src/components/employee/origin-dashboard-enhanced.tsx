"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingGrid, LoadingChart, LoadingSpinner } from "@/components/ui/loading-states";
import { 
  ReceiptText, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Plus,
  FileText,
  BarChart3,
  Lightbulb
} from "lucide-react";
import { useState, useEffect } from "react";
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';
import { getUserSpendingAnalytics, type SpendingAnalytics } from '@/lib/data-service';

interface OriginDashboardEnhancedProps {
  user?: {
    name?: string;
    email: string;
    role: string;
  };
}

export function OriginDashboardEnhanced({ user }: OriginDashboardEnhancedProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState<SpendingAnalytics | null>(null);

  // Load real analytics data
  useEffect(() => {
    if (user?.email) {
      getUserSpendingAnalytics(user.email).then(setAnalytics).catch(console.error);
    }
  }, [user?.email]);

  // Use real data if available, otherwise fallback to mock data
  const summaryData = analytics ? {
    totalReceipts: analytics.totalReceipts,
    totalAmount: analytics.totalSpent,
    pendingAmount: analytics.statusBreakdown.find(s => s.status === 'Pending')?.amount || 0,
    approvedAmount: analytics.statusBreakdown.find(s => s.status === 'Approved')?.amount || 0
  } : {
    totalReceipts: 0,
    totalAmount: 0,
    pendingAmount: 0,
    approvedAmount: 0
  };

  // Use real recent receipts if available
  const recentReceipts = analytics?.recentReceipts.slice(0, 3).map(receipt => ({
    id: receipt.id,
    amount: receipt.total || 0,
    vendor: receipt.merchant || 'Unknown',
    date: new Date(receipt.uploadedAt).toLocaleDateString(),
    status: receipt.status || 'pending'
  })) || [];

  const quickActions = [
    { label: "Submit Receipt", icon: Plus, href: "/employee/upload" },
    { 
      label: "View Analytics", 
      icon: BarChart3, 
      onClick: () => setShowAnalytics(!showAnalytics) 
    },
    { label: "Get Insights", icon: Lightbulb, href: "/employee/insights" }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-display">Dashboard</h1>
            <p className="text-caption">Welcome back, {user?.name || user?.email}</p>
          </div>
          <LoadingSpinner size="lg" />
        </div>
        <LoadingGrid count={4} />
        <LoadingChart />
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-[var(--color-text)]">Dashboard</h1>
          <p className="text-caption text-[var(--color-text-secondary)]">Welcome back, {user?.name || user?.email}</p>
        </div>
        <Button className="origin-button" asChild>
          <a href="/employee/upload">
            <Plus className="h-4 w-4 mr-2" />
            Submit Receipt
          </a>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[var(--color-card)] border-[var(--color-border)] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-text)]">Total Receipts</CardTitle>
            <ReceiptText className="h-4 w-4 text-[var(--color-text-secondary)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-primary)]">{summaryData.totalReceipts}</div>
            <p className="text-xs text-[var(--color-text-secondary)]">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--color-card)] border-[var(--color-border)] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-text)]">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-[var(--color-text-secondary)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-info)]">${summaryData.totalAmount.toFixed(2)}</div>
            <p className="text-xs text-[var(--color-text-secondary)]">All receipts</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--color-card)] border-[var(--color-border)] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-text)]">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-[var(--color-text-secondary)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-warning)]">${summaryData.pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-[var(--color-text-secondary)]">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="bg-[var(--color-card)] border-[var(--color-border)] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-text)]">Approved</CardTitle>
            <TrendingUp className="h-4 w-4 text-[var(--color-text-secondary)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[var(--color-success)]">${summaryData.approvedAmount.toFixed(2)}</div>
            <p className="text-xs text-[var(--color-text-secondary)]">Processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-[var(--color-card)] border-[var(--color-border)] shadow-sm">
        <CardHeader>
          <CardTitle className="text-[var(--color-text)]">Quick Actions</CardTitle>
          <CardDescription className="text-[var(--color-text-secondary)]">Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-[var(--color-bg-secondary)] border-[var(--color-border)]"
                asChild={!!action.href}
                onClick={action.onClick}
              >
                {action.href ? (
                  <a href={action.href}>
                    <action.icon className="h-6 w-6" />
                    <span>{action.label}</span>
                  </a>
                ) : (
                  <div>
                    <action.icon className="h-6 w-6" />
                    <span>{action.label}</span>
                  </div>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="origin-card">
          <CardHeader>
            <CardTitle>Recent Receipts</CardTitle>
            <CardDescription>Your latest submitted receipts</CardDescription>
          </CardHeader>
          <CardContent>
            {recentReceipts.length > 0 ? (
              <div className="space-y-4">
                {recentReceipts.map((receipt) => (
                  <div key={receipt.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{receipt.vendor}</p>
                        <p className="text-sm text-muted-foreground">{receipt.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${receipt.amount}</p>
                      <p className={`text-xs ${
                        receipt.status === 'approved' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {receipt.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                title="No Receipts Yet"
                description="Submit your first receipt to get started"
                buttonText="Submit Receipt"
                buttonLink="/employee/submit-receipt"
              />
            )}
          </CardContent>
        </Card>

        {/* Mini Analytics Preview */}
        <Card className="origin-card">
          <CardHeader>
            <CardTitle>Quick Analytics</CardTitle>
            <CardDescription>Your spending overview</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics && analytics.monthlyTrends.length > 0 ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    ${analytics.totalSpent.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Total spent this period</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold">{analytics.totalReceipts}</p>
                    <p className="text-xs text-gray-600">Receipts</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{analytics.categoryBreakdown.length}</p>
                    <p className="text-xs text-gray-600">Categories</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowAnalytics(true)}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Full Analytics
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No analytics data yet</p>
                <Button asChild>
                  <a href="/employee/upload">Submit Receipt</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="origin-card">
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
          <CardDescription>Smart recommendations based on your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start space-x-3">
                <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Spending Pattern Detected</p>
                  <p className="text-sm text-muted-foreground">
                    You tend to spend more on weekdays. Consider setting a daily budget limit.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-medium">Expense Optimization</p>
                  <p className="text-sm text-muted-foreground">
                    You could save ~$50/month by consolidating similar purchases.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="mt-8">
          <AnalyticsDashboard />
        </div>
      )}
    </div>
  );
}
