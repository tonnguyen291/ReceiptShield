
'use client';

import { useState, useEffect } from 'react';
import { FlaggedReceiptsTable } from '@/components/manager/flagged-receipts-table';
import { ManagerOverviewCharts } from '@/components/manager/manager-overview-charts';
import { TeamActivityTable } from '@/components/manager/team-activity-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Filter, LogOut, ChevronDown, Loader2, Calendar as CalendarIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import type { User, ProcessedReceipt } from '@/types';
import { getUsers, getEmployeesForManager } from '@/lib/user-store';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, isWithinInterval } from 'date-fns';
import type { DateRange } from 'react-day-picker';

type ReceiptStatusFilter = "all" | "pending_approval" | "approved" | "rejected";

export default function ManagerDashboardPage() {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportUser, setReportUser] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);

  // State for filtering
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<ReceiptStatusFilter>('all');


  useEffect(() => {
    if(user && user.role === 'manager') {
      const employees = getEmployeesForManager(user.id);
      setTeamMembers(employees);
    }
  }, [user]);

  const handleGenerateCsvReport = (employeeEmail?: string) => {
    if (!user) return;
    setIsGenerating(true);
    if (employeeEmail) setReportUser(employeeEmail);

    try {
      const employeeUser = employeeEmail ? getUsers().find(u => u.email === employeeEmail) : null;

      const receiptsToExport = employeeEmail
        ? getAllReceiptsForUser(employeeEmail)
        : getReceiptsForManager(user.id);

      const reportTitle = employeeEmail && employeeUser
        ? `activity_report_${employeeUser.name.replace(/\s+/g, '_')}`
        : 'team_activity_report';
      
      if (receiptsToExport.length === 0) {
        toast({
          title: 'No Receipts to Export',
          description: 'There are no receipts for the selected scope to export.',
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

      const escapeCsvField = (field: string | number | undefined | null) => {
          if (field === null || field === undefined) return '""';
          const str = String(field);
          if (/[",\n]/.test(str)) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
      };

      receiptsToExport.forEach(receipt => {
        const vendor = receipt.items.find(i => i.label.toLowerCase() === 'vendor')?.value || 'N/A';
        const date = receipt.items.find(i => i.label.toLowerCase() === 'date')?.value || 'N/A';
        const total = receipt.items.find(i => i.label.toLowerCase().includes('total'))?.value || 'N/A';
        
        let status;
        if (receipt.status) {
          status = receipt.status; 
        } else if (receipt.isFraudulent) {
          status = 'pending_approval';
        } else {
          status = 'clear'; 
        }
        
        const row = [
          receipt.id,
          escapeCsvField(receipt.fileName),
          escapeCsvField(receipt.uploadedBy),
          new Date(receipt.uploadedAt).toISOString(),
          escapeCsvField(status),
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
    } catch (error) {
      console.error("Error generating CSV report:", error);
      toast({
        title: 'Report Generation Failed',
        description: 'An unexpected error occurred while creating the CSV file.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setReportUser(null);
    }
  };

  const handleGeneratePdfReport = async (employeeEmail?: string) => {
    if (!user) return;
    setIsGenerating(true);
    if(employeeEmail) setReportUser(employeeEmail);
    try {
        let baseReceipts = employeeEmail 
            ? getAllReceiptsForUser(employeeEmail)
            : getReceiptsForManager(user.id);
            
        // Apply filters
        let filteredReceipts = baseReceipts.filter(receipt => {
          // Status filter
          if (statusFilter !== 'all' && receipt.status !== statusFilter) {
            return false;
          }
          // Date range filter
          if (dateRange?.from && dateRange?.to) {
             if (!isWithinInterval(new Date(receipt.uploadedAt), {start: dateRange.from, end: dateRange.to})) {
               return false;
             }
          }
          return true;
        });

        const reportTitle = employeeEmail
            ? `Expense Report for ${getUsers().find(u => u.email === employeeEmail)?.name || employeeEmail}`
            : 'Team Expense Report';
        
        if (filteredReceipts.length === 0) {
            toast({
                title: 'No Receipts to Export',
                description: "There are no receipts for the selected filters to export.",
            });
            setIsGenerating(false);
            setReportUser(null);
            return;
        }

        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF();
        
        const totalExpenses = filteredReceipts.reduce((acc, r) => {
            const amountItem = r.items.find(i => i.label.toLowerCase().includes('total amount'));
            const amountValue = parseFloat(amountItem?.value.replace(/[^0-9.-]+/g, "") || "0");
            return acc + (isNaN(amountValue) ? 0 : amountValue);
        }, 0);
        const totalFlagged = filteredReceipts.filter(r => r.isFraudulent).length;

        // Header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Receipt Shield - ' + reportTitle, 14, 22);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Manager: ${user.name}`, 14, 30);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 200, 30, { align: 'right' });
        
        // Filters section
        let filterText = 'Filters Applied: ';
        const appliedFilters = [];
        if (statusFilter !== 'all') appliedFilters.push(`Status: ${statusFilter.replace('_', ' ')}`);
        if (dateRange?.from && dateRange?.to) appliedFilters.push(`Date: ${format(dateRange.from, "LLL dd, y")} to ${format(dateRange.to, "LLL dd, y")}`);
        filterText += appliedFilters.length > 0 ? appliedFilters.join(', ') : 'None';
        doc.text(filterText, 14, 36);

        // Summary Section
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Summary', 14, 45);
        doc.setLineWidth(0.5);
        doc.line(14, 46, 200, 46);
        
        autoTable(doc, {
            startY: 48,
            body: [
                ['Total Receipts:', filteredReceipts.length.toString()],
                ['Total Expenses:', `$${totalExpenses.toFixed(2)}`],
                ['Flagged for Review:', totalFlagged.toString()],
            ],
            theme: 'plain',
            styles: { fontSize: 10 },
            columnStyles: { 0: { fontStyle: 'bold' } }
        });

        // Main Table
        const tableData = filteredReceipts.map(receipt => {
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
    } catch(error) {
        console.error("Error generating PDF report:", error);
        toast({
            title: 'Report Generation Failed',
            description: 'An unexpected error occurred while creating the PDF file.',
            variant: 'destructive',
        });
    } finally {
        setIsGenerating(false);
        setReportUser(null);
    }
  };

  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Manager Dashboard</h1>
          <p className="text-muted-foreground">Oversee expenses, review flagged receipts, and manage your team.</p>
        </div>
      </div>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>Export team or individual reports in CSV or PDF format. Apply filters for PDF exports.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            {/* Main Export Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="lg" className="shadow-sm" disabled={isGenerating && !reportUser}>
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
                  Export Team as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleGeneratePdfReport()} disabled={isGenerating}>
                  Export Team as PDF (with filters)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filters for PDF */}
            <div className="flex flex-wrap gap-2 items-center border p-2 rounded-md">
                <span className="text-sm font-medium mr-2 text-muted-foreground">PDF Filters:</span>
                <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as ReceiptStatusFilter)}>
                    <SelectTrigger className="w-[180px] h-9">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending_approval">Pending Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className="w-[260px] justify-start text-left font-normal h-9"
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                        dateRange.to ? (
                            <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(dateRange.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date range</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
                { (dateRange || statusFilter !== 'all') && (
                    <Button variant="ghost" size="sm" onClick={() => { setDateRange(undefined); setStatusFilter('all'); }}>
                        <X className="mr-2 h-4 w-4" /> Clear
                    </Button>
                )}
            </div>
          </div>
        </CardContent>
      </Card>


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
            </div>
        </CardHeader>
        <CardContent>
          <FlaggedReceiptsTable teamMembers={teamMembers} />
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
