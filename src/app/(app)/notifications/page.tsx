"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, AlertTriangle, Info, X, Mail, DollarSign, Receipt, Loader2, Clock } from "lucide-react";
import { getAllReceipts } from "@/lib/receipt-store";
import { getAllUsers } from "@/lib/firebase-auth";
import type { ProcessedReceipt } from "@/types";
import type { User } from "@/types";

// Interface for notification
interface Notification {
  id: string;
  type: "expense_approved" | "budget_alert" | "fraud_alert" | "receipt_reminder" | "system_update" | "receipt_pending" | "receipt_rejected";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: "low" | "medium" | "high";
  userId?: string;
  receiptId?: string;
}

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
      case "receipt_pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "receipt_rejected":
        return <X className="h-5 w-5 text-red-600" />;
      case "system_update":
        return <Bell className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  // Real-time notification generation
  const generateRealNotifications = async () => {
    try {
      setIsLoading(true);
      console.log('Generating real notifications...');

      // Fetch all receipts and users
      const [allReceipts, allUsers] = await Promise.all([
        getAllReceipts(),
        getAllUsers()
      ]);

      console.log('Fetched data for notifications:', { receipts: allReceipts.length, users: allUsers.length });

      const generatedNotifications: Notification[] = [];

      // Generate notifications from receipt data
      allReceipts.forEach((receipt, index) => {
        const receiptDate = new Date(receipt.uploadedAt);
        const isRecent = Date.now() - receiptDate.getTime() < 7 * 24 * 60 * 60 * 1000; // Last 7 days
        
        // Extract amount from receipt
        const totalItem = receipt.items.find(item => 
          item.label.toLowerCase().includes('total') || 
          item.label.toLowerCase().includes('amount')
        );
        const amount = totalItem ? (() => {
          const match = totalItem.value.match(/\$?(\d+\.?\d*)/);
          return match ? parseFloat(match[1]) : 0;
        })() : 0;

        // Generate different types of notifications based on receipt status and data
        if (receipt.status === 'approved' && isRecent) {
          generatedNotifications.push({
            id: `approved-${receipt.id}`,
            type: "expense_approved",
            title: "Expense Approved",
            message: `Your $${amount.toFixed(2)} receipt has been approved and will be reimbursed.`,
            timestamp: receiptDate.toLocaleString(),
            read: Math.random() > 0.3, // Random read status for demo
            priority: "low",
            userId: receipt.uploadedBy,
            receiptId: receipt.id
          });
        }

        if (receipt.status === 'rejected' && isRecent) {
          generatedNotifications.push({
            id: `rejected-${receipt.id}`,
            type: "receipt_rejected",
            title: "Receipt Rejected",
            message: `Your $${amount.toFixed(2)} receipt was rejected. ${receipt.managerNotes || 'Please review and resubmit.'}`,
            timestamp: receiptDate.toLocaleString(),
            read: Math.random() > 0.5,
            priority: "high",
            userId: receipt.uploadedBy,
            receiptId: receipt.id
          });
        }

        if (receipt.status === 'pending_approval' && isRecent) {
          generatedNotifications.push({
            id: `pending-${receipt.id}`,
            type: "receipt_pending",
            title: "Receipt Pending Review",
            message: `Your $${amount.toFixed(2)} receipt is pending manager approval.`,
            timestamp: receiptDate.toLocaleString(),
            read: Math.random() > 0.4,
            priority: "medium",
            userId: receipt.uploadedBy,
            receiptId: receipt.id
          });
        }

        // Generate fraud alerts for suspicious receipts
        if (receipt.isFraudulent || (receipt.fraudProbability && receipt.fraudProbability > 0.3)) {
          generatedNotifications.push({
            id: `fraud-${receipt.id}`,
            type: "fraud_alert",
            title: "Fraud Detection Alert",
            message: `Unusual spending pattern detected in your $${amount.toFixed(2)} receipt. Please review.`,
            timestamp: receiptDate.toLocaleString(),
            read: Math.random() > 0.2,
            priority: "high",
            userId: receipt.uploadedBy,
            receiptId: receipt.id
          });
        }

        // Generate budget alerts for high amounts
        if (amount > 500) {
          generatedNotifications.push({
            id: `budget-${receipt.id}`,
            type: "budget_alert",
            title: "High Amount Alert",
            message: `Large expense of $${amount.toFixed(2)} detected. Please ensure this is within budget.`,
            timestamp: receiptDate.toLocaleString(),
            read: Math.random() > 0.3,
            priority: "medium",
            userId: receipt.uploadedBy,
            receiptId: receipt.id
          });
        }
      });

      // Generate system notifications
      generatedNotifications.push({
        id: "system-update-1",
        type: "system_update",
        title: "System Update",
        message: "New fraud detection algorithms have been implemented for better expense monitoring.",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString(),
        read: true,
        priority: "low"
      });

      // Generate receipt reminders for users with no recent receipts
      const usersWithRecentReceipts = new Set(allReceipts
        .filter(r => Date.now() - new Date(r.uploadedAt).getTime() < 3 * 24 * 60 * 60 * 1000)
        .map(r => r.uploadedBy)
      );

      allUsers.forEach(user => {
        if (!usersWithRecentReceipts.has(user.email) && user.role === 'employee') {
          generatedNotifications.push({
            id: `reminder-${user.id}`,
            type: "receipt_reminder",
            title: "Receipt Submission Reminder",
            message: "You haven't submitted any receipts recently. Don't forget to submit your expenses.",
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleString(),
            read: Math.random() > 0.6,
            priority: "medium",
            userId: user.email
          });
        }
      });

      // Sort notifications by timestamp (newest first)
      generatedNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setNotifications(generatedNotifications);
      console.log('Generated notifications:', generatedNotifications.length);

    } catch (error) {
      console.error('Error generating notifications:', error);
      // Fallback to empty array on error
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load notifications on component mount
  useEffect(() => {
    generateRealNotifications();
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    if (filter === "high") return notification.priority === "high";
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    console.log("Notification marked as read:", id);
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    console.log("All notifications marked as read");
  };

  const deleteNotification = (id: string) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      console.log("Notification deleted:", id);
    }
  };

  const handleNotificationAction = (notification: Notification) => {
    switch (notification.type) {
      case "expense_approved":
        if (notification.receiptId) {
          window.open(`/employee/verify-receipt/${notification.receiptId}`, '_blank');
        } else {
          alert("Redirecting to approved expenses...");
        }
        break;
      case "budget_alert":
        alert("Redirecting to budget management...");
        break;
      case "fraud_alert":
        if (notification.receiptId) {
          window.open(`/employee/verify-receipt/${notification.receiptId}`, '_blank');
        } else {
          window.open('/admin/fraud-alerts', '_blank');
        }
        break;
      case "receipt_reminder":
        window.open('/employee/dashboard', '_blank');
        break;
      case "receipt_pending":
        if (notification.receiptId) {
          window.open(`/employee/verify-receipt/${notification.receiptId}`, '_blank');
        } else {
          window.open('/employee/dashboard', '_blank');
        }
        break;
      case "receipt_rejected":
        if (notification.receiptId) {
          window.open(`/employee/verify-receipt/${notification.receiptId}`, '_blank');
        } else {
          window.open('/employee/dashboard', '_blank');
        }
        break;
      case "system_update":
        alert("System update information displayed");
        break;
      default:
        alert("Processing notification...");
    }
  };

  const clearAllNotifications = () => {
    if (confirm("Are you sure you want to clear all notifications?")) {
      setNotifications([]);
      console.log("All notifications cleared");
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[var(--color-bg)] text-[var(--color-text)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)]">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">Notifications</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">Real-time updates from your expense management activities</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Bell className="h-4 w-4 mr-1" />
            {unreadCount} unread
          </Badge>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={generateRealNotifications}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                'Refresh'
              )}
            </Button>
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
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-[var(--color-text-secondary)] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">No Notifications</h3>
              <p className="text-[var(--color-text-secondary)] mb-4">
                {filter === "all" 
                  ? "No notifications found. All caught up!" 
                  : `No ${filter} notifications found.`
                }
              </p>
              <Button onClick={generateRealNotifications} variant="outline">
                Refresh Notifications
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start space-x-4 p-4 border border-[var(--color-border)] rounded-lg transition-colors ${
                  notification.read ? "bg-[var(--color-bg-secondary)]" : "bg-[var(--color-card)] border-blue-200"
                }`}
              >
                <div className="flex-shrink-0">
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-[var(--color-text)]">{notification.title}</h3>
                    <Badge variant={getPriorityColor(notification.priority)}>
                      {getPriorityIcon(notification.priority)}
                      <span className="ml-1 capitalize">{notification.priority}</span>
                    </Badge>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-2">{notification.message}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{notification.timestamp}</p>
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
          )}
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
            <div className="flex items-center justify-between p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)]">
              <div>
                <h3 className="font-medium text-[var(--color-text)]">Email Notifications</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">Receive notifications via email</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)]">
              <div>
                <h3 className="font-medium text-[var(--color-text)]">Push Notifications</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">Receive push notifications in browser</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)]">
              <div>
                <h3 className="font-medium text-[var(--color-text)]">SMS Notifications</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">Receive critical alerts via SMS</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
