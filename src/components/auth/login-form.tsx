
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
import { getManagers } from '@/lib/user-store';

export function LoginForm() {
  const [hasMounted, setHasMounted] = useState(false);
  const [managers, setManagers] = useState<User[]>([]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [supervisorId, setSupervisorId] = useState<string>('');
  const [error, setError] = useState('');
  const [isCreateAccountMode, setIsCreateAccountMode] = useState(false);
  const { login, createAccount } = useAuth();

  useEffect(() => {
    setHasMounted(true);
    if (isCreateAccountMode) {
      setManagers(getManagers());
    }
  }, [isCreateAccountMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    if (isCreateAccountMode) {
      if (!name.trim()) {
        setError('Full name is required.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (role === 'employee' && !supervisorId) {
        setError('You must select a supervisor.');
        return;
      }
      const result = createAccount(name, email, role, supervisorId);
      if (!result.success) {
        setError(result.message);
      }
    } else {
      const result = login(email, role);
      if (!result.success) {
        setError(result.message);
      }
    }
  };

  const toggleMode = () => {
    setIsCreateAccountMode(!isCreateAccountMode);
    setError('');
    // Reset fields
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRole('employee');
    setSupervisorId('');
  };

  if (!hasMounted) {
    return (
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center py-10">
          <div className="flex justify-center mb-4">
            <Shield className="w-16 h-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline">
            Loading Form
          </CardTitle>
           <CardDescription>
            Please wait a moment...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-56">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </CardContent>
        <CardFooter className="flex justify-center">
           <p className="text-xs text-muted-foreground">&nbsp;</p>
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
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            className="w-full"
          >
            {isCreateAccountMode ? 'Create Account' : 'Sign In'}
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
