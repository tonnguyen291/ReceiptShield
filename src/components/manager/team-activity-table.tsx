
'use client';

import { useState, useEffect } from 'react';
import type { User, ProcessedReceipt } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { getEmployeesForManager } from '@/lib/firebase-user-store';
import { getAllReceiptsForUser } from '@/lib/receipt-store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Loader2, Users } from 'lucide-react';

interface TeamMemberStats {
  user: User;
  receipts: number;
  totalAmount: number;
  flagged: number;
  approvalRate: number;
}

export function TeamActivityTable() {
    const { user } = useAuth();
    const [teamStats, setTeamStats] = useState<TeamMemberStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        if (!user || user.role !== 'manager') {
            setIsLoading(false);
            return;
        }

        const teamMembers = await getEmployeesForManager(user.id);
        
        // Load receipts for all team members
        const receiptPromises = teamMembers.map(async (employee) => {
            const receipts = await getAllReceiptsForUser(employee.email || '');
            return { employee, receipts };
        });
        
        const employeeReceipts = await Promise.all(receiptPromises);
        
        const stats: TeamMemberStats[] = employeeReceipts.map(({ employee, receipts }) => {
            const totalAmount = receipts.reduce((acc, r) => {
                const amountItem = r.items.find(i => i.label.toLowerCase().includes('total amount'));
                const amountValue = parseFloat(amountItem?.value.replace(/[^0-9.-]+/g,"") || "0");
                return acc + (isNaN(amountValue) ? 0 : amountValue);
            }, 0);
            
            const flagged = receipts.filter(r => r.isFraudulent).length;
            const approvedCount = receipts.filter(r => r.status === 'approved').length;
            const actionableCount = receipts.filter(r => r.status === 'approved' || r.status === 'rejected').length;
            const approvalRate = actionableCount > 0 ? Math.round((approvedCount / actionableCount) * 100) : 100;

            return {
                user: employee,
                receipts: receipts.length,
                totalAmount,
                flagged,
                approvalRate,
            };
        });

        setTeamStats(stats);
        setIsLoading(false);
    };


    useEffect(() => {
        const initializeData = async () => {
            setIsLoading(true);
            await loadData();
        };
        
        initializeData();
        
        const handleStorageChange = () => loadData();
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [user]);

    if (isLoading) {
      return (
        <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          Loading team data...
        </div>
      );
    }
    
    if (teamStats.length === 0) {
        return (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
              <Users className="mx-auto h-12 w-12 text-primary mb-4" />
              <p className="font-semibold">No Employees Found</p>
              <p>No employees have been assigned to you yet.</p>
            </div>
          );
    }

    return (
        <TooltipProvider>
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-center"># Receipts</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-center">Flagged Incidents</TableHead>
                    <TableHead className="text-center">Approval Rate</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {teamStats.map((employeeStat) => (
                    <TableRow 
                        key={employeeStat.user.id}
                        className="hover:bg-muted/30 transition-colors"
                    >
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={`https://placehold.co/40x40.png?text=${employeeStat.user.name ? employeeStat.user.name[0] : 'U'}`} data-ai-hint="abstract letter" />
                                    <AvatarFallback>{employeeStat.user.name?.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{employeeStat.user.name}</div>
                                    <div className="text-xs text-muted-foreground">{employeeStat.user.email}</div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="text-center">{employeeStat.receipts}</TableCell>
                        <TableCell className="text-right font-mono">${employeeStat.totalAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                            <Badge variant={employeeStat.flagged > 2 ? 'destructive' : employeeStat.flagged > 0 ? 'secondary' : 'default'}
                                   className={employeeStat.flagged === 0 ? 'bg-green-500/20 text-green-700' : ''}
                            >
                                {employeeStat.flagged}
                            </Badge>
                        </TableCell>
                        <TableCell>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center justify-center gap-2">
                                         <Progress value={employeeStat.approvalRate} className="w-24 h-2" indicatorClassName={employeeStat.approvalRate < 80 ? 'bg-destructive' : 'bg-primary'} />
                                         <span className="text-xs font-semibold">{employeeStat.approvalRate}%</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent><p>{employeeStat.approvalRate}% of receipts approved</p></TooltipContent>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TooltipProvider>
    );
}
