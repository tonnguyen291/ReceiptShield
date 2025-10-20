"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function ManagerAnalyticsPage() {
  const [teamData, setTeamData] = useState({
    totalTeamMembers: 12,
    activeSubmissions: 45,
    pendingApprovals: 8,
    totalTeamSpending: 12500,
    averagePerEmployee: 1041.67,
    topSpender: "Sarah Johnson",
    mostCommonCategory: "Meals",
    fraudAlerts: 2
  });

  const [teamSpending, setTeamSpending] = useState([
    { employee: "Sarah Johnson", amount: 2450, receipts: 15, status: "approved" },
    { employee: "Mike Chen", amount: 1890, receipts: 12, status: "pending" },
    { employee: "Emily Davis", amount: 1650, receipts: 10, status: "approved" },
    { employee: "John Smith", amount: 1420, receipts: 8, status: "approved" },
    { employee: "Lisa Wang", amount: 1380, receipts: 9, status: "pending" }
  ]);

  const [categoryBreakdown, setCategoryBreakdown] = useState([
    { category: "Meals", amount: 5200, percentage: 42, count: 25 },
    { category: "Transportation", amount: 3100, percentage: 25, count: 18 },
    { category: "Office Supplies", amount: 2200, percentage: 18, count: 12 },
    { category: "Training", amount: 1200, percentage: 10, count: 6 },
    { category: "Other", amount: 800, percentage: 6, count: 4 }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "rejected":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Analytics</h1>
        <p className="text-gray-600 mt-2">Comprehensive insights into your team's expense patterns and performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamData.totalTeamMembers}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${teamData.totalTeamSpending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{teamData.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Requires review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{teamData.fraudAlerts}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Spending Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Spending by Employee</CardTitle>
            <CardDescription>Individual spending breakdown for your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamSpending.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {member.employee.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{member.employee}</div>
                      <div className="text-sm text-gray-500">{member.receipts} receipts</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-bold">${member.amount.toLocaleString()}</div>
                    </div>
                    <Badge variant={getStatusColor(member.status)}>
                      {getStatusIcon(member.status)}
                      <span className="ml-1 capitalize">{member.status}</span>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Team expenses broken down by category</CardDescription>
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
                      className="bg-blue-600 h-2 rounded-full"
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

      {/* Team Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Insights</CardTitle>
          <CardDescription>Key insights and recommendations for your team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium mb-1">Spending Trend</h3>
              <p className="text-sm text-gray-600">Team spending increased by 12% this month</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium mb-1">Top Performer</h3>
              <p className="text-sm text-gray-600">{teamData.topSpender} has the highest spending</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium mb-1">Average per Employee</h3>
              <p className="text-sm text-gray-600">${teamData.averagePerEmployee.toFixed(2)} per person</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}