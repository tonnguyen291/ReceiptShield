'use client';

import { useState } from 'react';
import { testStorageConnectivity } from '@/lib/firebase-storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function TestStoragePage() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runStorageTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    setError(null);

    try {
      const result = await testStorageConnectivity();
      setTestResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setTestResult(false);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Firebase Storage Diagnostic</CardTitle>
            <CardDescription>
              Test Firebase Storage connectivity and configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Current Configuration:</h3>
              <div className="bg-muted p-3 rounded-lg text-sm font-mono">
                <div>Storage Bucket: {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'Not set'}</div>
                <div>Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not set'}</div>
                <div>Auth Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Not set'}</div>
              </div>
            </div>

            <Button 
              onClick={runStorageTest} 
              disabled={isTesting}
              className="w-full"
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Storage Connectivity...
                </>
              ) : (
                'Test Storage Connectivity'
              )}
            </Button>

            {testResult !== null && (
              <Alert className={testResult ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                <div className="flex items-center gap-2">
                  {testResult ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    {testResult 
                      ? 'Firebase Storage is accessible and configured correctly.' 
                      : 'Firebase Storage test failed. Check your configuration and network connection.'
                    }
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {error && (
              <Alert className="border-red-500 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <strong>Error:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-muted-foreground">
              <h4 className="font-semibold mb-2">Troubleshooting Steps:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Verify Firebase project is active and billing is enabled</li>
                <li>Check that Storage rules allow read/write access</li>
                <li>Ensure network connectivity to Firebase servers</li>
                <li>Verify storage bucket name matches your Firebase project</li>
                <li>Check browser console for additional error details</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
