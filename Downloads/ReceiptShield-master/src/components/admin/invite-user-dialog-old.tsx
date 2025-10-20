'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import confetti from 'canvas-confetti';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, UserPlus, AlertCircle, CheckCircle, XCircle, Link as LinkIcon, Copy, Send, Eye, RefreshCw, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { createInvitation, getInvitationByToken } from '@/lib/firebase-invitation-store';
import { getUsers } from '@/lib/firebase-user-store';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
// Email service is now handled via API route
import type { User, UserRole, InvitationRequest } from '@/types';

const inviteUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['employee', 'manager', 'admin'] as const),
  supervisorId: z.string().optional(),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
});

type InviteUserFormData = z.infer<typeof inviteUserSchema>;

interface InviteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInvitationSent: () => void;
}

export function InviteUserDialog({
  isOpen,
  onClose,
  onInvitationSent,
}: InviteUserDialogProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [managers, setManagers] = useState<User[]>([]);
  const [sentInvitation, setSentInvitation] = useState<null | { email: string; token: string; role: UserRole }>(null);
  const [copied, setCopied] = useState(false);
  const [emailValidation, setEmailValidation] = useState<{
    isValidating: boolean;
    isExisting: boolean;
    message: string;
  }>({
    isValidating: false,
    isExisting: false,
    message: '',
  });
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  console.log('🔍 InviteUserDialog rendered:', { isOpen, currentUser: !!currentUser });

  const form = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: '',
      role: 'employee',
      supervisorId: '',
      message: '',
    },
  });

  const selectedRole = form.watch('role');

  // Load managers when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadManagers();
    }
  }, [isOpen]);

  // Debounced email validation
  useEffect(() => {
    const email = form.watch('email');
    if (email) {
      const timeoutId = setTimeout(() => {
        validateEmail(email);
      }, 500); // 500ms delay
      
      return () => clearTimeout(timeoutId);
    } else {
      setEmailValidation({
        isValidating: false,
        isExisting: false,
        message: '',
      });
    }
  }, [form.watch('email')]);

  const loadManagers = async () => {
    try {
      const allUsers = await getUsers();
      const managerUsers = allUsers.filter(user => user.role === 'manager' && user.status === 'active');
      setManagers(managerUsers);
    } catch (error) {
      console.error('Error loading managers:', error);
    }
  };

  const validateEmail = async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailValidation({
        isValidating: false,
        isExisting: false,
        message: '',
      });
      return;
    }

    setEmailValidation({
      isValidating: true,
      isExisting: false,
      message: '',
    });

    try {
      // Check if user already exists
      const existingUserQuery = query(
        collection(db, 'users'),
        where('email', '==', email.toLowerCase())
      );
      const existingUserSnapshot = await getDocs(existingUserQuery);
      
      if (!existingUserSnapshot.empty) {
        setEmailValidation({
          isValidating: false,
          isExisting: true,
          message: 'A user with this email already exists in the system.',
        });
        return;
      }

      // Check if there's already a pending invitation
      const existingInvitationQuery = query(
        collection(db, 'invitations'),
        where('email', '==', email.toLowerCase()),
        where('status', '==', 'pending')
      );
      const existingInvitationSnapshot = await getDocs(existingInvitationQuery);
      
      if (!existingInvitationSnapshot.empty) {
        setEmailValidation({
          isValidating: false,
          isExisting: true,
          message: 'A pending invitation already exists for this email.',
        });
        return;
      }

      // Email is available
      setEmailValidation({
        isValidating: false,
        isExisting: false,
        message: 'Email is available.',
      });
    } catch (error) {
      console.error('Error validating email:', error);
      setEmailValidation({
        isValidating: false,
        isExisting: false,
        message: '',
      });
    }
  };

  const onSubmit = async (data: InviteUserFormData) => {
    console.log('🔍 Form submitted:', data);
    if (!currentUser) {
      console.log('❌ No current user found');
      return;
    }

    // Check if email validation failed
    if (emailValidation.isExisting) {
      return;
    }

    setIsLoading(true);
    try {
      const invitationData: InvitationRequest = {
        email: data.email,
        role: data.role,
        supervisorId: data.supervisorId || undefined,
        message: data.message || undefined,
      };

      // Send invitation via API route (handles both database creation and email sending)
      const response = await fetch('/api/send-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...invitationData,
          message: data.message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invitation');
      }

      const result = await response.json();
      
      // Get the invitation details for display
      const invitation = await getInvitationByToken(result.token);
      
      if (invitation) {
        setSentInvitation({ email: invitation.email, token: invitation.token, role: invitation.role });
      }
      setCopied(false);
      onInvitationSent();
    } catch (error) {
      console.error('Error sending invitation:', error);
      
      let errorTitle = 'Error';
      let errorMessage = 'Failed to send invitation';
      let errorIcon = <XCircle className="h-4 w-4" />;
      
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          errorTitle = 'User Already Exists';
          errorMessage = error.message;
          errorIcon = <AlertCircle className="h-4 w-4" />;
        } else if (error.message.includes('pending invitation')) {
          errorTitle = 'Invitation Already Sent';
          errorMessage = error.message;
          errorIcon = <Mail className="h-4 w-4" />;
        } else if (error.message.includes('Failed to send invitation email')) {
          errorTitle = 'Email Error';
          errorMessage = 'The invitation was created but the email could not be sent. Please try again.';
          errorIcon = <Mail className="h-4 w-4" />;
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      setSentInvitation(null);
      setEmailValidation({
        isValidating: false,
        isExisting: false,
        message: '',
      });
      onClose();
    }
  };

  const invitationUrl = sentInvitation
    ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://compensationengine.com'}/accept-invitation?token=${sentInvitation.token}`
    : '';

  const handleCopy = async () => {
    if (!invitationUrl) return;
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback toast if clipboard fails
      toast({ description: 'Could not copy link. Please copy manually.' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            Invite New User
          </DialogTitle>
          <DialogDescription className="text-base">
            Send an invitation to a new user to join your organization. They will receive an email with instructions to create their account.
          </DialogDescription>
        </DialogHeader>

        {sentInvitation && (
          <div className="mb-4 rounded-md border border-border bg-muted p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="font-medium">Invitation sent to {sentInvitation.email}</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Share or copy the link below if needed:
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm max-w-full overflow-hidden">
                    <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate" title={invitationUrl}>{invitationUrl}</span>
                  </div>
                  <Button type="button" variant="secondary" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="user@company.com"
                        className={`pl-10 ${
                          emailValidation.isExisting 
                            ? 'border-destructive focus:border-destructive' 
                            : emailValidation.message === 'Email is available.' 
                            ? 'border-green-500 focus:border-green-500' 
                            : ''
                        }`}
                        disabled={!!sentInvitation || isLoading}
                        {...field}
                      />
                      {emailValidation.isValidating && (
                        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {!emailValidation.isValidating && emailValidation.isExisting && (
                        <XCircle className="absolute right-3 top-3 h-4 w-4 text-destructive" />
                      )}
                      {!emailValidation.isValidating && emailValidation.message === 'Email is available.' && (
                        <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-primary" />
                      )}
                    </div>
                  </FormControl>
                  {emailValidation.message && (
                    <div className={`text-sm flex items-center gap-2 p-2 rounded-md ${
                      emailValidation.isExisting 
                        ? 'text-destructive bg-destructive/10 border border-destructive/20' 
                        : emailValidation.message === 'Email is available.' 
                        ? 'text-primary/90 bg-muted border border-border' 
                        : 'text-muted-foreground'
                    }`}>
                      {emailValidation.isExisting && <AlertCircle className="h-3 w-3" />}
                      {emailValidation.message === 'Email is available.' && <CheckCircle className="h-3 w-3 text-primary" />}
                      {emailValidation.message}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!sentInvitation || isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {selectedRole === 'employee' && 'Can submit receipts and view their own expense history'}
                    {selectedRole === 'manager' && 'Can manage team members and approve/reject receipts'}
                    {selectedRole === 'admin' && 'Full access to all features and user management'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedRole === 'employee' && (
              <FormField
                control={form.control}
                name="supervisorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supervisor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!!sentInvitation || isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a supervisor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {managers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.name} ({manager.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the manager who will supervise this employee
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a personal message to include in the invitation email..."
                      className="resize-none"
                      rows={3}
                      disabled={!!sentInvitation || isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This message will be included in the invitation email
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                {sentInvitation ? 'Done' : 'Cancel'}
              </Button>
              {!sentInvitation && (
                <Button 
                  type="submit" 
                  disabled={isLoading || emailValidation.isValidating || emailValidation.isExisting} 
                  className="min-w-[140px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Invitation
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
