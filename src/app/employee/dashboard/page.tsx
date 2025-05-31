import { ReceiptUploadForm } from '@/components/employee/receipt-upload-form';

export default function EmployeeDashboardPage() {
  return (
    <div className="space-y-8">
      <ReceiptUploadForm />
      {/* Later, could add a list of user's past submissions here */}
    </div>
  );
}
