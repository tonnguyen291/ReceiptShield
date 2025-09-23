'use client';

import React, { useState } from 'react';
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
  Phone,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function HelpPage() {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<number[]>([]);

  const toggleSection = (index: number) => {
    setExpandedSections(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqSections = [
    {
      title: "Getting Started",
      icon: <Upload className="h-5 w-5 text-blue-600" />,
      questions: [
        {
          question: "How do I submit a receipt?",
          answer: "Click on 'Submit Receipt' in the Quick Actions section, upload your receipt image, and verify the extracted information before submitting."
        },
        {
          question: "What receipt formats are supported?",
          answer: "We support JPG, PNG, and PDF formats. Make sure your receipt is clear and well-lit for best results."
        },
        {
          question: "What if my receipt is rejected?",
          answer: "If a receipt is rejected, you'll receive feedback on why. You can resubmit with corrections or contact your manager for assistance."
        }
      ]
    },
    {
      title: "Account & Profile",
      icon: <Settings className="h-5 w-5 text-green-600" />,
      questions: [
        {
          question: "How do I update my profile?",
          answer: "Click on 'Settings' in te Quick Actions section to update your personal information, email, and account details."
        },
        {
          question: "How do I reset my password?",
          answer: "Click 'Forgot Password' on the login page and follow the instructions sent to your email address."
        },
        {
          question: "What happens if I forget my login credentials?",
          answer: "Use the 'Forgot Password' link on the login page. You'll receive an email with instructions to reset your password."
        }
      ]
    },
    {
      title: "Receipt Processing",
      icon: <FileText className="h-5 w-5 text-orange-600" />,
      questions: [
        {
          question: "How accurate is the automatic data extraction?",
          answer: "Our OCR system achieves 95%+ accuracy on clear, well-lit receipts. Accuracy may vary with image quality and receipt format."
        },
        {
          question: "Can I manually edit the extracted receipt information?",
          answer: "Yes, you can edit all extracted fields before submitting. Review and correct any inaccuracies in the verification step."
        },
        {
          question: "What if the system can't read my receipt text?",
          answer: "If there are issues with the system reading your receipt, try uploading a clearer image. You can also manually enter the receipt information if OCR fails."
        }
      ]
    },
    {
      title: "Fraud Detection",
      icon: <CheckCircle className="h-5 w-5 text-red-600" />,
      questions: [
        {
          question: "How does the fraud detection work?",
          answer: "Our system uses a combination of AI and machine learning models and analyzes receipt patterns, amounts, vendor information, and other factors. This allows us to identify potentially fraudulent submissions."
        },
        {
          question: "What makes a receipt get flagged as suspicious?",
          answer: "Receipts may be flagged for unusual amounts, suspicious vendor names, round numbers, excessive tips, or other suspicious patterns."
        },
        {
          question: "Can I see why my receipt was flagged?",
          answer: "Yes, you'll receive an AI overview with detailed feedback explaining why your receipt was flagged and what you can do to address the concerns."
        },
        {
          question: "How accurate is the fraud detection system?",
          answer: "Our fraud detection system achieves 100% accuracy on known fraud patterns with minimal false positives on legitimate receipts."
        }
      ]
    },
    {
      title: "User Management",
      icon: <Mail className="h-5 w-5 text-purple-600" />,
      questions: [
        {
          question: "How do I invite new users to the system?",
          answer: "Go to the Admin dashboard, click 'Invite User', enter their email and select their role, then send the invitation."
        },
        {
          question: "What happens when someone accepts an invitation?",
          answer: "They'll be able to log in with their new account and access the system based on their assigned role and permissions."
        },
        {
          question: "Can I resend an invitation if it expires?",
          answer: "Yes, you can resend invitations from the Admin dashboard. Expired invitations can be regenerated and sent again."
        }
      ]
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
          
          <div className="space-y-4">
            {faqSections.map((section, sectionIndex) => {
              const isExpanded = expandedSections.includes(sectionIndex);
              return (
                <Card key={sectionIndex} className="shadow-lg">
                  <CardHeader 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleSection(sectionIndex)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {section.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <CardDescription>
                          {section.questions.length} questions
                        </CardDescription>
                      </div>
                      <div className="text-muted-foreground">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {section.questions.map((faq, faqIndex) => (
                          <div key={faqIndex} className="border-l-2 border-muted pl-4">
                            <h4 className="font-semibold text-foreground mb-2">
                              {faq.question}
                            </h4>
                            <p className="text-muted-foreground text-sm">
                              {faq.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
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
