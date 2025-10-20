'use client';

import { ThemeToggle } from '@/components/shared/theme-toggle';

export default function ThemeDemo() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Receipt Shield - Theme Demo</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="p-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[var(--color-text)]">Theme Variables Demo</h2>
          <p className="text-[var(--color-text-secondary)] mb-6">
            This page demonstrates the new CSS variable-based theme system with data-theme attributes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="rounded-xl p-6 shadow bg-[var(--color-card)] border border-[var(--color-border)]">
            <p className="text-[var(--color-text-secondary)] mb-2">Total Company Expenses</p>
            <h3 className="text-3xl font-bold text-[var(--color-primary)]">$490.96</h3>
          </div>
          
          <div className="rounded-xl p-6 shadow bg-[var(--color-card)] border border-[var(--color-border)]">
            <p className="text-[var(--color-text-secondary)] mb-2">Total Receipts Submitted</p>
            <h3 className="text-3xl font-bold text-[var(--color-info)]">3</h3>
          </div>
          
          <div className="rounded-xl p-6 shadow bg-[var(--color-card)] border border-[var(--color-border)]">
            <p className="text-[var(--color-text-secondary)] mb-2">Global Fraud Alerts</p>
            <h3 className="text-3xl font-bold text-[var(--color-danger)]">3</h3>
          </div>
          
          <div className="rounded-xl p-6 shadow bg-[var(--color-card)] border border-[var(--color-border)]">
            <p className="text-[var(--color-text-secondary)] mb-2">Total Users</p>
            <h3 className="text-3xl font-bold text-[var(--color-warning)]">13</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl p-6 shadow bg-[var(--color-card)] border border-[var(--color-border)]">
            <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">Color Palette</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-[var(--color-primary)]"></div>
                <span className="text-[var(--color-text-secondary)]">Primary (Receipt Shield Green)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-[var(--color-info)]"></div>
                <span className="text-[var(--color-text-secondary)]">Info (Blue)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-[var(--color-warning)]"></div>
                <span className="text-[var(--color-text-secondary)]">Warning (Orange)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-[var(--color-danger)]"></div>
                <span className="text-[var(--color-text-secondary)]">Danger (Red)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-[var(--color-success)]"></div>
                <span className="text-[var(--color-text-secondary)]">Success (Green)</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6 shadow bg-[var(--color-card)] border border-[var(--color-border)]">
            <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">Theme Features</h3>
            <ul className="space-y-2 text-[var(--color-text-secondary)]">
              <li>✅ CSS Variables for consistent theming</li>
              <li>✅ Data-theme attribute support</li>
              <li>✅ Light & Dark mode variants</li>
              <li>✅ Receipt Shield brand colors</li>
              <li>✅ Smooth theme transitions</li>
              <li>✅ System theme detection</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-6 rounded-xl bg-[var(--color-muted)] border border-[var(--color-border)]">
          <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">Usage Example</h3>
          <pre className="text-sm text-[var(--color-text-secondary)] overflow-x-auto">
{`<div className="bg-[var(--color-bg)] text-[var(--color-text)]">
  <div className="bg-[var(--color-card)] border-[var(--color-border)]">
    <h1 className="text-[var(--color-primary)]">Title</h1>
    <p className="text-[var(--color-text-secondary)]">Description</p>
  </div>
</div>`}
          </pre>
        </div>
      </main>
    </div>
  );
}
