
'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/types';
import { getUsers, getManagers, updateUser } from '@/lib/user-store';
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
import { MoreHorizontal, Pencil, UserCog, UserX, UserCheck, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ReassignSupervisorDialog } from './reassign-supervisor-dialog';
import { EditUserDialog } from './edit-user-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

export function UserManagementTable() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [managers, setManagers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeactivateConfirmOpen, setIsDeactivateConfirmOpen] = useState(false);
    const { toast } = useToast();

    const loadData = () => {
        const allUsers = getUsers();
        const allManagers = getManagers();
        setUsers(allUsers);
        setManagers(allManagers);
    };

    useEffect(() => {
        loadData();
    }, []);
    
    const handleOpenReassignDialog = (user: User) => {
        if(user.role === 'employee') {
            setSelectedUser(user);
            setIsReassignDialogOpen(true);
        }
    };

    const handleOpenEditDialog = (user: User) => {
        setSelectedUser(user);
        setIsEditDialogOpen(true);
    };

    const handleOpenDeactivateDialog = (user: User) => {
        setSelectedUser(user);
        setIsDeactivateConfirmOpen(true);
    };

    const handleToggleUserStatus = (user: User) => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        updateUser({ ...user, status: newStatus });
        loadData();
        toast({
            title: `User ${newStatus === 'active' ? 'Reactivated' : 'Deactivated'}`,
            description: `${user.name} has been ${newStatus === 'active' ? 'reactivated' : 'deactivated'}.`
        });
        if (isDeactivateConfirmOpen) {
            setIsDeactivateConfirmOpen(false);
            setSelectedUser(null);
        }
    }


    const handleSupervisorReassigned = () => {
        loadData(); // Re-fetch users to reflect the change
        toast({
            title: "Supervisor Reassigned",
            description: "The user's supervisor has been successfully updated."
        });
    };

    const handleUserUpdated = () => {
        loadData();
    };

    const getSupervisorName = (supervisorId?: string) => {
        if (!supervisorId) return 'N/A';
        const supervisor = managers.find(m => m.id === supervisorId);
        return supervisor?.name || 'Unknown';
    };

    return (
        <>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden md:table-cell">Supervisor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user.id} className={cn(user.status === 'inactive' && 'opacity-50')}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={`https://placehold.co/40x40.png?text=${user.name ? user.name[0] : 'U'}`} data-ai-hint="abstract letter"/>
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
                        <TableCell>
                           <Badge variant={user.status === 'active' ? 'default' : 'outline'} className={cn(user.status === 'active' ? 'bg-green-500/20 text-green-700' : '')}>
                                {user.status === 'active' ? 'Active' : 'Inactive'}
                           </Badge>
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
                                    <DropdownMenuItem onClick={() => handleOpenEditDialog(user)} disabled={user.status === 'inactive'}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleOpenReassignDialog(user)}
                                        disabled={user.role !== 'employee' || user.status === 'inactive'}
                                    >
                                        <UserCog className="mr-2 h-4 w-4" />
                                        Reassign Supervisor
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                     {user.status === 'active' ? (
                                        <DropdownMenuItem 
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => handleOpenDeactivateDialog(user)}
                                            disabled={user.role === 'admin'}
                                        >
                                            <UserX className="mr-2 h-4 w-4" />
                                            Deactivate User
                                        </DropdownMenuItem>
                                     ) : (
                                        <DropdownMenuItem 
                                            className="text-green-600 focus:text-green-600"
                                            onClick={() => handleToggleUserStatus(user)}
                                        >
                                            <UserCheck className="mr-2 h-4 w-4" />
                                            Reactivate User
                                        </DropdownMenuItem>
                                     )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        {selectedUser && (
            <ReassignSupervisorDialog
                isOpen={isReassignDialogOpen}
                onClose={() => setIsReassignDialogOpen(false)}
                user={selectedUser}
                managers={managers}
                onSupervisorReassigned={handleSupervisorReassigned}
            />
        )}
        {selectedUser && (
            <EditUserDialog
                isOpen={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                user={selectedUser}
                onUserUpdated={handleUserUpdated}
            />
        )}
        <AlertDialog open={isDeactivateConfirmOpen} onOpenChange={setIsDeactivateConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-destructive"/>
                    Are you sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                    This will deactivate <strong>{selectedUser?.name}</strong>. They will no longer be able to log in. Are you sure you want to continue?
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsDeactivateConfirmOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    onClick={() => selectedUser && handleToggleUserStatus(selectedUser)}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                    Yes, Deactivate
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}
