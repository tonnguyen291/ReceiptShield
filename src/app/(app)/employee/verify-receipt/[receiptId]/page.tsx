
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
// import { performEnhancedFraudAnalysis } from '@/lib/enhanced-fraud-service'; // Temporarily disabled
import { extractTextWithTesseract } from '@/lib/tesseract-ocr-service';
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
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
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

  const convertImageToDataUri = async (imageUrl: string): Promise<string> => {
    try {
      // If it's already a data URI, return it
      if (imageUrl.startsWith('data:')) {
        console.log('✅ Image is already a data URI');
        return imageUrl;
      }

      console.log('🔄 Converting image URL to data URI:', imageUrl.substring(0, 100) + '...');

      // Try different fetch strategies for Firebase Storage URLs
      let response: Response;
      
      try {
        // First try: Standard fetch with CORS
        response = await fetch(imageUrl, {
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Accept': 'image/*'
          }
        });
      } catch (corsError) {
        console.warn('CORS fetch failed, trying proxy endpoint:', corsError);
        
        // Second try: Use our proxy endpoint to avoid CORS issues
        if (imageUrl.includes('firebasestorage.googleapis.com')) {
          try {
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
            console.log('🔄 Using proxy endpoint:', proxyUrl);
            response = await fetch(proxyUrl);
          } catch (proxyError) {
            console.warn('Proxy fetch failed, trying no-cors mode:', proxyError);
            
            // Third try: No-cors mode (limited but might work)
            response = await fetch(imageUrl, {
              mode: 'no-cors',
              credentials: 'omit'
            });
          }
        } else {
          // For non-Firebase URLs, try no-cors mode
          response = await fetch(imageUrl, {
            mode: 'no-cors',
            credentials: 'omit'
          });
        }
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Image fetched successfully, converting to blob...');
      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('Received empty image blob');
      }

      console.log('✅ Image blob created, size:', blob.size, 'bytes');

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          console.log('✅ Image converted to data URI successfully');
          resolve(reader.result as string);
        };
        reader.onerror = (error) => {
          console.error('❌ FileReader error:', error);
          reject(new Error('Failed to convert image blob to data URI'));
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ Error converting image to data URI:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          if (imageUrl.includes('firebasestorage.googleapis.com')) {
            throw new Error('Cannot access Firebase Storage image. This might be due to CORS restrictions. Try uploading the image again or contact support.');
          }
          throw new Error('Cannot access image URL. This might be due to CORS restrictions or network issues.');
        }
        if (error.message.includes('CORS')) {
          throw new Error('Image access blocked by CORS policy. The image URL may not be accessible from this domain.');
        }
        throw new Error(`Image processing failed: ${error.message}`);
      }
      
      throw new Error('Failed to prepare image for OCR processing');
    }
  };

  const handleTesseractOCR = async () => {
    if (!receipt) return;
    
    setIsOcrProcessing(true);
    setOcrProgress(0);
    
    try {
      toast({
        title: 'Starting Tesseract OCR',
        description: 'Preparing image and extracting text...',
      });

      const imageSource = receipt.imageUrl || receipt.imageDataUri;
      if (!imageSource) {
        throw new Error('No image available for OCR processing');
      }

      console.log('🔍 Tesseract OCR - Image source:', {
        hasImageUrl: !!receipt.imageUrl,
        hasImageDataUri: !!receipt.imageDataUri,
        imageSourceType: imageSource.startsWith('data:') ? 'data-uri' : 'url',
        imageSourceLength: imageSource.length
      });

      // Convert image to data URI format for Tesseract
      setOcrProgress(10);
      const dataUri = await convertImageToDataUri(imageSource);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setOcrProgress(prev => Math.min(prev + 5, 90));
      }, 200);

      const ocrResult = await extractTextWithTesseract(dataUri);
      
      clearInterval(progressInterval);
      setOcrProgress(100);

      // Update the editable items with Tesseract results
      setEditableItems(ocrResult.items);

      toast({
        title: 'OCR Complete!',
        description: `Extracted ${ocrResult.items.length} items with ${Math.round(ocrResult.confidence * 100)}% confidence`,
      });

    } catch (error) {
      console.error('Tesseract OCR failed:', error);
      toast({
        title: 'OCR Failed',
        description: error instanceof Error ? error.message : 'Failed to extract text from image',
        variant: 'destructive',
      });
    } finally {
      setIsOcrProcessing(false);
      setOcrProgress(0);
    }
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
      toast({
        title: 'Starting Analysis',
        description: 'Running fraud detection...',
      });

      // Get ML prediction
      let mlPrediction = null;
      try {
        console.log('🤖 Calling ML prediction API...');
        
        // Prepare receipt data for ML model
        const receiptData = {
          amount: editableItems.find(item => 
            item.label.toLowerCase().includes('total') || 
            item.label.toLowerCase().includes('amount')
          )?.value || '0',
          merchant: editableItems.find(item => 
            item.label.toLowerCase().includes('vendor') || 
            item.label.toLowerCase().includes('store')
          )?.value || 'Unknown',
          category: 'Business Expense', // Default category
          items: editableItems
        };

        const mlResponse = await fetch('/api/ml-predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(receiptData)
        });

        if (mlResponse.ok) {
          const mlData = await mlResponse.json();
          mlPrediction = mlData.prediction;
          console.log('✅ ML prediction received:', mlPrediction);
        } else {
          console.warn('⚠️ ML prediction failed:', mlResponse.status);
        }
      } catch (mlError) {
        console.warn('⚠️ ML prediction error:', mlError);
      }

      // Create fraud analysis with ML prediction
      const fraudResult = {
        isFraudulent: mlPrediction?.is_fraudulent || false,
        fraudProbability: mlPrediction?.fraud_probability || 0.1,
        explanation: mlPrediction ? 
          `ML Analysis: ${mlPrediction.risk_level} risk (${(mlPrediction.fraud_probability * 100).toFixed(1)}% fraud probability)` :
          'Receipt processed successfully. No fraud detected.',
        riskFactors: {
          imageQuality: 'good' as const,
          extractionConfidence: 'high' as const,
          vendorVerification: 'unknown' as const,
          amountReasonableness: 'normal' as const,
        },
        duplicateDetection: {
          isDuplicate: false,
          similarSubmissions: [],
          similarityScore: 0,
        },
        analysis: {
          submissionId: receipt.id,
          receiptId: receipt.id,
          ml_prediction: mlPrediction,
          overall_risk_assessment: (mlPrediction?.risk_level || 'LOW') as 'LOW' | 'MEDIUM' | 'HIGH',
          analysis_timestamp: new Date().toISOString(),
          duplicateDetection: {
            isDuplicate: false,
            similarSubmissions: [],
            similarityScore: 0,
          },
          riskFactors: {
            imageQuality: 'good' as const,
            extractionConfidence: 'high' as const,
            vendorVerification: 'unknown' as const,
            amountReasonableness: 'normal' as const,
          },
        }
      };
      
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
        description: `ML Analysis: ${fraudResult.analysis.overall_risk_assessment || 'LOW'} risk (${(fraudResult.fraudProbability * 100).toFixed(1)}% fraud probability)`,
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
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-[var(--color-bg)] text-[var(--color-text)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        Loading receipt for verification...
      </div>
    );
  }

  if (receipt === null) {
    return (
      <Card className="max-w-2xl mx-auto my-8 shadow-lg bg-[var(--color-card)] border-[var(--color-border)]">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-destructive flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2" />
            Receipt Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[var(--color-text)]">The receipt you are looking for could not be found for verification.</p>
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
  const isPdf = imageSource?.startsWith('data:application/pdf') || receipt.fileName.toLowerCase().endsWith('.pdf');

  return (
    <Card className="max-w-4xl mx-auto my-8 shadow-xl bg-[var(--color-card)] border-[var(--color-border)]">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-headline flex items-center gap-2 text-[var(--color-text)]">
                <FileEdit className="w-7 h-7 text-primary"/>
                {pageTitle}
            </CardTitle>
            <Button onClick={() => router.back()} variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
        </div>
        <CardDescription className="text-[var(--color-text-secondary)]">
          Review the extracted information below. Edit any field as necessary, then confirm to proceed.
          If fields show "Extraction Failed" or are incorrect, use the "Re-extract with Tesseract" button to try Tesseract OCR, or correct them manually using the receipt image as a reference.
          {user?.role === 'manager' && " As a manager, saving changes will re-trigger fraud analysis."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleConfirmAndAnalyze}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2 text-[var(--color-text)]">Receipt Document</h3>
                {isPdf ? (
                    <div className="border border-[var(--color-border)] rounded-lg shadow-md bg-[var(--color-bg-secondary)] min-h-[300px] md:min-h-[400px] h-full flex flex-col items-center justify-center p-4">
                      <FileType className="w-16 h-16 text-[var(--color-text-secondary)] mb-4" />
                      <p className="text-sm text-center mb-4 text-[var(--color-text-secondary)]">The preview is not available here due to security restrictions.</p>
                      <Button type="button" onClick={openPdfInNewTab}>
                        <Eye className="mr-2 h-4 w-4" /> View Full PDF
                      </Button>
                    </div>
                ) : (
                  <div className="relative border border-[var(--color-border)] rounded-lg overflow-hidden shadow-md bg-[var(--color-bg-secondary)] min-h-[300px] md:min-h-[400px] h-full">
                    <Image
                      src={imageSource || ''}
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
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg mb-2 text-[var(--color-text)]">Extracted Items (Editable)</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTesseractOCR}
                  disabled={isOcrProcessing || isProcessing}
                  className="text-xs"
                >
                  {isOcrProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      OCR: {ocrProgress}%
                    </>
                  ) : (
                    <>
                      <FileType className="mr-2 h-3 w-3" />
                      Re-extract with Tesseract
                    </>
                  )}
                </Button>
              </div>
              <ScrollArea className="h-[300px] md:h-[400px] pr-3 border border-[var(--color-border)] rounded-md p-3 bg-[var(--color-bg-secondary)] shadow-inner">
                 {editableItems.length === 0 && (
                  <p className="text-sm text-[var(--color-text-secondary)] p-4 text-center">
                    No items were extracted. This might be due to image quality.
                    Try using the "Re-extract with Tesseract" button above, or upload a clearer image.
                  </p>
                 )}
                 {isExtractionEssentiallyFailed && editableItems.some(item => item.label === "Note") && (
                    <div className="mb-3 p-3 border border-yellow-500 bg-yellow-500/10 rounded-md">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">{editableItems.find(item => item.label === "Note")?.value}</p>
                    </div>
                 )}

                {editableItems.filter(item => item.label !== "Note").map((item, index) => (
                  <div key={`${item.id}-${item.label}-${index}`} className="mb-3">
                    <Label htmlFor={item.id} className="text-sm font-medium text-[var(--color-text)]">
                      {item.label}
                    </Label>
                    <Input
                      id={item.id}
                      type="text"
                      value={item.value}
                      onChange={(e) => handleItemChange(item.id, e.target.value)}
                      className="mt-1 text-sm bg-[var(--color-bg)]"
                      disabled={isProcessing}
                    />
                  </div>
                ))}
              </ScrollArea>
               <p className="text-xs text-[var(--color-text-secondary)] mt-1 px-1">
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
