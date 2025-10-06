"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Target, DollarSign } from "lucide-react";

export default function EmployeeInsightsPage() {
  const [insights, setInsights] = useState([
    {
      id: 1,
      type: "spending_pattern",
      title: "Spending Pattern Analysis",
      description: "Your meal expenses have increased by 25% compared to last month. Consider reviewing your dining choices.",
      impact: "medium",
      actionable: true,
      category: "Meals"
    },
    {
      id: 2,
      type: "budget_alert",
      title: "Budget Alert",
      description: "You've used 85% of your transportation budget. Only $75 remaining for the month.",
      impact: "high",
      actionable: true,
      category: "Transportation"
    },
    {
      id: 3,
      type: "savings_opportunity",
      title: "Savings Opportunity",
      description: "Switching to bulk office supplies could save you 15% on office expenses.",
      impact: "low",
      actionable: true,
      category: "Office Supplies"
    },
    {
      id: 4,
      type: "trend_analysis",
      title: "Positive Trend",
      description: "Your expense submission accuracy has improved by 20% this quarter.",
      impact: "positive",
      actionable: false,
      category: "General"
    }
  ]);

  const [recommendations, setRecommendations] = useState([
    {
      title: "Optimize Meal Expenses",
      description: "Consider meal prep or company cafeteria to reduce dining costs",
      potential_savings: "$200/month",
      difficulty: "Easy"
    },
    {
      title: "Use Public Transportation",
      description: "Switch to monthly transit passes for regular commutes",
      potential_savings: "$150/month",
      difficulty: "Medium"
    },
    {
      title: "Bulk Office Supplies",
      description: "Order office supplies in bulk to get better rates",
      potential_savings: "$50/month",
      difficulty: "Easy"
    }
  ]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      case "positive":
        return "outline";
      default:
        return "outline";
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <Target className="h-4 w-4" />;
      case "low":
        return <Lightbulb className="h-4 w-4" />;
      case "positive":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "default";
      case "Medium":
        return "secondary";
      case "Hard":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
        <p className="text-gray-600 mt-2">Personalized insights and recommendations for your expenses</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {insights.filter(i => i.impact === "high").length}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actionable</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {insights.filter(i => i.actionable).length}
            </div>
            <p className="text-xs text-muted-foreground">Can take action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Potential</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$400</div>
            <p className="text-xs text-muted-foreground">Per month</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Insights</CardTitle>
          <CardDescription>AI-generated insights based on your spending patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {getImpactIcon(insight.impact)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-gray-900">{insight.title}</h3>
                    <Badge variant={getImpactColor(insight.impact)}>
                      {insight.impact}
                    </Badge>
                    <Badge variant="outline">
                      {insight.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                  {insight.actionable && (
                    <Button variant="outline" size="sm">
                      Take Action
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
          <CardDescription>AI-powered suggestions to optimize your spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{rec.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-green-600">{rec.potential_savings}</span>
                    <Badge variant={getDifficultyColor(rec.difficulty)}>
                      {rec.difficulty}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Apply
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}