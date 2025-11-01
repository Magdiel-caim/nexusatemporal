import Stripe from 'stripe';
import { AppDataSource } from '../../config/database';
import { Order } from '../../entities/Order';
import { PaymentEvent } from '../../entities/PaymentEvent';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export interface CreateStripeSessionParams {
  planId: string;
  userEmail: string;
  userName?: string;
  successUrl: string;
  cancelUrl: string;
}

export const createStripeSession = async (params: CreateStripeSessionParams) => {
  const { planId, userEmail, userName, successUrl, cancelUrl } = params;

  // Create order in database
  const orderRepo = AppDataSource.getRepository(Order);
  const order = orderRepo.create({
    user_email: userEmail,
    user_name: userName,
    plan: planId,
    provider: 'stripe',
    status: 'pending',
  });
  await orderRepo.save(order);

  // Plan pricing (in cents)
  const planPrices: Record<string, number> = {
    essencial: 24700, // R$ 247.00
    profissional: 58000, // R$ 580.00
    empresarial: 124700, // R$ 1247.00
    enterprise: 299700, // R$ 2997.00
  };

  const amount = planPrices[planId] || 0;

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'brl',
          product_data: {
            name: `Plano ${planId.charAt(0).toUpperCase() + planId.slice(1)}`,
            description: 'Sistema Nexus Atemporal',
          },
          unit_amount: amount,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    customer_email: userEmail,
    metadata: {
      order_id: order.id,
      plan_id: planId,
    },
  });

  // Update order with external ID
  order.external_id = session.id;
  order.amount = amount;
  await orderRepo.save(order);

  return {
    sessionId: session.id,
    url: session.url,
  };
};

export const handleStripeWebhook = async (rawBody: Buffer, signature: string) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    // Save event
    const eventRepo = AppDataSource.getRepository(PaymentEvent);
    await eventRepo.save({
      provider: 'stripe',
      event_type: event.type,
      event: event as any,
    });

    // Handle specific events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;

        if (orderId) {
          const orderRepo = AppDataSource.getRepository(Order);
          const order = await orderRepo.findOne({ where: { id: orderId } });

          if (order) {
            order.status = 'paid';
            await orderRepo.save(order);

            // Trigger post-purchase flow
            await triggerPostPurchase(order);
          }
        }
        break;
      }

      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        // Handle subscription payments
        break;
    }

    return { received: true };
  } catch (err: any) {
    throw new Error(`Webhook Error: ${err.message}`);
  }
};

// Import from webhook module
const triggerPostPurchase = async (order: Order) => {
  const { sendN8nWebhook } = await import('../webhook/n8n');
  const { sendWelcomeEmail } = await import('../email/email.service');

  // Send to n8n
  await sendN8nWebhook({
    orderId: order.id,
    email: order.user_email,
    plan: order.plan || '',
    amount: order.amount || 0,
    provider: 'stripe',
  });

  // Send welcome email
  await sendWelcomeEmail(order.user_email, order.user_name || '', order.plan || '');
};
