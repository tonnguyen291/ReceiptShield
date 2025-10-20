import { LoginForm } from '@/components/auth/login-form';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[var(--color-text)] hover:text-[var(--color-primary)]">
            ← Back to Receipt Shield
          </Link>
          <ThemeToggle />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
