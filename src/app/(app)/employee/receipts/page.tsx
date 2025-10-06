'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getAllReceiptsForUser } from '@/lib/receipt-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import type { ProcessedReceipt } from '@/types';

export default function EmployeeReceiptsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<ProcessedReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReceipts = async () => {
      if (user?.email) {
        try {
          setIsLoading(true);
          const userReceipts = await getAllReceiptsForUser(user.email);
          setReceipts(userReceipts);
        } catch (err) {
          console.error('Error loading receipts:', err);
          setError('Failed to load receipts. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadReceipts();
  }, [user]);

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending_approval':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'draft':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending_approval':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Pending</Badge>;
      case 'draft':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTotalAmount = (receipt: ProcessedReceipt) => {
    const amountItem = receipt.items?.find(i => 
      i.label.toLowerCase().includes('total amount') || 
      i.label.toLowerCase().includes('amount') ||
      i.label.toLowerCase().includes('total')
    );
    if (!amountItem) return 0;
    const amountValue = parseFloat(amountItem.value.replace(/[^0-9.-]+/g, "") || "0");
    return isNaN(amountValue) ? 0 : amountValue;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
        <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Skeleton */}
          <div className="bg-card rounded-lg shadow-lg border p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>

          {/* Receipts Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="p-4 bg-destructive/10 rounded-lg">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Error Loading Receipts</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-card rounded-lg shadow-lg border p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-headline font-bold tracking-tight text-foreground">
                Receipt History
              </h1>
              <p className="text-muted-foreground text-sm">
                View all your submitted receipts and their status
              </p>
            </div>
          </div>
        </div>

        {/* Receipts List */}
        <div className="space-y-6">
          {receipts.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Receipts Yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't submitted any receipts yet. Start by uploading your first receipt.
                </p>
                <Button onClick={() => router.push('/employee/submit-receipt')}>
                  Submit Your First Receipt
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {receipts.map((receipt) => (
                <Card key={receipt.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          {getStatusIcon(receipt.status)}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold text-foreground">
                            {receipt.fileName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(receipt.uploadedAt), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground">
                            ${getTotalAmount(receipt).toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {receipt.items?.length || 0} items
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(receipt.status)}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/employee/verify-receipt/${receipt.id}`)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {receipts.length > 0 && (
          <Card className="shadow-lg border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-xl">Summary</CardTitle>
              <CardDescription>Overview of your receipt submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{receipts.length}</div>
                  <div className="text-sm text-muted-foreground">Total Receipts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {receipts.filter(r => r.status === 'approved').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {receipts.filter(r => r.status === 'pending_approval').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    ${receipts.reduce((acc, r) => acc + getTotalAmount(r), 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
