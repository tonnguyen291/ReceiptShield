
'use client';

import Image from 'next/image';
import type { ProcessedReceipt, ReceiptDataItem } from '@/types';
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
import { Info } from 'lucide-react';

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
              <div className="border rounded-md overflow-hidden shadow-md relative min-h-[300px] md:min-h-[400px]">
                <Image
                  src={receipt.imageDataUri}
                  alt={`Receipt ${receipt.fileName}`}
                  layout="fill"
                  objectFit="contain"
                  className="p-1"
                  data-ai-hint="receipt image"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1 flex items-center gap-1">
                  <Info className="w-5 h-5 text-primary"/>
                  Extracted Details
                  </h3>
                <ScrollArea className="h-40 border rounded-md p-1 bg-muted/30">
                  <div className="p-2 space-y-1.5">
                    {receipt.items && receipt.items.length > 0 ? (
                      receipt.items.map((item) => (
                        <div key={item.id} className="text-sm grid grid-cols-3 gap-1 even:bg-muted/20 p-1 rounded">
                          <span className="font-medium col-span-1 truncate pr-1">{item.label}:</span>
                          <span className="col-span-2 text-foreground/90 break-words">{item.value}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground p-2">No specific items were extracted.</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold text-lg mb-1">Fraud Analysis</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-sm">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={receipt.isFraudulent ? 'destructive' : 'default'}>
                      {receipt.isFraudulent ? 'Flagged' : 'Looks Clear'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-sm">
                    <span className="text-sm font-medium">Fraud Probability:</span>
                    <span className={`font-semibold ${fraudProbabilityPercent > 70 ? 'text-destructive' : fraudProbabilityPercent > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {fraudProbabilityPercent}%
                    </span>
                  </div>
                   <div className="space-y-1 p-2 bg-muted/50 rounded-sm">
                     <span className="text-sm font-medium">Explanation:</span>
                     <ScrollArea className="h-28">
                        <p className="text-xs p-1.5 rounded-md min-h-[40px] whitespace-pre-wrap">{receipt.explanation || 'No explanation provided.'}</p>
                     </ScrollArea>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="mt-2">
          <Button onClick={onClose} variant="outline">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
