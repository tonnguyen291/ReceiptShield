"use client";

import { SidebarLayout } from "@/components/shared/sidebar-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  ReceiptText, 
  ShieldAlert,
  BarChart3,
  DollarSign,
  Clock,
  CheckCircle
} from "lucide-react";

export default function SidebarDemoPage() {
  const stats = [
    {
      title: "Total Receipts",
      value: "1,247",
      change: "+12%",
      changeType: "positive",
      icon: ReceiptText
    },
    {
      title: "Active Users",
      value: "89",
      change: "+5%",
      changeType: "positive",
      icon: Users
    },
    {
      title: "Fraud Alerts",
      value: "3",
      change: "-2",
      changeType: "negative",
      icon: ShieldAlert
    },
    {
      title: "Total Amount",
      value: "$45,230",
      change: "+8%",
      changeType: "positive",
      icon: DollarSign
    }
  ];

  const recentActivity = [
    {
      id: 1,
      user: "Sarah Johnson",
      action: "submitted a receipt",
      amount: "$125.50",
      time: "2 minutes ago",
      status: "pending"
    },
    {
      id: 2,
      user: "Mike Chen",
      action: "approved expense",
      amount: "$89.99",
      time: "15 minutes ago",
      status: "approved"
    },
    {
      id: 3,
      user: "Lisa Wang",
      action: "flagged suspicious receipt",
      amount: "$2,450.00",
      time: "1 hour ago",
      status: "flagged"
    },
    {
      id: 4,
      user: "David Smith",
      action: "updated profile",
      amount: null,
      time: "2 hours ago",
      status: "updated"
    }
  ];

  return (
    <SidebarLayout className="p-6">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your receipts.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center space-x-1 mt-1">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500">from last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>
                Latest actions from your team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                        {activity.amount && (
                          <span className="font-medium text-gray-600"> for {activity.amount}</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    <Badge 
                      variant={
                        activity.status === 'approved' ? 'default' :
                        activity.status === 'flagged' ? 'destructive' :
                        activity.status === 'pending' ? 'secondary' : 'outline'
                      }
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <ReceiptText className="h-4 w-4 mr-2" />
                  Submit Receipt
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Team
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  Review Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
              <CardDescription>
                Monthly expense patterns over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Chart visualization would go here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>
                Individual team member statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-700">SJ</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Sarah Johnson</p>
                      <p className="text-xs text-gray-500">15 receipts this month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">$2,450</p>
                    <p className="text-xs text-green-600">+12%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700">MC</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Mike Chen</p>
                      <p className="text-xs text-gray-500">12 receipts this month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">$1,890</p>
                    <p className="text-xs text-green-600">+8%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-700">LW</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Lisa Wang</p>
                      <p className="text-xs text-gray-500">8 receipts this month</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">$1,230</p>
                    <p className="text-xs text-red-600">-3%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
