"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SubmissionHistoryTable } from "@/components/employee/submission-history-table";
import { ExpenseSummaryChart } from "@/components/employee/expense-summary-chart";
import {
  DollarSign,
  BarChart,
  Bot,
  LogOut,
  User,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
  Upload,
  Settings,
  Bell,
  HelpCircle,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getAllReceiptsForUser } from "@/lib/receipt-store";
import type { ProcessedReceipt } from "@/types";
import { isWithinInterval, format, startOfMonth, endOfMonth } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // -------------------------------
  // STATE: Stores KPI stats + activity
  // -------------------------------
  const [stats, setStats] = useState({
    totalExpensesThisMonth: 0,
    receiptsUploadedThisMonth: 0,
    pendingAmount: 0,
    pendingCount: 0,
    approvedAmount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalReceipts: 0,
    averageReceiptAmount: 0,
    monthlyGoal: 2000,
  });
  const [recentActivity, setRecentActivity] = useState<ProcessedReceipt[]>([]);

  // -------------------------------
  // EFFECT: Fetches receipt data from Firebase
  // - Calculates stats (expenses, pending, approved, etc.)
  // - Updates recent activity
  // -------------------------------
  useEffect(() => {
    const loadStats = async () => {
      if (!user?.email) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const allReceipts = (await getAllReceiptsForUser(
          user.email
        )) as ProcessedReceipt[];

        // Define date range for "this month"
        const now = new Date();
        const startOfCurrentMonth = startOfMonth(now);
        const endOfCurrentMonth = endOfMonth(now);

        // Helper: Extract numerical amount from receipt item
        const getAmountFromReceipt = (r: ProcessedReceipt) => {
          const item = r.items?.find((i) =>
            i.label.toLowerCase().includes("amount")
          );
          if (!item) return 0;
          const val = parseFloat(item.value.replace(/[^0-9.-]+/g, ""));
          return isNaN(val) ? 0 : val;
        };

        // Receipts uploaded this month
        const receiptsThisMonth = allReceipts.filter((r) =>
          isWithinInterval(new Date(r.uploadedAt), {
            start: startOfCurrentMonth,
            end: endOfCurrentMonth,
          })
        );

        // Calculate totals
        const totalExpensesThisMonth = receiptsThisMonth.reduce(
          (acc, r) => acc + getAmountFromReceipt(r),
          0
        );
        const pendingReceipts = allReceipts.filter(
          (r) => r.status === "pending_approval"
        );
        const approvedReceipts = allReceipts.filter(
          (r) => r.status === "approved"
        );

        // Save KPI stats to state
        setStats({
          totalExpensesThisMonth,
          receiptsUploadedThisMonth: receiptsThisMonth.length,
          pendingAmount: pendingReceipts.reduce(
            (acc, r) => acc + getAmountFromReceipt(r),
            0
          ),
          pendingCount: pendingReceipts.length,
          approvedAmount: approvedReceipts.reduce(
            (acc, r) => acc + getAmountFromReceipt(r),
            0
          ),
          approvedCount: approvedReceipts.length,
          rejectedCount: allReceipts.filter((r) => r.status === "rejected")
            .length,
          totalReceipts: allReceipts.length,
          averageReceiptAmount:
            allReceipts.length > 0
              ? allReceipts.reduce(
                  (acc, r) => acc + getAmountFromReceipt(r),
                  0
                ) / allReceipts.length
              : 0,
          monthlyGoal: 2000,
        });

        // Show top 5 recent receipts in "Recent Activity"
        setRecentActivity(allReceipts.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, [user]);

  // -------------------------------
  // SIDEBAR: Left-side navigation
  // - Branding
  // - Links to Dashboard, Receipts, Settings, Help
  // - Logout button
  // -------------------------------
  const Sidebar = () => (
    <aside className="w-64 bg-green-900 text-green-100 min-h-screen p-6 flex flex-col justify-between">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-2 mb-8">
          <User className="h-7 w-7 text-green-400" />
          <span className="font-bold text-xl">ReceiptShield</span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-green-200 hover:bg-green-800"
            onClick={() => router.push("/employee/dashboard")}
          >
            <LayoutDashboard className="h-5 w-5" /> Dashboard
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-green-200 hover:bg-green-800"
            onClick={() => router.push("/employee/submit-receipt")}
          >
            <Upload className="h-5 w-5" /> Submit Receipt
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-green-200 hover:bg-green-800"
            onClick={() => router.push("/employee/receipts")}
          >
            <FileText className="h-5 w-5" /> Receipts
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-green-200 hover:bg-green-800"
            onClick={() => router.push("/profile")}
          >
            <Settings className="h-5 w-5" /> Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-green-200 hover:bg-green-800"
            onClick={() => router.push("/help")}
          >
            <HelpCircle className="h-5 w-5" /> Help
          </Button>
        </nav>
      </div>

      {/* Logout button */}
      <div className="pt-6 border-t border-green-800">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-red-400 hover:bg-red-900"
          onClick={logout}
        >
          <LogOut className="h-5 w-5" /> Sign Out
        </Button>
      </div>
    </aside>
  );

  // -------------------------------
  // LOADING STATE: Shown while fetching data
  // - Sidebar visible
  // - Skeleton placeholders instead of real data
  // -------------------------------
  if (isLoading) {
    return (
      <div className="flex bg-green-950 text-white">
        <Sidebar />
        <main className="flex-1 p-10">
          {/* Skeleton Header */}
          <Skeleton className="h-12 w-1/3 mb-6 bg-green-800" />

          {/* Skeleton KPI cards */}
          <div className="grid grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-green-900 rounded-lg p-6 flex flex-col gap-4"
              >
                <Skeleton className="h-5 w-20 bg-green-800" />
                <Skeleton className="h-8 w-24 bg-green-800" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // -------------------------------
  // MAIN DASHBOARD LAYOUT
  // -------------------------------
  return (
    <div className="flex min-h-screen bg-green-950 text-white">
      <Sidebar />
      <main className="flex-1 p-10 space-y-10 overflow-y-auto">
        {/* HEADER: Page title + greeting */}
        <div>
          <h1 className="text-4xl font-extrabold mb-2">Employee Dashboard</h1>
          <p className="text-green-200">
            Welcome back, {user?.name || "Employee"} — here’s your overview.
          </p>
        </div>

        {/* KPI CARDS: Quick financial stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Monthly Expenses */}
          <div className="bg-white text-gray-900 p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <DollarSign className="h-5 w-5" /> Monthly Expenses
            </div>
            <p className="text-2xl font-bold">
              ${stats.totalExpensesThisMonth.toFixed(2)}
            </p>
            <Progress
              value={(stats.totalExpensesThisMonth / stats.monthlyGoal) * 100}
              className="mt-2"
            />
          </div>

          {/* Approved Expenses */}
          <div className="bg-white text-gray-900 p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle className="h-5 w-5" /> Approved
            </div>
            <p className="text-2xl font-bold">
              ${stats.approvedAmount.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">
              {stats.approvedCount} approved
            </p>
          </div>

          {/* Pending Expenses */}
          <div className="bg-white text-gray-900 p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <Clock className="h-5 w-5" /> Pending
            </div>
            <p className="text-2xl font-bold">
              ${stats.pendingAmount.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">
              {stats.pendingCount} pending
            </p>
          </div>

          {/* Average Receipt Amount */}
          <div className="bg-white text-gray-900 p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <TrendingUp className="h-5 w-5" /> Average
            </div>
            <p className="text-2xl font-bold">
              ${stats.averageReceiptAmount.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">
              {stats.totalReceipts} receipts
            </p>
          </div>
        </div>

        {/* SUBMIT RECEIPT: CTA box */}
        <div className="bg-white text-gray-900 rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Upload className="h-6 w-6 text-green-600" /> Submit a Receipt
          </h2>
          <p className="text-gray-700 mb-4">
            Upload your receipts quickly and track them in real time.
          </p>
          <Button
            onClick={() => router.push("/employee/submit-receipt")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
          >
            Submit Receipt Now
          </Button>
        </div>

        {/* HISTORY + SIDEBAR WIDGETS */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Submission History Table */}
          <div className="lg:col-span-2 bg-white text-gray-900 rounded-xl p-6 shadow-lg">
            <h3 className="flex items-center gap-2 text-green-600 mb-4">
              <FileText className="h-5 w-5" /> Submission History
            </h3>
            <SubmissionHistoryTable />
          </div>

          {/* Sidebar widgets: Breakdown + Activity + Tips */}
          <div className="space-y-6">
            {/* Expense Breakdown chart */}
            <div className="bg-white text-gray-900 rounded-xl p-6 shadow-lg">
              <h3 className="flex items-center gap-2 text-green-600 mb-4">
                <BarChart className="h-5 w-5" /> Expense Breakdown
              </h3>
              <ExpenseSummaryChart />
            </div>

            {/* Recent Activity feed */}
            <div className="bg-white text-gray-900 rounded-xl p-6 shadow-lg">
              <h3 className="flex items-center gap-2 text-green-600 mb-4">
                <Bell className="h-5 w-5" /> Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 bg-gray-100 rounded-lg p-3"
                    >
                      <FileText className="h-4 w-4 text-green-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{r.fileName}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Badge
                            variant={
                              r.status === "approved"
                                ? "default"
                                : r.status === "pending_approval"
                                ? "secondary"
                                : r.status === "rejected"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {r.status || "draft"}
                          </Badge>
                          <span>
                            {format(new Date(r.uploadedAt), "MMM dd")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No recent activity</p>
                )}
              </div>
            </div>

            {/* Tips section */}
            <div className="bg-white text-gray-900 rounded-xl p-6 shadow-lg">
              <h3 className="flex items-center gap-2 text-green-600 mb-4">
                <Bot className="h-5 w-5" /> Tips
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>📸 Clear, well-lit receipt photos</li>
                <li>⏰ Submit within 24 hours</li>
                <li>✅ Review extracted info</li>
                <li>📱 Upload from your phone</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FOOTER: App name + last updated date */}
        <footer className="pt-8 text-green-300 text-sm">
          ReceiptShield Employee Dashboard · Last updated{" "}
          {format(new Date(), "MMM dd, yyyy")}
        </footer>
      </main>
    </div>
  );
}
