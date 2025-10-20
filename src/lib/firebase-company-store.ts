import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Company, SubscriptionTier, SubscriptionStatus, CompanySettings } from '@/types';
import { getUsageLimits } from './stripe-subscriptions';

const COMPANIES_COLLECTION = 'companies';
const SUBSCRIPTION_USAGE_COLLECTION = 'subscriptionUsage';

/**
 * Create a new company with trial status
 */
export async function createCompany(
  name: string, 
  ownerId: string
): Promise<string> {
  try {
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

    const companyData = {
      name: name.trim(),
      ownerId,
      subscriptionTier: 'trial' as SubscriptionTier,
      subscriptionStatus: 'trialing' as SubscriptionStatus,
      trialEndsAt: Timestamp.fromDate(trialEndsAt),
      receiptCount: 0,
      userCount: 1, // Owner is the first user
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    const docRef = await addDoc(collection(db, COMPANIES_COLLECTION), companyData);
    console.log('Company created:', docRef.id);

    // Initialize subscription usage tracking
    await addDoc(collection(db, SUBSCRIPTION_USAGE_COLLECTION), {
      companyId: docRef.id,
      month: now.getMonth(),
      year: now.getFullYear(),
      receiptCount: 0,
      userCount: 1,
      createdAt: Timestamp.fromDate(now),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating company:', error);
    throw new Error(`Failed to create company: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get company by ID
 */
export async function getCompany(companyId: string): Promise<Company | null> {
  try {
    const companyRef = doc(db, COMPANIES_COLLECTION, companyId);
    const companySnap = await getDoc(companyRef);
    
    if (!companySnap.exists()) {
      return null;
    }

    const data = companySnap.data();
    return {
      id: companySnap.id,
      name: data.name,
      ownerId: data.ownerId,
      subscriptionTier: data.subscriptionTier,
      subscriptionStatus: data.subscriptionStatus,
      trialEndsAt: data.trialEndsAt instanceof Timestamp 
        ? data.trialEndsAt.toDate() 
        : data.trialEndsAt,
      currentPeriodEnd: data.currentPeriodEnd instanceof Timestamp 
        ? data.currentPeriodEnd.toDate() 
        : data.currentPeriodEnd,
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      receiptCount: data.receiptCount || 0,
      userCount: data.userCount || 0,
      createdAt: data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate() 
        : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp 
        ? data.updatedAt.toDate() 
        : data.updatedAt,
    };
  } catch (error) {
    console.error('Error getting company:', error);
    throw new Error(`Failed to get company: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update company subscription data
 */
export async function updateCompanySubscription(
  companyId: string,
  subscriptionData: {
    subscriptionTier?: SubscriptionTier;
    subscriptionStatus?: SubscriptionStatus;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: Date;
    trialEndsAt?: Date;
  }
): Promise<void> {
  try {
    const companyRef = doc(db, COMPANIES_COLLECTION, companyId);
    
    const updateData: any = {
      ...subscriptionData,
      updatedAt: Timestamp.now(),
    };

    // Convert dates to Timestamps
    if (subscriptionData.currentPeriodEnd) {
      updateData.currentPeriodEnd = Timestamp.fromDate(subscriptionData.currentPeriodEnd);
    }
    if (subscriptionData.trialEndsAt) {
      updateData.trialEndsAt = Timestamp.fromDate(subscriptionData.trialEndsAt);
    }

    await updateDoc(companyRef, updateData);
    console.log('Company subscription updated:', companyId);
  } catch (error) {
    console.error('Error updating company subscription:', error);
    throw new Error(`Failed to update company subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if company has active subscription
 */
export async function checkSubscriptionStatus(companyId: string): Promise<{
  isActive: boolean;
  isTrial: boolean;
  isExpired: boolean;
  daysRemaining?: number;
}> {
  try {
    const company = await getCompany(companyId);
    if (!company) {
      return { isActive: false, isTrial: false, isExpired: true };
    }

    const now = new Date();
    const isTrial = company.subscriptionStatus === 'trialing';
    const isActive = company.subscriptionStatus === 'active' || isTrial;
    
    let isExpired = false;
    let daysRemaining: number | undefined;

    if (isTrial && company.trialEndsAt) {
      const trialEnd = company.trialEndsAt;
      isExpired = now > trialEnd;
      daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    } else if (company.currentPeriodEnd) {
      isExpired = now > company.currentPeriodEnd;
    }

    return {
      isActive: isActive && !isExpired,
      isTrial,
      isExpired,
      daysRemaining,
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return { isActive: false, isTrial: false, isExpired: true };
  }
}

/**
 * Get current month's usage for a company
 */
export async function getCompanyUsage(companyId: string): Promise<{
  receiptCount: number;
  userCount: number;
  limits: {
    maxReceipts: number;
    maxUsers: number;
  };
}> {
  try {
    const company = await getCompany(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    const limits = getUsageLimits(company.subscriptionTier);
    
    return {
      receiptCount: company.receiptCount,
      userCount: company.userCount,
      limits: {
        maxReceipts: limits.maxReceipts,
        maxUsers: limits.maxUsers,
      },
    };
  } catch (error) {
    console.error('Error getting company usage:', error);
    throw new Error(`Failed to get company usage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Increment receipt count for company
 */
export async function incrementReceiptCount(companyId: string): Promise<void> {
  try {
    const companyRef = doc(db, COMPANIES_COLLECTION, companyId);
    await updateDoc(companyRef, {
      receiptCount: company.receiptCount + 1,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error incrementing receipt count:', error);
    throw new Error(`Failed to increment receipt count: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Increment user count for company
 */
export async function incrementUserCount(companyId: string): Promise<void> {
  try {
    const companyRef = doc(db, COMPANIES_COLLECTION, companyId);
    await updateDoc(companyRef, {
      userCount: company.userCount + 1,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error incrementing user count:', error);
    throw new Error(`Failed to increment user count: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrement user count for company
 */
export async function decrementUserCount(companyId: string): Promise<void> {
  try {
    const companyRef = doc(db, COMPANIES_COLLECTION, companyId);
    await updateDoc(companyRef, {
      userCount: Math.max(0, company.userCount - 1),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error decrementing user count:', error);
    throw new Error(`Failed to decrement user count: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all companies (for platform admins)
 */
export async function getAllCompanies(): Promise<Company[]> {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, COMPANIES_COLLECTION), orderBy('createdAt', 'desc'))
    );
    
    const companies: Company[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      companies.push({
        id: doc.id,
        name: data.name,
        ownerId: data.ownerId,
        subscriptionTier: data.subscriptionTier,
        subscriptionStatus: data.subscriptionStatus,
        trialEndsAt: data.trialEndsAt instanceof Timestamp 
          ? data.trialEndsAt.toDate() 
          : data.trialEndsAt,
        currentPeriodEnd: data.currentPeriodEnd instanceof Timestamp 
          ? data.currentPeriodEnd.toDate() 
          : data.currentPeriodEnd,
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        receiptCount: data.receiptCount || 0,
        userCount: data.userCount || 0,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp 
          ? data.updatedAt.toDate() 
          : data.updatedAt,
      });
    });
    
    return companies;
  } catch (error) {
    console.error('Error getting all companies:', error);
    throw new Error(`Failed to get companies: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update company settings
 */
export async function updateCompanySettings(
  companyId: string,
  settings: Partial<CompanySettings>
): Promise<void> {
  try {
    const settingsRef = doc(db, COMPANIES_COLLECTION, companyId, 'settings', 'main');
    await updateDoc(settingsRef, {
      ...settings,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating company settings:', error);
    throw new Error(`Failed to update company settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get company settings
 */
export async function getCompanySettings(companyId: string): Promise<CompanySettings | null> {
  try {
    const settingsRef = doc(db, COMPANIES_COLLECTION, companyId, 'settings', 'main');
    const settingsSnap = await getDoc(settingsRef);
    
    if (!settingsSnap.exists()) {
      return null;
    }

    return settingsSnap.data() as CompanySettings;
  } catch (error) {
    console.error('Error getting company settings:', error);
    return null;
  }
}
