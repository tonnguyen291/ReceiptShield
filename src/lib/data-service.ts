"use client";

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { User, ProcessedReceipt, ReceiptSubmission } from '@/types';

// ==================== USER DATA ====================

export async function getCurrentUser(userId: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        id: userDoc.id,
        ...userData,
        createdAt: userData.createdAt?.toDate(),
        updatedAt: userData.updatedAt?.toDate()
      } as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as User[];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function getUsersByRole(role: string): Promise<User[]> {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', role),
      where('status', '==', 'active')
    );
    const usersSnapshot = await getDocs(q);
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as User[];
  } catch (error) {
    console.error('Error fetching users by role:', error);
    return [];
  }
}

export async function getTeamMembers(managerId: string): Promise<User[]> {
  try {
    const q = query(
      collection(db, 'users'),
      where('supervisorId', '==', managerId),
      where('status', '==', 'active')
    );
    const usersSnapshot = await getDocs(q);
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as User[];
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
}

// ==================== RECEIPT DATA ====================

export async function getUserReceipts(userEmail: string): Promise<ProcessedReceipt[]> {
  try {
    const q = query(
      collection(db, 'receipts'),
      where('uploadedBy', '==', userEmail),
      orderBy('uploadedAt', 'desc')
    );
    const receiptsSnapshot = await getDocs(q);
    return receiptsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt,
      createdAt: doc.data().createdAt,
      updatedAt: doc.data().updatedAt
    })) as ProcessedReceipt[];
  } catch (error) {
    console.error('Error fetching user receipts:', error);
    return [];
  }
}

export async function getTeamReceipts(teamEmails: string[]): Promise<ProcessedReceipt[]> {
  try {
    const receipts: ProcessedReceipt[] = [];
    
    // Firestore doesn't support 'in' queries with more than 10 items
    const chunks = [];
    for (let i = 0; i < teamEmails.length; i += 10) {
      chunks.push(teamEmails.slice(i, i + 10));
    }
    
    for (const chunk of chunks) {
      const q = query(
        collection(db, 'receipts'),
        where('uploadedBy', 'in', chunk),
        orderBy('uploadedAt', 'desc')
      );
      const receiptsSnapshot = await getDocs(q);
      const chunkReceipts = receiptsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt,
        createdAt: doc.data().createdAt,
        updatedAt: doc.data().updatedAt
      })) as ProcessedReceipt[];
      receipts.push(...chunkReceipts);
    }
    
    return receipts.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  } catch (error) {
    console.error('Error fetching team receipts:', error);
    return [];
  }
}

export async function getAllReceipts(): Promise<ProcessedReceipt[]> {
  try {
    const q = query(
      collection(db, 'receipts'),
      orderBy('uploadedAt', 'desc')
    );
    const receiptsSnapshot = await getDocs(q);
    return receiptsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt,
      createdAt: doc.data().createdAt,
      updatedAt: doc.data().updatedAt
    })) as ProcessedReceipt[];
  } catch (error) {
    console.error('Error fetching all receipts:', error);
    return [];
  }
}

// ==================== ANALYTICS DATA ====================

export interface SpendingAnalytics {
  totalSpent: number;
  totalReceipts: number;
  averagePerReceipt: number;
  spendingByCategory: { [category: string]: number };
  monthlyTrends: { month: string; amount: number }[];
  recentReceipts: ProcessedReceipt[];
  statusBreakdown: { status: string; count: number; amount: number }[];
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
  userVsAverage: { userSpent: number; averageSpent: number; period: string };
}

export async function getUserSpendingAnalytics(userEmail: string): Promise<SpendingAnalytics> {
  try {
    const receipts = await getUserReceipts(userEmail);
    
    // Calculate total spent from receipt total field or items
    const totalSpent = receipts.reduce((sum, receipt) => {
      // Try to use receipt.total if available, otherwise sum items
      if (receipt.total && typeof receipt.total === 'number') {
        return sum + receipt.total;
      }
      
      // Fallback to summing items
      return sum + receipt.items.reduce((itemSum, item) => {
        const priceMatch = item.value.match(/\$?(\d+\.?\d*)/);
        return itemSum + (priceMatch ? parseFloat(priceMatch[1]) : 0);
      }, 0);
    }, 0);
    
    // Enhanced category breakdown using receipt category or merchant
    const spendingByCategory: { [category: string]: number } = {};
    const statusBreakdown: { [status: string]: { count: number; amount: number } } = {};
    
    receipts.forEach(receipt => {
      // Category logic - use receipt category, merchant, or derive from merchant name
      let category = receipt.category || 'Other';
      if (!receipt.category && receipt.merchant) {
        category = categorizeByMerchant(receipt.merchant);
      }
      
      const amount = receipt.total || receipt.items.reduce((sum, item) => {
        const priceMatch = item.value.match(/\$?(\d+\.?\d*)/);
        return sum + (priceMatch ? parseFloat(priceMatch[1]) : 0);
      }, 0);
      
      spendingByCategory[category] = (spendingByCategory[category] || 0) + amount;
      
      // Status breakdown
      const status = receipt.status || 'pending';
      if (!statusBreakdown[status]) {
        statusBreakdown[status] = { count: 0, amount: 0 };
      }
      statusBreakdown[status].count += 1;
      statusBreakdown[status].amount += amount;
    });
    
    // Convert spending by category to percentage
    const categoryBreakdown = Object.entries(spendingByCategory).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);
    
    // Convert status breakdown to array
    const statusBreakdownArray = Object.entries(statusBreakdown).map(([status, data]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count: data.count,
      amount: data.amount
    }));
    
    // Generate monthly trends (last 6 months)
    const monthlyTrends = generateMonthlyTrends(receipts);
    
    // Get user vs average comparison (current month)
    const userVsAverage = await getUserVsAverageComparison(userEmail, receipts);
    
    return {
      totalSpent,
      totalReceipts: receipts.length,
      averagePerReceipt: receipts.length > 0 ? totalSpent / receipts.length : 0,
      spendingByCategory,
      monthlyTrends,
      recentReceipts: receipts.slice(0, 5),
      statusBreakdown: statusBreakdownArray,
      categoryBreakdown,
      userVsAverage
    };
  } catch (error) {
    console.error('Error generating user analytics:', error);
    return {
      totalSpent: 0,
      totalReceipts: 0,
      averagePerReceipt: 0,
      spendingByCategory: {},
      monthlyTrends: [],
      recentReceipts: [],
      statusBreakdown: [],
      categoryBreakdown: [],
      userVsAverage: { userSpent: 0, averageSpent: 0, period: 'current_month' }
    };
  }
}

export async function getTeamSpendingAnalytics(teamEmails: string[]): Promise<SpendingAnalytics> {
  try {
    const receipts = await getTeamReceipts(teamEmails);
    
    const totalSpent = receipts.reduce((sum, receipt) => {
      return sum + receipt.items.reduce((itemSum, item) => {
        // Extract price from item value if it contains a price
        const priceMatch = item.value.match(/\$?(\d+\.?\d*)/);
        return itemSum + (priceMatch ? parseFloat(priceMatch[1]) : 0);
      }, 0);
    }, 0);
    
    const spendingByCategory: { [category: string]: number } = {};
    receipts.forEach(receipt => {
      receipt.items.forEach(item => {
        const category = 'Other'; // Default category since ReceiptDataItem doesn't have category
        const priceMatch = item.value.match(/\$?(\d+\.?\d*)/);
        const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
        spendingByCategory[category] = (spendingByCategory[category] || 0) + price;
      });
    });
    
    const monthlyTrends = generateMonthlyTrends(receipts);
    
    return {
      totalSpent,
      totalReceipts: receipts.length,
      averagePerReceipt: receipts.length > 0 ? totalSpent / receipts.length : 0,
      spendingByCategory,
      monthlyTrends,
      recentReceipts: receipts.slice(0, 10)
    };
  } catch (error) {
    console.error('Error generating team analytics:', error);
    return {
      totalSpent: 0,
      totalReceipts: 0,
      averagePerReceipt: 0,
      spendingByCategory: {},
      monthlyTrends: [],
      recentReceipts: []
    };
  }
}

export async function getOrganizationAnalytics(): Promise<SpendingAnalytics> {
  try {
    const receipts = await getAllReceipts();
    
    const totalSpent = receipts.reduce((sum, receipt) => {
      return sum + receipt.items.reduce((itemSum, item) => {
        // Extract price from item value if it contains a price
        const priceMatch = item.value.match(/\$?(\d+\.?\d*)/);
        return itemSum + (priceMatch ? parseFloat(priceMatch[1]) : 0);
      }, 0);
    }, 0);
    
    const spendingByCategory: { [category: string]: number } = {};
    receipts.forEach(receipt => {
      receipt.items.forEach(item => {
        const category = 'Other'; // Default category since ReceiptDataItem doesn't have category
        const priceMatch = item.value.match(/\$?(\d+\.?\d*)/);
        const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
        spendingByCategory[category] = (spendingByCategory[category] || 0) + price;
      });
    });
    
    const monthlyTrends = generateMonthlyTrends(receipts);
    
    return {
      totalSpent,
      totalReceipts: receipts.length,
      averagePerReceipt: receipts.length > 0 ? totalSpent / receipts.length : 0,
      spendingByCategory,
      monthlyTrends,
      recentReceipts: receipts.slice(0, 20)
    };
  } catch (error) {
    console.error('Error generating organization analytics:', error);
    return {
      totalSpent: 0,
      totalReceipts: 0,
      averagePerReceipt: 0,
      spendingByCategory: {},
      monthlyTrends: [],
      recentReceipts: []
    };
  }
}

// ==================== HELPER FUNCTIONS ====================

// Helper function to categorize receipts by merchant name
function categorizeByMerchant(merchant: string): string {
  const merchantLower = merchant.toLowerCase();
  
  // Food & Dining
  if (merchantLower.includes('restaurant') || merchantLower.includes('cafe') || 
      merchantLower.includes('coffee') || merchantLower.includes('food') ||
      merchantLower.includes('starbucks') || merchantLower.includes('mcdonald') ||
      merchantLower.includes('pizza') || merchantLower.includes('burger')) {
    return 'Food & Dining';
  }
  
  // Travel
  if (merchantLower.includes('hotel') || merchantLower.includes('airline') ||
      merchantLower.includes('taxi') || merchantLower.includes('uber') ||
      merchantLower.includes('lyft') || merchantLower.includes('flight') ||
      merchantLower.includes('travel') || merchantLower.includes('booking')) {
    return 'Travel';
  }
  
  // Office Supplies
  if (merchantLower.includes('office') || merchantLower.includes('supplies') ||
      merchantLower.includes('staples') || merchantLower.includes('depot') ||
      merchantLower.includes('amazon') || merchantLower.includes('dell') ||
      merchantLower.includes('computer') || merchantLower.includes('laptop')) {
    return 'Office Supplies';
  }
  
  // Transportation
  if (merchantLower.includes('gas') || merchantLower.includes('fuel') ||
      merchantLower.includes('shell') || merchantLower.includes('exxon') ||
      merchantLower.includes('chevron') || merchantLower.includes('bp')) {
    return 'Transportation';
  }
  
  // Entertainment
  if (merchantLower.includes('movie') || merchantLower.includes('cinema') ||
      merchantLower.includes('theater') || merchantLower.includes('entertainment') ||
      merchantLower.includes('netflix') || merchantLower.includes('spotify')) {
    return 'Entertainment';
  }
  
  return 'Other';
}

// Helper function to get user vs average comparison
async function getUserVsAverageComparison(userEmail: string, userReceipts: ProcessedReceipt[]): Promise<{ userSpent: number; averageSpent: number; period: string }> {
  try {
    // Calculate user's current month spending
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const userCurrentMonthSpent = userReceipts
      .filter(receipt => {
        const receiptDate = new Date(receipt.uploadedAt);
        return receiptDate.getMonth() === currentMonth && receiptDate.getFullYear() === currentYear;
      })
      .reduce((sum, receipt) => {
        return sum + (receipt.total || receipt.items.reduce((itemSum, item) => {
          const priceMatch = item.value.match(/\$?(\d+\.?\d*)/);
          return itemSum + (priceMatch ? parseFloat(priceMatch[1]) : 0);
        }, 0));
      }, 0);
    
    // Get all receipts for current month to calculate average
    const allReceipts = await getAllReceipts();
    const currentMonthReceipts = allReceipts.filter(receipt => {
      const receiptDate = new Date(receipt.uploadedAt);
      return receiptDate.getMonth() === currentMonth && receiptDate.getFullYear() === currentYear;
    });
    
    // Group by user and calculate average
    const userSpendingMap: { [email: string]: number } = {};
    currentMonthReceipts.forEach(receipt => {
      const email = receipt.uploadedBy;
      const amount = receipt.total || receipt.items.reduce((sum, item) => {
        const priceMatch = item.value.match(/\$?(\d+\.?\d*)/);
        return sum + (priceMatch ? parseFloat(priceMatch[1]) : 0);
      }, 0);
      
      userSpendingMap[email] = (userSpendingMap[email] || 0) + amount;
    });
    
    const userSpendingArray = Object.values(userSpendingMap);
    const averageSpent = userSpendingArray.length > 0 
      ? userSpendingArray.reduce((sum, amount) => sum + amount, 0) / userSpendingArray.length 
      : 0;
    
    return {
      userSpent: userCurrentMonthSpent,
      averageSpent,
      period: 'current_month'
    };
  } catch (error) {
    console.error('Error calculating user vs average:', error);
    return {
      userSpent: 0,
      averageSpent: 0,
      period: 'current_month'
    };
  }
}

function generateMonthlyTrends(receipts: ProcessedReceipt[]): { month: string; amount: number }[] {
  const monthlyData: { [key: string]: number } = {};
  
  receipts.forEach(receipt => {
    const date = new Date(receipt.uploadedAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const receiptTotal = receipt.items.reduce((sum, item) => {
      const priceMatch = item.value.match(/\$?(\d+\.?\d*)/);
      return sum + (priceMatch ? parseFloat(priceMatch[1]) : 0);
    }, 0);
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + receiptTotal;
  });
  
  // Generate last 6 months
  const trends = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    trends.push({
      month: monthName,
      amount: monthlyData[monthKey] || 0
    });
  }
  
  return trends;
}

// ==================== SUBMISSION DATA ====================

export async function getUserSubmissions(userId: string): Promise<ReceiptSubmission[]> {
  try {
    const q = query(
      collection(db, 'receipt_submissions'),
      where('userUid', '==', userId),
      orderBy('submittedAt', 'desc')
    );
    const submissionsSnapshot = await getDocs(q);
    return submissionsSnapshot.docs.map(doc => ({
      submissionId: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt,
      processedAt: doc.data().processedAt,
      analyzedAt: doc.data().analyzedAt
    })) as ReceiptSubmission[];
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    return [];
  }
}

export async function getPendingApprovals(managerId: string): Promise<ProcessedReceipt[]> {
  try {
    const q = query(
      collection(db, 'receipts'),
      where('supervisorId', '==', managerId),
      where('status', '==', 'pending_approval'),
      orderBy('uploadedAt', 'desc')
    );
    const receiptsSnapshot = await getDocs(q);
    return receiptsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt,
      createdAt: doc.data().createdAt,
      updatedAt: doc.data().updatedAt
    })) as ProcessedReceipt[];
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    return [];
  }
}
