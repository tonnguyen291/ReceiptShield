
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
import { Eye, FileText, Loader2, Pencil, Trash2, ClipboardCheck, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

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
      setReceiptToDelete(null); // Close dialog
    }
  };

  const getStatus = (receipt: ProcessedReceipt): { text: string; variant: "default" | "destructive" | "secondary" } => {
    if (receipt.explanation === "Pending user verification.") {
      return { text: "Pending Verification", variant: "secondary" };
    }
    if (receipt.isFraudulent) {
      return { text: "Flagged", variant: "destructive" };
    }
    return { text: "Clear", variant: "default" };
  };


  return (
    <>
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              Fetching your receipts...
            </div>
          ) : receipts.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
              <FileText className="w-10 h-10 text-primary mb-3" />
              <p>You haven&apos;t uploaded any receipts yet.</p>
              <p className="text-sm">Use the &quot;Upload New Receipt&quot; button to get started!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Upload Date</TableHead>
                  <TableHead className="hidden md:table-cell">Summary Snippet</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => {
                  const status = getStatus(receipt);
                  return (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium max-w-xs truncate">{receipt.fileName}</TableCell>
                      <TableCell className="hidden sm:table-cell">{new Date(receipt.uploadedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-sm truncate">
                        {receipt.summary ? `${receipt.summary.substring(0, 50)}...` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>
                          {status.text}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {status.text === "Pending Verification" ? (
                          <Button variant="outline" size="sm" onClick={() => handleEditOrVerify(receipt.id)} title="Verify Receipt">
                            <ClipboardCheck className="h-4 w-4" />
                          </Button>
                        ) : (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(receipt.id)} title="View Details">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEditOrVerify(receipt.id)} title="Edit Receipt">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(receipt)} title="Delete Receipt">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!receiptToDelete} onOpenChange={(open) => !open && setReceiptToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-destructive" />
                Are you sure you want to delete this receipt?
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
