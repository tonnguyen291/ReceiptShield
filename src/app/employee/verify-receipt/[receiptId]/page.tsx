
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getReceiptById, updateReceipt } from '@/lib/receipt-store';
import type { ProcessedReceipt, ReceiptDataItem } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, AlertTriangle, CheckCircle, Loader2, FileEdit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { flagFraudulentReceipt } from '@/ai/flows/flag-fraudulent-receipt';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function VerifyReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [receipt, setReceipt] = useState<ProcessedReceipt | null | undefined>(undefined);
  const [editableItems, setEditableItems] = useState<ReceiptDataItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const receiptId = params.receiptId as string;

  useEffect(() => {
    if (receiptId) {
      const foundReceipt = getReceiptById(receiptId);
      setReceipt(foundReceipt);
      if (foundReceipt) {
        setEditableItems(foundReceipt.items.map(item => ({ ...item }))); // Create a deep copy for editing
      }
    }
  }, [receiptId]);

  const handleItemChange = (id: string, newValue: string) => {
    setEditableItems(prevItems =>
      prevItems.map(item => (item.id === id ? { ...item, value: newValue } : item))
    );
  };

  const handleConfirmAndAnalyze = async (e: FormEvent) => {
    e.preventDefault();
    if (!receipt) return;

    setIsProcessing(true);
    try {
      const receiptDataString = editableItems
        .map(item => `${item.label}: ${item.value}`)
        .join('\n');

      const fraudResult = await flagFraudulentReceipt({
        receiptData: receiptDataString,
        receiptImage: receipt.imageDataUri,
      });

      // Check if any critical values (e.g., 'Date', 'Total Amount') are 'Not found' or empty.
      // This is a basic check; more sophisticated checks could be added.
      const hasMissingCriticalInfo = editableItems.some(item =>
        (item.label.toLowerCase().includes('date') || item.label.toLowerCase().includes('total') || item.label.toLowerCase().includes('amount')) &&
        (item.value.trim() === '' || item.value.toLowerCase() === 'not found')
      );
      
      const finalReceipt: ProcessedReceipt = {
        ...receipt,
        items: editableItems, // Save the edited items
        isFraudulent: fraudResult.fraudulent || hasMissingCriticalInfo,
        fraudProbability: hasMissingCriticalInfo && !fraudResult.fraudulent ? 0.75 : fraudResult.fraudProbability, // Boost probability if user confirmed missing info
        explanation: hasMissingCriticalInfo && !fraudResult.fraudulent 
            ? `User confirmed receipt with missing/problematic critical information (e.g., Date, Total). Original AI Assessment: ${fraudResult.explanation}` 
            : fraudResult.explanation,
      };

      updateReceipt(finalReceipt);

      toast({
        title: 'Receipt Verified & Analyzed!',
        description: 'Redirecting to final details...',
      });
      router.push(`/employee/receipt/${finalReceipt.id}`);
    } catch (error: any) {
      console.error('Error during fraud analysis:', error);
      toast({
        title: 'Analysis Error',
        description: error.message || 'Could not analyze the receipt. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (receipt === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        Loading receipt for verification...
      </div>
    );
  }

  if (receipt === null) {
    return (
      <Card className="max-w-2xl mx-auto my-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-destructive flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2" />
            Receipt Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>The receipt you are looking for could not be found for verification.</p>
          <Button onClick={() => router.push('/employee/dashboard')} className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto my-8 shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-headline flex items-center gap-2">
                <FileEdit className="w-7 h-7 text-primary"/>
                Verify Receipt Data: {receipt.fileName}
            </CardTitle>
            <Button onClick={() => router.back()} variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
        </div>
        <CardDescription>
          Review the AI-extracted information below. Edit any field as necessary, then confirm to proceed with fraud analysis.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleConfirmAndAnalyze}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Receipt Image</h3>
              <div className="border rounded-lg overflow-hidden shadow-md relative bg-muted min-h-[300px] md:min-h-[400px]">
                <Image
                  src={receipt.imageDataUri}
                  alt={`Receipt ${receipt.fileName}`}
                  layout="fill"
                  objectFit="contain"
                  className="p-1"
                  data-ai-hint="receipt full"
                />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-lg mb-2">Extracted Items (Editable)</h3>
              <ScrollArea className="h-[300px] md:h-[400px] pr-3 border rounded-md p-3 bg-muted/30 shadow-inner">
                 {editableItems.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">No items extracted by AI. You can attempt to add them or proceed if the image is unclear.</p>}
                {editableItems.map((item) => (
                  <div key={item.id} className="mb-3">
                    <Label htmlFor={item.id} className="text-sm font-medium text-foreground/90">
                      {item.label}
                    </Label>
                    <Input
                      id={item.id}
                      type="text"
                      value={item.value}
                      onChange={(e) => handleItemChange(item.id, e.target.value)}
                      className="mt-1 text-sm bg-background"
                      disabled={isProcessing}
                    />
                  </div>
                ))}
              </ScrollArea>
               <p className="text-xs text-muted-foreground mt-1 px-1">
                  Ensure key details like Vendor, Total Amount, and Date are accurate. Correct any "Not found" values if visible on the receipt.
                </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => router.push('/employee/dashboard')} disabled={isProcessing}>
            Cancel
          </Button>
          <Button type="submit" disabled={isProcessing || editableItems.length === 0}>
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            {isProcessing ? 'Analyzing...' : 'Confirm & Analyze Fraud'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
