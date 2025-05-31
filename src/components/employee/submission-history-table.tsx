
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProcessedReceipt } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { getAllReceiptsForUser } from '@/lib/receipt-store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, FileText, Loader2 } from 'lucide-react';

export function SubmissionHistoryTable() {
  const { user } = useAuth();
  const router = useRouter();
  const [receipts, setReceipts] = useState<ProcessedReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      setIsLoading(true);
      const userReceipts = getAllReceiptsForUser(user.email);
      setReceipts(userReceipts);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setReceipts([]);
    }
     const handleStorageChange = () => {
        if (user?.email) {
            const updatedReceipts = getAllReceiptsForUser(user.email);
            setReceipts(updatedReceipts);
        }
     };
     window.addEventListener('storage', handleStorageChange);
     return () => window.removeEventListener('storage', handleStorageChange);

  }, [user?.email]);

  const handleViewDetails = (receiptId: string) => {
    router.push(`/employee/receipt/${receiptId}`);
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            Fetching your receipts...
          </div>
        ) : receipts.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
            <FileText className="w-10 h-10 text-primary mb-3" />
            <p>You haven&apos;t uploaded any receipts yet.</p>
            <p className="text-sm">Use the &quot;Upload New Receipt&quot; button to get started!</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead className="hidden sm:table-cell">Upload Date</TableHead>
                <TableHead className="hidden md:table-cell">Summary Snippet</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium max-w-xs truncate">{receipt.fileName}</TableCell>
                  <TableCell className="hidden sm:table-cell">{new Date(receipt.uploadedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-sm truncate">
                    {receipt.summary ? `${receipt.summary.substring(0, 50)}...` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={receipt.isFraudulent ? 'destructive' : 'default'}>
                      {receipt.isFraudulent ? 'Flagged' : 'Clear'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(receipt.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
