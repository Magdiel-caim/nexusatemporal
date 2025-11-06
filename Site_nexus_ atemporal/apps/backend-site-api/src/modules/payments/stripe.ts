import Stripe from 'stripe';
import axios from 'axios';
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
  try {
    // 1. IMPORTANTE: Chamar Sistema Principal PRIMEIRO para criar usuário
    const oneNexusApiUrl = process.env.ONE_NEXUS_API_URL;
    const oneNexusApiKey = process.env.ONE_NEXUS_API_KEY;

    if (oneNexusApiUrl && oneNexusApiKey) {
      console.log('[Stripe Webhook] Calling main system API...', {
        orderId: order.id,
        email: order.user_email,
        plan: order.plan,
      });

      try {
        const response = await axios.post(
          `${oneNexusApiUrl}/users/external/create-from-payment`,
          {
            email: order.user_email,
            name: order.user_name || order.user_email.split('@')[0],
            planId: order.plan || 'essencial',
            stripeSessionId: order.external_id,
            amount: order.amount || 0,
          },
          {
            headers: {
              'Authorization': `Bearer ${oneNexusApiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 segundos
          }
        );

        console.log('[Stripe Webhook] Main system API response:', {
          success: response.data.success,
          userId: response.data.data?.userId,
          isNewUser: response.data.data?.isNewUser,
        });
      } catch (apiError: any) {
        console.error('[Stripe Webhook] Error calling main system API:', {
          message: apiError.message,
          status: apiError.response?.status,
          data: apiError.response?.data,
        });

        // Se falhar, logar mas não parar o fluxo (os outros webhooks ainda executam)
        // Em produção, isso deveria ser enviado para uma fila de retry
      }
    } else {
      console.warn('[Stripe Webhook] ONE_NEXUS_API_URL or ONE_NEXUS_API_KEY not configured');
    }

    // 2. Send to n8n (opcional)
    try {
      const { sendN8nWebhook } = await import('../webhook/n8n');
      await sendN8nWebhook({
        orderId: order.id,
        email: order.user_email,
        plan: order.plan || '',
        amount: order.amount || 0,
        provider: 'stripe',
      });
    } catch (n8nError) {
      console.error('[Stripe Webhook] Error sending to n8n:', n8nError);
    }

    // 3. Send welcome email from Site (backup - o Sistema Principal já envia)
    try {
      const { sendWelcomeEmail } = await import('../email/email.service');
      // Comentado porque o Sistema Principal já envia um email melhor
      // await sendWelcomeEmail(order.user_email, order.user_name || '', order.plan || '');
    } catch (emailError) {
      console.error('[Stripe Webhook] Error sending welcome email:', emailError);
    }
  } catch (error) {
    console.error('[Stripe Webhook] Error in triggerPostPurchase:', error);
    // Não lançar erro para não falhar o webhook do Stripe
  }
};
