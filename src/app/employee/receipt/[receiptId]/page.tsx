
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getReceiptById } from '@/lib/receipt-store';
import type { ProcessedReceipt, ReceiptDataItem } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, Info, MessageSquareText, ShieldQuestion, CheckCircle, XCircle } from 'lucide-react';
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

  const getStatusBadge = () => {
    if (receipt.status === 'approved') {
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle className="w-4 h-4 mr-1.5"/>Approved by Manager</Badge>;
    }
    if (receipt.status === 'rejected') {
      return <Badge variant="destructive"><XCircle className="w-4 h-4 mr-1.5"/>Rejected by Manager</Badge>;
    }
    if (receipt.status === 'pending_approval') {
      return <Badge variant="secondary"><ShieldQuestion className="w-4 h-4 mr-1.5"/>Pending Manager Review</Badge>;
    }
    return <Badge variant={receipt.isFraudulent ? 'destructive' : 'default'} className="text-sm px-3 py-1">
            {receipt.isFraudulent ? 'Flagged as Potentially Fraudulent' : 'Looks Clear (AI)'}
           </Badge>;
  };

  return (
    <Card className="w-full mx-auto my-8 shadow-xl">
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
      
      <CardContent className="pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {/* Receipt Image Column */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="font-semibold text-xl">Receipt Image</h3>
            <div className="border rounded-lg overflow-hidden shadow-md relative bg-muted h-[calc(80vh-150px)] min-h-[400px]">
              <Image
                src={receipt.imageDataUri}
                alt={`Receipt ${receipt.fileName}`}
                fill
                style={{objectFit: 'contain'}}
                className="p-2"
                data-ai-hint="receipt full"
              />
            </div>
          </div>

          {/* Details Sidebar Column */}
          <div className="md:col-span-1 space-y-6 flex flex-col">
            <div className="flex-grow space-y-4">
              <h3 className="font-semibold text-xl text-primary">Review & Analysis</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md shadow-sm">
                  <span className="text-sm font-medium">Overall Status:</span>
                  {getStatusBadge()}
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md shadow-sm">
                  <span className="text-sm font-medium">AI Fraud Probability:</span>
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
                  <span className="text-sm font-medium">AI Explanation:</span>
                  <ScrollArea className="h-36">
                      <p className="text-xs p-2 rounded-md min-h-[40px] whitespace-pre-wrap">{receipt.explanation || 'No AI explanation provided.'}</p>
                  </ScrollArea>
                </div>
                {receipt.managerNotes && (
                  <Card className="mt-3 shadow-sm">
                    <CardHeader className="p-3">
                      <CardTitle className="text-md flex items-center gap-2"><MessageSquareText className="w-4 h-4 text-accent"/>Manager Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <ScrollArea className="h-28">
                        <p className="text-xs whitespace-pre-wrap">{receipt.managerNotes}</p>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <Separator />
            
            <div>
              <h3 className="font-semibold text-xl text-primary mb-2 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Extracted Details
              </h3>
              <ScrollArea className="h-[calc(40vh-100px)] min-h-[200px] border rounded-md p-1 bg-muted/50 shadow-inner">
                <div className="p-3 space-y-2">
                {receipt.items && receipt.items.length > 0 ? (
                  receipt.items.map((item) => (
                    <div key={item.id} className="text-sm grid grid-cols-3 gap-1 even:bg-muted/30 p-1 rounded">
                      <span className="font-medium col-span-1 truncate pr-1">{item.label}:</span>
                      <span className="col-span-2 text-foreground/90 break-words">{item.value}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground p-2">No specific items were extracted or confirmed for this receipt.</p>
                )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </CardContent>
      
       {receipt.status && (receipt.status === 'approved' || receipt.status === 'rejected') && (
        <CardFooter className="pt-4 border-t mt-6">
            <p className="text-sm text-muted-foreground w-full text-center">
                This receipt has been {receipt.status} by management.
            </p>
        </CardFooter>
      )}
    </Card>
  );
}
