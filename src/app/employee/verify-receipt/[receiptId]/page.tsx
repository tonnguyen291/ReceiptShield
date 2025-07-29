
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
import { getPredictionFromML, calculateOverallRiskAssessment } from '@/lib/ml-fraud-service';
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
    if (receiptId) {
      const foundReceipt = getReceiptById(receiptId);
      setReceipt(foundReceipt);
      if (foundReceipt) {
        setEditableItems(Array.isArray(foundReceipt.items) ? foundReceipt.items.map(item => ({ ...item })) : []);
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

    const needsAttention = editableItems.some(item =>
        (item.label.toLowerCase().includes("vendor") || item.label.toLowerCase().includes("date") || item.label.toLowerCase().includes("total amount")) &&
        (item.value.toLowerCase().includes("extraction failed") || item.value.toLowerCase().includes("not found - edit me") || item.value.trim() === "")
    );

    if (needsAttention && user?.role === 'employee') { // Only employees get this strict check
        toast({
            title: 'Attention Needed',
            description: 'Please review and edit fields marked "Extraction Failed", "Not found - Edit me", or empty critical fields (Vendor, Date, Total Amount) before proceeding.',
            variant: 'destructive',
        });
        return;
    }

    setIsProcessing(true);
    try {
      // Step 1: Get ML prediction first
      toast({
        title: 'Starting Analysis',
        description: 'Running ML fraud detection model...',
      });

      const mlPrediction = await getPredictionFromML(editableItems);
      
      // Step 2: Get AI fraud detection
      toast({
        title: 'Analysis in Progress',
        description: 'Running AI fraud analysis...',
      });

      const receiptDataString = editableItems
        .map(item => `${item.label}: ${item.value}`)
        .join('\n');

      const aiFraudResult = await flagFraudulentReceipt({
        receiptData: receiptDataString,
        receiptImage: receipt.imageDataUri,
      });

      // Step 3: Check for missing critical information
      const hasMissingCriticalInfo = editableItems.some(item =>
        (item.label.toLowerCase().includes('date') || item.label.toLowerCase().includes('total') || item.label.toLowerCase().includes('amount')) &&
        (item.value.trim() === '' || item.value.toLowerCase() === 'not found' || item.value.toLowerCase().includes("extraction failed") || item.value.toLowerCase().includes("not found - edit me"))
      );

      // Step 4: Create comprehensive fraud analysis
      const fraudAnalysis: FraudAnalysis = {
        ml_prediction: mlPrediction || undefined,
        ai_detection: {
          fraudulent: aiFraudResult.fraudulent,
          fraudProbability: aiFraudResult.fraudProbability,
          explanation: aiFraudResult.explanation
        },
        overall_risk_assessment: calculateOverallRiskAssessment(
          mlPrediction?.risk_level,
          aiFraudResult.fraudProbability
        ),
        analysis_timestamp: new Date().toISOString()
      };

      // Step 5: Determine final fraud status and explanation
      const mlSaysFraud = mlPrediction?.is_fraudulent || false;
      const aiSaysFraud = aiFraudResult.fraudulent;
      const isActuallyFraudulent = mlSaysFraud || aiSaysFraud || hasMissingCriticalInfo;

      let finalExplanation = '';
      if (hasMissingCriticalInfo) {
        finalExplanation = `Flagged due to missing/problematic critical information (e.g., Date, Total). `;
      }
      
      if (mlPrediction) {
        finalExplanation += `ML Model: ${mlPrediction.risk_level} risk (${(mlPrediction.fraud_probability * 100).toFixed(1)}% fraud probability). `;
      } else {
        finalExplanation += `ML Model: Unavailable (server offline). `;
      }
      
      finalExplanation += `AI Analysis: ${aiFraudResult.explanation}`;

      // Step 6: Calculate final fraud probability (weighted average)
      let finalFraudProbability = aiFraudResult.fraudProbability;
      if (mlPrediction) {
        // Average ML and AI probabilities, giving ML slightly more weight
        finalFraudProbability = (mlPrediction.fraud_probability * 0.6) + (aiFraudResult.fraudProbability * 0.4);
      }
      if (hasMissingCriticalInfo) {
        finalFraudProbability = Math.max(finalFraudProbability, 0.75); // Boost if missing info
      }
      
      const finalReceipt: ProcessedReceipt = {
        ...receipt,
        items: editableItems,
        // Legacy fields for backward compatibility
        isFraudulent: isActuallyFraudulent,
        fraudProbability: finalFraudProbability,
        explanation: finalExplanation,
        // New comprehensive analysis
        fraud_analysis: fraudAnalysis,
        status: isActuallyFraudulent ? 'pending_approval' : undefined,
      };

      updateReceipt(finalReceipt);

      toast({
        title: `Receipt ${user?.role === 'manager' ? 'Updated' : 'Verified'} & Analyzed!`,
        description: `ML Risk: ${fraudAnalysis.ml_prediction?.risk_level || 'N/A'}, AI Risk: ${(aiFraudResult.fraudProbability * 100).toFixed(1)}%`,
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
