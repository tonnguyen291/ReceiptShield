"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface OriginDashboardCardProps {
  title: string;
  subtitle?: string;
  value?: string | number;
  change?: {
    value: number;
    type: "positive" | "negative" | "neutral";
  };
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function OriginDashboardCard({
  title,
  subtitle,
  value,
  change,
  icon,
  children,
  className,
  onClick
}: OriginDashboardCardProps) {
  const changeColor = change?.type === "positive" 
    ? "text-green-600" 
    : change?.type === "negative" 
    ? "text-red-600" 
    : "text-muted-foreground";

  return (
    <Card 
      className={cn(
        "origin-card cursor-pointer group",
        onClick && "hover:shadow-lg transition-all duration-200",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon && (
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {icon}
              </div>
            )}
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
              </CardTitle>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {value && (
          <div className="space-y-2">
            <div className="text-2xl font-bold text-foreground">
              {value}
            </div>
            {change && (
              <div className={cn("text-sm font-medium", changeColor)}>
                {change.value > 0 ? "+" : ""}{change.value}%
              </div>
            )}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

interface OriginSummaryCardProps {
  title: string;
  amount: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    period: string;
  };
  icon?: ReactNode;
  className?: string;
}

export function OriginSummaryCard({
  title,
  amount,
  subtitle,
  trend,
  icon,
  className
}: OriginSummaryCardProps) {
  return (
    <Card className={cn("origin-card", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{amount}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <p className="text-sm text-muted-foreground">
                {trend.value > 0 ? "+" : ""}{trend.value}% {trend.period}
              </p>
            )}
          </div>
          {icon && (
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface OriginInsightCardProps {
  title: string;
  description: string;
  value: string | number;
  status: "success" | "warning" | "error" | "info";
  icon?: ReactNode;
  action?: ReactNode;
}

export function OriginInsightCard({
  title,
  description,
  value,
  status,
  icon,
  action
}: OriginInsightCardProps) {
  const statusColors = {
    success: "text-green-600 bg-green-50 border-green-200",
    warning: "text-orange-600 bg-orange-50 border-orange-200", 
    error: "text-red-600 bg-red-50 border-red-200",
    info: "text-blue-600 bg-blue-50 border-blue-200"
  };

  return (
    <Card className={cn("origin-card border-l-4", statusColors[status])}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {icon && (
                <div className="p-1 rounded text-current">
                  {icon}
                </div>
              )}
              <h3 className="font-semibold text-sm">{title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
            <p className="text-lg font-bold text-current">{value}</p>
          </div>
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
