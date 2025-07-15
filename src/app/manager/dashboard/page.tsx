
'use client';

import { FlaggedReceiptsTable } from '@/components/manager/flagged-receipts-table';
import { ManagerOverviewCharts } from '@/components/manager/manager-overview-charts';
import { TeamActivityTable } from '@/components/manager/team-activity-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Filter, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { getReceiptsForManager } from '@/lib/receipt-store';
import { getEmployeesForManager } from '@/lib/user-store';
import { Separator } from '@/components/ui/separator';

export default function ManagerDashboardPage() {
  const { toast } = useToast();
  const { user, logout } = useAuth();

  const handleGenerateReportClick = () => {
    if (!user) return;

    const teamMembers = getEmployeesForManager(user.id);
    if (teamMembers.length === 0) {
      toast({
        title: 'No Employees Found',
        description: 'You have no employees assigned to you to generate a report for.',
        variant: 'destructive',
      });
      return;
    }

    const receiptsToExport = getReceiptsForManager(user.id);
    if (receiptsToExport.length === 0) {
      toast({
        title: 'No Receipts to Export',
        description: "Your team has not submitted any receipts yet.",
      });
      return;
    }

    const headers = [
      'ID', 'File Name', 'Uploaded By', 'Uploaded At', 'Fraud Probability', 
      'Status', 'Vendor', 'Date', 'Total Amount'
    ];
    const csvRows = [headers.join(',')];

    receiptsToExport.forEach(receipt => {
      const vendor = receipt.items.find(i => i.label.toLowerCase() === 'vendor')?.value || 'N/A';
      const date = receipt.items.find(i => i.label.toLowerCase() === 'date')?.value || 'N/A';
      const total = receipt.items.find(i => i.label.toLowerCase().includes('total'))?.value || 'N/A';
      
      const row = [
        receipt.id,
        `"${receipt.fileName.replace(/"/g, '""')}"`,
        receipt.uploadedBy,
        new Date(receipt.uploadedAt).toISOString(),
        receipt.fraudProbability.toFixed(2),
        receipt.status || (receipt.isFraudulent ? 'pending_approval' : 'clear'),
        `"${vendor.replace(/"/g, '""')}"`,
        `"${date.replace(/"/g, '""')}"`,
        `"${total.replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `team_activity_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Report Generated',
      description: 'A CSV report for all team activity has been downloaded.',
    });
  };

  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Manager Dashboard</h1>
          <p className="text-muted-foreground">Oversee expenses, review flagged receipts, and manage your team.</p>
        </div>
        <Button onClick={handleGenerateReportClick} size="lg" className="shadow-sm w-full sm:w-auto">
          <FileText className="mr-2 h-5 w-5" />
          Generate Report
        </Button>
      </div>

      <ManagerOverviewCharts />

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Team Activity</CardTitle>
          <CardDescription>Overview of expense submissions across all employees.</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamActivityTable />
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
              <div>
                <CardTitle>Receipt Audit Queue</CardTitle>
                <CardDescription>These receipts were flagged by AI and require manual approval.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                 <Filter className="w-4 h-4 text-muted-foreground" />
                 <Select defaultValue="all">
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue placeholder="Filter by employee" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Employees</SelectItem>
                        <SelectItem value="user1">employee1@example.com</SelectItem>
                        <SelectItem value="user2">employee2@example.com</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
            </div>
        </CardHeader>
        <CardContent>
          <FlaggedReceiptsTable />
        </CardContent>
      </Card>
       <Separator className="my-8" />
       <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={logout}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
