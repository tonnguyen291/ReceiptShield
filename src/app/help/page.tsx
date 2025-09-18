'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  HelpCircle, 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock,
  Settings,
  Mail,
  Phone
} from 'lucide-react';

export default function HelpPage() {
  const router = useRouter();

  const faqs = [
    {
      question: "How do I submit a receipt?",
      answer: "Click on 'Submit Receipt' in the Quick Actions section, upload your receipt image, and verify the extracted information before submitting.",
      icon: <Upload className="h-5 w-5 text-blue-600" />
    },
    {
      question: "What receipt formats are supported?",
      answer: "We support JPG, PNG, and PDF formats. Make sure your receipt is clear and well-lit for best results.",
      icon: <FileText className="h-5 w-5 text-green-600" />
    },
    {
      question: "How long does approval take?",
      answer: "Receipts are typically reviewed within 1-2 business days. You'll receive notifications when the status changes.",
      icon: <Clock className="h-5 w-5 text-orange-600" />
    },
    {
      question: "What if my receipt is rejected?",
      answer: "If a receipt is rejected, you'll receive feedback on why. You can resubmit with corrections or contact your manager for assistance.",
      icon: <CheckCircle className="h-5 w-5 text-red-600" />
    },
    {
      question: "How do I update my profile?",
      answer: "Go to Settings in the Quick Actions section to update your personal information, email, and preferences.",
      icon: <Settings className="h-5 w-5 text-purple-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-card rounded-lg shadow-lg border p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-headline font-bold tracking-tight text-foreground">
                Help & Support
              </h1>
              <p className="text-muted-foreground text-sm">
                Find answers to common questions and get support
              </p>
            </div>
          </div>
        </div>

        {/* Quick Help */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-lg border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <HelpCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Quick Start</CardTitle>
                  <CardDescription>Get started with ReceiptShield</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">1. Submit Receipts</h4>
                <p className="text-sm text-muted-foreground">
                  Upload your expense receipts using the Submit Receipt button
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">2. Verify Information</h4>
                <p className="text-sm text-muted-foreground">
                  Review and correct the extracted receipt information
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">3. Track Status</h4>
                <p className="text-sm text-muted-foreground">
                  Monitor your receipt approval status in the dashboard
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Contact Support</CardTitle>
                  <CardDescription>Need more help? We're here for you</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Email Support</h4>
                <p className="text-sm text-muted-foreground">
                  support@receiptshield.com
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Phone Support</h4>
                <p className="text-sm text-muted-foreground">
                  +1 (555) 123-4567
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Business Hours</h4>
                <p className="text-sm text-muted-foreground">
                  Monday - Friday, 9 AM - 6 PM EST
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-primary rounded-full"></div>
            <h2 className="text-xl font-semibold text-foreground">Frequently Asked Questions</h2>
          </div>
          
          <div className="grid gap-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted rounded-lg mt-1">
                      {faq.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-muted-foreground">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <Card className="shadow-lg border-l-4 border-l-purple-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Pro Tips</CardTitle>
                <CardDescription>Best practices for using ReceiptShield</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Receipt Quality</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Ensure receipts are well-lit and clear</li>
                  <li>• Avoid blurry or dark photos</li>
                  <li>• Include the entire receipt in the frame</li>
                  <li>• Submit receipts within 24 hours when possible</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Organization</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Keep receipts organized by date</li>
                  <li>• Add notes for business context</li>
                  <li>• Review extracted information carefully</li>
                  <li>• Follow up on pending approvals</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
