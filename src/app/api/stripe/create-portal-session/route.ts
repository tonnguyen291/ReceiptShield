import { NextRequest, NextResponse } from 'next/server';
import { createPortalSession } from '@/lib/stripe-subscriptions';
import { getCompany } from '@/lib/firebase-company-store';
import { auth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get user's company
    const companyId = decodedToken.companyId;
    if (!companyId) {
      return NextResponse.json(
        { error: 'User not associated with a company' },
        { status: 400 }
      );
    }

    const company = await getCompany(companyId);
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    if (!company.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found for this company' },
        { status: 400 }
      );
    }

    // Check if user can manage subscription
    const userDoc = await auth.getUser(userId);
    const canManageSubscription = userDoc.customClaims?.canManageSubscription || false;
    
    if (!canManageSubscription) {
      return NextResponse.json(
        { error: 'You do not have permission to manage subscriptions' },
        { status: 403 }
      );
    }

    // Create portal session
    const session = await createPortalSession({
      companyId,
      customerId: company.stripeCustomerId,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
