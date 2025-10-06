"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, AlertTriangle, Info, X, Mail, DollarSign, Receipt } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "expense_approved",
      title: "Expense Approved",
      message: "Your $89.99 Starbucks receipt has been approved and will be reimbursed.",
      timestamp: "2024-01-15 10:30 AM",
      read: false,
      priority: "low"
    },
    {
      id: 2,
      type: "budget_alert",
      title: "Budget Alert",
      message: "You've used 85% of your transportation budget. Only $75 remaining.",
      timestamp: "2024-01-15 09:15 AM",
      read: false,
      priority: "high"
    },
    {
      id: 3,
      type: "fraud_alert",
      title: "Fraud Detection",
      message: "Unusual spending pattern detected. Please review your recent submissions.",
      timestamp: "2024-01-14 3:45 PM",
      read: true,
      priority: "high"
    },
    {
      id: 4,
      type: "receipt_reminder",
      title: "Receipt Reminder",
      message: "You have 3 pending receipts that need to be submitted.",
      timestamp: "2024-01-14 2:20 PM",
      read: true,
      priority: "medium"
    },
    {
      id: 5,
      type: "system_update",
      title: "System Update",
      message: "New features have been added to the expense management system.",
      timestamp: "2024-01-13 11:00 AM",
      read: true,
      priority: "low"
    }
  ]);

  const [filter, setFilter] = useState("all");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <Info className="h-4 w-4" />;
      case "low":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "expense_approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "budget_alert":
        return <DollarSign className="h-5 w-5 text-yellow-600" />;
      case "fraud_alert":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "receipt_reminder":
        return <Receipt className="h-5 w-5 text-blue-600" />;
      case "system_update":
        return <Bell className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    if (filter === "high") return notification.priority === "high";
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    alert("Notification marked as read");
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    alert("All notifications marked as read");
  };

  const deleteNotification = (id: number) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      alert("Notification deleted");
    }
  };

  const handleNotificationAction = (notification: any) => {
    switch (notification.type) {
      case "expense_approved":
        alert("Redirecting to approved expenses...");
        break;
      case "budget_alert":
        alert("Redirecting to budget management...");
        break;
      case "fraud_alert":
        alert("Redirecting to fraud detection...");
        break;
      case "receipt_reminder":
        alert("Redirecting to receipt submission...");
        break;
      case "system_update":
        alert("Redirecting to system updates...");
        break;
      default:
        alert("Processing notification...");
    }
  };

  const clearAllNotifications = () => {
    if (confirm("Are you sure you want to clear all notifications?")) {
      setNotifications([]);
      alert("All notifications cleared");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">Stay updated with your expense management activities</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Bell className="h-4 w-4 mr-1" />
            {unreadCount} unread
          </Badge>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={markAllAsRead}>
              Mark All Read
            </Button>
            <Button variant="outline" onClick={clearAllNotifications}>
              Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All ({notifications.length})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          onClick={() => setFilter("unread")}
        >
          Unread ({unreadCount})
        </Button>
        <Button
          variant={filter === "high" ? "default" : "outline"}
          onClick={() => setFilter("high")}
        >
          High Priority ({notifications.filter(n => n.priority === "high").length})
        </Button>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Your latest notifications and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start space-x-4 p-4 border rounded-lg transition-colors ${
                  notification.read ? "bg-gray-50" : "bg-white border-blue-200"
                }`}
              >
                <div className="flex-shrink-0">
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900">{notification.title}</h3>
                    <Badge variant={getPriorityColor(notification.priority)}>
                      {getPriorityIcon(notification.priority)}
                      <span className="ml-1 capitalize">{notification.priority}</span>
                    </Badge>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                  <p className="text-xs text-gray-500">{notification.timestamp}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNotificationAction(notification)}
                  >
                    Take Action
                  </Button>
                  {!notification.read && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark Read
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h3 className="font-medium">Push Notifications</h3>
                <p className="text-sm text-gray-600">Receive push notifications in browser</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h3 className="font-medium">SMS Notifications</h3>
                <p className="text-sm text-gray-600">Receive critical alerts via SMS</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
