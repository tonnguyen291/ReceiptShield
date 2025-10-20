"use client";

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <Card className={cn("origin-card", className)}>
      <CardHeader>
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}

interface LoadingGridProps {
  count?: number;
  className?: string;
}

export function LoadingGrid({ count = 4, className }: LoadingGridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}

interface LoadingTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function LoadingTable({ rows = 5, columns = 4, className }: LoadingTableProps) {
  return (
    <Card className={cn("origin-card", className)}>
      <CardHeader>
        <Skeleton className="h-6 w-1/4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex items-center space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton 
                  key={colIndex} 
                  className={cn(
                    "h-4",
                    colIndex === 0 ? "w-1/4" : 
                    colIndex === 1 ? "w-1/3" : 
                    colIndex === 2 ? "w-1/6" : "w-1/5"
                  )} 
                />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface LoadingListProps {
  items?: number;
  className?: string;
}

export function LoadingList({ items = 5, className }: LoadingListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

interface LoadingChartProps {
  className?: string;
}

export function LoadingChart({ className }: LoadingChartProps) {
  // Use consistent heights to avoid hydration issues
  const barHeights = [40, 27, 95, 64, 29, 63, 31];
  
  return (
    <Card className={cn("origin-card", className)}>
      <CardHeader>
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end space-x-2 h-32">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton 
                key={i} 
                className="w-8 bg-primary/20" 
                style={{ height: `${barHeights[i]}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary",
        sizeClasses[size]
      )} />
    </div>
  );
}

interface LoadingButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function LoadingButton({ loading, children, className }: LoadingButtonProps) {
  return (
    <div className={cn("relative", className)}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
          <LoadingSpinner size="sm" />
        </div>
      )}
      {children}
    </div>
  );
}

interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ loading, children, message = "Loading...", className }: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center space-y-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
