
'use client';

import { SubmissionHistoryTable } from '@/components/employee/submission-history-table';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';

export default function EmployeeDashboardPage() {
  const router = useRouter();

  const handleUploadClick = () => {
    router.push('/employee/upload');
  };

  return (
    <div className="space-y-12">
      <div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-headline font-semibold text-center md:text-left">Employee Dashboard</h1>
          <Button onClick={handleUploadClick} size="lg" className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" />
            Upload New Receipt
          </Button>
        </div>
      </div>
      
      <Separator />

      <div>
        <h2 className="text-2xl font-headline font-semibold mb-6 text-center md:text-left">My Submission History</h2>
        <SubmissionHistoryTable />
      </div>
    </div>
  );
}
