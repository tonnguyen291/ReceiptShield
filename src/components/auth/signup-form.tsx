'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import type { User, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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
import { getManagers } from '@/lib/firebase-auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function SignupForm() {
  const [managers, setManagers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [supervisorId, setSupervisorId] = useState<string>('');
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createAccount, user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // If the user is already logged in, redirect them.
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
    const loadManagers = async () => {
      const managersList = await getManagers();
      setManagers(managersList);
    };
    loadManagers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const showErrorToast = (description: string) => {
        toast({
            title: 'Creation Failed',
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
      if (role === 'admin' && !companyName.trim()) {
        showErrorToast('Company name is required for admin accounts.');
        return;
      }
      
      const response = await createAccount(name, email, password, role, supervisorId, companyName);
      if (!response.success) {
        showErrorToast(response.message || "Failed to create account.");
      }
    } catch (error) {
      console.error('Authentication error:', error);
      showErrorToast('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Shield className="w-16 h-16 text-primary" />
        </div>
        <CardTitle className="text-3xl font-headline">
          Create Account
        </CardTitle>
        <CardDescription>
          Fill in the details to get started with Receipt Shield.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {role === 'employee' && (
            <div className="space-y-2">
              <Label htmlFor="supervisor">Supervisor</Label>
              <Select value={supervisorId} onValueChange={setSupervisorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {role === 'admin' && (
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Your Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
              <p className="text-sm text-gray-600">
                You'll be creating a new company and will be the owner with full control.
              </p>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
        <div className="text-center text-sm text-gray-600">
          <Link href="/" className="text-primary hover:underline">
            ← Back to Receipt Shield
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
