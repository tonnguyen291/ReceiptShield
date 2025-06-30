
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SubmissionHistoryTable } from '@/components/employee/submission-history-table';
import { PlusCircle } from 'lucide-react';

export default function EmployeeDashboardPage() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">My Receipts</h1>
          <p className="text-muted-foreground">View your submission history or upload a new receipt.</p>
        </div>
        <Button onClick={() => router.push('/employee/upload')} size="lg" className="shadow-sm w-full sm:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" />
          Upload New Receipt
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
          <CardDescription>Your recently uploaded receipts.</CardDescription>
        </CardHeader>
        <CardContent>
          <SubmissionHistoryTable />
        </CardContent>
      </Card>
    </div>
  );
}
