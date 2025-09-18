'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Clock, User, Mail, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getInvitationByToken, updateInvitationStatus, isInvitationExpired } from '@/lib/firebase-invitation-store';
import type { Invitation } from '@/types';

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid invitation link. No token provided.');
      setIsLoading(false);
      return;
    }

    loadInvitation(token);
  }, [searchParams]);

  const loadInvitation = async (token: string) => {
    try {
      const invitationData = await getInvitationByToken(token);
      
      if (!invitationData) {
        setError('Invalid invitation link. The invitation may have been deleted or the link is incorrect.');
        return;
      }

      if (invitationData.status !== 'pending') {
        if (invitationData.status === 'accepted') {
          setError('This invitation has already been accepted.');
        } else if (invitationData.status === 'expired') {
          setError('This invitation has expired.');
        } else if (invitationData.status === 'cancelled') {
          setError('This invitation has been cancelled.');
        }
        return;
      }

      if (isInvitationExpired(invitationData)) {
        setError('This invitation has expired.');
        await updateInvitationStatus(invitationData.id, 'expired');
        return;
      }

      setInvitation(invitationData);
    } catch (error) {
      console.error('Error loading invitation:', error);
      setError('Failed to load invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SignUpFormData) => {
    if (!invitation) return;

    setIsSigningUp(true);
    try {
      // First, validate the invitation
      const response = await fetch('/api/accept-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: invitation.token,
          name: data.name,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to validate invitation');
      }

      // Now create the Firebase Auth user
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      const { getAuth } = await import('firebase/auth');
      const { addUser } = await import('@/lib/firebase-user-store');
      const { updateInvitationStatus } = await import('@/lib/firebase-invitation-store');

      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, invitation.email, data.password);
      
      // Update the user's display name
      await updateProfile(userCredential.user, {
        displayName: data.name,
      });

      // Create the user record in Firestore
      const userId = await addUser({
        name: data.name,
        email: invitation.email,
        role: invitation.role,
        supervisorId: invitation.supervisorId,
        status: 'active',
        uid: userCredential.user.uid,
      });

      // Update invitation status
      await updateInvitationStatus(invitation.id, 'accepted', userId);

      toast({
        title: 'Account Created Successfully!',
        description: 'Welcome to ReceiptShield. You are now logged in.',
      });

      // Redirect to appropriate dashboard based on role
      if (invitation.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (invitation.role === 'manager') {
        router.push('/manager/dashboard');
      } else {
        router.push('/employee/dashboard');
      }
    } catch (error) {
      console.error('Error creating account:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create account',
        variant: 'destructive',
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  const getStatusIcon = () => {
    if (error) return <XCircle className="h-6 w-6 text-destructive" />;
    if (invitation) return <CheckCircle className="h-6 w-6 text-green-600" />;
    return <Clock className="h-6 w-6 text-muted-foreground" />;
  };

  const getStatusColor = () => {
    if (error) return 'destructive';
    if (invitation) return 'default';
    return 'secondary';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading invitation...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl font-bold">
            {error ? 'Invalid Invitation' : 'Accept Invitation'}
          </CardTitle>
          <CardDescription>
            {error 
              ? 'There was a problem with your invitation link'
              : 'Complete your account setup to join ReceiptShield'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : invitation ? (
            <>
              {/* Invitation Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{invitation.email}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="secondary" className="capitalize">
                    {invitation.role}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Invited by {invitation.invitedBy}
                  </span>
                </div>
              </div>

              {/* Sign Up Form */}
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    {...form.register('name')}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    {...form.register('password')}
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    {...form.register('confirmPassword')}
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSigningUp}
                >
                  {isSigningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account & Accept Invitation
                </Button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  By creating an account, you agree to our terms of service and privacy policy.
                </p>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  );
}
