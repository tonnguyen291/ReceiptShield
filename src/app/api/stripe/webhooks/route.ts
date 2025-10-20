import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { updateCompanySubscription } from '@/lib/firebase-company-store';
import { mapStripeStatusToInternal, mapStripePlanToTier } from '@/lib/stripe-subscriptions';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not set');
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const companyId = session.metadata?.companyId;
        const plan = session.metadata?.plan;

        if (!companyId || !plan) {
          console.error('Missing metadata in checkout session:', session.id);
          break;
        }

        // Update company subscription
        await updateCompanySubscription(companyId, {
          subscriptionTier: plan as any,
          subscriptionStatus: 'active',
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          currentPeriodEnd: new Date(session.subscription_details?.current_period_end * 1000),
        });

        console.log(`Subscription created for company ${companyId}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const companyId = subscription.metadata?.companyId;

        if (!companyId) {
          console.error('Missing companyId in subscription metadata:', subscription.id);
          break;
        }

        const status = mapStripeStatusToInternal(subscription.status);
        const tier = mapStripePlanToTier(subscription.items.data[0].price.id);

        await updateCompanySubscription(companyId, {
          subscriptionTier: tier,
          subscriptionStatus: status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        });

        console.log(`Subscription updated for company ${companyId}: ${status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const companyId = subscription.metadata?.companyId;

        if (!companyId) {
          console.error('Missing companyId in subscription metadata:', subscription.id);
          break;
        }

        await updateCompanySubscription(companyId, {
          subscriptionStatus: 'canceled',
        });

        console.log(`Subscription canceled for company ${companyId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = invoice.subscription as string;
        
        // Get subscription details to find company
        const subscriptionDetails = await stripe.subscriptions.retrieve(subscription);
        const companyId = subscriptionDetails.metadata?.companyId;

        if (!companyId) {
          console.error('Missing companyId in subscription metadata:', subscription);
          break;
        }

        await updateCompanySubscription(companyId, {
          subscriptionStatus: 'past_due',
        });

        console.log(`Payment failed for company ${companyId}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = invoice.subscription as string;
        
        // Get subscription details to find company
        const subscriptionDetails = await stripe.subscriptions.retrieve(subscription);
        const companyId = subscriptionDetails.metadata?.companyId;

        if (!companyId) {
          console.error('Missing companyId in subscription metadata:', subscription);
          break;
        }

        await updateCompanySubscription(companyId, {
          subscriptionStatus: 'active',
        });

        console.log(`Payment succeeded for company ${companyId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
