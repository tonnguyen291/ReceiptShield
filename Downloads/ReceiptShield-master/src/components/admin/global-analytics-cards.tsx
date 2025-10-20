
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Files, ShieldAlert, Users } from 'lucide-react';
import { getAllReceipts } from '@/lib/receipt-store';
import { getUsers } from '@/lib/firebase-user-store';
import type { ProcessedReceipt } from '@/types';

export function GlobalAnalyticsCards() {
    const [stats, setStats] = useState({
        totalExpenses: 0,
        totalReceipts: 0,
        totalFraudAlerts: 0,
        totalUsers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                console.log('🔄 Loading analytics stats...');
                const allReceipts = await getAllReceipts();
                const allUsers = await getUsers();
                
                console.log('📊 Analytics data:', {
                    receipts: allReceipts.length,
                    users: allUsers.length
                });

                const totalExpenses = allReceipts.reduce((acc, r) => {
                    const amountItem = r.items.find(i => i.label.toLowerCase().includes('total amount'));
                    const amountValue = parseFloat(amountItem?.value.replace(/[^0-9.-]+/g, "") || "0");
                    return acc + (isNaN(amountValue) ? 0 : amountValue);
                }, 0);

                const totalFraudAlerts = allReceipts.filter(r => r.isFraudulent).length;

                const newStats = {
                    totalExpenses,
                    totalReceipts: allReceipts.length,
                    totalFraudAlerts,
                    totalUsers: allUsers.length,
                };
                
                console.log('📈 Final stats:', newStats);
                setStats(newStats);
                setLoading(false);
            } catch (error) {
                console.error('❌ Error loading analytics stats:', error);
                // Set default values on error
                setStats({
                    totalExpenses: 0,
                    totalReceipts: 0,
                    totalFraudAlerts: 0,
                    totalUsers: 0
                });
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="shadow-lg bg-[var(--color-card)] border-[var(--color-border)]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 w-24 bg-[var(--color-muted)] rounded animate-pulse"></div>
                            <div className="h-4 w-4 bg-[var(--color-muted)] rounded animate-pulse"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-16 bg-[var(--color-muted)] rounded animate-pulse mb-2"></div>
                            <div className="h-3 w-20 bg-[var(--color-muted)] rounded animate-pulse"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-l-4 border-l-[var(--color-primary)] bg-[var(--color-card)] border-[var(--color-border)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--color-text)]">Total Company Expenses</CardTitle>
                    <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                        <DollarSign className="h-4 w-4 text-[var(--color-primary)]" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--color-primary)]">${stats.totalExpenses.toFixed(2)}</div>
                    <p className="text-xs text-[var(--color-text-secondary)]">Across all users</p>
                </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-l-4 border-l-[var(--color-info)] bg-[var(--color-card)] border-[var(--color-border)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--color-text)]">Total Receipts Submitted</CardTitle>
                    <div className="p-2 bg-[var(--color-info)]/10 rounded-lg">
                        <Files className="h-4 w-4 text-[var(--color-info)]" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--color-info)]">{stats.totalReceipts}</div>
                    <p className="text-xs text-[var(--color-text-secondary)]">All-time submissions</p>
                </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-l-4 border-l-[var(--color-danger)] bg-[var(--color-card)] border-[var(--color-border)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--color-text)]">Global Fraud Alerts</CardTitle>
                    <div className="p-2 bg-[var(--color-danger)]/10 rounded-lg">
                        <ShieldAlert className="h-4 w-4 text-[var(--color-danger)]" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--color-danger)]">{stats.totalFraudAlerts}</div>
                    <p className="text-xs text-[var(--color-text-secondary)]">Flagged for review</p>
                </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-l-4 border-l-[var(--color-warning)] bg-[var(--color-card)] border-[var(--color-border)]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[var(--color-text)]">Total Users</CardTitle>
                    <div className="p-2 bg-[var(--color-warning)]/10 rounded-lg">
                        <Users className="h-4 w-4 text-[var(--color-warning)]" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-[var(--color-warning)]">{stats.totalUsers}</div>
                    <p className="text-xs text-[var(--color-text-secondary)]">Across all roles</p>
                </CardContent>
            </Card>
        </div>
    );
}
