
import { ReceiptUploadForm } from '@/components/employee/receipt-upload-form';
import { SubmissionHistoryTable } from '@/components/employee/submission-history-table';
import { Separator } from '@/components/ui/separator';

export default function EmployeeDashboardPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-headline font-semibold mb-8 text-center md:text-left">Employee Dashboard</h1>
        <ReceiptUploadForm />
      </div>
      
      <Separator />

      <div>
        <h2 className="text-2xl font-headline font-semibold mb-6 text-center md:text-left">My Submission History</h2>
        <SubmissionHistoryTable />
      </div>
    </div>
  );
}
