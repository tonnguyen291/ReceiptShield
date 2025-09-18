'use client';

import { useState } from 'react';
import type { ProcessedReceipt } from '@/types';
import { approveReceipt, rejectReceipt, updateReceipt } from '@/lib/receipt-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, XCircle, MessageSquareText, Loader2, CheckSquare, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface BulkReceiptActionsProps {
  receipts: ProcessedReceipt[];
  onActionComplete: () => void;
}

export function BulkReceiptActions({ receipts, onActionComplete }: BulkReceiptActionsProps) {
  const { toast } = useToast();
  const [selectedReceipts, setSelectedReceipts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [showBulkApproveDialog, setShowBulkApproveDialog] = useState(false);
  const [showBulkRejectDialog, setShowBulkRejectDialog] = useState(false);
  const [showBulkRequestInfoDialog, setShowBulkRequestInfoDialog] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState('');
  const [bulkRequestMessage, setBulkRequestMessage] = useState('');

  const pendingReceipts = receipts.filter(r => r.status !== 'approved' && r.status !== 'rejected');

  const handleSelectAll = () => {
    if (selectedReceipts.size === pendingReceipts.length) {
      setSelectedReceipts(new Set());
    } else {
      setSelectedReceipts(new Set(pendingReceipts.map(r => r.id)));
    }
  };

  const handleSelectReceipt = (receiptId: string) => {
    const newSelected = new Set(selectedReceipts);
    if (newSelected.has(receiptId)) {
      newSelected.delete(receiptId);
    } else {
      newSelected.add(receiptId);
    }
    setSelectedReceipts(newSelected);
  };

  const handleBulkApprove = async () => {
    if (selectedReceipts.size === 0) return;

    setIsLoading(true);
    try {
      const promises = Array.from(selectedReceipts).map(receiptId => 
        approveReceipt(receiptId)
      );
      
      await Promise.all(promises);
      
      toast({
        title: "Receipts Approved",
        description: `${selectedReceipts.size} receipt(s) have been approved.`,
      });
      
      setSelectedReceipts(new Set());
      onActionComplete();
    } catch (error) {
      console.error('Error bulk approving receipts:', error);
      toast({
        title: "Error",
        description: "Failed to approve some receipts. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setShowBulkApproveDialog(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedReceipts.size === 0 || !bulkRejectReason.trim()) return;

    setIsLoading(true);
    try {
      const promises = Array.from(selectedReceipts).map(receiptId => 
        rejectReceipt(receiptId, bulkRejectReason)
      );
      
      await Promise.all(promises);
      
      toast({
        title: "Receipts Rejected",
        description: `${selectedReceipts.size} receipt(s) have been rejected.`,
        variant: 'destructive',
      });
      
      setSelectedReceipts(new Set());
      setBulkRejectReason('');
      onActionComplete();
    } catch (error) {
      console.error('Error bulk rejecting receipts:', error);
      toast({
        title: "Error",
        description: "Failed to reject some receipts. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setShowBulkRejectDialog(false);
    }
  };

  const handleBulkRequestInfo = async () => {
    if (selectedReceipts.size === 0 || !bulkRequestMessage.trim()) return;

    setIsLoading(true);
    try {
      const promises = Array.from(selectedReceipts).map(receiptId => 
        updateReceipt(receiptId, {
          status: 'pending_approval',
          managerNotes: `Request for more information: ${bulkRequestMessage}`,
        })
      );
      
      await Promise.all(promises);
      
      toast({
        title: "Information Requested",
        description: `Request sent for ${selectedReceipts.size} receipt(s).`,
      });
      
      setSelectedReceipts(new Set());
      setBulkRequestMessage('');
      onActionComplete();
    } catch (error) {
      console.error('Error bulk requesting info:', error);
      toast({
        title: "Error",
        description: "Failed to send some requests. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setShowBulkRequestInfoDialog(false);
    }
  };

  if (pendingReceipts.length === 0) {
    return null;
  }

  const allSelected = selectedReceipts.size === pendingReceipts.length;
  const someSelected = selectedReceipts.size > 0;

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className="text-sm font-medium">
              {allSelected ? 'Deselect All' : 'Select All'} ({pendingReceipts.length} pending)
            </span>
          </div>
          {someSelected && (
            <span className="text-sm text-muted-foreground">
              {selectedReceipts.size} selected
            </span>
          )}
        </div>
        
        {someSelected && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setShowBulkApproveDialog(true)}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Approve Selected
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowBulkRejectDialog(true)}
              disabled={isLoading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowBulkRequestInfoDialog(true)}
              disabled={isLoading}
            >
              <MessageSquareText className="h-4 w-4 mr-2" />
              Request Info
            </Button>
          </div>
        )}
      </div>

      {/* Bulk Approve Dialog */}
      <AlertDialog open={showBulkApproveDialog} onOpenChange={setShowBulkApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
              Approve Selected Receipts
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve {selectedReceipts.size} receipt(s)? This action will mark them as approved and notify the employees.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkApprove}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Approve {selectedReceipts.size} Receipts
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Reject Dialog */}
      <AlertDialog open={showBulkRejectDialog} onOpenChange={setShowBulkRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <XCircle className="w-6 h-6 mr-2 text-destructive" />
              Reject Selected Receipts
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting {selectedReceipts.size} receipt(s). The employees will be notified with your feedback.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="bulk-reject-reason">Reason for Rejection</Label>
            <Textarea
              id="bulk-reject-reason"
              placeholder="Please explain why these receipts are being rejected..."
              value={bulkRejectReason}
              onChange={(e) => setBulkRejectReason(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBulkRejectReason('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkReject}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={isLoading || !bulkRejectReason.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Reject {selectedReceipts.size} Receipts
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Request Info Dialog */}
      <Dialog open={showBulkRequestInfoDialog} onOpenChange={setShowBulkRequestInfoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request More Information</DialogTitle>
            <DialogDescription>
              Send a message to employees requesting additional information for {selectedReceipts.size} receipt(s).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk-request-message">Message to Employees</Label>
              <Textarea
                id="bulk-request-message"
                placeholder="Please provide more details about these expenses..."
                value={bulkRequestMessage}
                onChange={(e) => setBulkRequestMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkRequestInfoDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkRequestInfo} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Send Request to {selectedReceipts.size} Employees
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
