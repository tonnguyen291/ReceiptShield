
'use client';

import { useState } from 'react';
import { FlaggedReceiptsTable } from '@/components/manager/flagged-receipts-table';
import { ManagerOverviewCharts } from '@/components/manager/manager-overview-charts';
import { TeamActivityTable } from '@/components/manager/team-activity-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Filter, LogOut, ChevronDown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { getReceiptsForManager } from '@/lib/receipt-store';
import { Separator } from '@/components/ui/separator';
import { EmployeeView } from '@/components/manager/employee-view';

export default function ManagerDashboardPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCsvReport = () => {
    if (!user) return;
    setIsGenerating(true);

    const receiptsToExport = getReceiptsForManager(user.id);
    if (receiptsToExport.length === 0) {
      toast({
        title: 'No Receipts to Export',
        description: "There are no receipts from your team to export.",
      });
      setIsGenerating(false);
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
      title: 'CSV Report Generated',
      description: 'A CSV report for your team\'s activity has been downloaded.',
    });
    setIsGenerating(false);
  };

  const handleGeneratePdfReport = async () => {
    if (!user) return;
    setIsGenerating(true);

    const receiptsToExport = getReceiptsForManager(user.id);
    if (receiptsToExport.length === 0) {
        toast({
            title: 'No Receipts to Export',
            description: "There are no receipts from your team to export.",
        });
        setIsGenerating(false);
        return;
    }

    // Dynamically import libraries to ensure they are client-side only
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Team Activity Report - ${user.name}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    
    const tableData = receiptsToExport.map(receipt => {
        const vendor = receipt.items.find(i => i.label.toLowerCase() === 'vendor')?.value || 'N/A';
        const date = receipt.items.find(i => i.label.toLowerCase() === 'date')?.value || 'N/A';
        const total = receipt.items.find(i => i.label.toLowerCase().includes('total'))?.value || 'N/A';
        const status = receipt.status || (receipt.isFraudulent ? 'pending_approval' : 'clear');
        
        return [
            receipt.uploadedBy,
            vendor,
            date,
            total,
            status
        ];
    });

    autoTable(doc, {
        startY: 35,
        head: [['Employee', 'Vendor', 'Date', 'Amount', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [38, 43, 51] }, // Dark grey for header
    });
    
    doc.save(`team_activity_report_${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: 'PDF Report Generated',
      description: 'A PDF report for your team\'s activity has been downloaded.',
    });
    setIsGenerating(false);
  };

  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Manager Dashboard</h1>
          <p className="text-muted-foreground">Oversee expenses, review flagged receipts, and manage your team.</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="lg" className="shadow-sm w-full sm:w-auto" disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <FileText className="mr-2 h-5 w-5" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Report'}
              <ChevronDown className="ml-2 h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleGenerateCsvReport} disabled={isGenerating}>
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleGeneratePdfReport} disabled={isGenerating}>
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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

      <EmployeeView />
      
       <Separator className="my-8" />
       <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => useAuth().logout()}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
