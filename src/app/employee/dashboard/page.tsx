
'use client';

import { useState } from 'react';
import { SubmissionHistoryTable } from '@/components/employee/submission-history-table';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { PlusCircle, History, BrainCircuit, Bell, UserCog, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Chatbot } from '@/components/shared/chatbot';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const handleUploadClick = () => {
    router.push('/employee/upload');
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-headline font-semibold">Employee Dashboard</h1>
          <Button onClick={handleUploadClick} size="lg" className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" />
            Upload New Receipt
          </Button>
        </div>
        
        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-6 h-6 text-primary" />
                Manage My Receipts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SubmissionHistoryTable />
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-md lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="w-6 h-6 text-primary" />
                  Understanding AI Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI analyzes receipts for fraud probability. You can view detailed explanations and scores by clicking the 'View' icon on any receipt in your history table. This feedback helps you understand why a receipt might be flagged for manager review.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-6 h-6 text-primary" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No new notifications. Alerts for approvals and rejections will appear here. (Future Feature)</p>
              </CardContent>
            </Card>

            <Card className="shadow-md lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="w-6 h-6 text-primary" />
                  Profile & Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-muted-foreground">Manage your personal information, preferences, and change your password.</p>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" onClick={() => router.push('/profile')}>Edit Profile</Button>
                  <Button variant="outline" onClick={() => router.push('/profile/change-password')}>Change Password</Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
