"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { getAllUsers } from "@/lib/firebase-auth";
import { getAllReceipts } from "@/lib/receipt-store";
import type { User } from "@/types";
import type { ProcessedReceipt } from "@/types";

export default function AdminAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [orgData, setOrgData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSpending: 0,
    averagePerUser: 0,
    totalReceipts: 0,
    fraudAlerts: 0,
    pendingApprovals: 0,
    departments: 0
  });

  const [departmentSpending, setDepartmentSpending] = useState([
    { department: "Engineering", users: 45, spending: 45000, receipts: 450, avgPerUser: 1000 },
    { department: "Sales", users: 25, spending: 35000, receipts: 350, avgPerUser: 1400 },
    { department: "Marketing", users: 20, spending: 25000, receipts: 250, avgPerUser: 1250 },
    { department: "HR", users: 15, spending: 10000, receipts: 100, avgPerUser: 667 },
    { department: "Finance", users: 12, spending: 8000, receipts: 80, avgPerUser: 667 },
    { department: "Operations", users: 10, spending: 7000, receipts: 70, avgPerUser: 700 }
  ]);

  const [categoryBreakdown, setCategoryBreakdown] = useState([
    { category: "Meals", amount: 50000, percentage: 40, count: 500 },
    { category: "Transportation", amount: 30000, percentage: 24, count: 300 },
    { category: "Office Supplies", amount: 20000, percentage: 16, count: 200 },
    { category: "Training", amount: 15000, percentage: 12, count: 150 },
    { category: "Other", amount: 10000, percentage: 8, count: 100 }
  ]);

  const [fraudInsights, setFraudInsights] = useState([
    { type: "Suspicious Amounts", count: 0, severity: "high" },
    { type: "Duplicate Receipts", count: 0, severity: "medium" },
    { type: "Unusual Vendors", count: 0, severity: "low" }
  ]);

  // Real-time data fetching functions
  const fetchRealAnalyticsData = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching real analytics data...');

      // Fetch all users and receipts
      const [users, receipts] = await Promise.all([
        getAllUsers(),
        getAllReceipts()
      ]);

      console.log('Fetched data:', { users: users.length, receipts: receipts.length });

      // Calculate real metrics
      const totalUsers = users.length;
      const activeUsers = users.filter(user => user.status === 'active').length;
      const totalReceipts = receipts.length;
      
      // Calculate total spending from receipts
      const totalSpending = receipts.reduce((sum, receipt) => {
        const totalItem = receipt.items.find(item => 
          item.label.toLowerCase().includes('total') || 
          item.label.toLowerCase().includes('amount')
        );
        if (totalItem) {
          const match = totalItem.value.match(/\$?(\d+\.?\d*)/);
          return sum + (match ? parseFloat(match[1]) : 0);
        }
        return sum;
      }, 0);

      const averagePerUser = totalUsers > 0 ? totalSpending / totalUsers : 0;
      
      // Count pending approvals
      const pendingApprovals = receipts.filter(receipt => 
        receipt.status === 'pending_approval'
      ).length;

      // Calculate fraud alerts using real-time analysis
      const fraudAlerts = receipts.filter(receipt => 
        receipt.isFraudulent || 
        (receipt.fraudProbability && receipt.fraudProbability > 0.3) ||
        (receipt.fraud_analysis?.overall_risk_assessment && 
         receipt.fraud_analysis.overall_risk_assessment !== 'LOW')
      ).length;

      // Count departments (unique supervisor IDs + users without supervisors)
      const departments = new Set([
        ...users.filter(u => u.role === 'manager').map(u => u.id),
        ...users.filter(u => !u.supervisorId && u.role !== 'manager').map(u => u.id)
      ]).size;

      // Update organization data
      setOrgData({
        totalUsers,
        activeUsers,
        totalSpending,
        averagePerUser,
        totalReceipts,
        fraudAlerts,
        pendingApprovals,
        departments
      });

      // Calculate department spending
      const deptSpending = calculateDepartmentSpending(users, receipts);
      setDepartmentSpending(deptSpending);

      // Calculate category breakdown
      const categoryBreakdown = calculateCategoryBreakdown(receipts);
      setCategoryBreakdown(categoryBreakdown);

      // Calculate fraud insights
      const fraudInsights = calculateFraudInsights(receipts);
      setFraudInsights(fraudInsights);

      console.log('Analytics data updated:', {
        totalUsers,
        activeUsers,
        totalSpending,
        fraudAlerts,
        pendingApprovals
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate department spending
  const calculateDepartmentSpending = (users: User[], receipts: ProcessedReceipt[]) => {
    const deptMap = new Map<string, {
      department: string;
      users: number;
      spending: number;
      receipts: number;
      avgPerUser: number;
    }>();

    // Group users by department (supervisor)
    users.forEach(user => {
      const deptName = user.role === 'manager' ? user.name : 
                      user.supervisorId ? 
                        users.find(u => u.id === user.supervisorId)?.name || 'Unknown' :
                        'Unassigned';
      
      if (!deptMap.has(deptName)) {
        deptMap.set(deptName, {
          department: deptName,
          users: 0,
          spending: 0,
          receipts: 0,
          avgPerUser: 0
        });
      }
      
      const dept = deptMap.get(deptName)!;
      dept.users++;
    });

    // Calculate spending per department
    receipts.forEach(receipt => {
      const user = users.find(u => u.email === receipt.uploadedBy);
      if (user) {
        const deptName = user.role === 'manager' ? user.name : 
                        user.supervisorId ? 
                          users.find(u => u.id === user.supervisorId)?.name || 'Unknown' :
                          'Unassigned';
        
        const dept = deptMap.get(deptName);
        if (dept) {
          dept.receipts++;
          
          const totalItem = receipt.items.find(item => 
            item.label.toLowerCase().includes('total') || 
            item.label.toLowerCase().includes('amount')
          );
          if (totalItem) {
            const match = totalItem.value.match(/\$?(\d+\.?\d*)/);
            dept.spending += match ? parseFloat(match[1]) : 0;
          }
        }
      }
    });

    // Calculate averages
    deptMap.forEach(dept => {
      dept.avgPerUser = dept.users > 0 ? dept.spending / dept.users : 0;
    });

    return Array.from(deptMap.values()).sort((a, b) => b.spending - a.spending);
  };

  // Calculate category breakdown
  const calculateCategoryBreakdown = (receipts: ProcessedReceipt[]) => {
    const categoryMap = new Map<string, { amount: number; count: number }>();
    let totalAmount = 0;

    receipts.forEach(receipt => {
      // Default category since ReceiptDataItem doesn't have category
      const category = 'Other';
      
      const totalItem = receipt.items.find(item => 
        item.label.toLowerCase().includes('total') || 
        item.label.toLowerCase().includes('amount')
      );
      
      if (totalItem) {
        const match = totalItem.value.match(/\$?(\d+\.?\d*)/);
        const amount = match ? parseFloat(match[1]) : 0;
        
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { amount: 0, count: 0 });
        }
        
        const cat = categoryMap.get(category)!;
        cat.amount += amount;
        cat.count++;
        totalAmount += amount;
      }
    });

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: totalAmount > 0 ? Math.round((data.amount / totalAmount) * 100) : 0,
      count: data.count
    })).sort((a, b) => b.amount - a.amount);
  };

  // Calculate fraud insights
  const calculateFraudInsights = (receipts: ProcessedReceipt[]) => {
    const suspiciousAmounts = receipts.filter(receipt => {
      const totalItem = receipt.items.find(item => 
        item.label.toLowerCase().includes('total') || 
        item.label.toLowerCase().includes('amount')
      );
      if (totalItem) {
        const match = totalItem.value.match(/\$?(\d+\.?\d*)/);
        const amount = match ? parseFloat(match[1]) : 0;
        // Flag amounts over $1000 as suspicious
        return amount > 1000;
      }
      return false;
    }).length;

    const duplicateReceipts = receipts.filter(receipt => 
      receipt.isFraudulent && 
      receipt.explanation?.toLowerCase().includes('duplicate')
    ).length;

    const unusualVendors = receipts.filter(receipt => 
      receipt.isFraudulent && 
      receipt.explanation?.toLowerCase().includes('vendor')
    ).length;

    return [
      { type: "Suspicious Amounts", count: suspiciousAmounts, severity: "high" },
      { type: "Duplicate Receipts", count: duplicateReceipts, severity: "medium" },
      { type: "Unusual Vendors", count: unusualVendors, severity: "low" }
    ];
  };

  // Load data on component mount
  useEffect(() => {
    fetchRealAnalyticsData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <Clock className="h-4 w-4" />;
      case "low":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[var(--color-bg)] text-[var(--color-text)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)]">Loading organization analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Organization Analytics</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">Real-time insights into your organization's expense management</p>
        </div>
        <Button 
          onClick={fetchRealAnalyticsData}
          variant="outline"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            'Refresh Data'
          )}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orgData.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Organization wide</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${orgData.totalSpending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{orgData.fraudAlerts}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{orgData.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Department Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Department</CardTitle>
            <CardDescription>Expense breakdown across organization departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentSpending.map((dept, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{dept.department}</span>
                      <span className="text-sm text-[var(--color-text-secondary)] ml-2">({dept.users} users)</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${dept.spending.toLocaleString()}</div>
                      <div className="text-sm text-[var(--color-text-secondary)]">${dept.avgPerUser}/user</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(dept.spending / orgData.totalSpending) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)]">{dept.receipts} receipts</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Organization-wide expense categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryBreakdown.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category.category}</span>
                    <div className="text-right">
                      <div className="font-bold">${category.amount.toLocaleString()}</div>
                      <div className="text-sm text-[var(--color-text-secondary)]">{category.percentage}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)]">{category.count} transactions</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fraud Detection Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Fraud Detection Insights</CardTitle>
          <CardDescription>AI-powered fraud detection and prevention metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {fraudInsights.map((insight, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  {getSeverityIcon(insight.severity)}
                </div>
                <h3 className="font-medium mb-1">{insight.type}</h3>
                <div className="text-2xl font-bold text-red-600">{insight.count}</div>
                <p className="text-sm text-[var(--color-text-secondary)]">Detected cases</p>
                <Badge variant={getSeverityColor(insight.severity)} className="mt-2">
                  {insight.severity} severity
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Organization Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Performance</CardTitle>
          <CardDescription>Key performance indicators and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium mb-1">Departments</h3>
              <p className="text-sm text-gray-600">{orgData.departments} active departments</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium mb-1">Active Users</h3>
              <p className="text-sm text-gray-600">{orgData.activeUsers} of {orgData.totalUsers} users</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium mb-1">Average per User</h3>
              <p className="text-sm text-gray-600">${orgData.averagePerUser.toFixed(2)} per person</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-medium mb-1">Growth Rate</h3>
              <p className="text-sm text-gray-600">+12% from last month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}