import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription?success=true`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription?canceled=true`,
} as const;

// Subscription tier pricing (in cents)
export const SUBSCRIPTION_PLANS = {
  basic: {
    priceId: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic',
    amount: 2900, // $29.00
    name: 'Basic',
    features: {
      maxReceipts: 200,
      maxUsers: 10,
      advancedAnalytics: false,
      apiAccess: false,
      customIntegrations: false,
      prioritySupport: false,
    },
  },
  professional: {
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional',
    amount: 7900, // $79.00
    name: 'Professional',
    features: {
      maxReceipts: 1000,
      maxUsers: 50,
      advancedAnalytics: true,
      apiAccess: false,
      customIntegrations: false,
      prioritySupport: true,
    },
  },
  enterprise: {
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    amount: 19900, // $199.00
    name: 'Enterprise',
    features: {
      maxReceipts: 5000,
      maxUsers: -1, // Unlimited
      advancedAnalytics: true,
      apiAccess: true,
      customIntegrations: true,
      prioritySupport: true,
    },
  },
} as const;

export type SubscriptionPlanKey = keyof typeof SUBSCRIPTION_PLANS;
