import { stripe, SUBSCRIPTION_PLANS, type SubscriptionPlanKey } from './stripe';
import type { Company, SubscriptionTier, SubscriptionStatus } from '@/types';

export interface CreateCheckoutSessionParams {
  companyId: string;
  plan: SubscriptionPlanKey;
  customerEmail: string;
  companyName: string;
}

export interface CreatePortalSessionParams {
  companyId: string;
  customerId: string;
}

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession({
  companyId,
  plan,
  customerEmail,
  companyName,
}: CreateCheckoutSessionParams) {
  const planConfig = SUBSCRIPTION_PLANS[plan];
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: planConfig.priceId,
        quantity: 1,
      },
    ],
    customer_email: customerEmail,
    metadata: {
      companyId,
      companyName,
      plan,
    },
    subscription_data: {
      metadata: {
        companyId,
        companyName,
        plan,
      },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription?canceled=true`,
  });

  return session;
}

/**
 * Create a Stripe customer portal session for subscription management
 */
export async function createPortalSession({
  companyId,
  customerId,
}: CreatePortalSessionParams) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription`,
  });

  return session;
}

/**
 * Get subscription details from Stripe
 */
export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Get customer details from Stripe
 */
export async function getCustomer(customerId: string) {
  return await stripe.customers.retrieve(customerId);
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Update subscription to a different plan
 */
export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}

/**
 * Map Stripe subscription status to our internal status
 */
export function mapStripeStatusToInternal(
  stripeStatus: string
): SubscriptionStatus {
  switch (stripeStatus) {
    case 'trialing':
      return 'trialing';
    case 'active':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
      return 'canceled';
    case 'incomplete':
    case 'incomplete_expired':
    case 'unpaid':
      return 'expired';
    default:
      return 'expired';
  }
}

/**
 * Map Stripe plan to our internal tier
 */
export function mapStripePlanToTier(priceId: string): SubscriptionTier {
  for (const [plan, config] of Object.entries(SUBSCRIPTION_PLANS)) {
    if (config.priceId === priceId) {
      return plan as SubscriptionTier;
    }
  }
  return 'trial';
}

/**
 * Get usage limits for a subscription tier
 */
export function getUsageLimits(tier: SubscriptionTier) {
  if (tier === 'trial') {
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
  }

  const planKey = tier as SubscriptionPlanKey;
  const plan = SUBSCRIPTION_PLANS[planKey];
  
  return {
    maxReceipts: plan.features.maxReceipts,
    maxUsers: plan.features.maxUsers,
    features: plan.features,
  };
}

/**
 * Check if a company can perform an action based on their subscription
 */
export function canPerformAction(
  company: Company,
  action: 'upload_receipt' | 'add_user'
): { allowed: boolean; reason?: string; upgradeRequired?: boolean } {
  const limits = getUsageLimits(company.subscriptionTier);
  
  // Check if subscription is active
  if (company.subscriptionStatus !== 'active' && company.subscriptionStatus !== 'trialing') {
    return {
      allowed: false,
      reason: 'Your subscription is not active. Please update your payment method.',
      upgradeRequired: true,
    };
  }

  // Check trial expiration
  if (company.subscriptionStatus === 'trialing' && company.trialEndsAt) {
    if (new Date() > company.trialEndsAt) {
      return {
        allowed: false,
        reason: 'Your trial has expired. Please subscribe to continue.',
        upgradeRequired: true,
      };
    }
  }

  // Check usage limits
  if (action === 'upload_receipt') {
    if (limits.maxReceipts !== -1 && company.receiptCount >= limits.maxReceipts) {
      return {
        allowed: false,
        reason: `You've reached your monthly receipt limit of ${limits.maxReceipts}. Upgrade to continue.`,
        upgradeRequired: true,
      };
    }
  }

  if (action === 'add_user') {
    if (limits.maxUsers !== -1 && company.userCount >= limits.maxUsers) {
      return {
        allowed: false,
        reason: `You've reached your user limit of ${limits.maxUsers}. Upgrade to continue.`,
        upgradeRequired: true,
      };
    }
  }

  return { allowed: true };
}
