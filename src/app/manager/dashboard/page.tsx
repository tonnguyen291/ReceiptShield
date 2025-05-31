import { FlaggedReceiptsTable } from '@/components/manager/flagged-receipts-table';

export default function ManagerDashboardPage() {
  return (
    <div className="space-y-8">
      <FlaggedReceiptsTable />
    </div>
  );
}
