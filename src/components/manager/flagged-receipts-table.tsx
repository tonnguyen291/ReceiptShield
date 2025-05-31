'use client';

import { useState, useEffect } from 'react';
import type { ProcessedReceipt } from '@/types';
import { getFlaggedReceiptsForManager } from '@/lib/receipt-store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ReceiptDetailsDialog } from './receipt-details-dialog';
import { AlertCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function FlaggedReceiptsTable() {
  const [receipts, setReceipts] = useState<ProcessedReceipt[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<ProcessedReceipt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ensure this runs client-side
    const loadReceipts = () => {
      setReceipts(getFlaggedReceiptsForManager());
      setIsLoading(false);
    };
    loadReceipts();
    
    // Optional: Listen for storage changes to update table dynamically
    const handleStorageChange = () => loadReceipts();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);

  }, []);

  const handleViewDetails = (receipt: ProcessedReceipt) => {
    setSelectedReceipt(receipt);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading flagged receipts...</div>;
  }

  if (receipts.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl font-headline">No Flagged Receipts</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">There are currently no receipts flagged for review.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-2xl font-headline">Flagged Receipts for Review</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead className="hidden md:table-cell">Uploaded By</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead>Fraud Probability</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium truncate max-w-xs">{receipt.fileName}</TableCell>
                  <TableCell className="hidden md:table-cell">{receipt.uploadedBy}</TableCell>
                  <TableCell className="hidden sm:table-cell">{new Date(receipt.uploadedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={receipt.fraudProbability * 100} className="w-24 h-2" 
                        indicatorClassName={
                          receipt.fraudProbability * 100 > 70 ? 'bg-destructive' :
                          receipt.fraudProbability * 100 > 40 ? 'bg-yellow-500' : 'bg-green-500'
                        }
                      />
                      <span>{Math.round(receipt.fraudProbability * 100)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={receipt.isFraudulent ? 'destructive' : 'default'}>
                      {receipt.isFraudulent ? 'Flagged' : 'Clear'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(receipt)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ReceiptDetailsDialog
        receipt={selectedReceipt}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
