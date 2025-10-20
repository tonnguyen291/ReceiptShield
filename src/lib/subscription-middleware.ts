import { getCompany, incrementReceiptCount, incrementUserCount, decrementUserCount } from './firebase-company-store';
import { canPerformAction } from './stripe-subscriptions';
import type { Company } from '@/types';

export interface UsageCheckResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: boolean;
  currentUsage?: {
    receipts: number;
    users: number;
  };
  limits?: {
    maxReceipts: number;
    maxUsers: number;
  };
}

/**
 * Check if a company can upload a receipt
 */
export async function canUploadReceipt(companyId: string): Promise<UsageCheckResult> {
  try {
    const company = await getCompany(companyId);
    if (!company) {
      return {
        allowed: false,
        reason: 'Company not found',
      };
    }

    const actionResult = canPerformAction(company, 'upload_receipt');
    
    return {
      allowed: actionResult.allowed,
      reason: actionResult.reason,
      upgradeRequired: actionResult.upgradeRequired,
      currentUsage: {
        receipts: company.receiptCount,
        users: company.userCount,
      },
    };
  } catch (error) {
    console.error('Error checking receipt upload permission:', error);
    return {
      allowed: false,
      reason: 'Error checking permissions',
    };
  }
}

/**
 * Check if a company can add a user
 */
export async function canAddUser(companyId: string): Promise<UsageCheckResult> {
  try {
    const company = await getCompany(companyId);
    if (!company) {
      return {
        allowed: false,
        reason: 'Company not found',
      };
    }

    const actionResult = canPerformAction(company, 'add_user');
    
    return {
      allowed: actionResult.allowed,
      reason: actionResult.reason,
      upgradeRequired: actionResult.upgradeRequired,
      currentUsage: {
        receipts: company.receiptCount,
        users: company.userCount,
      },
    };
  } catch (error) {
    console.error('Error checking user addition permission:', error);
    return {
      allowed: false,
      reason: 'Error checking permissions',
    };
  }
}

/**
 * Check if a company has an active subscription
 */
export async function hasActiveSubscription(companyId: string): Promise<{
  isActive: boolean;
  isTrial: boolean;
  isExpired: boolean;
  daysRemaining?: number;
  reason?: string;
}> {
  try {
    const company = await getCompany(companyId);
    if (!company) {
      return {
        isActive: false,
        isTrial: false,
        isExpired: true,
        reason: 'Company not found',
      };
    }

    const now = new Date();
    const isTrial = company.subscriptionStatus === 'trialing';
    const isActive = company.subscriptionStatus === 'active' || isTrial;
    
    let isExpired = false;
    let daysRemaining: number | undefined;
    let reason: string | undefined;

    if (isTrial && company.trialEndsAt) {
      const trialEnd = company.trialEndsAt;
      isExpired = now > trialEnd;
      daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (isExpired) {
        reason = 'Your trial has expired. Please subscribe to continue.';
      } else if (daysRemaining <= 3) {
        reason = `Your trial expires in ${daysRemaining} days. Consider upgrading to continue.`;
      }
    } else if (company.currentPeriodEnd) {
      isExpired = now > company.currentPeriodEnd;
      if (isExpired) {
        reason = 'Your subscription has expired. Please update your payment method.';
      }
    }

    if (!isActive || isExpired) {
      reason = reason || 'Your subscription is not active. Please subscribe to continue.';
    }

    return {
      isActive: isActive && !isExpired,
      isTrial,
      isExpired,
      daysRemaining,
      reason,
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return {
      isActive: false,
      isTrial: false,
      isExpired: true,
      reason: 'Error checking subscription status',
    };
  }
}

/**
 * Record a receipt upload (increment counter)
 */
export async function recordReceiptUpload(companyId: string): Promise<void> {
  try {
    await incrementReceiptCount(companyId);
  } catch (error) {
    console.error('Error recording receipt upload:', error);
    throw new Error('Failed to record receipt upload');
  }
}

/**
 * Record a user addition (increment counter)
 */
export async function recordUserAddition(companyId: string): Promise<void> {
  try {
    await incrementUserCount(companyId);
  } catch (error) {
    console.error('Error recording user addition:', error);
    throw new Error('Failed to record user addition');
  }
}

/**
 * Record a user removal (decrement counter)
 */
export async function recordUserRemoval(companyId: string): Promise<void> {
  try {
    await decrementUserCount(companyId);
  } catch (error) {
    console.error('Error recording user removal:', error);
    throw new Error('Failed to record user removal');
  }
}

/**
 * Get usage limits for a subscription tier
 */
export function getUsageLimits(tier: string) {
  switch (tier) {
    case 'trial':
      return {
        maxReceipts: 50,
        maxUsers: 5,
        features: {
          advancedAnalytics: false,
          apiAccess: false,
          customIntegrations: false,
          prioritySupport: false,
        },
      };
    case 'basic':
      return {
        maxReceipts: 200,
        maxUsers: 10,
        features: {
          advancedAnalytics: false,
          apiAccess: false,
          customIntegrations: false,
          prioritySupport: false,
        },
      };
    case 'professional':
      return {
        maxReceipts: 1000,
        maxUsers: 50,
        features: {
          advancedAnalytics: true,
          apiAccess: false,
          customIntegrations: false,
          prioritySupport: true,
        },
      };
    case 'enterprise':
      return {
        maxReceipts: 5000,
        maxUsers: -1, // Unlimited
        features: {
          advancedAnalytics: true,
          apiAccess: true,
          customIntegrations: true,
          prioritySupport: true,
        },
      };
    default:
      return {
        maxReceipts: 0,
        maxUsers: 0,
        features: {
          advancedAnalytics: false,
          apiAccess: false,
          customIntegrations: false,
          prioritySupport: false,
        },
      };
  }
}

/**
 * Check if a user can access a specific feature based on their company's subscription
 */
export async function canAccessFeature(
  companyId: string,
  feature: 'advancedAnalytics' | 'apiAccess' | 'customIntegrations' | 'prioritySupport'
): Promise<boolean> {
  try {
    const company = await getCompany(companyId);
    if (!company) {
      return false;
    }

    const limits = getUsageLimits(company.subscriptionTier);
    return limits.features[feature] || false;
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
}

/**
 * Get comprehensive usage information for a company
 */
export async function getCompanyUsageInfo(companyId: string): Promise<{
  company: Company | null;
  subscription: {
    isActive: boolean;
    isTrial: boolean;
    isExpired: boolean;
    daysRemaining?: number;
    reason?: string;
  };
  usage: {
    receipts: number;
    users: number;
    limits: {
      maxReceipts: number;
      maxUsers: number;
    };
  };
  features: {
    advancedAnalytics: boolean;
    apiAccess: boolean;
    customIntegrations: boolean;
    prioritySupport: boolean;
  };
}> {
  try {
    const company = await getCompany(companyId);
    if (!company) {
      return {
        company: null,
        subscription: {
          isActive: false,
          isTrial: false,
          isExpired: true,
          reason: 'Company not found',
        },
        usage: {
          receipts: 0,
          users: 0,
          limits: {
            maxReceipts: 0,
            maxUsers: 0,
          },
        },
        features: {
          advancedAnalytics: false,
          apiAccess: false,
          customIntegrations: false,
          prioritySupport: false,
        },
      };
    }

    const subscription = await hasActiveSubscription(companyId);
    const limits = getUsageLimits(company.subscriptionTier);

    return {
      company,
      subscription,
      usage: {
        receipts: company.receiptCount,
        users: company.userCount,
        limits: {
          maxReceipts: limits.maxReceipts,
          maxUsers: limits.maxUsers,
        },
      },
      features: limits.features,
    };
  } catch (error) {
    console.error('Error getting company usage info:', error);
    throw new Error('Failed to get company usage information');
  }
}
