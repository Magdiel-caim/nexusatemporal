import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planName, billingCycle, customerData } = body;

    // Map plan names to Stripe Price IDs
    const priceMap: Record<string, Record<string, string>> = {
      'Essencial': {
        monthly: process.env.STRIPE_PRICE_ESSENCIAL_MONTHLY!,
        yearly: process.env.STRIPE_PRICE_ESSENCIAL_YEARLY!,
      },
      'Profissional': {
        monthly: process.env.STRIPE_PRICE_PROFISSIONAL_MONTHLY!,
        yearly: process.env.STRIPE_PRICE_PROFISSIONAL_YEARLY!,
      },
      'Empresarial': {
        monthly: process.env.STRIPE_PRICE_EMPRESARIAL_MONTHLY!,
        yearly: process.env.STRIPE_PRICE_EMPRESARIAL_YEARLY!,
      },
      'Enterprise': {
        monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY!,
        yearly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY!, // Enterprise only has monthly
      },
    };

    const priceId = priceMap[planName]?.[billingCycle];

    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan or billing cycle' },
        { status: 400 }
      );
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: customerData?.email,
      metadata: {
        planName,
        billingCycle,
        clinicName: customerData?.clinicName || '',
        cnpj: customerData?.cnpj || '',
        phone: customerData?.phone || '',
        address: customerData?.address || '',
        fullName: customerData?.fullName || '',
        cpf: customerData?.cpf || '',
      },
      subscription_data: {
        trial_period_days: 10, // 10 days free trial
        metadata: {
          planName,
          billingCycle,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/obrigado?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?canceled=true`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
