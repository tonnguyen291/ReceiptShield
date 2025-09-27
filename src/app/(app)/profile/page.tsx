
'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserProfileSettings } from '@/components/shared/user-profile-settings';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        Loading user profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-8 flex justify-start">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
        </Button>
      </div>
      
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <UserCircle2 className="w-8 h-8 text-primary"/>
            Profile Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your personal information and account details
          </p>
        </div>
        
        <UserProfileSettings />
      </div>
    </div>
  );
}
