"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, DollarSign, Calendar, Tag, CheckCircle, Clock, XCircle, Search, Filter, SortAsc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EmployeeSpendingPage() {
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      vendor: "Starbucks Coffee",
      amount: 12.50,
      date: "2024-01-15",
      category: "Meals",
      status: "approved",
      receipt: "receipt_001.jpg"
    },
    {
      id: 2,
      vendor: "Uber",
      amount: 25.30,
      date: "2024-01-14",
      category: "Transportation",
      status: "pending",
      receipt: "receipt_002.jpg"
    },
    {
      id: 3,
      vendor: "Office Depot",
      amount: 89.99,
      date: "2024-01-13",
      category: "Office Supplies",
      status: "approved",
      receipt: "receipt_003.jpg"
    },
    {
      id: 4,
      vendor: "Amazon",
      amount: 156.75,
      date: "2024-01-12",
      category: "Office Supplies",
      status: "rejected",
      receipt: "receipt_004.jpg"
    }
  ]);

  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");

  const handleViewReceipt = (receiptId: string) => {
    alert(`Opening receipt: ${receiptId}`);
    // In a real app, this would open a modal or navigate to receipt detail
  };

  const handleResubmit = (transactionId: number) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
      alert(`Resubmitting transaction: ${transaction.vendor} - $${transaction.amount}`);
      // In a real app, this would open a resubmission form
    }
  };

  const handleDelete = (transactionId: number) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
      alert("Transaction deleted successfully!");
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === "all" || transaction.status === filter;
    const matchesSearch = transaction.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortBy) {
      case "amount":
        return b.amount - a.amount;
      case "vendor":
        return a.vendor.localeCompare(b.vendor);
      case "date":
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

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
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const totalSpent = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const approvedAmount = transactions
    .filter(t => t.status === "approved")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const pendingAmount = transactions
    .filter(t => t.status === "pending")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const rejectedAmount = transactions
    .filter(t => t.status === "rejected")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Spending History</h1>
        <p className="text-gray-600 mt-2">Track your expense submissions and their status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${approvedAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Reimbursed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Under review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${rejectedAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Not approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find and organize your transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date (Newest)</SelectItem>
                <SelectItem value="amount">Amount (Highest)</SelectItem>
                <SelectItem value="vendor">Vendor (A-Z)</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setFilter("all");
                setSortBy("date");
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest expense submissions and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Receipt className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{transaction.vendor}</h3>
                      <Badge variant={getStatusColor(transaction.status)}>
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1 capitalize">{transaction.status}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {transaction.date}
                      </span>
                      <span className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        {transaction.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-bold text-lg">${transaction.amount.toFixed(2)}</div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewReceipt(transaction.receipt)}
                    >
                      View Receipt
                    </Button>
                    {transaction.status === "rejected" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleResubmit(transaction.id)}
                      >
                        Resubmit
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}