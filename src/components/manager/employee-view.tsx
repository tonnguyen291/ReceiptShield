
'use client';

import { useState, useEffect } from 'react';
import type { User, ProcessedReceipt } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { getEmployeesForManager } from '@/lib/firebase-user-store';
import { getAllReceiptsForUser } from '@/lib/receipt-store';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ShieldQuestion, Loader2, Users, FileText, ChevronDown, Edit3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ReceiptActions } from './receipt-actions';

interface EmployeeViewProps {
    onGeneratePdf: (employeeEmail: string) => void;
    onGenerateCsv: (employeeEmail: string) => void;
    isGenerating: boolean;
    reportUser: string | null;
}

export function EmployeeView({ onGeneratePdf, onGenerateCsv, isGenerating, reportUser }: EmployeeViewProps) {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<User[]>([]);
  const [receiptsByEmployee, setReceiptsByEmployee] = useState<Record<string, ProcessedReceipt[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadData = async () => {
    if (user && user.role === 'manager') {
      const teamMembers = await getEmployeesForManager(user.id);
      setEmployees(teamMembers);

      const allReceipts: Record<string, ProcessedReceipt[]> = {};
      
      // Load receipts for each employee
      const receiptPromises = teamMembers.map(async (employee) => {
        if (employee.email) {
          const receipts = await getAllReceiptsForUser(employee.email);
          return {
            employeeId: employee.id,
            receipts: receipts
          };
        }
        return null;
      });
      
      const results = await Promise.all(receiptPromises);
      
      results.forEach(result => {
        if (result) {
          allReceipts[result.employeeId] = result.receipts;
        }
      });
      
      setReceiptsByEmployee(allReceipts);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const getStatusBadge = (receipt: ProcessedReceipt): JSX.Element => {
    if (receipt.status === 'approved') {
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle className="w-3 h-3 mr-1"/>Approved</Badge>;
    }
    if (receipt.status === 'rejected') {
      return <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 text-white"><XCircle className="w-3 h-3 mr-1"/>Rejected</Badge>;
    }
    if (receipt.status === 'draft' || receipt.isDraft) {
      return <Badge variant="outline" className={receipt.managerNotes?.includes('Request for more information') ? "border-orange-500 text-orange-600" : "border-gray-500 text-gray-600"}><Edit3 className="w-3 h-3 mr-1"/>{receipt.managerNotes?.includes('Request for more information') ? 'Needs Revision' : 'Draft'}</Badge>;
    }
    if (receipt.status === 'pending_approval') {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200"><ShieldQuestion className="w-3 h-3 mr-1"/>Pending Review</Badge>;
    }
    return <Badge variant={receipt.isFraudulent ? "destructive" : "default"}><CheckCircle className="w-3 h-3 mr-1"/>Clear</Badge>;
  };
  
  const getItemValue = (items: ProcessedReceipt['items'], label: string) => {
    const item = items.find(i => i.label.toLowerCase().includes(label.toLowerCase()));
    return item?.value || 'N/A';
  }


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employee View</CardTitle>
          <CardDescription>View submitted receipts for each employee on your team.</CardDescription>
        </CardHeader>
        <CardContent className="h-24 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Employee View</CardTitle>
        <CardDescription>View submitted receipts and generate individual reports for each employee on your team.</CardDescription>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
           <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
              <Users className="mx-auto h-12 w-12 text-primary mb-4" />
              <p className="font-semibold">No Employees Found</p>
              <p>No employees have been assigned to you yet.</p>
            </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {employees.map(employee => (
              <AccordionItem value={employee.id} key={employee.id}>
                <AccordionTrigger>
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={`https://placehold.co/40x40.png?text=${employee.name ? employee.name[0] : 'U'}`} data-ai-hint="abstract letter" />
                                <AvatarFallback>{employee.name?.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium text-left">{employee.name}</div>
                                <div className="text-xs text-muted-foreground text-left">{employee.email}</div>
                            </div>
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-2 bg-muted/50 rounded-md">
                    <div className="flex justify-end mb-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" disabled={isGenerating && reportUser === employee.email}>
                                     {isGenerating && reportUser === employee.email ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                     ) : (
                                        <FileText className="mr-2 h-4 w-4" />
                                     )}
                                    Generate Report
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => employee.email && onGenerateCsv(employee.email)} disabled={isGenerating}>Export as CSV</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => employee.email && onGeneratePdf(employee.email)} disabled={isGenerating}>Export as PDF</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    {receiptsByEmployee[employee.id]?.length > 0 ? (
                       <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {receiptsByEmployee[employee.id].map(receipt => (
                            <TableRow key={receipt.id}>
                              <TableCell className="font-medium">{getItemValue(receipt.items, 'vendor')}</TableCell>
                              <TableCell>{getItemValue(receipt.items, 'date')}</TableCell>
                              <TableCell>{getItemValue(receipt.items, 'total amount')}</TableCell>
                              <TableCell>{getStatusBadge(receipt)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/employee/receipt/${receipt.id}`);
                                    }}
                                  >
                                    View Details
                                  </Button>
                                  <ReceiptActions 
                                    receipt={receipt} 
                                    onActionComplete={loadData}
                                    variant="inline"
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-center text-muted-foreground py-4">This employee has no submitted receipts.</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
