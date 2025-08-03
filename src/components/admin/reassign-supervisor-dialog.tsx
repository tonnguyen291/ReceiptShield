
'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/types';
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
import { Label } from '@/components/ui/label';
import { updateUserSupervisor, getManagers } from '@/lib/user-store';
import { Loader2 } from 'lucide-react';

interface ReassignSupervisorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSupervisorReassigned: () => void;
}

export function ReassignSupervisorDialog({
  isOpen,
  onClose,
  user,
  onSupervisorReassigned,
}: ReassignSupervisorDialogProps) {
  const [selectedSupervisorId, setSelectedSupervisorId] = useState(user.supervisorId || '');
  const [isSaving, setIsSaving] = useState(false);
  const [availableManagers, setAvailableManagers] = useState<User[]>([]);

  useEffect(() => {
    // Ensure the user being edited cannot be their own supervisor
    if (isOpen) {
        const allManagers = getManagers();
        setAvailableManagers(allManagers.filter(manager => manager.id !== user.id));
    }
  }, [user, isOpen]);

  const handleSave = () => {
    if (!selectedSupervisorId || selectedSupervisorId === user.supervisorId) {
      onClose();
      return;
    }
    setIsSaving(true);
    updateUserSupervisor(user.id, selectedSupervisorId);
    // Simulate a small delay for user feedback
    setTimeout(() => {
        setIsSaving(false);
        onSupervisorReassigned();
        onClose();
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reassign Supervisor</DialogTitle>
          <DialogDescription>
            Change the supervisor for <strong>{user.name}</strong> ({user.email}).
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="supervisor-select">New Supervisor</Label>
          <Select
            value={selectedSupervisorId}
            onValueChange={setSelectedSupervisorId}
          >
            <SelectTrigger id="supervisor-select" className="mt-2">
              <SelectValue placeholder="Select a manager" />
            </SelectTrigger>
            <SelectContent>
              {availableManagers.map((manager) => (
                <SelectItem key={manager.id} value={manager.id}>
                  {manager.name} ({manager.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !selectedSupervisorId || selectedSupervisorId === user.supervisorId}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
