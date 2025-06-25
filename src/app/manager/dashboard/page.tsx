
'use client';

import { FlaggedReceiptsTable } from '@/components/manager/flagged-receipts-table';
import { ManagerOverviewCharts } from '@/components/manager/manager-overview-charts';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Users, Settings, FileText as ReportIcon, ShieldAlert, TrendingUp, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function ManagerDashboardPage() {
  const { toast } = useToast();

  const handleGenerateReportClick = () => {
    toast({
      title: 'Feature Coming Soon',
      description: 'Full report generation and download functionality will be available in a future update.',
    });
  };

  const handleChatbotClick = () => {
    toast({
      title: 'Feature Coming Soon',
      description: 'Our AI-powered chatbot will be available soon to help you with your questions.',
    });
  };

  return (
    <>
      <div className="space-y-12">
        <div>
          <h1 className="text-3xl font-headline font-semibold mb-8 text-center md:text-left">Manager Dashboard</h1>
        </div>

        <Separator />

        <div>
          <h2 className="text-2xl font-headline font-semibold mb-6 text-center md:text-left flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" /> Dashboard Overview
          </h2>
          <ManagerOverviewCharts />
        </div>

        <Separator />

        <div>
          <h2 className="text-2xl font-headline font-semibold mb-6 text-center md:text-left flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary" /> Review AI-Flagged Receipts
          </h2>
          <FlaggedReceiptsTable />
        </div>

        <Separator />
        
        <div>
          <h2 className="text-2xl font-headline font-semibold mb-6 text-center md:text-left flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Manage Users
          </h2>
          <Card className="shadow-md">
            <CardHeader><CardTitle>User Administration</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Add, remove, or edit employee accounts. (Functionality to be implemented)</p>
              <Button variant="outline" className="mt-4" disabled>Manage Users</Button>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div>
          <h2 className="text-2xl font-headline font-semibold mb-6 text-center md:text-left flex items-center gap-2">
            <ReportIcon className="w-6 h-6 text-primary" /> Data Reports
          </h2>
          <Card className="shadow-md">
            <CardHeader><CardTitle>Expense Reporting</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Generate and download expense reports.</p>
              <Button variant="outline" className="mt-4" onClick={handleGenerateReportClick}>Generate Report</Button>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div>
          <h2 className="text-2xl font-headline font-semibold mb-6 text-center md:text-left flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" /> Notifications
          </h2>
          <Card className="shadow-md">
            <CardHeader><CardTitle>System Alerts</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No new notifications. This section will show alerts for new flagged receipts, approvals, or high-priority actions. (Functionality to be implemented)</p>
            </CardContent>
          </Card>
        </div>

        <Separator />
        
        <div>
          <h2 className="text-2xl font-headline font-semibold mb-6 text-center md:text-left flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" /> System Settings
          </h2>
          <Card className="shadow-md">
            <CardHeader><CardTitle>Company Policies & Configuration</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Manage expense limits, categories, data retention, etc. (Functionality to be implemented)</p>
              <Button variant="outline" className="mt-4" disabled>Configure Settings</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chatbot FAB */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleChatbotClick}
              className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
              size="icon"
            >
              <MessageSquare className="h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Chat with AI Assistant</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
