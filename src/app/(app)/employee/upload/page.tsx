

'use client';

import ReceiptUploadForm from '@/components/employee/receipt-upload-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function UploadReceiptPage() {
  const router = useRouter();
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 flex justify-start">
        <Button variant="outline" size="sm" onClick={() => router.push('/employee/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
        </Button>
      </div>
      <ReceiptUploadForm />
    </div>
  );
}

