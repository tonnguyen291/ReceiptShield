'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';
import { summarizeReceipt } from '@/ai/flows/summarize-receipt';
import { flagFraudulentReceipt } from '@/ai/flows/flag-fraudulent-receipt';
import type { ProcessedReceipt } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { addReceipt } from '@/lib/receipt-store';
import { fileToDataUri } from '@/lib/utils';

export function ReceiptUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 5MB.',
          variant: 'destructive',
        });
        setFile(null);
        setPreview(null);
        e.target.value = ''; // Reset file input
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !user) {
      toast({
        title: 'Error',
        description: 'Please select a file and ensure you are logged in.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const imageDataUri = await fileToDataUri(file);

      const summaryResult = await summarizeReceipt({ photoDataUri: imageDataUri });
      if (!summaryResult || !summaryResult.summary) {
        throw new Error('Failed to summarize receipt. The summary was empty.');
      }
      
      // If summary contains "Date or amount not found", flag as potentially problematic
      // This is a simple heuristic, a more robust check might be needed.
      const isSummaryProblematic = summaryResult.summary.toLowerCase().includes("date or amount not found");

      const fraudResult = await flagFraudulentReceipt({
        receiptData: summaryResult.summary,
        receiptImage: imageDataUri,
      });
      
      const newReceipt: ProcessedReceipt = {
        id: Date.now().toString(),
        fileName: file.name,
        imageDataUri,
        summary: summaryResult.summary,
        isFraudulent: fraudResult.fraudulent || isSummaryProblematic, // Also flag if summary is problematic
        fraudProbability: isSummaryProblematic && !fraudResult.fraudulent ? 0.75 : fraudResult.fraudProbability, // Assign higher probability if summary problematic
        explanation: isSummaryProblematic && !fraudResult.fraudulent ? `AI flagged: ${fraudResult.explanation}. Human attention needed: Receipt summary indicates missing date or amount. Original AI Fraud assessment: ${fraudResult.explanation}` : fraudResult.explanation,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.email,
      };

      addReceipt(newReceipt);

      toast({
        title: 'Receipt Uploaded',
        description: `Summary: ${newReceipt.summary}. Fraudulent: ${newReceipt.isFraudulent ? 'Yes' : 'No'}.`,
      });
      setFile(null);
      setPreview(null);
      // Reset the file input visually
      const fileInput = document.getElementById('receipt-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error('Error processing receipt:', error);
      toast({
        title: 'Processing Error',
        description: error.message || 'Could not process the receipt. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Upload Expense Receipt</CardTitle>
        <CardDescription>Submit a photo of your receipt for processing.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="receipt-upload" className="text-base">Receipt Image</Label>
            <Input
              id="receipt-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              disabled={isProcessing}
            />
            <p className="text-xs text-muted-foreground">Max file size: 5MB. Accepted formats: JPG, PNG, GIF.</p>
          </div>

          {preview && (
            <div className="mt-4 border border-dashed border-border rounded-md p-4 text-center">
              <Image
                src={preview}
                alt="Receipt preview"
                width={400}
                height={400}
                className="max-w-full max-h-64 object-contain rounded-md mx-auto"
                data-ai-hint="receipt scan"
              />
              <p className="text-sm text-muted-foreground mt-2">{file?.name}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={!file || isProcessing}>
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 h-4 w-4" />
            )}
            {isProcessing ? 'Processing...' : 'Upload and Process Receipt'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
