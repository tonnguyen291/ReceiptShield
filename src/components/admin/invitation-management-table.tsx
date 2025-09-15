'use client';

import { useState, useEffect } from 'react';
import type { Invitation } from '@/types';
import { getInvitations, cancelInvitation, deleteInvitation } from '@/lib/firebase-invitation-store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Mail, Clock, CheckCircle, XCircle, Trash2, Ban } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function InvitationManagementTable() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadInvitations = async () => {
    try {
      setIsLoading(true);
      const invitationsData = await getInvitations();
      setInvitations(invitationsData);
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invitations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
    
    // Listen for invitation sent events to refresh the list
    const handleInvitationSent = () => {
      loadInvitations();
    };
    
    window.addEventListener('invitation-sent', handleInvitationSent);
    
    return () => {
      window.removeEventListener('invitation-sent', handleInvitationSent);
    };
  }, []);

  const handleOpenCancelDialog = (invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setIsCancelDialogOpen(true);
  };

  const handleOpenDeleteDialog = (invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setIsDeleteDialogOpen(true);
  };

  const handleCancelInvitation = async () => {
    if (!selectedInvitation) return;

    try {
      await cancelInvitation(selectedInvitation.id);
      await loadInvitations();
      toast({
        title: 'Invitation Cancelled',
        description: `Invitation for ${selectedInvitation.email} has been cancelled.`
      });
      setIsCancelDialogOpen(false);
      setSelectedInvitation(null);
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel invitation',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteInvitation = async () => {
    if (!selectedInvitation) return;

    try {
      await deleteInvitation(selectedInvitation.id);
      await loadInvitations();
      toast({
        title: 'Invitation Deleted',
        description: `Invitation for ${selectedInvitation.email} has been permanently deleted.`
      });
      setIsDeleteDialogOpen(false);
      setSelectedInvitation(null);
    } catch (error) {
      console.error('Error deleting invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete invitation',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (invitation: Invitation) => {
    const isExpired = new Date() > invitation.expiresAt;
    
    switch (invitation.status) {
      case 'pending':
        return (
          <Badge 
            variant={isExpired ? 'destructive' : 'default'} 
            className={cn(
              isExpired ? 'bg-red-500/20 text-red-700' : 'bg-blue-500/20 text-blue-700'
            )}
          >
            {isExpired ? 'Expired' : 'Pending'}
          </Badge>
        );
      case 'accepted':
        return (
          <Badge variant="default" className="bg-green-500/20 text-green-700">
            Accepted
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-gray-500/20 text-gray-700">
            Cancelled
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="destructive" className="bg-red-500/20 text-red-700">
            Expired
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Unknown
          </Badge>
        );
    }
  };

  const getStatusIcon = (invitation: Invitation) => {
    const isExpired = new Date() > invitation.expiresAt;
    
    switch (invitation.status) {
      case 'pending':
        return isExpired ? <Clock className="h-4 w-4 text-red-500" /> : <Clock className="h-4 w-4 text-blue-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
      case 'expired':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getDaysUntilExpiry = (expiresAt: Date) => {
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invitations...</p>
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8">
        <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No Invitations</h3>
        <p className="text-sm text-muted-foreground">
          No invitations have been sent yet. Use the "Invite New User" button to send your first invitation.
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => {
            const daysUntilExpiry = getDaysUntilExpiry(invitation.expiresAt);
            const isExpired = daysUntilExpiry <= 0;
            
            return (
              <TableRow key={invitation.id} className={cn(
                invitation.status === 'cancelled' && 'opacity-50'
              )}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(invitation)}
                    <span className="font-medium">{invitation.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {invitation.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {getStatusBadge(invitation)}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(invitation.createdAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "text-sm",
                    isExpired ? "text-red-600" : daysUntilExpiry <= 2 ? "text-orange-600" : "text-muted-foreground"
                  )}>
                    {isExpired ? 'Expired' : `${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} left`}
                  </span>
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
                      <DropdownMenuSeparator />
                      {invitation.status === 'pending' && (
                        <DropdownMenuItem 
                          className="text-orange-600 focus:text-orange-600"
                          onClick={() => handleOpenCancelDialog(invitation)}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Cancel Invitation
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleOpenDeleteDialog(invitation)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Permanently
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the invitation for <strong>{selectedInvitation?.email}</strong>? 
              This will prevent them from accepting the invitation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Invitation</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelInvitation}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Cancel Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete the invitation for <strong>{selectedInvitation?.email}</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Invitation</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteInvitation}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
