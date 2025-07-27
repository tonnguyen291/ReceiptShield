
'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getAllReceipts, getAllReceiptsForUser, getReceiptsForManager } from '@/lib/receipt-store';
import { runAssistant } from '@/ai/flows/assistant-flow';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Loader2, Send, User, UploadCloud } from 'lucide-react';
import type { ProcessedReceipt } from '@/types';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Chatbot({ isOpen, onClose }: ChatbotProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
        setMessages([
          {
            id: 'init',
            role: 'assistant',
            content: `Hello ${user?.name || 'there'}! I am your AI assistant. How can I help you today?`,
          },
        ]);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || isResponding) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsResponding(true);

    try {
      let relevantReceipts: ProcessedReceipt[];

      if (user.role === 'admin') {
        relevantReceipts = getAllReceipts();
      } else if (user.role === 'manager') {
        relevantReceipts = getReceiptsForManager(user.id);
      } else {
        relevantReceipts = getAllReceiptsForUser(user.email);
      }

      const receiptHistoryString = JSON.stringify(
        relevantReceipts.map(r => ({ 
            fileName: r.fileName, 
            status: r.status || (r.isFraudulent ? 'flagged' : 'clear'), 
            uploaded_at: r.uploadedAt,
            uploadedBy: r.uploadedBy 
        }))
      );

      const result = await runAssistant({
        query: input,
        userEmail: user.email,
        userRole: user.role,
        receiptHistory: receiptHistoryString,
      });
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
      };

      if (result.suggestUpload && user.role === 'employee') {
        assistantMessage.action = {
          label: 'Upload a Receipt',
          onClick: () => {
            router.push('/employee/submit-receipt');
            onClose();
          },
        };
      }
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'m sorry, but I encountered an error. Please try again later.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-lg flex flex-col p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="text-2xl font-headline flex items-center gap-2">
            <Bot className="w-7 h-7 text-primary" />
            AI Expense Assistant
          </SheetTitle>
          <SheetDescription>
            Ask questions about policy or check receipt status.
            {user?.role === 'manager' && ' As a manager, you can also ask for team-wide summaries.'}
            {user?.role === 'admin' && ' As an admin, you can ask for organization-wide summaries.'}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow p-6 pt-2" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <Avatar className="h-9 w-9 border border-primary">
                    <AvatarFallback><Bot className="w-5 h-5" /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-4 py-3 max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />
                  {message.action && (
                    <Button
                      onClick={message.action.onClick}
                      variant="secondary"
                      size="sm"
                      className="mt-3"
                    >
                      <UploadCloud className="mr-2 h-4 w-4" />
                      {message.action.label}
                    </Button>
                  )}
                </div>
                 {message.role === 'user' && (
                  <Avatar className="h-9 w-9">
                    <AvatarFallback><User className="w-5 h-5" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isResponding && (
                <div className="flex items-start gap-3">
                     <Avatar className="h-9 w-9 border border-primary">
                        <AvatarFallback><Bot className="w-5 h-5" /></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-4 py-3 bg-muted text-muted-foreground flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Thinking...</span>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <SheetFooter className="p-4 border-t bg-background">
          <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a receipt or expense policy..."
              className="min-h-0 flex-1 resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isResponding}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isResponding}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
