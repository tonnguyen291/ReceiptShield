
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
import { ArrowLeft, AlertTriangle, CheckCircle, Loader2, FileEdit, FileType, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { performEnhancedFraudAnalysis } from '@/lib/enhanced-fraud-service';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth
import type { FraudAnalysis } from '@/types';

export default function VerifyReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth(); // Get current user
  const [receipt, setReceipt] = useState<ProcessedReceipt | null | undefined>(undefined);
  const [editableItems, setEditableItems] = useState<ReceiptDataItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const receiptId = params.receiptId as string;

  useEffect(() => {
    const loadReceipt = async () => {
      if (receiptId) {
        try {
          const foundReceipt = await getReceiptById(receiptId);
          setReceipt(foundReceipt);
          if (foundReceipt) {
            setEditableItems(Array.isArray(foundReceipt.items) ? foundReceipt.items.map(item => ({ ...item })) : []);
          }
        } catch (error) {
          console.error('Error loading receipt:', error);
          toast({
            title: 'Error',
            description: 'Failed to load receipt. Please try again.',
            variant: 'destructive',
          });
        }
      }
    };
    
    loadReceipt();
  }, [receiptId, toast]);

  const handleItemChange = (id: string, newValue: string) => {
    setEditableItems(prevItems =>
      prevItems.map(item => (item.id === id ? { ...item, value: newValue } : item))
    );
  };
  
  const openPdfInNewTab = () => {
    if (receipt && isPdf) {
      const pdfUrl = receipt.imageUrl || receipt.imageDataUri;
      window.open(pdfUrl, '_blank');
    }
  };

  const handleConfirmAndAnalyze = async (e: FormEvent) => {
    e.preventDefault();
    if (!receipt) return;

    const needsAttention = editableItems.some(item =>
        (item.label.toLowerCase().includes("vendor") || item.label.toLowerCase().includes("date") || item.label.toLowerCase().includes("total amount")) &&
        (item.value.toLowerCase().includes("extraction failed") || item.value.toLowerCase().includes("not found - edit me") || item.value.trim() === "")
    );

    if (needsAttention && user?.role === 'employee') { // Only employees get this strict check
        toast({
            title: 'Attention Needed',
            description: 'Please review and edit fields marked "Extraction Failed", "Not found - edit me", or empty critical fields (Vendor, Date, Total Amount) before proceeding.',
            variant: 'destructive',
        });
        return;
    }

    setIsProcessing(true);
    try {
      // Check if we have submission ID for enhanced tracking
      if (!receipt.submissionId) {
        throw new Error('Receipt missing submission ID - cannot perform enhanced analysis');
      }

      toast({
        title: 'Starting Enhanced Analysis',
        description: 'Running comprehensive fraud detection...',
      });

      // Perform enhanced fraud analysis
      const fraudResult = await performEnhancedFraudAnalysis(
        editableItems,
        imageSource,
        receipt.submissionId,
        receipt.id
      );
      
      const finalReceipt: ProcessedReceipt = {
        ...receipt,
        items: editableItems,
        // Legacy fields for backward compatibility
        isFraudulent: fraudResult.isFraudulent,
        fraudProbability: fraudResult.fraudProbability,
        explanation: fraudResult.explanation,
        // New comprehensive analysis
        fraud_analysis: fraudResult.analysis,
        status: 'pending_approval', // Always set to pending_approval when employee submits
        isDraft: false, // Clear draft status when resubmitting
      };

      await updateReceipt(finalReceipt);

      toast({
        title: `Receipt ${user?.role === 'manager' ? 'Updated' : 'Verified'} & Analyzed!`,
        description: `Risk Assessment: ${fraudResult.analysis.overall_risk_assessment || 'N/A'}, Confidence: ${(fraudResult.fraudProbability * 100).toFixed(1)}%, Quality: ${fraudResult.riskFactors.imageQuality}`,
      });

      if (user?.role === 'manager') {
        router.push('/manager/dashboard');
      } else {
        router.push(`/employee/receipt/${finalReceipt.id}`);
      }

    } catch (error: any) {
      console.error('Error during fraud analysis:', error);
      toast({
        title: 'Analysis Error',
        description: error.message || 'Could not analyze the receipt. Please try again.',
        variant: 'destructive',
      });
       if (receipt && !receipt.explanation.toLowerCase().includes("error occurred during ai fraud analysis")) {
         const errorReceipt = {
            ...receipt,
            explanation: "A local error occurred while preparing data for fraud analysis. Please check your inputs or try again."
         }
         updateReceipt(errorReceipt);
       }
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
          <Button onClick={() => router.push(user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard')} className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isExtractionEssentiallyFailed = editableItems.length > 0 && editableItems.every(item => item.value.toLowerCase().includes("extraction failed") || item.value.toLowerCase().includes("not found - edit me"));
  const pageTitle = user?.role === 'manager' ? `Review & Edit Receipt: ${receipt.fileName}` : `Verify Receipt Data: ${receipt.fileName}`;
  const submitButtonText = user?.role === 'manager' ? 'Save Changes & Re-analyze' : 'Confirm & Analyze Fraud';
  const imageSource = receipt.imageUrl || receipt.imageDataUri;
  const isPdf = imageSource.startsWith('data:application/pdf') || receipt.fileName.toLowerCase().endsWith('.pdf');

  return (
    <Card className="max-w-4xl mx-auto my-8 shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-headline flex items-center gap-2">
                <FileEdit className="w-7 h-7 text-primary"/>
                {pageTitle}
            </CardTitle>
            <Button onClick={() => router.back()} variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
        </div>
        <CardDescription>
          Review the AI-extracted information below. Edit any field as necessary, then confirm to proceed.
          If fields show "Extraction Failed" or are incorrect, please correct them using the receipt image as a reference.
          {user?.role === 'manager' && " As a manager, saving changes will re-trigger fraud analysis."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleConfirmAndAnalyze}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Receipt Document</h3>
                {isPdf ? (
                    <div className="border rounded-lg shadow-md bg-muted min-h-[300px] md:min-h-[400px] h-full flex flex-col items-center justify-center p-4">
                      <FileType className="w-16 h-16 text-muted-foreground mb-4" />
                      <p className="text-sm text-center mb-4 text-muted-foreground">The preview is not available here due to security restrictions.</p>
                      <Button type="button" onClick={openPdfInNewTab}>
                        <Eye className="mr-2 h-4 w-4" /> View Full PDF
                      </Button>
                    </div>
                ) : (
                  <div className="relative border rounded-lg overflow-hidden shadow-md bg-muted min-h-[300px] md:min-h-[400px] h-full">
                    <Image
                      src={imageSource}
                      alt={`Receipt ${receipt.fileName}`}
                      fill
                      style={{objectFit: 'contain'}}
                      className="p-1"
                      data-ai-hint="receipt full"
                    />
                  </div>
                )}
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-lg mb-2">Extracted Items (Editable)</h3>
              <ScrollArea className="h-[300px] md:h-[400px] pr-3 border rounded-md p-3 bg-muted/30 shadow-inner">
                 {editableItems.length === 0 && (
                  <p className="text-sm text-muted-foreground p-4 text-center">
                    No items were extracted by the AI. This might be due to image quality.
                    Please try uploading a clearer image or a different receipt.
                  </p>
                 )}
                 {isExtractionEssentiallyFailed && editableItems.some(item => item.label === "Note") && (
                    <div className="mb-3 p-3 border border-yellow-500 bg-yellow-500/10 rounded-md">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">{editableItems.find(item => item.label === "Note")?.value}</p>
                    </div>
                 )}

                {editableItems.filter(item => item.label !== "Note").map((item) => (
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
                  Ensure key details like Vendor, Total Amount, and Date are accurate.
                  Correct any "Extraction Failed" or "Not found" values if visible on the receipt.
                </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => router.push(user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard')} disabled={isProcessing}>
            Cancel
          </Button>
          <Button type="submit" disabled={isProcessing || editableItems.length === 0 || editableItems.filter(item => item.label !== "Note").length === 0}>
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            {isProcessing ? 'Processing...' : submitButtonText}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
