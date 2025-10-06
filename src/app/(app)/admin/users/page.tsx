"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, Mail, Phone, Shield, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      role: "employee",
      department: "Engineering",
      status: "active",
      avatar: "/avatars/sarah.jpg",
      lastLogin: "2024-01-15",
      totalSpending: 2450,
      receipts: 15
    },
    {
      id: 2,
      name: "Mike Chen",
      email: "mike.chen@company.com",
      role: "manager",
      department: "Product",
      status: "active",
      avatar: "/avatars/mike.jpg",
      lastLogin: "2024-01-14",
      totalSpending: 1890,
      receipts: 12
    },
    {
      id: 3,
      name: "Emily Davis",
      email: "emily.davis@company.com",
      role: "employee",
      department: "Design",
      status: "active",
      avatar: "/avatars/emily.jpg",
      lastLogin: "2024-01-13",
      totalSpending: 1650,
      receipts: 10
    },
    {
      id: 4,
      name: "John Smith",
      email: "john.smith@company.com",
      role: "admin",
      department: "IT",
      status: "active",
      avatar: "/avatars/john.jpg",
      lastLogin: "2024-01-12",
      totalSpending: 0,
      receipts: 0
    },
    {
      id: 5,
      name: "Lisa Wang",
      email: "lisa.wang@company.com",
      role: "employee",
      department: "Marketing",
      status: "inactive",
      avatar: "/avatars/lisa.jpg",
      lastLogin: "2024-01-05",
      totalSpending: 1380,
      receipts: 9
    }
  ]);

  const [userStats, setUserStats] = useState({
    totalUsers: 150,
    activeUsers: 142,
    inactiveUsers: 8,
    totalSpending: 125000,
    averagePerUser: 833.33,
    pendingInvitations: 5
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      case "suspended":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "inactive":
        return <Clock className="h-4 w-4" />;
      case "suspended":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "manager":
        return "default";
      case "employee":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all users in your organization</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Organization wide</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{userStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{userStats.inactiveUsers}</div>
            <p className="text-xs text-muted-foreground">Not logged in recently</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{userStats.pendingInvitations}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      <Badge variant={getStatusColor(user.status)}>
                        {getStatusIcon(user.status)}
                        <span className="ml-1 capitalize">{user.status}</span>
                      </Badge>
                      <Badge variant={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{user.department}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {user.email}
                      </span>
                      <span>Last login: {user.lastLogin}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-bold text-lg">${user.totalSpending.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{user.receipts} receipts</div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Shield className="h-4 w-4 mr-1" />
                        Permissions
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle>User Management Actions</CardTitle>
          <CardDescription>Bulk actions and user management tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <UserPlus className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium mb-1">Invite Users</h3>
              <p className="text-sm text-gray-600 mb-3">Send invitations to new users</p>
              <Button variant="outline" size="sm">Send Invitations</Button>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium mb-1">Manage Permissions</h3>
              <p className="text-sm text-gray-600 mb-3">Update user roles and access</p>
              <Button variant="outline" size="sm">Update Roles</Button>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium mb-1">Bulk Actions</h3>
              <p className="text-sm text-gray-600 mb-3">Perform actions on multiple users</p>
              <Button variant="outline" size="sm">Bulk Actions</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}