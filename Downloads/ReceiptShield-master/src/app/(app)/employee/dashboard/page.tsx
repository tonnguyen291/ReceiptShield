'use client';

import { OriginDashboardEnhanced } from '@/components/employee/origin-dashboard-enhanced';
import { NoSSR } from '@/components/shared/no-ssr';

export default function EmployeeDashboardPage() {
  // Mock user data - replace with real user data from context
  const user = {
    name: "John Doe",
    email: "john@company.com",
    role: "employee"
  };

  return (
    <NoSSR>
      <OriginDashboardEnhanced user={user} />
    </NoSSR>
  );
}
