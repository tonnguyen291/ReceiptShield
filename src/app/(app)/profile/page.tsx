
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState(''); // Date of Birth

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setDob(user.dob || ''); 
    }
  }, [user]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser = { ...user, name, dob };
    setUser(updatedUser); 
    
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been saved.',
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        Loading user profile...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 flex justify-start">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <UserCircle2 className="w-7 h-7 text-primary"/>
            Manage Your Profile
          </CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (Cannot be changed)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled 
                readOnly
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date" 
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Save Changes</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
