
'use client';

import { useState, useEffect } from 'react';
import { FlaggedReceiptsTable } from '@/components/manager/flagged-receipts-table';
import { ManagerOverviewCharts } from '@/components/manager/manager-overview-charts';
import { TeamActivityTable } from '@/components/manager/team-activity-table';
import { ManagerQuickStats } from '@/components/manager/manager-quick-stats';
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
import { getReceiptsForManager, getAllReceiptsForUser, getAllSubmittedReceipts } from '@/lib/receipt-store';
import { Separator } from '@/components/ui/separator';
import { EmployeeView } from '@/components/manager/employee-view';
import type { User, ProcessedReceipt } from '@/types';
import { getUsers, getEmployeesForManager, initializeDefaultUsers } from '@/lib/firebase-user-store';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filtering
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<ReceiptStatusFilter>('all');


  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Initialize default users if needed
        await initializeDefaultUsers();
        
        if (user && user.role === 'manager') {
          const employees = await getEmployeesForManager(user.id);
          setTeamMembers(employees);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data. Please refresh the page.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user, toast]);

  const handleGenerateCsvReport = async (employeeEmail?: string) => {
    if (!user) {
      console.error('No user found for CSV report generation');
      return;
    }
    if (user.role !== 'manager' && user.role !== 'admin') {
      console.error('User does not have permission to generate reports:', user.role);
      toast({
        title: 'Permission Denied',
        description: 'Only managers and admins can generate reports.',
        variant: 'destructive',
      });
      return;
    }
    console.log('Starting CSV report generation for:', employeeEmail || 'all users');
    setIsGenerating(true);
    if (employeeEmail) setReportUser(employeeEmail);

    try {
      const employeeUser = employeeEmail ? (await getUsers()).find(u => u.email === employeeEmail) : null;

      const receiptsToExport = employeeEmail
        ? await getAllReceiptsForUser(employeeEmail)
        : await getReceiptsForManager(user.id);
      
      console.log('Found receipts to export:', receiptsToExport.length);
      console.log('Manager ID:', user.id);
      console.log('Manager role:', user.role);
      console.log('Employee email:', employeeEmail);
      
      // Debug: Let's also check what receipts exist in total
      if (!employeeEmail) {
        const allReceipts = await getAllSubmittedReceipts();
        console.log('Total receipts in database:', allReceipts.length);
        console.log('Sample receipts:', allReceipts.slice(0, 3).map(r => ({
          id: r.id,
          uploadedBy: r.uploadedBy,
          supervisorId: r.supervisorId
        })));
        
        // If no receipts found by supervisorId, try alternative approach
        if (receiptsToExport.length === 0 && allReceipts.length > 0) {
          console.log('No receipts found by supervisorId, trying alternative approach...');
          
          // Get team members for this manager
          const teamMembers = await getEmployeesForManager(user.id);
          console.log('Team members for manager:', teamMembers.map(m => ({ id: m.id, email: m.email })));
          
          if (teamMembers.length > 0) {
            const teamEmails = teamMembers.map(member => member.email);
            console.log('Team emails:', teamEmails);
            
            // Filter receipts by team member emails
            const teamReceipts = allReceipts.filter(receipt => 
              teamEmails.includes(receipt.uploadedBy)
            );
            console.log('Found receipts by team emails:', teamReceipts.length);
            
            if (teamReceipts.length > 0) {
              console.log('Using team-based receipt filtering instead of supervisorId');
              // Update the receipts to export
              receiptsToExport.splice(0, receiptsToExport.length, ...teamReceipts);
            }
          }
        }
      }

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
        // Validate receipt data
        if (!receipt.id || !receipt.items || !Array.isArray(receipt.items)) {
          console.warn('Invalid receipt data:', receipt);
          return;
        }
        
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
      console.log('CSV content generated, length:', csvContent.length);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportTitle}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.display = 'none';
      document.body.appendChild(link);
      console.log('Triggering CSV download...');
      link.click();
      
      // Clean up after a short delay
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: 'CSV Report Generated',
        description: `The CSV report has been downloaded with ${receiptsToExport.length} receipts.`,
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
    if (!user) {
      console.error('No user found for PDF report generation');
      return;
    }
    if (user.role !== 'manager' && user.role !== 'admin') {
      console.error('User does not have permission to generate reports:', user.role);
      toast({
        title: 'Permission Denied',
        description: 'Only managers and admins can generate reports.',
        variant: 'destructive',
      });
      return;
    }
    console.log('Starting PDF report generation for:', employeeEmail || 'all users');
    setIsGenerating(true);
    if(employeeEmail) setReportUser(employeeEmail);
    try {
        let baseReceipts = employeeEmail 
            ? await getAllReceiptsForUser(employeeEmail)
            : await getReceiptsForManager(user.id);
        
        console.log('Found base receipts for PDF:', baseReceipts.length);
        console.log('Manager ID for PDF:', user.id);
        console.log('Employee email for PDF:', employeeEmail);
        
        // Debug: Let's also check what receipts exist in total
        if (!employeeEmail) {
          const allReceipts = await getAllSubmittedReceipts();
          console.log('Total receipts in database for PDF:', allReceipts.length);
          console.log('Sample receipts for PDF:', allReceipts.slice(0, 3).map(r => ({
            id: r.id,
            uploadedBy: r.uploadedBy,
            supervisorId: r.supervisorId
          })));
          
          // If no receipts found by supervisorId, try alternative approach
          if (baseReceipts.length === 0 && allReceipts.length > 0) {
            console.log('No receipts found by supervisorId for PDF, trying alternative approach...');
            
            // Get team members for this manager
            const teamMembers = await getEmployeesForManager(user.id);
            console.log('Team members for manager (PDF):', teamMembers.map(m => ({ id: m.id, email: m.email })));
            
            if (teamMembers.length > 0) {
              const teamEmails = teamMembers.map(member => member.email);
              console.log('Team emails (PDF):', teamEmails);
              
              // Filter receipts by team member emails
              const teamReceipts = allReceipts.filter(receipt => 
                teamEmails.includes(receipt.uploadedBy)
              );
              console.log('Found receipts by team emails (PDF):', teamReceipts.length);
              
              if (teamReceipts.length > 0) {
                console.log('Using team-based receipt filtering for PDF instead of supervisorId');
                // Update the base receipts
                baseReceipts = teamReceipts;
              }
            }
          }
        }
            
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
            ? `Expense Report for ${(await getUsers()).find(u => u.email === employeeEmail)?.name || employeeEmail}`
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

        console.log('Importing PDF libraries...');
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        console.log('PDF libraries imported successfully');

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
            // Validate receipt data
            if (!receipt.id || !receipt.items || !Array.isArray(receipt.items)) {
              console.warn('Invalid receipt data in PDF generation:', receipt);
              return ['Invalid Data', 'N/A', 'N/A', 'N/A', 'N/A', 'Error'];
            }
            
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

        console.log('Saving PDF with filename:', fileName);
        doc.save(fileName);
        console.log('PDF saved successfully');

        toast({
          title: 'PDF Report Generated',
          description: `An enhanced PDF report has been downloaded with ${filteredReceipts.length} receipts.`,
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Loading Dashboard</h2>
          <p className="text-[var(--color-text-secondary)]">Please wait while we load your team data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="p-4 bg-destructive/10 rounded-lg">
            <X className="h-12 w-12 text-destructive mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Error Loading Dashboard</h2>
          <p className="text-[var(--color-text-secondary)]">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Header Section */}
        <div className="bg-[var(--color-card)] rounded-lg shadow-lg border border-[var(--color-border)] p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-headline font-bold tracking-tight text-[var(--color-text)]">
                    Manager Dashboard
                  </h1>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    Welcome back, {user?.name || 'Manager'}
                  </p>
                </div>
              </div>
              <p className="text-[var(--color-text-secondary)] max-w-2xl">
                Oversee expenses, review flagged receipts, and manage your team's financial submissions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm text-[var(--color-text-secondary)]">Team Members</p>
                <p className="text-2xl font-bold text-primary">{teamMembers.length}</p>
              </div>
              <div className="h-12 w-px bg-[var(--color-border)]"></div>
              <div className="text-right">
                <p className="text-sm text-[var(--color-text-secondary)]">Role</p>
                <p className="text-sm font-medium text-[var(--color-text)] capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      

        {/* Quick Stats Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-primary rounded-full"></div>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Quick Overview</h2>
          </div>
          <ManagerQuickStats />
        </div>

        {/* Overview Charts Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-primary rounded-full"></div>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Team Overview</h2>
          </div>
          <ManagerOverviewCharts />
        </div>

        {/* Report Generation Section */}
        <Card className="shadow-lg border-l-4 border-l-blue-500">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Generate Reports</CardTitle>
                <CardDescription>Export team or individual reports in CSV or PDF format. Apply filters for PDF exports.</CardDescription>
              </div>
            </div>
          </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Quick Export</h4>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleGenerateCsvReport()} 
                  disabled={isGenerating}
                  className="flex-1"
                  variant="outline"
                >
                  {isGenerating && !reportUser ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  Export CSV
                </Button>
                <Button 
                  onClick={() => handleGeneratePdfReport()} 
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating && !reportUser ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  Export PDF
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Team Members</h4>
              <p className="text-sm text-muted-foreground">
                {teamMembers.length} active team members
              </p>
            </div>
          </div>

          {/* Advanced Filters for PDF */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium text-foreground">PDF Export Filters</h4>
            </div>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status Filter</label>
                <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as ReceiptStatusFilter)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending_approval">Pending Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[240px] justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        "Pick a date range"
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
              </div>
              
              {(dateRange || statusFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setDateRange(undefined); setStatusFilter('all'); }}
                  className="h-10 px-3"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Team Activity Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-green-500 rounded-full"></div>
            <h2 className="text-xl font-semibold text-foreground">Team Activity</h2>
          </div>
          <Card className="shadow-lg border-l-4 border-l-green-500">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Team Performance</CardTitle>
                  <CardDescription>Overview of expense submissions across all employees.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TeamActivityTable />
            </CardContent>
          </Card>
        </div>

        {/* Flagged Receipts Section */}
        <div id="flagged-receipts" className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-red-500 rounded-full"></div>
            <h2 className="text-xl font-semibold text-foreground">Receipt Audit Queue</h2>
          </div>
          <Card className="shadow-lg border-l-4 border-l-red-500">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Filter className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Receipt Review Queue</CardTitle>
                    <CardDescription>All receipts submitted by your team that require your review and approval.</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.email || ''}>
                          {member.name} ({member.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FlaggedReceiptsTable teamMembers={teamMembers} />
            </CardContent>
          </Card>
        </div>

        {/* Employee Management Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-purple-500 rounded-full"></div>
            <h2 className="text-xl font-semibold text-foreground">Employee Management</h2>
          </div>
          <EmployeeView 
            onGeneratePdf={handleGeneratePdfReport} 
            onGenerateCsv={handleGenerateCsvReport}
            isGenerating={isGenerating}
            reportUser={reportUser}
          />
        </div>
        
        {/* Footer Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">
                ReceiptShield Manager Dashboard
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Team Members</p>
                <p className="text-sm font-medium text-foreground">{teamMembers.length}</p>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <Button
                variant="ghost"
                onClick={logout}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
