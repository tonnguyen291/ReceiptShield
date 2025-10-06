"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Eye, CheckCircle, XCircle } from "lucide-react";

export default function AdminFraudAlertsPage() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "Suspicious Amount",
      severity: "high",
      description: "Receipt amount significantly higher than usual spending patterns",
      employee: "John Doe",
      amount: "$2,450.00",
      date: "2024-01-15",
      status: "pending"
    },
    {
      id: 2,
      type: "Duplicate Receipt",
      severity: "medium",
      description: "Similar receipt submitted within 24 hours",
      employee: "Sarah Johnson",
      amount: "$89.99",
      date: "2024-01-14",
      status: "investigating"
    },
    {
      id: 3,
      type: "Unusual Vendor",
      severity: "low",
      description: "First-time submission from new vendor",
      employee: "Mike Chen",
      amount: "$125.50",
      date: "2024-01-13",
      status: "resolved"
    }
  ]);

  const [selectedAlert, setSelectedAlert] = useState<number | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const handleApprove = (id: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, status: "resolved" } : alert
    ));
    // Show success message
    alert(`Alert ${id} approved successfully!`);
  };

  const handleReject = (id: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, status: "rejected" } : alert
    ));
    // Show success message
    alert(`Alert ${id} rejected successfully!`);
  };

  const handleReview = (id: number) => {
    setSelectedAlert(id);
    setIsReviewModalOpen(true);
  };

  const handleBulkAction = (action: string) => {
    const selectedAlerts = alerts.filter(alert => alert.status === "pending");
    if (selectedAlerts.length === 0) {
      alert("No pending alerts to process!");
      return;
    }
    
    if (action === "approve") {
      setAlerts(prev => prev.map(alert => 
        alert.status === "pending" ? { ...alert, status: "resolved" } : alert
      ));
      alert(`Approved ${selectedAlerts.length} alerts!`);
    } else if (action === "reject") {
      setAlerts(prev => prev.map(alert => 
        alert.status === "pending" ? { ...alert, status: "rejected" } : alert
      ));
      alert(`Rejected ${selectedAlerts.length} alerts!`);
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "investigating":
        return "secondary";
      case "resolved":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fraud Detection</h1>
          <p className="text-gray-600 mt-2">Monitor and manage fraud alerts across the organization</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="destructive" className="px-3 py-1">
            <AlertTriangle className="h-4 w-4 mr-1" />
            3 Active Alerts
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Severity</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">8</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">False Positives</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15%</div>
            <p className="text-xs text-muted-foreground">Accuracy rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
          <CardDescription>Process multiple alerts at once</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button 
              onClick={() => handleBulkAction("approve")}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve All Pending
            </Button>
            <Button 
              onClick={() => handleBulkAction("reject")}
              variant="destructive"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject All Pending
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Fraud Alerts</CardTitle>
          <CardDescription>Review and take action on detected fraud patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{alert.type}</h3>
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <Badge variant={getStatusColor(alert.status)}>
                        {alert.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Employee: {alert.employee}</span>
                      <span>Amount: {alert.amount}</span>
                      <span>Date: {alert.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleReview(alert.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleApprove(alert.id)}
                    disabled={alert.status === "resolved"}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleReject(alert.id)}
                    disabled={alert.status === "resolved"}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
