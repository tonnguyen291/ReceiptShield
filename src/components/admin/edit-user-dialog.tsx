
'use client';

import { useState, useEffect } from 'react';
import type { User, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateUser } from '@/lib/firebase-user-store';
import { updateUserEmail } from '@/lib/firebase-auth';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: () => void;
}

export function EditUserDialog({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}: EditUserDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingAdmin, setIsConfirmingAdmin] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email);
      setRole(user.role);
      setCurrentPassword('');
      setEmailError('');
      setIsChangingEmail(false);
    }
  }, [user]);

  if (!user) return null;

  const proceedWithSave = async () => {
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
      const updatedUser: Partial<User> = {
        name,
        email: email.toLowerCase(),
        role,
        // If role is changed from employee, supervisorId should be cleared
        supervisorId: role === 'employee' ? user.supervisorId : undefined,
      };
      
      await updateUser(user.id, updatedUser);
      
      onUserUpdated();
      toast({
        title: "User Updated",
        description: `Details for ${user.name} have been saved${emailChanged ? ' and email has been updated' : ''}.`,
      });
      onClose();
    } catch (error: any) {
      console.error('Error updating user:', error);
      let errorMessage = 'Failed to update user. Please try again.';
      
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
      if (isConfirmingAdmin) setIsConfirmingAdmin(false);
    }
  }

  const handleSave = () => {
    // If the role is being changed TO admin and the original role was NOT admin, show confirmation
    if (role === 'admin' && user.role !== 'admin') {
      setIsConfirmingAdmin(true);
      return;
    }
    proceedWithSave();
  };
  
  const canChangeRole = user.role !== 'admin';

  return (
    <>
      <Dialog open={isOpen && !isConfirmingAdmin} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Details</DialogTitle>
            <DialogDescription>
              Modify the details for <strong>{user.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="User's full name"
                  disabled={isSaving}
                />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                      value={role}
                      onValueChange={(value) => setRole(value as UserRole)}
                      disabled={isSaving || !canChangeRole}
                  >
                      <SelectTrigger id="edit-role">
                      <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                  </Select>
                  {!canChangeRole && (
                      <p className="text-xs text-muted-foreground">The role of an admin cannot be changed.</p>
                  )}
              </div>
              <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                      id="edit-email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError('');
                        setIsChangingEmail(e.target.value !== user.email);
                      }}
                      placeholder="user@example.com"
                      disabled={isSaving}
                      className={emailError ? 'border-destructive' : ''}
                  />
                  {emailError && (
                    <p className="text-xs text-destructive">{emailError}</p>
                  )}
                  {isChangingEmail && (
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        disabled={isSaving}
                        className={emailError ? 'border-destructive' : ''}
                      />
                      <p className="text-xs text-muted-foreground">
                        Current password is required to change email address.
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                      Caution: Changing the email affects login and receipt history.
                  </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isConfirmingAdmin} onOpenChange={setIsConfirmingAdmin}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-destructive"/>
                Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
                You are about to promote <strong>{name}</strong> to an <strong>Admin</strong>.
                This action is irreversible through this interface. Are you sure you want to continue?
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmingAdmin(false)} disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
                onClick={proceedWithSave}
                disabled={isSaving}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, Make Admin
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
   </>
  );
}
