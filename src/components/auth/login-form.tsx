
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import type { User, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield } from 'lucide-react';
import { getManagers } from '@/lib/firebase-user-store';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function LoginForm() {
  const [managers, setManagers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [supervisorId, setSupervisorId] = useState<string>('');
  const [isCreateAccountMode, setIsCreateAccountMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, createAccount, user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // If the user is already logged in (e.g., from a previous session), redirect them.
    if (!isLoading && user) {
        if (user.role === 'admin') {
            router.push('/admin/dashboard');
        } else if (user.role === 'manager') {
            router.push('/manager/dashboard');
        } else {
            router.push('/employee/dashboard');
        }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (isCreateAccountMode) {
      const loadManagers = async () => {
        const managersList = await getManagers();
        setManagers(managersList);
      };
      loadManagers();
    }
  }, [isCreateAccountMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const showErrorToast = (description: string) => {
        toast({
            title: isCreateAccountMode ? 'Creation Failed' : 'Login Failed',
            description,
            variant: 'destructive',
        });
    }

    try {
      if (!email) {
        showErrorToast('Email is required.');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        showErrorToast('Please enter a valid email address.');
        return;
      }
      if (!password) {
        showErrorToast('Password is required.');
        return;
      }

      if (isCreateAccountMode) {
        if (!name.trim()) {
          showErrorToast('Full name is required.');
          return;
        }
        if (password.length < 6) {
          showErrorToast('Password must be at least 6 characters long.');
          return;
        }
        if (password !== confirmPassword) {
          showErrorToast('Passwords do not match.');
          return;
        }
        if (role === 'employee' && !supervisorId) {
          showErrorToast('You must select a supervisor.');
          return;
        }
        const response = await createAccount(name, email, role, supervisorId);
        if (!response.success) {
          showErrorToast(response.message || "Failed to create account.");
        }
      } else {
        const response = await login(email, role);
        if (!response.success) {
          showErrorToast(response.message || "Login failed.");
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      showErrorToast('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsCreateAccountMode(!isCreateAccountMode);
    // Reset fields
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRole('employee');
    setSupervisorId('');
  };

  // While loading auth state or if user exists (and is being redirected), show a loading spinner.
  if (isLoading || user) {
    return (
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center py-10">
          <div className="flex justify-center mb-4">
            <Shield className="w-16 h-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline">
            {isLoading ? 'Connecting to Firebase...' : 'Authenticating'}
          </CardTitle>
           <CardDescription>
            {isLoading ? 'Initializing database connection...' : 'Please wait...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center h-56 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          {isLoading && (
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              This may take a few seconds on first load while we connect to Firebase...
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
           <p className="text-xs text-muted-foreground">
             {isLoading ? 'Initializing...' : 'Redirecting...'}
           </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Shield className="w-16 h-16 text-primary" />
        </div>
        <CardTitle className="text-3xl font-headline">
          {isCreateAccountMode ? 'Create Account' : 'Welcome to Receipt Shield'}
        </CardTitle>
        <CardDescription>
          {isCreateAccountMode ? 'Fill in the details to get started.' : 'Please sign in to manage your expenses.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {isCreateAccountMode && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {isCreateAccountMode && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isCreateAccountMode && role === 'employee' && (
            <div className="space-y-2">
              <Label htmlFor="supervisor">Supervisor</Label>
              <Select value={supervisorId} onValueChange={setSupervisorId}>
                <SelectTrigger id="supervisor">
                  <SelectValue placeholder="Select your supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {managers.length > 0 ? (
                    managers.map(manager => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name} ({manager.email})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No managers available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isSubmitting}
          >
            {(isLoading || isSubmitting) ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" />
                {isCreateAccountMode ? 'Creating Account...' : 'Signing In...'}
              </div>
            ) : (
              isCreateAccountMode ? 'Create Account' : 'Sign In'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" onClick={toggleMode} className="text-sm">
          {isCreateAccountMode ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
        </Button>
      </CardFooter>
    </Card>
  );
}
