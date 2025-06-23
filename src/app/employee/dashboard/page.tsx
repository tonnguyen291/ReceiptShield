
'use client';

import { SubmissionHistoryTable } from '@/components/employee/submission-history-table';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { PlusCircle, Bell, UserCog, History, BrainCircuit, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleUploadClick = () => {
    router.push('/employee/upload');
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
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-headline font-semibold text-center md:text-left">Employee Dashboard</h1>
            <Button onClick={handleUploadClick} size="lg" className="w-full md:w-auto">
              <PlusCircle className="mr-2 h-5 w-5" />
              Upload New Receipt
            </Button>
          </div>
        </div>
        
        <Separator />

        <div>
          <h2 className="text-2xl font-headline font-semibold mb-6 text-center md:text-left flex items-center gap-2">
            <History className="w-6 h-6 text-primary" /> Manage My Receipts
          </h2>
          <SubmissionHistoryTable />
        </div>

        <Separator />

        <div>
          <h2 className="text-2xl font-headline font-semibold mb-6 text-center md:text-left flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-primary" /> AI Insights
          </h2>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Understanding AI Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                For receipts flagged by our AI, detailed explanations and fraud probability scores can be found by clicking 'View' on the receipt in the 'Manage My Receipts' section. This will take you to the individual receipt details page where AI feedback is provided.
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div>
          <h2 className="text-2xl font-headline font-semibold mb-6 text-center md:text-left flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" /> Notifications
          </h2>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No new notifications at this time. This section will show alerts for approvals, rejections, and status changes. (Functionality to be implemented)</p>
              {/* Placeholder for future notification list */}
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div>
          <h2 className="text-2xl font-headline font-semibold mb-6 text-center md:text-left flex items-center gap-2">
            <UserCog className="w-6 h-6 text-primary" /> Profile & Settings
          </h2>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Manage your personal information and preferences here. (Functionality to be implemented)</p>
              <Button variant="outline" className="mt-4" disabled>Edit Profile</Button>
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
