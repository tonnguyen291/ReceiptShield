"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, Mail, Phone, Shield, CheckCircle, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { getAllUsers } from "@/lib/firebase-auth";
import { getAllReceipts } from "@/lib/receipt-store";
import type { User } from "@/types";
import type { ProcessedReceipt } from "@/types";

// Interface for user with spending data
interface UserWithSpending extends User {
  totalSpending: number;
  receipts: number;
  lastLogin: string;
  department: string;
}

export default function AdminUsersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserWithSpending[]>([]);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalSpending: 0,
    averagePerUser: 0,
    pendingInvitations: 0
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

  // Real-time data fetching functions
  const fetchRealUsersData = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching real users data...');

      // Fetch all users and receipts
      const [allUsers, allReceipts] = await Promise.all([
        getAllUsers(),
        getAllReceipts()
      ]);

      console.log('Fetched data:', { users: allUsers.length, receipts: allReceipts.length });

      // Calculate spending per user
      const userSpendingMap = new Map<string, { totalSpending: number; receipts: number }>();
      
      allReceipts.forEach(receipt => {
        const userEmail = receipt.uploadedBy;
        if (!userSpendingMap.has(userEmail)) {
          userSpendingMap.set(userEmail, { totalSpending: 0, receipts: 0 });
        }
        
        const userData = userSpendingMap.get(userEmail)!;
        userData.receipts++;
        
        // Extract amount from receipt
        const totalItem = receipt.items.find(item => 
          item.label.toLowerCase().includes('total') || 
          item.label.toLowerCase().includes('amount')
        );
        if (totalItem) {
          const match = totalItem.value.match(/\$?(\d+\.?\d*)/);
          userData.totalSpending += match ? parseFloat(match[1]) : 0;
        }
      });

      // Create users with spending data
      const usersWithSpending: UserWithSpending[] = allUsers.map(user => {
        const spendingData = userSpendingMap.get(user.email) || { totalSpending: 0, receipts: 0 };
        
        // Determine department based on role and supervisor
        let department = 'Unassigned';
        if (user.role === 'manager') {
          department = user.name; // Manager's name as department
        } else if (user.supervisorId) {
          const supervisor = allUsers.find(u => u.id === user.supervisorId);
          department = supervisor?.name || 'Unknown';
        }

        // Generate last login date (mock for now - would come from auth logs)
        const lastLogin = user.createdAt ? 
          new Date(user.createdAt).toLocaleDateString() : 
          new Date().toLocaleDateString();

        return {
          ...user,
          totalSpending: spendingData.totalSpending,
          receipts: spendingData.receipts,
          lastLogin,
          department
        };
      });

      // Sort users by total spending (highest first)
      usersWithSpending.sort((a, b) => b.totalSpending - a.totalSpending);

      setUsers(usersWithSpending);

      // Calculate user statistics
      const totalUsers = allUsers.length;
      const activeUsers = allUsers.filter(user => user.status === 'active').length;
      const inactiveUsers = allUsers.filter(user => user.status === 'inactive').length;
      const totalSpending = usersWithSpending.reduce((sum, user) => sum + user.totalSpending, 0);
      const averagePerUser = totalUsers > 0 ? totalSpending / totalUsers : 0;

      setUserStats({
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalSpending,
        averagePerUser,
        pendingInvitations: 0 // TODO: Get from invitations table
      });

      console.log('Users data updated:', {
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalSpending,
        averagePerUser
      });

    } catch (error) {
      console.error('Error fetching users data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchRealUsersData();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[var(--color-bg)] text-[var(--color-text)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-[var(--color-text-secondary)]">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">User Management</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">Real-time user data from your organization</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={fetchRealUsersData}
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
          <Button className="bg-primary hover:bg-primary/90">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>
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
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-[var(--color-text-secondary)] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">No Users Found</h3>
              <p className="text-[var(--color-text-secondary)] mb-4">
                No users found in the database. Try refreshing the data or invite new users.
              </p>
              <Button onClick={fetchRealUsersData} variant="outline">
                Refresh Data
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors bg-[var(--color-card)]">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-[var(--color-text)]">{user.name}</h3>
                      <Badge variant={getStatusColor(user.status)}>
                        {getStatusIcon(user.status)}
                        <span className="ml-1 capitalize">{user.status}</span>
                      </Badge>
                      <Badge variant={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">{user.department}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-[var(--color-text-secondary)]">
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
                    <div className="font-bold text-lg text-[var(--color-text)]">${user.totalSpending.toLocaleString()}</div>
                    <div className="text-sm text-[var(--color-text-secondary)]">{user.receipts} receipts</div>
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
          )}
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