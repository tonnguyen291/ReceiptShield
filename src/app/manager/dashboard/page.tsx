
'use client';

import { FlaggedReceiptsTable } from '@/components/manager/flagged-receipts-table';
import { ManagerOverviewCharts } from '@/components/manager/manager-overview-charts';
import { TeamActivityTable } from '@/components/manager/team-activity-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ManagerDashboardPage() {
  const { toast } = useToast();

  const handleGenerateReportClick = () => {
    toast({
      title: 'Feature Coming Soon',
      description: 'Full report generation and download functionality will be available in a future update.',
    });
  };

  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Manager Dashboard</h1>
          <p className="text-muted-foreground">Oversee expenses, review flagged receipts, and manage your team.</p>
        </div>
        <Button onClick={handleGenerateReportClick} size="lg" className="shadow-sm w-full sm:w-auto" disabled>
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
    </div>
  );
}
