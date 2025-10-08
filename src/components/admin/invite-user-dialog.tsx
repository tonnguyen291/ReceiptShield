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
import { Loader2, Mail, UserPlus, AlertCircle, CheckCircle, XCircle, Link as LinkIcon, Copy, Send, Eye, RefreshCw, List, Sparkles, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { createInvitation, getInvitationByToken } from '@/lib/firebase-invitation-store';
import { getUsers } from '@/lib/firebase-user-store';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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

  const form = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: '',
      role: 'employee',
      supervisorId: '',
      message: '',
    },
  });

  // Trigger confetti on successful invitation
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

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
      }, 500);
      
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
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', email.toLowerCase())
      );
      const usersSnapshot = await getDocs(usersQuery);

      if (!usersSnapshot.empty) {
        setEmailValidation({
          isValidating: false,
          isExisting: true,
          message: 'This email is already registered in the system.',
        });
        return;
      }

      const invitationsQuery = query(
        collection(db, 'invitations'),
        where('email', '==', email.toLowerCase()),
        where('status', '==', 'pending')
      );
      const invitationsSnapshot = await getDocs(invitationsQuery);

      if (!invitationsSnapshot.empty) {
        setEmailValidation({
          isValidating: false,
          isExisting: true,
          message: 'A pending invitation already exists for this email.',
        });
        return;
      }

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
    if (!currentUser || emailValidation.isExisting) return;

    setIsLoading(true);
    setEmailStatus('sending');
    setEmailError(null);

    try {
      const invitationData: InvitationRequest = {
        email: data.email,
        role: data.role,
        supervisorId: data.supervisorId || undefined,
        message: data.message || undefined,
      };

      // Send invitation
      const response = await fetch('/api/send-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...invitationData,
          message: data.message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send invitation');
      }

      const result = await response.json();
      const invitation = await getInvitationByToken(result.token);
      
      if (invitation) {
        setSentInvitation({ email: invitation.email, token: invitation.token, role: invitation.role });
        setEmailStatus('sent');
        triggerConfetti();
        onInvitationSent();
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      setEmailStatus('failed');
      setEmailError(error instanceof Error ? error.message : 'Failed to send invitation');
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send invitation',
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
      setEmailStatus('idle');
      setEmailError(null);
      setEmailValidation({ isValidating: false, isExisting: false, message: '' });
      onClose();
    }
  };

  const handleSendAnother = () => {
    form.reset();
    setSentInvitation(null);
    setEmailStatus('idle');
    setEmailError(null);
    setCopied(false);
  };

  const invitationUrl = sentInvitation
    ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://compensationengine.com'}/accept-invitation?token=${sentInvitation.token}`
    : '';

  const handleCopy = async () => {
    if (!invitationUrl) return;
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      toast({ description: '✅ Link copied to clipboard!' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ description: 'Could not copy link. Please copy manually.', variant: 'destructive' });
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'manager': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'employee': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[640px]">
        {sentInvitation ? (
          // Success View
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Invitation Sent Successfully!
                </h2>
                <p className="text-gray-600">
                  An invitation email has been sent to <span className="font-semibold">{sentInvitation.email}</span>
                </p>
              </div>
            </div>

            {/* Email Status Indicator */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {emailStatus === 'sending' && <Loader2 className="h-5 w-5 text-green-600 animate-spin" />}
                  {emailStatus === 'sent' && <Check className="h-5 w-5 text-green-600" />}
                  {emailStatus === 'failed' && <XCircle className="h-5 w-5 text-red-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-green-900">
                      {emailStatus === 'sending' && 'Sending email...'}
                      {emailStatus === 'sent' && 'Email delivered successfully'}
                      {emailStatus === 'failed' && 'Email delivery failed'}
                    </span>
                    <Badge className={getRoleBadgeColor(sentInvitation.role)}>
                      {sentInvitation.role}
                    </Badge>
                  </div>
                  {emailStatus === 'failed' && emailError && (
                    <p className="text-sm text-red-600 mt-1">{emailError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Invitation Link */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Share Invitation Link</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3">
                  <LinkIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600 truncate">{invitationUrl}</span>
                </div>
                <Button
                  type="button"
                  onClick={handleCopy}
                  className="flex-shrink-0"
                  variant={copied ? "default" : "outline"}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Button
                onClick={handleSendAnother}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Send Another
              </Button>
              <Button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Done
              </Button>
            </div>
          </div>
        ) : (
          // Form View
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                Invite New User
              </DialogTitle>
              <DialogDescription className="text-base">
                Send an invitation to a new user to join your organization. They will receive an email with instructions.
              </DialogDescription>
            </DialogHeader>

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
                            disabled={isLoading}
                            {...field}
                          />
                          {emailValidation.isValidating && (
                            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </FormControl>
                      {emailValidation.message && (
                        <p className={`text-sm ${emailValidation.isExisting ? 'text-destructive' : 'text-green-600'}`}>
                          {emailValidation.message}
                        </p>
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
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
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
                        Choose the user's role in the organization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('role') === 'employee' && (
                  <FormField
                    control={form.control}
                    name="supervisorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign Manager</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a manager (optional)" />
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
                          Optionally assign a manager to this employee
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
                          placeholder="Add a personal welcome message..."
                          className="resize-none"
                          rows={3}
                          disabled={isLoading}
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
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || emailValidation.isExisting}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

