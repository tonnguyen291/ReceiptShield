
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getReceiptById, updateReceipt } from '@/lib/receipt-store';
import type { ProcessedReceipt } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { flagFraudulentReceipt } from '@/ai/flows/flag-fraudulent-receipt';

export default function VerifyReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [receipt, setReceipt] = useState<ProcessedReceipt | null | undefined>(undefined);
  const [editableSummary, setEditableSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const receiptId = params.receiptId as string;

  useEffect(() => {
    if (receiptId) {
      const foundReceipt = getReceiptById(receiptId);
      setReceipt(foundReceipt);
      if (foundReceipt) {
        setEditableSummary(foundReceipt.summary);
      }
    }
  }, [receiptId]);

  const handleConfirmAndAnalyze = async (e: FormEvent) => {
    e.preventDefault();
    if (!receipt) return;

    setIsProcessing(true);
    try {
      const fraudResult = await flagFraudulentReceipt({
        receiptData: editableSummary, // Use the potentially edited summary
        receiptImage: receipt.imageDataUri,
        // transactionHistory: "" // Optional, can be added later
      });

      const isSummaryProblematic = editableSummary.toLowerCase().includes("date or amount not found");
      
      const finalReceipt: ProcessedReceipt = {
        ...receipt,
        summary: editableSummary,
        isFraudulent: fraudResult.fraudulent || isSummaryProblematic,
        fraudProbability: isSummaryProblematic && !fraudResult.fraudulent ? 0.75 : fraudResult.fraudProbability,
        explanation: isSummaryProblematic && !fraudResult.fraudulent ? `User confirmed summary with missing date/amount. Original AI Fraud assessment: ${fraudResult.explanation}` : fraudResult.explanation,
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
    <Card className="max-w-3xl mx-auto my-8 shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-headline">Verify Receipt: {receipt.fileName}</CardTitle>
            <Button onClick={() => router.back()} variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
        </div>
        <CardDescription>
          Review the AI-extracted summary. Edit if necessary, then confirm to proceed with fraud analysis.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleConfirmAndAnalyze}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Receipt Image</h3>
              <div className="border rounded-lg overflow-hidden shadow-md aspect-[3/4] relative bg-muted">
                <Image
                  src={receipt.imageDataUri}
                  alt={`Receipt ${receipt.fileName}`}
                  layout="fill"
                  objectFit="contain"
                  className="p-1"
                  data-ai-hint="receipt scan"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="summary" className="text-lg font-semibold">Extracted Summary (Editable)</Label>
                <Textarea
                  id="summary"
                  value={editableSummary}
                  onChange={(e) => setEditableSummary(e.target.value)}
                  rows={10}
                  className="mt-1 text-sm"
                  disabled={isProcessing}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Please ensure key details like vendor, total amount, and date are accurate.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/employee/dashboard')} disabled={isProcessing}>
            Cancel & Go to Dashboard
          </Button>
          <Button type="submit" disabled={isProcessing || !editableSummary.trim()}>
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
