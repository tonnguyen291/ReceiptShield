"use client";
import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { getUserByEmail } from "@/lib/firebase-user-store";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // First check if the email exists in our user database
      const user = await getUserByEmail(email);
      if (!user) {
        setError("No account found with this email address. Please check your email or contact support.");
        setLoading(false);
        return;
      }

      // If user exists, send password reset email
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      setMessage("Password reset link sent! Check your email for instructions.");
    } catch (error: any) {
      console.error("Password reset error:", error);
      
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email address. Please check your email or contact support.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          <div className="bg-card rounded-lg shadow-lg border border-border p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-foreground">Check Your Email</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <a 
              href="/login" 
              className="inline-block w-full h-12 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors flex items-center justify-center"
            >
              Back to Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          <h1 className="text-2xl font-bold mb-4 text-foreground">Reset Your Password</h1>
          <p className="text-muted-foreground mb-6">Enter your email address and we'll send you a reset link.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full pl-20 h-12 px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-destructive mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}

            {message && (
              <div className="p-3 rounded-md bg-green-50 border border-green-200">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-green-700">{message}</p>
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full h-12 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending...
                </div>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <a href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                  Sign in here
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}