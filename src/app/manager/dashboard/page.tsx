
'use client';

import { useState } from 'react';
import { FlaggedReceiptsTable } from '@/components/manager/flagged-receipts-table';
import { ManagerOverviewCharts } from '@/components/manager/manager-overview-charts';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, Users, Settings, FileText, ShieldAlert, TrendingUp, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Chatbot } from '@/components/shared/chatbot';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function ManagerDashboardPage() {
  const { toast } = useToast();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const handleGenerateReportClick = () => {
    toast({
      title: 'Feature Coming Soon',
      description: 'Full report generation and download functionality will be available in a future update.',
    });
  };

  return (
    <>
      <div className="space-y-8">
        <h1 className="text-3xl font-headline font-semibold">Manager Dashboard</h1>

        <div>
          <h2 className="text-2xl font-headline font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" /> Dashboard Overview
          </h2>
          <ManagerOverviewCharts />
        </div>

        <Separator />

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-primary" /> Review AI-Flagged Receipts
            </CardTitle>
            <CardDescription>These receipts were flagged by the AI for potential issues. Please review them carefully.</CardDescription>
          </CardHeader>
          <CardContent>
            <FlaggedReceiptsTable />
          </CardContent>
        </Card>

        <Separator />
        
        <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="w-6 h-6 text-primary" /> Manage Users</CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-muted-foreground mb-4">Add, remove, or edit employee accounts. (Future Feature)</p>
                <Button variant="outline" disabled>Manage Users</Button>
                </CardContent>
            </Card>
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText className="w-6 h-6 text-primary" /> Data Reports</CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-muted-foreground mb-4">Generate and download expense reports.</p>
                <Button variant="outline" onClick={handleGenerateReportClick}>Generate Report</Button>
                </CardContent>
            </Card>
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell className="w-6 h-6 text-primary" /> Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-muted-foreground">System-wide alerts will appear here. (Future Feature)</p>
                </CardContent>
            </Card>
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Settings className="w-6 h-6 text-primary" /> System Settings</CardTitle>
                </CardHeader>
                <CardContent>
                <p className="text-muted-foreground mb-4">Manage expense policies, categories, etc. (Future Feature)</p>
                <Button variant="outline" disabled>Configure Settings</Button>
                </CardContent>
            </Card>
        </div>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsChatbotOpen(true)}
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
      
      <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </>
  );
}
