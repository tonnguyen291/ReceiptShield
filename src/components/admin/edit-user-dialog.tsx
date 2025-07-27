
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateUser } from '@/lib/user-store';
import { Loader2 } from 'lucide-react';
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
  const [role, setRole] = useState<UserRole>('employee');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setRole(user.role);
    }
  }, [user]);

  if (!user) return null;

  const handleSave = () => {
    setIsSaving(true);
    const updatedUser: User = {
        ...user,
        name,
        role,
        // If role is changed from employee, supervisorId should be cleared
        supervisorId: role === 'employee' ? user.supervisorId : undefined,
    };

    updateUser(updatedUser);
    
    // Simulate a small delay for user feedback
    setTimeout(() => {
        setIsSaving(false);
        onUserUpdated();
        toast({
            title: "User Updated",
            description: `Details for ${user.name} have been saved.`,
        });
        onClose();
    }, 500);
  };
  
  const canChangeRole = user.role !== 'admin';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Details</DialogTitle>
          <DialogDescription>
            Modify the details for <strong>{user.name}</strong> ({user.email}).
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
                    value={user.email}
                    disabled
                    readOnly
                    className="bg-muted/50"
                />
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
  );
}
