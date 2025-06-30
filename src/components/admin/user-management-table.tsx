
'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/types';
import { getUsers, getManagers } from '@/lib/user-store';
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
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UserManagementTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [managers, setManagers] = useState<User[]>([]);

    useEffect(() => {
        const allUsers = getUsers();
        const allManagers = getManagers();
        setUsers(allUsers);
        setManagers(allManagers);
    }, []);

    const getSupervisorName = (supervisorId?: string) => {
        if (!supervisorId) return 'N/A';
        const supervisor = managers.find(m => m.id === supervisorId);
        return supervisor?.name || 'Unknown';
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden md:table-cell">Supervisor</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={`https://placehold.co/40x40.png?text=${user.name ? user.name[0] : 'U'}`} data-ai-hint="abstract letter" />
                                    <AvatarFallback>{user.name?.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge 
                                variant={user.role === 'admin' ? 'destructive' : user.role === 'manager' ? 'secondary' : 'default'}
                                className="capitalize"
                            >
                                {user.role}
                            </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                            {getSupervisorName(user.supervisorId)}
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem disabled>Edit User</DropdownMenuItem>
                                    <DropdownMenuItem disabled>Change Role</DropdownMenuItem>
                                    <DropdownMenuItem disabled>Reassign Supervisor</DropdownMenuItem>
                                    <DropdownMenuItem disabled className="text-destructive">Deactivate User</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
