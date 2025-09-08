
'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, FileType } from 'lucide-react';
import { summarizeReceipt } from '@/ai/flows/summarize-receipt';
import type { ProcessedReceipt, ReceiptDataItem } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { addReceipt } from '@/lib/receipt-store';
import { fileToDataUri } from '@/lib/utils';

export function ReceiptUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [isPdf, setIsPdf] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 5MB.',
          variant: 'destructive',
        });
        setFile(null);
        setPreview(null);
        setIsPdf(false);
        e.target.value = ''; // Reset file input
        return;
      }
      setFile(selectedFile);
      setIsPdf(selectedFile.type === 'application/pdf');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setPreview(null);
      setIsPdf(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !user || !user.email) {
      toast({
        title: 'Error',
        description: 'Please select a file and ensure you are logged in with a valid user account.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const imageDataUri = await fileToDataUri(file);

      const summaryResult = await summarizeReceipt({ photoDataUri: imageDataUri });
      if (!summaryResult || !summaryResult.items) {
        throw new Error('Failed to summarize receipt. The AI did not return structured items.');
      }
      
      const processedItems: ReceiptDataItem[] = summaryResult.items.map((item, index) => ({
        ...item,
        id: `item-${Date.now()}-${index}`,
      }));

      const initialReceipt: ProcessedReceipt = {
        id: Date.now().toString(),
        fileName: file.name,
        imageDataUri,
        items: processedItems,
        isFraudulent: false,
        fraudProbability: 0,
        explanation: "Pending user verification.",
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.email,
        supervisorId: user.supervisorId, // Add supervisorId to receipt
      };

      addReceipt(initialReceipt);

      toast({
        title: 'Receipt Items Extracted!',
        description: 'Please verify the extracted information.',
      });
      
      setFile(null);
      setPreview(null);
      setIsPdf(false);
      const fileInput = document.getElementById('receipt-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      router.push(`/employee/verify-receipt/${initialReceipt.id}`);

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
        <CardDescription>Submit a photo or PDF of your receipt for AI processing.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="receipt-upload" className="text-base">Receipt Document</Label>
            <Input
              id="receipt-upload"
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              disabled={isProcessing}
            />
            <p className="text-xs text-muted-foreground">Max file size: 5MB. Accepted formats: JPG, PNG, PDF.</p>
          </div>

          {preview && (
            <div className="mt-4 border border-dashed border-border rounded-md p-4 text-center">
              {isPdf ? (
                <div className="flex flex-col items-center justify-center p-4">
                  <FileType className="h-16 w-16 text-muted-foreground" />
                </div>
              ) : (
                <Image
                  src={preview}
                  alt="Receipt preview"
                  width={400}
                  height={400}
                  className="max-w-full max-h-64 object-contain rounded-md mx-auto"
                  data-ai-hint="receipt scan"
                />
              )}
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
            {isProcessing ? 'Processing...' : 'Upload & Extract Data'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}