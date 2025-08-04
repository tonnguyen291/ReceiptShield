
"use client";

import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Chatbot } from '@/components/shared/chatbot';
import './globals.css';
import { useState } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isChatbotOpen, setChatbotOpen] = useState(false);

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <title>Receipt Shield</title>
        <meta name="description" content="Secure and user-friendly expense management." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          <Toaster />

          {/* Global Chatbot */}
          <Chatbot isOpen={isChatbotOpen} onClose={() => setChatbotOpen(false)} />

          {/* Floating Chatbot Button */}
          <Button
            onClick={() => setChatbotOpen(true)}
            className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl z-50"
            size="icon"
          >
            <Bot className="h-8 w-8" />
            <span className="sr-only">Open AI Assistant</span>
          </Button>
        </AuthProvider>
      </body>
    </html>
  );
}
