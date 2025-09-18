
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ProcessedReceipt, User } from '@/types';
import { getFlaggedReceiptsForManager, getAllReceipts } from '@/lib/receipt-store';
import { getEmployeesForManager } from '@/lib/firebase-user-store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ReceiptDetailsDialog } from './receipt-details-dialog';
import { ReceiptActions } from './receipt-actions';
import { BulkReceiptActions } from './bulk-receipt-actions';
import { Eye, Loader2, Pencil, ShieldQuestion, Filter, CheckCircle, XCircle, Edit3 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Checkbox } from '../ui/checkbox';
import { useAuth } from '@/contexts/auth-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface FlaggedReceiptsTableProps {
  teamMembers: User[];
}

export function FlaggedReceiptsTable({ teamMembers }: FlaggedReceiptsTableProps) {
  const { user } = useAuth();
  const [allFlaggedReceipts, setAllFlaggedReceipts] = useState<ProcessedReceipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<ProcessedReceipt[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<ProcessedReceipt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const router = useRouter();

  const loadReceipts = async () => {
    if (user?.id) {
        // Get all receipts for the manager's team, not just flagged ones
        const teamMembers = await getEmployeesForManager(user.id);
        const teamEmails = teamMembers.map(member => member.email);
        const allReceiptsData = await getAllReceipts();
        
        // Filter receipts by team members and show all receipts (including approved/rejected for status visibility)
        const teamReceipts = allReceiptsData.filter(receipt => 
          teamEmails.includes(receipt.uploadedBy)
        );
        
        // Debug: Check for receipts without IDs
        const receiptsWithoutId = teamReceipts.filter(receipt => !receipt.id);
        if (receiptsWithoutId.length > 0) {
          console.error('Found receipts without IDs:', receiptsWithoutId);
        }
        
        // Debug: Log all receipts to see their structure
        console.log('All team receipts loaded:', teamReceipts.map(r => ({
          id: r.id,
          fileName: r.fileName,
          uploadedBy: r.uploadedBy,
          status: r.status,
          hasId: !!r.id
        })));
        
        // Filter out any receipts without IDs before setting state
        const validReceipts = teamReceipts.filter(receipt => receipt.id && receipt.id.trim() !== '');
        console.log(`Filtered ${teamReceipts.length - validReceipts.length} receipts without valid IDs`);
        
        setAllFlaggedReceipts(validReceipts);
        setFilteredReceipts(validReceipts);
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await loadReceipts();
    };
    
    initializeData();
    
    const handleStorageChange = () => loadReceipts();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  useEffect(() => {
    if (selectedEmployee === 'all') {
      setFilteredReceipts(allFlaggedReceipts);
    } else {
      setFilteredReceipts(
        allFlaggedReceipts.filter(receipt => receipt.uploadedBy === selectedEmployee)
      );
    }
  }, [selectedEmployee, allFlaggedReceipts]);


  const handleViewDetails = (receipt: ProcessedReceipt) => {
    setSelectedReceipt(receipt);
    setIsDialogOpen(true);
  };

  const handleEdit = (receiptId: string) => {
    router.push(`/employee/verify-receipt/${receiptId}`);
  };


  return (
    <>
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-[220px] h-8 text-xs">
                <SelectValue placeholder="Filter by employee" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.email}>{member.name}</SelectItem>
                ))}
            </SelectContent>
            </Select>
        </div>
      </div>
      {isLoading ? (
        <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          Loading flagged receipts...
        </div>
      ) : filteredReceipts.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
          <ShieldQuestion className="mx-auto h-12 w-12 text-primary mb-4" />
          <p className="font-semibold">All clear!</p>
          <p>No receipts match the current filter.</p>
        </div>
      ) : (
        <>
          <BulkReceiptActions 
            receipts={filteredReceipts} 
            onActionComplete={loadReceipts}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Receipt ID</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead>Fraud Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {filteredReceipts.filter(receipt => receipt.id).map((receipt) => (
              <TableRow key={receipt.id}>
                <TableCell>
                  {receipt.status !== 'approved' && receipt.status !== 'rejected' && (
                    <Checkbox
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  )}
                </TableCell>
                <TableCell className="font-medium truncate max-w-[200px] sm:max-w-xs font-mono text-sm">{receipt.id}</TableCell>
                <TableCell className="truncate max-w-[150px] sm:max-w-xs">{receipt.uploadedBy}</TableCell>
                <TableCell className="hidden sm:table-cell">{new Date(receipt.uploadedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={receipt.fraudProbability * 100} className="w-20 h-2" 
                      indicatorClassName={
                        receipt.fraudProbability * 100 > 70 ? 'bg-destructive' :
                        receipt.fraudProbability * 100 > 40 ? 'bg-yellow-500' : 'bg-green-500'
                      }
                    />
                    <span className="text-xs font-semibold">{Math.round(receipt.fraudProbability * 100)}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  {receipt.status === 'approved' ? (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
                      <CheckCircle className="w-3 h-3 mr-1.5" />
                      Approved
                    </Badge>
                  ) : receipt.status === 'rejected' ? (
                    <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 text-white">
                      <XCircle className="w-3 h-3 mr-1.5" />
                      Rejected
                    </Badge>
                  ) : receipt.status === 'draft' || receipt.isDraft ? (
                    <Badge variant="outline" className={receipt.managerNotes?.includes('Request for more information') ? "border-orange-500 text-orange-600" : "border-gray-500 text-gray-600"}>
                      <Edit3 className="w-3 h-3 mr-1.5" />
                      {receipt.managerNotes?.includes('Request for more information') ? 'Needs Revision' : 'Draft'}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                      <ShieldQuestion className="w-3 h-3 mr-1.5" />
                      Pending Review
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewDetails(receipt)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>View Details</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(receipt.id)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Edit Receipt</p></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <ReceiptActions 
                      receipt={receipt} 
                      onActionComplete={loadReceipts}
                      variant="inline"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </>
      )}
      <ReceiptDetailsDialog
        receipt={selectedReceipt}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onActionComplete={loadReceipts}
      />
    </>
  );
}
