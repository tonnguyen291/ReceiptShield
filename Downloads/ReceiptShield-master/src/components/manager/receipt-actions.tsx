'use client';

import { useState } from 'react';
import type { ProcessedReceipt } from '@/types';
import { approveReceipt, rejectReceipt } from '@/lib/receipt-store';
import { updateReceipt } from '@/lib/firebase-receipt-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, MessageSquareText, Loader2 } from 'lucide-react';
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

interface ReceiptActionsProps {
  receipt: ProcessedReceipt;
  onActionComplete: () => void;
  variant?: 'inline' | 'dialog';
}

export function ReceiptActions({ receipt, onActionComplete, variant = 'inline' }: ReceiptActionsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showRequestInfoDialog, setShowRequestInfoDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [requestInfoMessage, setRequestInfoMessage] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  // Safety check for receipt and receipt ID
  if (!receipt) {
    console.error('ReceiptActions: receipt is null/undefined');
    return null;
  }
  
  if (!receipt.id) {
    console.error('ReceiptActions: receipt.id is undefined', {
      receipt,
      receiptKeys: Object.keys(receipt),
      receiptId: receipt.id,
      receiptType: typeof receipt.id
    });
    return null;
  }

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await approveReceipt(receipt.id);
      toast({
        title: "Receipt Approved",
        description: `Receipt "${receipt.fileName}" has been approved.`,
      });
      onActionComplete();
    } catch (error) {
      console.error('Error approving receipt:', error);
      toast({
        title: "Error",
        description: "Failed to approve receipt. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setShowApproveDialog(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection.",
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await rejectReceipt(receipt.id, rejectReason);
      toast({
        title: "Receipt Rejected",
        description: `Receipt "${receipt.fileName}" has been rejected.`,
        variant: 'destructive',
      });
      onActionComplete();
    } catch (error) {
      console.error('Error rejecting receipt:', error);
      toast({
        title: "Error",
        description: "Failed to reject receipt. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setShowRejectDialog(false);
      setRejectReason('');
    }
  };

  const handleRequestInfo = async () => {
    if (!requestInfoMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please provide a message for the employee.",
        variant: 'destructive',
      });
      return;
    }

    // Double-check receipt ID before proceeding
    if (!receipt?.id) {
      console.error('handleRequestInfo: receipt.id is undefined', { receipt });
      toast({
        title: "Error",
        description: "Receipt ID is missing. Please refresh the page and try again.",
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('handleRequestInfo: About to update receipt', {
        receiptId: receipt.id,
        receipt: receipt,
        receiptKeys: Object.keys(receipt)
      });
      
      // Final safety check right before the call
      if (!receipt.id) {
        console.error('CRITICAL: receipt.id is undefined right before updateReceipt call!', {
          receipt,
          receiptKeys: Object.keys(receipt),
          receiptId: receipt.id,
          receiptType: typeof receipt.id
        });
        throw new Error('Receipt ID is missing right before update call');
      }
      
      // Store the ID in a variable to prevent any closure issues
      const receiptIdToUpdate = receipt.id;
      console.log('About to call updateReceipt with ID:', receiptIdToUpdate, 'Type:', typeof receiptIdToUpdate);
      
      await updateReceipt(receiptIdToUpdate, {
        status: 'draft',
        managerNotes: `Request for more information: ${requestInfoMessage}`,
      });
      toast({
        title: "Information Requested",
        description: `Request sent to ${receipt.uploadedBy} for more information.`,
      });
      onActionComplete();
    } catch (error) {
      console.error('Error requesting info:', error);
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setShowRequestInfoDialog(false);
      setRequestInfoMessage('');
    }
  };

  if (receipt.status === 'approved' || receipt.status === 'rejected') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {receipt.status === 'approved' ? 'Approved' : 'Rejected'}
        </span>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowApproveDialog(true)}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowRejectDialog(true)}
            disabled={isLoading}
          >
            <XCircle className="h-4 w-4" />
            Reject
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowRequestInfoDialog(true)}
            disabled={isLoading}
          >
            <MessageSquareText className="h-4 w-4" />
            Request Info
          </Button>
        </div>

        {/* Request Info Dialog */}
        <Dialog open={showRequestInfoDialog} onOpenChange={setShowRequestInfoDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request More Information</DialogTitle>
              <DialogDescription>
                Send a message to {receipt.uploadedBy} requesting additional information about this receipt.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="request-message">Message to Employee</Label>
                <Textarea
                  id="request-message"
                  placeholder="Please provide more details about this expense..."
                  value={requestInfoMessage}
                  onChange={(e) => setRequestInfoMessage(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRequestInfoDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleRequestInfo} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Send Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approve Confirmation Dialog */}
        <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                Approve Receipt
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to approve this receipt? This action will mark it as approved and notify the employee.
                <br />
                <strong>Receipt:</strong> {receipt.fileName}
                <br />
                <strong>Employee:</strong> {receipt.uploadedBy}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Approve
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reject Confirmation Dialog */}
        <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <XCircle className="w-6 h-6 mr-2 text-destructive" />
                Reject Receipt
              </AlertDialogTitle>
              <AlertDialogDescription>
                Please provide a reason for rejecting this receipt. The employee will be notified with your feedback.
                <br />
                <strong>Receipt:</strong> {receipt.fileName}
                <br />
                <strong>Employee:</strong> {receipt.uploadedBy}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="reject-reason">Reason for Rejection</Label>
              <Textarea
                id="reject-reason"
                placeholder="Please explain why this receipt is being rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setRejectReason('')}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReject}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                disabled={isLoading || !rejectReason.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Reject
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Dialog variant - for use in receipt details dialog
  return (
    <div className="flex items-center gap-2 pt-4 border-t">
      <Button
        onClick={() => setShowApproveDialog(true)}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <CheckCircle className="h-4 w-4 mr-2" />
        )}
        Approve
      </Button>
      <Button
        variant="destructive"
        onClick={() => setShowRejectDialog(true)}
        disabled={isLoading}
      >
        <XCircle className="h-4 w-4 mr-2" />
        Reject
      </Button>
      <Button
        variant="outline"
        onClick={() => setShowRequestInfoDialog(true)}
        disabled={isLoading}
      >
        <MessageSquareText className="h-4 w-4 mr-2" />
        Request Info
      </Button>

      {/* Same dialogs as above */}
      <Dialog open={showRequestInfoDialog} onOpenChange={setShowRequestInfoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request More Information</DialogTitle>
            <DialogDescription>
              Send a message to {receipt.uploadedBy} requesting additional information about this receipt.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="request-message">Message to Employee</Label>
              <Textarea
                id="request-message"
                placeholder="Please provide more details about this expense..."
                value={requestInfoMessage}
                onChange={(e) => setRequestInfoMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestInfoDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestInfo} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
              Approve Receipt
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this receipt? This action will mark it as approved and notify the employee.
              <br />
              <strong>Receipt:</strong> {receipt.fileName}
              <br />
              <strong>Employee:</strong> {receipt.uploadedBy}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <XCircle className="w-6 h-6 mr-2 text-destructive" />
              Reject Receipt
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this receipt. The employee will be notified with your feedback.
              <br />
              <strong>Receipt:</strong> {receipt.fileName}
              <br />
              <strong>Employee:</strong> {receipt.uploadedBy}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-reason">Reason for Rejection</Label>
            <Textarea
              id="reject-reason"
              placeholder="Please explain why this receipt is being rejected..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectReason('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={isLoading || !rejectReason.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
