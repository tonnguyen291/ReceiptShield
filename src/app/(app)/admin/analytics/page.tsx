"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [orgData, setOrgData] = useState({
    totalUsers: 150,
    activeUsers: 142,
    totalSpending: 125000,
    averagePerUser: 833.33,
    totalReceipts: 1250,
    fraudAlerts: 15,
    pendingApprovals: 45,
    departments: 8
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
    { type: "Suspicious Amounts", count: 8, severity: "high" },
    { type: "Duplicate Receipts", count: 4, severity: "medium" },
    { type: "Unusual Vendors", count: 3, severity: "low" }
  ]);

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

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Organization Analytics</h1>
        <p className="text-gray-600 mt-2">Comprehensive insights into your organization's expense management</p>
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
                      <span className="text-sm text-gray-500 ml-2">({dept.users} users)</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${dept.spending.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">${dept.avgPerUser}/user</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(dept.spending / orgData.totalSpending) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-500">{dept.receipts} receipts</div>
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
                      <div className="text-sm text-gray-500">{category.percentage}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-500">{category.count} transactions</div>
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
                <p className="text-sm text-gray-500">Detected cases</p>
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