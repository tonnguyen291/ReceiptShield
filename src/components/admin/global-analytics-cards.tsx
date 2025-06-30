
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, Files, ShieldAlert, Users } from 'lucide-react';
import { getAllReceipts } from '@/lib/receipt-store';
import { getUsers } from '@/lib/user-store';
import type { ProcessedReceipt } from '@/types';

export function GlobalAnalyticsCards() {
    const [stats, setStats] = useState({
        totalExpenses: 0,
        totalReceipts: 0,
        totalFraudAlerts: 0,
        totalUsers: 0
    });

    useEffect(() => {
        const allReceipts = getAllReceipts();
        const allUsers = getUsers();

        const totalExpenses = allReceipts.reduce((acc, r) => {
            const amountItem = r.items.find(i => i.label.toLowerCase().includes('total amount'));
            const amountValue = parseFloat(amountItem?.value.replace(/[^0-9.-]+/g, "") || "0");
            return acc + (isNaN(amountValue) ? 0 : amountValue);
        }, 0);

        const totalFraudAlerts = allReceipts.filter(r => r.isFraudulent).length;

        setStats({
            totalExpenses,
            totalReceipts: allReceipts.length,
            totalFraudAlerts,
            totalUsers: allUsers.length,
        });
    }, []);

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Company Expenses</CardTitle>
                    <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${stats.totalExpenses.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Across all users</p>
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Receipts Submitted</CardTitle>
                    <Files className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalReceipts}</div>
                    <p className="text-xs text-muted-foreground">All-time submissions</p>
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Global Fraud Alerts</CardTitle>
                    <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-destructive">{stats.totalFraudAlerts}</div>
                    <p className="text-xs text-muted-foreground">Flagged for review</p>
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">Across all roles</p>
                </CardContent>
            </Card>
        </div>
    );
}
