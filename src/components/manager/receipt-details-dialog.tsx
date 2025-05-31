'use client';

import Image from 'next/image';
import type { ProcessedReceipt } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '../ui/separator';

interface ReceiptDetailsDialogProps {
  receipt: ProcessedReceipt | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptDetailsDialog({ receipt, isOpen, onClose }: ReceiptDetailsDialogProps) {
  if (!receipt) return null;

  const fraudProbabilityPercent = Math.round(receipt.fraudProbability * 100);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">Receipt Details: {receipt.fileName}</DialogTitle>
          <DialogDescription>
            Uploaded by: {receipt.uploadedBy} on {new Date(receipt.uploadedAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Receipt Image</h3>
              <div className="border rounded-md overflow-hidden shadow-md">
                <Image
                  src={receipt.imageDataUri}
                  alt={`Receipt ${receipt.fileName}`}
                  width={600}
                  height={800}
                  className="w-full h-auto object-contain"
                  data-ai-hint="receipt image"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">Summary</h3>
                <p className="text-sm bg-muted p-3 rounded-md">{receipt.summary || 'No summary available.'}</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold text-lg mb-1">Fraud Analysis</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={receipt.isFraudulent ? 'destructive' : 'default'}>
                      {receipt.isFraudulent ? 'Flagged as Potentially Fraudulent' : 'Looks Clear'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Fraud Probability:</span>
                    <span className={`font-semibold ${fraudProbabilityPercent > 70 ? 'text-destructive' : fraudProbabilityPercent > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {fraudProbabilityPercent}%
                    </span>
                  </div>
                   <div className="space-y-1">
                     <span className="text-sm font-medium">Explanation:</span>
                     <p className="text-xs bg-muted p-2 rounded-md h-32 overflow-y-auto">{receipt.explanation || 'No explanation provided.'}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
