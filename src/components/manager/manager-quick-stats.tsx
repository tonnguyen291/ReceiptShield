'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getFlaggedReceiptsForManager, getReceiptsForManager, getAllReceipts } from '@/lib/receipt-store';
import { getEmployeesForManager } from '@/lib/firebase-user-store';
import { AlertTriangle, CheckCircle, Clock, FileText, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import type { ProcessedReceipt } from '@/types';

interface QuickStats {
  pendingReview: number;
  approvedToday: number;
  totalReceipts: number;
  highRiskReceipts: number;
}

export function ManagerQuickStats() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<QuickStats>({
    pendingReview: 0,
    approvedToday: 0,
    totalReceipts: 0,
    highRiskReceipts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) {
        console.log('No user ID available for stats');
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('Loading stats for user:', user.id, user.email);
        
        // Get team members first
        const teamMembers = await getEmployeesForManager(user.id);
        console.log('Team members:', teamMembers.length, teamMembers.map(m => ({ name: m.name, email: m.email })));
        
        // Get all receipts and filter by team members
        const allReceiptsData = await getAllReceipts();
        console.log('All receipts in system:', allReceiptsData.length);
        
        // Filter receipts by team member emails
        const teamEmails = teamMembers.map(member => member.email);
        const allReceipts = allReceiptsData.filter(receipt => 
          teamEmails.includes(receipt.uploadedBy)
        );
        
        const flaggedReceipts = allReceipts.filter(receipt => 
          receipt.isFraudulent && receipt.status === 'pending_approval'
        );
        
        console.log('Loaded receipts:', {
          allReceipts: allReceipts.length,
          flaggedReceipts: flaggedReceipts.length,
          teamEmails,
          sampleReceipt: allReceipts[0]
        });
        
        // Calculate stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const approvedToday = allReceipts.filter(receipt => 
          receipt.status === 'approved' && 
          new Date(receipt.uploadedAt) >= today
        ).length;
        
        const highRiskReceipts = flaggedReceipts.filter(receipt => 
          receipt.fraudProbability > 0.7
        ).length;
        
        const newStats = {
          pendingReview: flaggedReceipts.length,
          approvedToday,
          totalReceipts: allReceipts.length,
          highRiskReceipts,
        };
        
        console.log('Calculated stats:', newStats);
        setStats(newStats);
      } catch (error) {
        console.error('Error loading manager stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Pending Review',
      value: stats.pendingReview,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Receipts awaiting approval',
      action: () => router.push('/manager/dashboard#flagged-receipts'),
      actionText: 'Review Now',
    },
    {
      title: 'Approved Today',
      value: stats.approvedToday,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Receipts approved today',
    },
    {
      title: 'Total Receipts',
      value: stats.totalReceipts,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'All team receipts',
    },
    {
      title: 'High Risk',
      value: stats.highRiskReceipts,
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'High fraud probability',
      action: () => router.push('/manager/dashboard#flagged-receipts'),
      actionText: 'Investigate',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            {stat.action && (
              <div className="mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={stat.action}
                  className="w-full"
                >
                  {stat.actionText}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
