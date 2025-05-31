
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, FileText, ListChecks } from 'lucide-react';

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
     // Optional: Listen for storage changes to update table dynamically
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

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-primary" />
            Loading Submission History...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-muted-foreground">
            Fetching your receipts...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (receipts.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            No Submissions Yet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You haven&apos;t uploaded any receipts. Use the form above to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="pt-6"> {/* Add padding-top if CardHeader is removed or to space from title if it's outside */}
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
      </CardContent>
    </Card>
  );
}
