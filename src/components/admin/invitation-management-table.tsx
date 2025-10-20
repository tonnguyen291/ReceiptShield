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
import { MoreHorizontal, Mail, Clock, CheckCircle, XCircle, Trash2, Ban, Send, Copy, Link } from 'lucide-react';
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
  const [filteredInvitations, setFilteredInvitations] = useState<Invitation[]>([]);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  const loadInvitations = async () => {
    try {
      setIsLoading(true);
      const invitationsData = await getInvitations();
      setInvitations(invitationsData);
      applyFilter(invitationsData, statusFilter);
      console.log('📧 Loaded invitations:', {
        total: invitationsData.length,
        filter: statusFilter,
        filtered: invitationsData.filter(inv => statusFilter === 'all' || inv.status === statusFilter).length
      });
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

  const applyFilter = (invitationsList: Invitation[], filter: string) => {
    console.log('🔍 Applying filter:', { filter, totalInvitations: invitationsList.length });
    if (filter === 'all') {
      setFilteredInvitations(invitationsList);
      console.log('🔍 Set all invitations:', invitationsList.length);
    } else {
      const filtered = invitationsList.filter(invitation => invitation.status === filter);
      setFilteredInvitations(filtered);
      console.log('🔍 Filtered invitations:', { filter, count: filtered.length });
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    applyFilter(invitations, value);
  };

  const getStatusCounts = () => {
    const counts = {
      all: invitations.length,
      pending: invitations.filter(inv => inv.status === 'pending').length,
      accepted: invitations.filter(inv => inv.status === 'accepted').length,
      expired: invitations.filter(inv => inv.status === 'expired').length,
      cancelled: invitations.filter(inv => inv.status === 'cancelled').length,
    };
    return counts;
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

  const handleResendInvitation = async (invitation: Invitation) => {
    try {
      // Call the send invitation API to resend the email
      const response = await fetch('/api/send-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: invitation.email,
          role: invitation.role,
          supervisorId: invitation.supervisorId,
          message: invitation.status === 'expired' 
            ? 'Your invitation has been renewed and resent to join ReceiptShield'
            : 'Resending your invitation to join ReceiptShield',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resend invitation');
      }

      const result = await response.json();
      
      // Refresh the invitations list to show updated status
      await loadInvitations();
      
      toast({
        title: invitation.status === 'expired' ? 'Invitation Renewed' : 'Invitation Resent',
        description: result.message || `Invitation email has been resent to ${invitation.email}`,
      });
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to resend invitation',
        variant: 'destructive',
      });
    }
  };

  const handleCopyInvitationUrl = async (invitation: Invitation) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://compensationengine.com';
      const invitationUrl = `${baseUrl}/accept-invitation?token=${invitation.token}`;
      
      await navigator.clipboard.writeText(invitationUrl);
      toast({
        title: 'Link Copied',
        description: 'Invitation link has been copied to clipboard',
      });
    } catch (error) {
      console.error('Error copying invitation URL:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy invitation link',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (invitation: Invitation) => {
    switch (invitation.status) {
      case 'pending':
        return (
          <Badge variant="secondary">
            Pending
          </Badge>
        );
      case 'accepted':
        return (
          <Badge variant="default">
            Accepted
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline">
            Cancelled
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="destructive">
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
        return isExpired ? <Clock className="h-4 w-4 text-destructive" /> : <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'cancelled':
      case 'expired':
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading invitations...</p>
        </div>
      </div>
    );
  }

  console.log('🔍 Current state:', { 
    invitations: invitations.length, 
    filteredInvitations: filteredInvitations.length, 
    statusFilter 
  });

  return (
    <>

      {/* Status Count Bar */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Status Overview:</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {(() => {
            const counts = getStatusCounts();
            return [
              { status: 'all', label: 'All', count: counts.all, color: 'bg-muted text-muted-foreground' },
              { status: 'pending', label: 'Pending', count: counts.pending, color: 'bg-primary/10 text-primary' },
              { status: 'accepted', label: 'Accepted', count: counts.accepted, color: 'bg-green-500/10 text-green-600' },
              { status: 'expired', label: 'Expired', count: counts.expired, color: 'bg-destructive/10 text-destructive' },
              { status: 'cancelled', label: 'Cancelled', count: counts.cancelled, color: 'bg-orange-500/10 text-orange-600' },
            ].map(({ status, label, count, color }) => (
              <div
                key={status}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors hover:opacity-80 ${
                  statusFilter === status ? 'ring-2 ring-primary ring-offset-1' : ''
                } ${color}`}
                onClick={() => handleStatusFilterChange(status)}
              >
                <span>{label}</span>
                <span className="font-bold">{count}</span>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Content based on filtered results */}
      {filteredInvitations.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mb-6">
            <Mail className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">
            {statusFilter === 'all' ? 'No Invitations Yet' : `No ${statusFilter} Invitations`}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {statusFilter === 'all' 
              ? 'No invitations have been sent yet. Use the "Invite New User" button above to send your first invitation.'
              : `No invitations with "${statusFilter}" status found. Try changing the filter or send new invitations.`
            }
          </p>
        </div>
      ) : (

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Sent</TableHead>
              <TableHead className="font-semibold">Expires</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {filteredInvitations.map((invitation) => {
            // Calculate days until expiry based on the last sent date
            const lastSentDate = invitation.lastSentAt || invitation.createdAt;
            const daysUntilExpiry = getDaysUntilExpiry(invitation.expiresAt);
            const isExpired = daysUntilExpiry <= 0;
            
            return (
              <TableRow key={invitation.id} className={cn(
                "hover:bg-muted/50 transition-colors",
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
                    {formatDate(invitation.lastSentAt || invitation.createdAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "text-sm",
                    invitation.status === 'expired' ? "text-destructive" : 
                    invitation.status === 'pending' && daysUntilExpiry <= 2 ? "text-amber-600" : 
                    "text-muted-foreground"
                  )}>
                    {invitation.status === 'expired' ? 'Expired' : 
                     invitation.status === 'pending' ? `${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} left` :
                     invitation.status === 'accepted' ? 'N/A' :
                     invitation.status === 'cancelled' ? 'N/A' :
                     'N/A'}
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
                        <>
                          <DropdownMenuItem 
                            className="text-blue-600 focus:text-blue-600"
                            onClick={() => handleResendInvitation(invitation)}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Resend Invitation
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-green-600 focus:text-green-600"
                            onClick={() => handleCopyInvitationUrl(invitation)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Invitation Link
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-orange-600 focus:text-orange-600"
                            onClick={() => handleOpenCancelDialog(invitation)}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Cancel Invitation
                          </DropdownMenuItem>
                        </>
                      )}
                      {invitation.status === 'expired' && (
                        <>
                          <DropdownMenuItem 
                            className="text-blue-600 focus:text-blue-600"
                            onClick={() => handleResendInvitation(invitation)}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Resend & Renew Invitation
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-green-600 focus:text-green-600"
                            onClick={() => handleCopyInvitationUrl(invitation)}
                          >
                            <Link className="mr-2 h-4 w-4" />
                            Copy Invitation Link
                          </DropdownMenuItem>
                        </>
                      )}
                      {invitation.status === 'cancelled' && (
                        <DropdownMenuItem 
                          className="text-green-600 focus:text-green-600"
                          onClick={() => handleCopyInvitationUrl(invitation)}
                        >
                          <Link className="mr-2 h-4 w-4" />
                          Copy Invitation Link
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
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
      </div>
      )}

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
