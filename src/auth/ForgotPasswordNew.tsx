'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';

const ForgotPasswordNew: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setEmailError('');

    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });
      setSuccess(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      if (error.code === 'auth/user-not-found') {
        setEmailError('No account found with this email address');
      } else if (error.code === 'auth/invalid-email') {
        setEmailError('Please enter a valid email address');
      } else if (error.code === 'auth/too-many-requests') {
        setEmailError('Too many attempts. Please try again later');
      } else {
        setEmailError('Failed to send reset email. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(156,146,172,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
        </div>
        
        <div className="w-full max-w-md relative z-10">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-8 text-muted-foreground hover:text-foreground transition-colors duration-200 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
            Back
          </Button>

          {/* Success Card */}
          <div className="rounded-lg text-card-foreground shadow-2xl border-0 bg-white/90 backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5"></div>
            
            <div className="flex flex-col p-6 text-center space-y-6 pb-8 relative">
              {/* Success Icon */}
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group hover:scale-105 transition-transform duration-300">
                <CheckCircle className="h-10 w-10 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              
              <div className="space-y-3">
                <div className="tracking-tight text-3xl font-bold bg-gradient-to-r from-slate-800 via-green-600 to-emerald-600 bg-clip-text text-transparent leading-tight">
                  Check Your Email
                </div>
                <div className="text-base text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  We've sent a password reset link to <strong>{email}</strong>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 space-y-6 px-8 pb-8 relative">
              {/* Success Details */}
              <div className="bg-green-50 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-green-800 mb-3">📧 Next Steps</h4>
                <div className="text-xs text-green-700 space-y-2 text-left">
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span>Check your email inbox for the reset link</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span>Click the link to reset your password</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span>Create a new secure password</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => router.push('/login')}
                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                <ArrowLeft className="mr-3 h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
                Back to Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(156,146,172,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-8 text-muted-foreground hover:text-foreground transition-colors duration-200 group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
          Back
        </Button>

        {/* Main Card */}
        <div className="rounded-lg text-card-foreground shadow-2xl border-0 bg-white/90 backdrop-blur-md relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5"></div>
          
          <div className="flex flex-col p-6 text-center space-y-6 pb-8 relative">
            {/* Icon */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group hover:scale-105 transition-transform duration-300">
              <Shield className="h-10 w-10 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            
            <div className="space-y-3">
              <div className="tracking-tight text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                Reset Your Password
              </div>
              <div className="text-base text-muted-foreground leading-relaxed max-w-sm mx-auto">
                No worries! Enter your email address and we'll send you a secure link to reset your password.
              </div>
            </div>
          </div>

          <div className="p-6 pt-0 space-y-6 px-8 pb-8 relative">
            {/* Email Input */}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                Email Address
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors duration-200" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleEmailChange}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className={cn(
                    "pl-20 h-14 text-base border-2 transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20",
                    emailError && "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                  )}
                />
              </div>
              {emailError && (
                <div className="flex items-center gap-2 text-sm text-red-600 animate-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit}
              disabled={loading || !email.trim()}
              className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  Send Reset Link
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-muted-foreground font-medium">or</span>
              </div>
            </div>

            {/* Additional Options */}
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <Button 
                  variant="link" 
                  onClick={() => router.push('/login')}
                  className="p-0 h-auto text-blue-600 hover:text-blue-700 font-semibold underline-offset-4"
                >
                  Sign in here
                </Button>
              </p>
              
              {/* Helpful Tips */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">💡 Helpful Tips</h4>
                <div className="text-xs text-muted-foreground space-y-2 text-left">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Check your spam folder if you don't see the email</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>The reset link will expire in 1 hour for security</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Contact support if you continue having issues</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Need help? Contact our{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto text-blue-600 hover:text-blue-700 font-semibold underline-offset-4"
            >
              support team
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordNew;
