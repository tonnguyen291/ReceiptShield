'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { updateUserEmail } from '@/lib/firebase-auth';
import { updateUser } from '@/lib/firebase-user-store';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, User, Save, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function UserProfileSettings() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const { toast } = useToast();

  if (!user) return null;

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    setEmailError('');
    setIsChangingEmail(newEmail !== user.email);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setEmailError('');

    try {
      // Check if email is being changed
      const emailChanged = email !== user.email;
      
      if (emailChanged) {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setEmailError('Please enter a valid email address');
          setIsSaving(false);
          return;
        }
        
        // Check if password is provided for email change
        if (!currentPassword.trim()) {
          setEmailError('Current password is required to change email');
          setIsSaving(false);
          return;
        }
        
        // Update email in Firebase Auth and Firestore
        await updateUserEmail(user.uid, email, currentPassword);
      }

      // Update other user details in Firestore
      const updatedUser: Partial<typeof user> = {
        name,
        email: email.toLowerCase(),
      };
      
      await updateUser(user.id, updatedUser);
      
      // Update the user context
      setUser({
        ...user,
        ...updatedUser,
      });
      
      toast({
        title: "Profile Updated",
        description: `Your profile has been updated${emailChanged ? ' and email has been changed' : ''}.`,
      });
      
      // Clear password field
      setCurrentPassword('');
      setIsChangingEmail(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (error.message?.includes('wrong-password')) {
        setEmailError('Incorrect current password');
      } else if (error.message?.includes('email-already-in-use')) {
        setEmailError('This email is already in use');
      } else if (error.message?.includes('invalid-email')) {
        setEmailError('Invalid email address');
      } else if (error.message) {
        setEmailError(error.message);
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Settings
        </CardTitle>
        <CardDescription>
          Update your personal information and account details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Full Name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-email">Email Address</Label>
            <Input
              id="profile-email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="your@email.com"
              disabled={isSaving}
              className={emailError ? 'border-destructive' : ''}
            />
            {emailError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{emailError}</AlertDescription>
              </Alert>
            )}
            {isChangingEmail && (
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  disabled={isSaving}
                  className={emailError ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground">
                  Current password is required to change your email address.
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Changing your email will affect your login credentials and receipt history.
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || (!name.trim() || !email.trim())}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
