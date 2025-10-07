"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, AlertTriangle, CheckCircle, DollarSign, TrendingUp } from "lucide-react";

export default function EmployeeBudgetPage() {
  const [budgets, setBudgets] = useState([
    {
      category: "Meals",
      allocated: 1000,
      spent: 750,
      remaining: 250,
      percentage: 75
    },
    {
      category: "Transportation",
      allocated: 500,
      spent: 320,
      remaining: 180,
      percentage: 64
    },
    {
      category: "Office Supplies",
      allocated: 300,
      spent: 280,
      remaining: 20,
      percentage: 93
    },
    {
      category: "Training",
      allocated: 200,
      spent: 150,
      remaining: 50,
      percentage: 75
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingBudget, setEditingBudget] = useState<{category: string, allocated: number} | null>(null);

  const handleEditBudget = (category: string, allocated: number) => {
    setEditingBudget({ category, allocated });
    setIsEditing(true);
  };

  const handleSaveBudget = (newAmount: number) => {
    if (editingBudget) {
      setBudgets(prev => prev.map(budget => 
        budget.category === editingBudget.category 
          ? { 
              ...budget, 
              allocated: newAmount, 
              remaining: newAmount - budget.spent,
              percentage: (budget.spent / newAmount) * 100
            }
          : budget
      ));
      setIsEditing(false);
      setEditingBudget(null);
      alert(`Budget updated for ${editingBudget.category}: $${newAmount}`);
    }
  };

  const handleSetAlert = (category: string) => {
    const budget = budgets.find(b => b.category === category);
    if (budget) {
      alert(`Alert set for ${category} at 80% of budget ($${budget.allocated * 0.8})`);
    }
  };

  const handleResetBudget = (category: string) => {
    if (confirm(`Reset budget for ${category}? This will set spent amount to 0.`)) {
      setBudgets(prev => prev.map(budget => 
        budget.category === category 
          ? { 
              ...budget, 
              spent: 0, 
              remaining: budget.allocated,
              percentage: 0
            }
          : budget
      ));
      alert(`Budget reset for ${category}`);
    }
  };

  const totalAllocated = budgets.reduce((sum, budget) => sum + budget.allocated, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overallPercentage = (totalSpent / totalAllocated) * 100;

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return "destructive";
    if (percentage >= 75) return "default";
    return "secondary";
  };

  const getStatusText = (percentage: number) => {
    if (percentage >= 90) return "Over Budget";
    if (percentage >= 75) return "Near Limit";
    return "On Track";
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Budget Overview</h1>
        <p className="text-gray-600 mt-2">Track your spending against allocated budgets</p>
      </div>

      {/* Overall Budget Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Overall Budget Status</span>
          </CardTitle>
          <CardDescription>Your total budget allocation and spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">${totalAllocated.toLocaleString()}</div>
              <p className="text-sm text-[var(--color-text-secondary)]">Total Allocated</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">${totalSpent.toLocaleString()}</div>
              <p className="text-sm text-[var(--color-text-secondary)]">Total Spent</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">${totalRemaining.toLocaleString()}</div>
              <p className="text-sm text-[var(--color-text-secondary)]">Remaining</p>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-[var(--color-text-secondary)]">{overallPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={overallPercentage} className="h-2" />
            <div className="flex items-center justify-between mt-2">
              <Badge variant={getStatusColor(overallPercentage)}>
                {getStatusText(overallPercentage)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {budgets.map((budget, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{budget.category}</span>
                <Badge variant={getStatusColor(budget.percentage)}>
                  {getStatusText(budget.percentage)}
                </Badge>
              </CardTitle>
              <CardDescription>
                ${budget.spent.toLocaleString()} of ${budget.allocated.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-[var(--color-text-secondary)]">{budget.percentage}%</span>
                  </div>
                  <Progress value={budget.percentage} className="h-2" />
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">${budget.allocated}</div>
                    <p className="text-xs text-[var(--color-text-secondary)]">Allocated</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">${budget.spent}</div>
                    <p className="text-xs text-[var(--color-text-secondary)]">Spent</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">${budget.remaining}</div>
                    <p className="text-xs text-[var(--color-text-secondary)]">Remaining</p>
                  </div>
                </div>

                {budget.percentage >= 90 && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">Approaching budget limit</span>
                  </div>
                )}

                {budget.percentage < 75 && (
                  <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">On track with budget</span>
                  </div>
                )}

                <div className="flex space-x-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditBudget(budget.category, budget.allocated)}
                  >
                    Edit Budget
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSetAlert(budget.category)}
                  >
                    Set Alert
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleResetBudget(budget.category)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Budget Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Budget Tips</span>
          </CardTitle>
          <CardDescription>Helpful suggestions to manage your expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-600">Track your daily expenses to stay within budget</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-600">Set up alerts when you reach 80% of your budget</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-600">Review your spending patterns monthly to optimize allocations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}