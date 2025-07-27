
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
import { getReceiptsForManager, getAllReceiptsForUser } from '@/lib/receipt-store';
import { Separator } from '@/components/ui/separator';
import { EmployeeView } from '@/components/manager/employee-view';
import type { ProcessedReceipt } from '@/types';
import { getUsers } from '@/lib/user-store';

export default function ManagerDashboardPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportUser, setReportUser] = useState<string | null>(null);

  const handleGenerateCsvReport = (employeeEmail?: string) => {
    if (!user) return;
    setIsGenerating(true);
    if(employeeEmail) setReportUser(employeeEmail);

    const receiptsToExport = employeeEmail 
        ? getAllReceiptsForUser(employeeEmail) 
        : getReceiptsForManager(user.id);
        
    const reportTitle = employeeEmail
        ? `activity_report_${employeeEmail}`
        : 'team_activity_report';

    if (receiptsToExport.length === 0) {
      toast({
        title: 'No Receipts to Export',
        description: `There are no receipts for the selected scope to export.`,
      });
      setIsGenerating(false);
      setReportUser(null);
      return;
    }

    const headers = [
      'ID', 'File Name', 'Uploaded By', 'Uploaded At', 'Status', 
      'Fraud Probability', 'AI Explanation', 'Manager Notes', 
      'Vendor', 'Date', 'Total Amount'
    ];
    const csvRows = [headers.join(',')];

    receiptsToExport.forEach(receipt => {
      const vendor = receipt.items.find(i => i.label.toLowerCase() === 'vendor')?.value || 'N/A';
      const date = receipt.items.find(i => i.label.toLowerCase() === 'date')?.value || 'N/A';
      const total = receipt.items.find(i => i.label.toLowerCase().includes('total'))?.value || 'N/A';
      
      const escapeCsvField = (field: string | undefined) => {
        if (field === null || field === undefined) return '""';
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }
      
      const row = [
        receipt.id,
        escapeCsvField(receipt.fileName),
        escapeCsvField(receipt.uploadedBy),
        new Date(receipt.uploadedAt).toISOString(),
        escapeCsvField(receipt.status || (receipt.isFraudulent ? 'pending_approval' : 'clear')),
        receipt.fraudProbability.toFixed(2),
        escapeCsvField(receipt.explanation),
        escapeCsvField(receipt.managerNotes),
        escapeCsvField(vendor),
        escapeCsvField(date),
        escapeCsvField(total)
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportTitle}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'CSV Report Generated',
      description: 'The CSV report has been downloaded.',
    });
    setIsGenerating(false);
    setReportUser(null);
  };

  const handleGeneratePdfReport = async (employeeEmail?: string) => {
    if (!user) return;
    setIsGenerating(true);
    if(employeeEmail) setReportUser(employeeEmail);

    const receiptsToExport = employeeEmail 
        ? getAllReceiptsForUser(employeeEmail)
        : getReceiptsForManager(user.id);
        
    const reportTitle = employeeEmail
        ? `Expense Report for ${getUsers().find(u => u.email === employeeEmail)?.name || employeeEmail}`
        : 'Team Expense Report';
    
    if (receiptsToExport.length === 0) {
        toast({
            title: 'No Receipts to Export',
            description: "There are no receipts for the selected scope to export.",
        });
        setIsGenerating(false);
        setReportUser(null);
        return;
    }

    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    
    const totalExpenses = receiptsToExport.reduce((acc, r) => {
        const amountItem = r.items.find(i => i.label.toLowerCase().includes('total amount'));
        const amountValue = parseFloat(amountItem?.value.replace(/[^0-9.-]+/g, "") || "0");
        return acc + (isNaN(amountValue) ? 0 : amountValue);
    }, 0);
    const totalFlagged = receiptsToExport.filter(r => r.isFraudulent).length;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Receipt Shield - ' + reportTitle, 14, 22);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Manager: ${user.name}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 200, 30, { align: 'right' });

    // Summary Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, 45);
    doc.setLineWidth(0.5);
    doc.line(14, 46, 200, 46);
    
    autoTable(doc, {
        startY: 48,
        body: [
            ['Total Receipts:', receiptsToExport.length.toString()],
            ['Total Expenses:', `$${totalExpenses.toFixed(2)}`],
            ['Flagged for Review:', totalFlagged.toString()],
        ],
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: { 0: { fontStyle: 'bold' } }
    });

    // Main Table
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
            `${Math.round(receipt.fraudProbability * 100)}%`,
            status
        ];
    });

    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Employee', 'Vendor', 'Date', 'Amount', 'Fraud Score', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [38, 43, 51], textColor: [255,255,255] },
    });

    // Footer with Page Numbers
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, 287, { align: 'center' });
    }
    
    const fileName = employeeEmail
        ? `expense_report_${employeeEmail}_${new Date().toISOString().split('T')[0]}.pdf`
        : `team_expense_report_${new Date().toISOString().split('T')[0]}.pdf`;

    doc.save(fileName);

    toast({
      title: 'PDF Report Generated',
      description: 'An enhanced PDF report has been downloaded.',
    });
    setIsGenerating(false);
    setReportUser(null);
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
            <Button size="lg" className="shadow-sm w-full sm:w-auto" disabled={isGenerating && !reportUser}>
              {isGenerating && !reportUser ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <FileText className="mr-2 h-5 w-5" />
              )}
              {isGenerating && !reportUser ? 'Generating...' : 'Generate Team Report'}
              <ChevronDown className="ml-2 h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleGenerateCsvReport()} disabled={isGenerating}>
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleGeneratePdfReport()} disabled={isGenerating}>
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

      <EmployeeView 
        onGeneratePdf={handleGeneratePdfReport} 
        onGenerateCsv={handleGenerateCsvReport}
        isGenerating={isGenerating}
        reportUser={reportUser}
      />
      
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
