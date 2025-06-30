
'use client';

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

const teamData = [
    {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        receipts: 15,
        totalAmount: 1250.75,
        flagged: 2,
        approvalRate: 87,
    },
    {
        name: 'Bob Williams',
        email: 'bob@example.com',
        receipts: 8,
        totalAmount: 620.00,
        flagged: 0,
        approvalRate: 100,
    },
    {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        receipts: 22,
        totalAmount: 2130.50,
        flagged: 5,
        approvalRate: 77,
    },
    {
        name: 'Diana Miller',
        email: 'diana@example.com',
        receipts: 5,
        totalAmount: 310.20,
        flagged: 1,
        approvalRate: 80,
    },
];

export function TeamActivityTable() {
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
                    {teamData.map((employee) => (
                    <TableRow key={employee.email}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={`https://placehold.co/40x40.png?text=${employee.name[0]}`} data-ai-hint="abstract letter" />
                                    <AvatarFallback>{employee.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{employee.name}</div>
                                    <div className="text-xs text-muted-foreground">{employee.email}</div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="text-center">{employee.receipts}</TableCell>
                        <TableCell className="text-right font-mono">${employee.totalAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                            <Badge variant={employee.flagged > 2 ? 'destructive' : employee.flagged > 0 ? 'secondary' : 'default'}
                                   className={employee.flagged === 0 ? 'bg-green-500/20 text-green-700' : ''}
                            >
                                {employee.flagged}
                            </Badge>
                        </TableCell>
                        <TableCell>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center justify-center gap-2">
                                         <Progress value={employee.approvalRate} className="w-24 h-2" indicatorClassName={employee.approvalRate < 80 ? 'bg-destructive' : 'bg-primary'} />
                                         <span className="text-xs font-semibold">{employee.approvalRate}%</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent><p>{employee.approvalRate}% of receipts approved</p></TooltipContent>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TooltipProvider>
    );
}
