
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProcessedReceipt } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { getAllReceiptsForUser, deleteReceipt } from '@/lib/receipt-store';
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
import { Card, CardContent } from '@/components/ui/card';
import { Eye, FileText, Loader2, Pencil, Trash2, ClipboardCheck, AlertTriangle, ShieldQuestion, CheckCircle, XCircle } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function SubmissionHistoryTable() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [receipts, setReceipts] = useState<ProcessedReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [receiptToDelete, setReceiptToDelete] = useState<ProcessedReceipt | null>(null);

  useEffect(() => {
    if (user?.email) {
      setIsLoading(true);
      const userReceipts = getAllReceiptsForUser(user.email);
      setReceipts(userReceipts);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setReceipts([]);
    }
     const handleStorageChange = () => {
        if (user?.email) {
            const updatedReceipts = getAllReceiptsForUser(user.email);
            setReceipts(updatedReceipts);
        }
     };
     window.addEventListener('storage', handleStorageChange);
     return () => window.removeEventListener('storage', handleStorageChange);

  }, [user?.email]);

  const handleViewDetails = (receiptId: string) => {
    router.push(`/employee/receipt/${receiptId}`);
  };

  const handleEditOrVerify = (receiptId: string) => {
    router.push(`/employee/verify-receipt/${receiptId}`);
  }

  const handleDeleteClick = (receipt: ProcessedReceipt) => {
    setReceiptToDelete(receipt);
  };

  const confirmDelete = () => {
    if (receiptToDelete) {
      deleteReceipt(receiptToDelete.id);
      setReceipts(prevReceipts => prevReceipts.filter(r => r.id !== receiptToDelete.id));
      toast({
        title: "Receipt Deleted",
        description: `Receipt "${receiptToDelete.fileName}" has been successfully deleted.`,
      });
      setReceiptToDelete(null);
    }
  };

  const getStatusBadge = (receipt: ProcessedReceipt): JSX.Element => {
    if (receipt.status === 'approved') {
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle className="w-3 h-3 mr-1"/>Approved</Badge>;
    }
    if (receipt.status === 'rejected') {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1"/>Rejected</Badge>;
    }
    if (receipt.status === 'pending_approval') {
      return <Badge variant="secondary"><ShieldQuestion className="w-3 h-3 mr-1"/>Pending Review</Badge>;
    }
    if (receipt.explanation === "Pending user verification.") {
      return <Badge variant="secondary"><ClipboardCheck className="w-3 h-3 mr-1"/>Pending Verification</Badge>;
    }
    if (receipt.isFraudulent) {
      return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1"/>Flagged</Badge>;
    }
    return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1"/>Clear</Badge>;
  };


  const getSummarySnippet = (receipt: ProcessedReceipt): string => {
    if (receipt.items && receipt.items.length > 0) {
      const vendor = receipt.items.find(item => item.label.toLowerCase() === 'vendor');
      const total = receipt.items.find(item => item.label.toLowerCase().includes('total amount'));
      let snippet = '';
      if (vendor && vendor.value) snippet += `${vendor.value}`;
      if (total && total.value) snippet += (snippet ? ` - ${total.value}` : `${total.value}`);
      
      if (!snippet && receipt.items[0]) {
          snippet = `${receipt.items[0].label}: ${receipt.items[0].value}`;
      }

      if (snippet.length > 50) {
        snippet = snippet.substring(0, 47) + "...";
      }
      return snippet || 'N/A';
    }
    return 'N/A';
  };


  return (
    <>
      {isLoading ? (
        <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          Fetching your receipts...
        </div>
      ) : receipts.length === 0 ? (
        <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
          <FileText className="w-10 h-10 text-primary mb-3" />
          <p>You haven't uploaded any receipts yet.</p>
          <p className="text-sm">Use the &quot;Upload New Receipt&quot; button to get started!</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead className="hidden sm:table-cell">Upload Date</TableHead>
              <TableHead className="hidden md:table-cell">Summary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.map((receipt) => {
              const isPendingEmployeeVerification = receipt.explanation === "Pending user verification.";
              const isActionableByEmployee = isPendingEmployeeVerification || (!receipt.status || receipt.status === 'pending_approval');

              return (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium max-w-[150px] sm:max-w-xs truncate">{receipt.fileName}</TableCell>
                  <TableCell className="hidden sm:table-cell">{new Date(receipt.uploadedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-sm truncate text-muted-foreground">
                    {getSummarySnippet(receipt)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(receipt)}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <TooltipProvider>
                      {isPendingEmployeeVerification ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleEditOrVerify(receipt.id)}>
                              <ClipboardCheck className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Verify Receipt</p></TooltipContent>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(receipt.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>View Details</p></TooltipContent>
                        </Tooltip>
                      )}
                      
                      {isActionableByEmployee && !isPendingEmployeeVerification && receipt.status !== 'approved' && receipt.status !== 'rejected' && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleEditOrVerify(receipt.id)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Edit Receipt</p></TooltipContent>
                        </Tooltip>
                      )}

                      {receipt.status !== 'approved' && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(receipt)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Delete Receipt</p></TooltipContent>
                        </Tooltip>
                      )}
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <AlertDialog open={!!receiptToDelete} onOpenChange={(open) => !open && setReceiptToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-destructive" />
                Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the receipt: <br />
              <strong>{receiptToDelete?.fileName}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReceiptToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
