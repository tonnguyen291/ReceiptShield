
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SubmissionHistoryTable } from '@/components/employee/submission-history-table';
import { ExpenseSummaryChart } from '@/components/employee/expense-summary-chart';
import { 
  PlusCircle, 
  DollarSign, 
  BarChart, 
  AlertTriangle, 
  Bot, 
  LogOut, 
  User, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
  Upload,
  Settings,
  Bell,
  HelpCircle,
  Target,
  Award,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Separator } from '@/components/ui/separator';
import { getAllReceiptsForUser } from '@/lib/receipt-store';
import type { ProcessedReceipt } from '@/types';
import { subMonths, isWithinInterval, format, startOfMonth, endOfMonth } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Add a simple timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('⏰ Employee Dashboard: Auto-timeout reached, stopping loading');
      setIsLoading(false);
    }, 3000); // 3 second timeout
    
    return () => clearTimeout(timeout);
  }, []);
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
    monthlyGoal: 2000, // Example monthly goal
  });
  const [recentActivity, setRecentActivity] = useState<ProcessedReceipt[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<{name: string, value: number, color: string}[]>([]);

  useEffect(() => {
    // Add a global timeout to prevent infinite loading
    const globalTimeout = setTimeout(() => {
      console.log('⏰ Employee Dashboard: Global timeout reached, stopping loading');
      setIsLoading(false);
    }, 5000); // Reduced to 5 seconds

    const loadStats = async () => {
      console.log('🔍 Employee Dashboard: Starting loadStats, user:', user);
      
      // Always set loading to false after a short delay if no user
      if (!user) {
        console.log('❌ Employee Dashboard: No user, setting default values');
        setTimeout(() => {
          setStats({
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
          setRecentActivity([]);
          setExpenseCategories([]);
          setIsLoading(false);
        }, 1000);
        return;
      }
      
    if (user?.email) {
        try {
          setIsLoading(true);
          console.log('🔍 Employee Dashboard: Loading receipts for user:', user.email);
          
          // Load receipts with a shorter timeout to prevent hanging
          const allReceipts = await Promise.race([
            getAllReceiptsForUser(user.email),
            new Promise<ProcessedReceipt[]>((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 5000)
            )
          ]) as ProcessedReceipt[];
          
          console.log('🔍 Employee Dashboard: Loaded receipts:', allReceipts.length);

      const now = new Date();
          const startOfCurrentMonth = startOfMonth(now);
          const endOfCurrentMonth = endOfMonth(now);

          // Optimize data processing with early returns
          const getAmountFromReceipt = (receipt: ProcessedReceipt) => {
            const amountItem = receipt.items?.find(i => 
              i.label.toLowerCase().includes('total amount') || 
              i.label.toLowerCase().includes('amount') ||
              i.label.toLowerCase().includes('total')
            );
            if (!amountItem) return 0;
            const amountValue = parseFloat(amountItem.value.replace(/[^0-9.-]+/g, "") || "0");
            return isNaN(amountValue) ? 0 : amountValue;
          };

          // Process data in batches to avoid blocking
          const processReceipts = (receipts: ProcessedReceipt[]) => {
            const receiptsThisMonth = receipts.filter(r => 
              isWithinInterval(new Date(r.uploadedAt), { start: startOfCurrentMonth, end: endOfCurrentMonth })
            );

            const totalExpensesThisMonth = receiptsThisMonth.reduce((acc, r) => acc + getAmountFromReceipt(r), 0);
            
            // Status-based filtering
            const pendingReceipts = receipts.filter(r => r.status === 'pending_approval');
            const draftReceipts = receipts.filter(r => r.status === 'draft' || r.isDraft);
            const approvedReceipts = receipts.filter(r => r.status === 'approved');
            const rejectedReceipts = receipts.filter(r => r.status === 'rejected');
            
      const totalPendingReceipts = [...pendingReceipts, ...draftReceipts];
            const pendingAmount = totalPendingReceipts.reduce((acc, r) => acc + getAmountFromReceipt(r), 0);
            const approvedAmount = approvedReceipts.reduce((acc, r) => acc + getAmountFromReceipt(r), 0);
            
            // Calculate average receipt amount
            const totalAmount = receipts.reduce((acc, r) => acc + getAmountFromReceipt(r), 0);
            const averageReceiptAmount = receipts.length > 0 ? totalAmount / receipts.length : 0;

            return {
        totalExpensesThisMonth,
        receiptsUploadedThisMonth: receiptsThisMonth.length,
        pendingAmount,
        pendingCount: totalPendingReceipts.length,
              approvedAmount,
              approvedCount: approvedReceipts.length,
              rejectedCount: rejectedReceipts.length,
              totalReceipts: receipts.length,
              averageReceiptAmount,
              monthlyGoal: 2000,
            };
          };

          // Process main stats first
          const stats = processReceipts(allReceipts);
          console.log('🔍 Employee Dashboard: Processed stats:', stats);
          setStats(stats);

          // Set recent activity (limit to 5 for performance)
          setRecentActivity(allReceipts.slice(0, 5));
          console.log('🔍 Employee Dashboard: Set recent activity');

          // Process categories in a separate batch to avoid blocking
          setTimeout(() => {
            const receiptsThisMonth = allReceipts.filter(r => 
              isWithinInterval(new Date(r.uploadedAt), { start: startOfCurrentMonth, end: endOfCurrentMonth })
            );

            const categoryMap = new Map<string, number>();
            receiptsThisMonth.forEach(receipt => {
              const amount = getAmountFromReceipt(receipt);
              if (amount === 0) return; // Skip zero amounts
              
              const vendor = receipt.items?.find(i => 
                i.label.toLowerCase().includes('vendor') || 
                i.label.toLowerCase().includes('merchant') ||
                i.label.toLowerCase().includes('store')
              )?.value.toLowerCase() || 'other';
              
              let category = 'Other';
              if (vendor.includes('hotel') || vendor.includes('travel') || vendor.includes('flight')) {
                category = 'Travel';
              } else if (vendor.includes('restaurant') || vendor.includes('food') || vendor.includes('meal')) {
                category = 'Meals';
              } else if (vendor.includes('office') || vendor.includes('supplies') || vendor.includes('stationery')) {
                category = 'Supplies';
              } else if (vendor.includes('gas') || vendor.includes('fuel') || vendor.includes('transport')) {
                category = 'Transportation';
              }
              
              categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
            });

            const categories = Array.from(categoryMap.entries()).map(([name, value], index) => ({
              name,
              value: Math.round(value * 100) / 100,
              color: ['#3F51B5', '#7E57C2', '#42A5F5', '#AB47BC', '#26A69A'][index % 5]
            }));

            setExpenseCategories(categories);
            console.log('🔍 Employee Dashboard: Set expense categories');
          }, 100);

        } catch (error) {
          console.error('❌ Employee Dashboard: Error loading dashboard data:', error);
          // Set default values on error
          setStats({
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
          setRecentActivity([]);
          setExpenseCategories([]);
        } finally {
          console.log('🔍 Employee Dashboard: Setting isLoading to false');
          clearTimeout(globalTimeout);
          setIsLoading(false);
        }
      } else {
        console.log('❌ Employee Dashboard: No user email found, user:', user);
        clearTimeout(globalTimeout);
        // Set default values and stop loading
        setStats({
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
        setRecentActivity([]);
        setExpenseCategories([]);
        setIsLoading(false);
      }
    };
    
    loadStats();
    
    // Cleanup timeout on unmount
    return () => {
      clearTimeout(globalTimeout);
    };
  }, [user]);

  if (isLoading) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
        <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
          {/* Loading indicator with progress */}
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Loading Dashboard</h2>
            <p className="text-muted-foreground mb-4">Please wait while we load your data...</p>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">This may take a few moments</p>
          </div>
          {/* Header Skeleton */}
          <div className="bg-card rounded-lg shadow-lg border p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-6 w-6 text-primary" />
                  </div>
        <div>
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48 mt-2" />
                  </div>
                </div>
                <Skeleton className="h-4 w-96" />
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-12 mt-1" />
                </div>
                <div className="h-12 w-px bg-border"></div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20 mt-1" />
                </div>
              </div>
            </div>
          </div>

          {/* KPI Cards Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-primary rounded-full"></div>
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-20 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-16 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-green-500 rounded-full"></div>
              <Skeleton className="h-6 w-32" />
            </div>
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Skeleton */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                  <Skeleton className="h-6 w-32" />
                </div>
                <Card className="shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-48 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Header */}
        <div className="bg-card rounded-lg shadow-lg border p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-headline font-bold tracking-tight text-foreground">
                    Employee Dashboard
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Welcome back, {user?.name || 'Employee'}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                Track your expenses, manage receipts, and monitor your reimbursement status.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Receipts</p>
                <p className="text-2xl font-bold text-primary">{stats.totalReceipts}</p>
              </div>
              <div className="h-12 w-px bg-border"></div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-sm font-medium text-foreground">{stats.receiptsUploadedThisMonth} receipts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced KPI Cards */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-primary rounded-full"></div>
            <h2 className="text-xl font-semibold text-foreground">Overview</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-lg border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Monthly Expenses</CardTitle>
                    <CardDescription>Current month spending</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">${stats.totalExpensesThisMonth.toFixed(2)}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={(stats.totalExpensesThisMonth / stats.monthlyGoal) * 100} className="flex-1" />
                  <span className="text-sm text-muted-foreground">
                    {((stats.totalExpensesThisMonth / stats.monthlyGoal) * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Goal: ${stats.monthlyGoal.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-l-4 border-l-green-500">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Approved</CardTitle>
                    <CardDescription>Successfully processed</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">${stats.approvedAmount.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {stats.approvedCount} receipts approved
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-l-4 border-l-orange-500">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Pending</CardTitle>
                    <CardDescription>Awaiting approval</CardDescription>
                  </div>
                </div>
          </CardHeader>
          <CardContent>
                <div className="text-3xl font-bold text-orange-600">${stats.pendingAmount.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {stats.pendingCount} receipts pending
                </p>
          </CardContent>
        </Card>

            <Card className="shadow-lg border-l-4 border-l-purple-500">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Average</CardTitle>
                    <CardDescription>Per receipt amount</CardDescription>
                  </div>
                </div>
          </CardHeader>
          <CardContent>
                <div className="text-3xl font-bold text-purple-600">${stats.averageReceiptAmount.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {stats.totalReceipts} total receipts
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Receipt - Prominent Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-primary rounded-full"></div>
            <h2 className="text-xl font-semibold text-foreground">Submit Your Receipt</h2>
          </div>
          <Card className="shadow-lg border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl text-foreground">Upload Receipt</CardTitle>
                  <CardDescription className="text-muted-foreground">Submit your expense receipts quickly and easily</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step-by-step instructions */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-4 bg-card/60 rounded-lg border border-border">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold text-foreground">Upload Receipt</h4>
                    <p className="text-sm text-muted-foreground">Take a photo or upload your receipt image</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-card/60 rounded-lg border border-border">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold text-foreground">Verify Details</h4>
                    <p className="text-sm text-muted-foreground">Review and correct the extracted information</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-card/60 rounded-lg border border-border">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold text-foreground">Submit</h4>
                    <p className="text-sm text-muted-foreground">Submit for approval and tracking</p>
                  </div>
                </div>
              </div>

              {/* Main action button */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-6 bg-card/80 rounded-lg border border-border">
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Ready to submit a receipt?</h3>
                  <p className="text-muted-foreground">Click the button below to start the upload process</p>
                </div>
                <Button 
                  onClick={() => router.push('/employee/submit-receipt')} 
                  size="lg"
                  className="px-8 py-3 h-auto"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Submit Receipt Now
                </Button>
              </div>
          </CardContent>
        </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-muted-foreground rounded-full"></div>
            <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
          </div>
          <Card className="shadow-lg border-l-4 border-l-muted-foreground">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted/20 rounded-lg">
                  <Zap className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">Other Actions</CardTitle>
                  <CardDescription>Manage your receipts and account</CardDescription>
                </div>
              </div>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button 
                  onClick={() => router.push('/employee/receipts')} 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                >
                  <FileText className="h-6 w-6" />
                  <span className="text-sm font-medium">View History</span>
                </Button>
                <Button 
                  onClick={() => router.push('/profile')} 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                >
                  <Settings className="h-6 w-6" />
                  <span className="text-sm font-medium">Settings</span>
                </Button>
                <Button 
                  onClick={() => router.push('/help')} 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2"
                >
                  <HelpCircle className="h-6 w-6" />
                  <span className="text-sm font-medium">Help</span>
                </Button>
              </div>
          </CardContent>
        </Card>
      </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Submission History */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
              </div>
              <Card className="shadow-lg border-l-4 border-l-blue-500">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Submission History</CardTitle>
                      <CardDescription>Your recently uploaded receipts and their status</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                <SubmissionHistoryTable />
                </CardContent>
            </Card>
            </div>
        </div>

          {/* Sidebar */}
        <div className="space-y-6">
            {/* Expense Summary */}
            <Card className="shadow-lg border-l-4 border-l-purple-500">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Expense Breakdown</CardTitle>
                    <CardDescription>Spending by category this month</CardDescription>
                  </div>
                </div>
                </CardHeader>
                <CardContent>
                    <ExpenseSummaryChart />
                </CardContent>
            </Card>

            {/* Recent Activity Feed */}
            <Card className="shadow-lg border-l-4 border-l-orange-500">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Bell className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Recent Activity</CardTitle>
                    <CardDescription>Latest updates and notifications</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((receipt, index) => (
                      <div key={receipt.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{receipt.fileName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={receipt.status === 'approved' ? 'default' : 
                                     receipt.status === 'pending_approval' ? 'secondary' : 
                                     receipt.status === 'rejected' ? 'destructive' : 'outline'}
                              className="text-xs"
                            >
                              {receipt.status || 'draft'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(receipt.uploadedAt), 'MMM dd')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

        {/* Tips & Guidance */}
        <Card className="shadow-lg border-l-4 border-l-muted-foreground bg-gradient-to-br from-muted/5 to-muted/10">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted/20 rounded-lg">
                <Bot className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl">Receipt Submission Tips</CardTitle>
                <CardDescription>Best practices for submitting receipts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-card/50 rounded-lg border border-border">
                <p className="text-sm text-foreground">
                  📸 <strong>Photo Quality:</strong> Take clear, well-lit photos of your receipts
                </p>
              </div>
              <div className="p-3 bg-card/50 rounded-lg border border-border">
                <p className="text-sm text-foreground">
                  ⏰ <strong>Timing:</strong> Submit receipts within 24 hours for faster processing
                </p>
              </div>
              <div className="p-3 bg-card/50 rounded-lg border border-border">
                <p className="text-sm text-foreground">
                  ✅ <strong>Verification:</strong> Always review and correct extracted information
                </p>
              </div>
              <div className="p-3 bg-card/50 rounded-lg border border-border">
                <p className="text-sm text-foreground">
                  📱 <strong>Mobile:</strong> Use your phone camera for quick uploads on the go
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-foreground">
                <strong>Need Help?</strong> Click the "Help" button above for detailed instructions and support.
              </p>
            </div>
          </CardContent>
        </Card>
          </div>
        </div>
        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">
                ReceiptShield Employee Dashboard
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {format(new Date(), 'MMM dd, yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total Receipts</p>
                <p className="text-sm font-medium text-foreground">{stats.totalReceipts}</p>
      </div>
              <Separator orientation="vertical" className="h-8" />
        <Button
          variant="ghost"
          onClick={logout}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
