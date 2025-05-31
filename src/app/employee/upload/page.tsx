
'use client';

import { ReceiptUploadForm } from '@/components/employee/receipt-upload-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UploadReceiptPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 flex justify-start">
        <Button asChild variant="outline" size="sm">
          <Link href="/employee/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <ReceiptUploadForm />
    </div>
  );
}
