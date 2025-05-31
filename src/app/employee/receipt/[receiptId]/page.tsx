
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getReceiptById } from '@/lib/receipt-store';
import type { ProcessedReceipt } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ReceiptDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [receipt, setReceipt] = useState<ProcessedReceipt | null | undefined>(undefined); // undefined for loading state
  const receiptId = params.receiptId as string;

  useEffect(() => {
    if (receiptId) {
      const foundReceipt = getReceiptById(receiptId);
      setReceipt(foundReceipt);
    }
  }, [receiptId]);

  if (receipt === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <p>Loading receipt details...</p>
      </div>
    );
  }

  if (receipt === null) {
    return (
      <Card className="max-w-3xl mx-auto my-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-destructive flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2" />
            Receipt Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>The receipt you are looking for could not be found. It might have been deleted or the ID is incorrect.</p>
          <Button onClick={() => router.push('/employee/dashboard')} className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  const fraudProbabilityPercent = Math.round(receipt.fraudProbability * 100);

  return (
    <Card className="max-w-4xl mx-auto my-8 shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-3xl font-headline mb-1">{receipt.fileName}</CardTitle>
                <CardDescription>
                Uploaded by: {receipt.uploadedBy} on {new Date(receipt.uploadedAt).toLocaleDateString()}
                </CardDescription>
            </div>
            <Button onClick={() => router.push('/employee/dashboard')} variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
        </div>
      </CardHeader>
      <ScrollArea className="max-h-[calc(100vh-20rem)]"> {/* Adjust max height as needed */}
        <CardContent className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-xl text-primary">Receipt Image</h3>
              <div className="border rounded-lg overflow-hidden shadow-md relative bg-muted">
                <Image
                  src={receipt.imageDataUri}
                  alt={`Receipt ${receipt.fileName}`}
                  layout="fill"
                  objectFit="contain"
                  className="p-2"
                  data-ai-hint="receipt full"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-xl text-primary mb-1">Summary</h3>
                <p className="text-sm bg-muted p-4 rounded-md shadow-sm min-h-[60px]">{receipt.summary || 'No summary available.'}</p>
              </div>
              
              <Separator />

              <div>
                <h3 className="font-semibold text-xl text-primary mb-2">Fraud Analysis</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md shadow-sm">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={receipt.isFraudulent ? 'destructive' : 'default'} className="text-sm px-3 py-1">
                      {receipt.isFraudulent ? 'Flagged as Potentially Fraudulent' : 'Looks Clear'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md shadow-sm">
                    <span className="text-sm font-medium">Fraud Probability:</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={fraudProbabilityPercent} 
                        className="w-28 h-2.5"
                        indicatorClassName={
                          fraudProbabilityPercent > 70 ? 'bg-destructive' :
                          fraudProbabilityPercent > 40 ? 'bg-yellow-500' : 'bg-green-500'
                        }
                      />
                      <span className={`font-semibold text-sm ${fraudProbabilityPercent > 70 ? 'text-destructive' : fraudProbabilityPercent > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {fraudProbabilityPercent}%
                      </span>
                    </div>
                  </div>
                   <div className="space-y-1 p-3 bg-muted/50 rounded-md shadow-sm">
                     <span className="text-sm font-medium">Explanation:</span>
                     <ScrollArea className="h-32">
                        <p className="text-xs p-2 rounded-md min-h-[50px] whitespace-pre-wrap">{receipt.explanation || 'No explanation provided.'}</p>
                     </ScrollArea>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
