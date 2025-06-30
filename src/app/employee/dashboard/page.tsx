
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { SubmissionHistoryTable } from '@/components/employee/submission-history-table';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { PlusCircle, History, BrainCircuit, Bell, UserCog, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Chatbot } from '@/components/shared/chatbot';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function EmployeeDashboardPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const handleUploadClick = () => {
    router.push('/employee/upload');
  };

  return (
    <>
      <div className="space-y-8 max-w-3xl mx-auto">
        <div className="flex flex-col items-start gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold tracking-tight">Employee Dashboard</h1>
            <p className="text-muted-foreground">Manage your expense receipts and submissions.</p>
          </div>
          <Button onClick={handleUploadClick} size="lg" className="w-full sm:w-auto shadow-sm">
            <PlusCircle className="mr-2 h-5 w-5" />
            Upload New Receipt
          </Button>
        </div>
        
        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <History className="w-7 h-7 text-primary" />
                <span className="text-2xl font-semibold">My Submission History</span>
              </CardTitle>
              <CardDescription>View, edit, or track the status of your submitted receipts below.</CardDescription>
            </CardHeader>
            <CardContent>
              <SubmissionHistoryTable />
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="w-6 h-6 text-primary" />
                Account Settings
              </CardTitle>
              <CardDescription>Manage your personal information and password.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={() => router.push('/profile')} className="flex-1">Edit Profile</Button>
                <Button variant="outline" onClick={() => router.push('/profile/change-password')} className="flex-1">Change Password</Button>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="w-6 h-6 text-primary" />
                AI Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our AI helps by analyzing receipts for you. Click the 'View' icon on any receipt to see its detailed analysis and fraud probability score.
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
              <p className="text-sm text-muted-foreground">No new notifications. Alerts will appear here in the future.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <Button variant="destructive" onClick={logout}>Sign Out</Button>
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
          <TooltipContent side="left">
            <p>Chat with AI Assistant</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </>
  );
}
