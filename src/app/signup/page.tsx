import { SignupForm } from '@/components/auth/signup-form';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-2xl font-bold text-green-800 dark:text-green-200 hover:text-green-900 dark:hover:text-green-100">
            ← Back to Receipt Shield
          </Link>
          <ThemeToggle />
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
