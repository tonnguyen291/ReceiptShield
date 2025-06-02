
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ProcessedReceipt } from '@/types';
import { getFlaggedReceiptsForManager, approveReceipt, rejectReceipt } from '@/lib/receipt-store';
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
import { AlertCircle, CheckCircle, Eye, Loader2, Pencil, XCircle, ShieldQuestion } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function FlaggedReceiptsTable() {
  const [receipts, setReceipts] = useState<ProcessedReceipt[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<ProcessedReceipt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionReceipt, setActionReceipt] = useState<ProcessedReceipt | null>(null);
  const [dialogActionType, setDialogActionType] = useState<'approve' | 'reject' | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const loadReceipts = () => {
    setReceipts(getFlaggedReceiptsForManager());
    setIsLoading(false);
  };

  useEffect(() => {
    loadReceipts();
    const handleStorageChange = () => loadReceipts();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleViewDetails = (receipt: ProcessedReceipt) => {
    setSelectedReceipt(receipt);
    setIsDialogOpen(true);
  };

  const handleEdit = (receiptId: string) => {
    router.push(`/employee/verify-receipt/${receiptId}`); // Using employee page for now
  };

  const openActionDialog = (receipt: ProcessedReceipt, action: 'approve' | 'reject') => {
    setActionReceipt(receipt);
    setDialogActionType(action);
  };

  const confirmAction = () => {
    if (!actionReceipt || !dialogActionType) return;

    if (dialogActionType === 'approve') {
      approveReceipt(actionReceipt.id);
      toast({ title: "Receipt Approved", description: `Receipt "${actionReceipt.fileName}" has been approved.` });
    } else if (dialogActionType === 'reject') {
      rejectReceipt(actionReceipt.id); // Simple reject for now, can add notes later
      toast({ title: "Receipt Rejected", description: `Receipt "${actionReceipt.fileName}" has been rejected.`, variant: 'destructive' });
    }
    loadReceipts(); // Refresh the list
    setActionReceipt(null);
    setDialogActionType(null);
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
               <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              Loading flagged receipts...
            </div>
          ) : receipts.length === 0 ? (
             <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
              <ShieldQuestion className="mx-auto h-12 w-12 text-primary mb-4" />
              <p>No receipts are currently pending your review.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Fraud Probability</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium truncate max-w-[200px] sm:max-w-xs">{receipt.fileName}</TableCell>
                    <TableCell className="truncate max-w-[150px] sm:max-w-xs">{receipt.uploadedBy}</TableCell>
                    <TableCell className="hidden sm:table-cell">{new Date(receipt.uploadedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={receipt.fraudProbability * 100} className="w-20 h-2" 
                          indicatorClassName={
                            receipt.fraudProbability * 100 > 70 ? 'bg-destructive' :
                            receipt.fraudProbability * 100 > 40 ? 'bg-yellow-500' : 'bg-green-500'
                          }
                        />
                        <span className="text-xs">{Math.round(receipt.fraudProbability * 100)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={receipt.status === 'pending_approval' ? 'secondary' : 'default'}>
                        {receipt.status === 'pending_approval' ? 'Pending Review' : receipt.status || 'Flagged'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(receipt)} title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                       <Button variant="ghost" size="sm" onClick={() => handleEdit(receipt.id)} title="Edit Receipt">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openActionDialog(receipt, 'approve')} title="Approve Receipt" className="text-green-600 hover:text-green-700">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openActionDialog(receipt, 'reject')} title="Reject Receipt" className="text-red-600 hover:text-red-700">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <ReceiptDetailsDialog
        receipt={selectedReceipt}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
      <AlertDialog open={!!actionReceipt} onOpenChange={(open) => !open && (setActionReceipt(null), setDialogActionType(null))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
                <AlertCircle className={`w-6 h-6 mr-2 ${dialogActionType === 'reject' ? 'text-destructive' : 'text-green-600'}`} />
                Confirm {dialogActionType === 'approve' ? 'Approval' : 'Rejection'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {dialogActionType} the receipt: <br />
              <strong>{actionReceipt?.fileName}</strong> from {actionReceipt?.uploadedBy}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => (setActionReceipt(null), setDialogActionType(null))}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={dialogActionType === 'reject' ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : "bg-green-600 hover:bg-green-700 text-white"}
            >
              {dialogActionType === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

