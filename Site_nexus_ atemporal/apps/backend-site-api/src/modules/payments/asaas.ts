import axios from 'axios';
import { AppDataSource } from '../../config/database';
import { Order } from '../../entities/Order';

const ASAAS_API_URL = 'https://www.asaas.com/api/v3';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';

export interface CreateAsaasChargeParams {
  planId: string;
  userEmail: string;
  userName: string;
  cpfCnpj: string;
}

export const createAsaasCharge = async (params: CreateAsaasChargeParams) => {
  const { planId, userEmail, userName, cpfCnpj } = params;

  // Create order
  const orderRepo = AppDataSource.getRepository(Order);
  const order = orderRepo.create({
    user_email: userEmail,
    user_name: userName,
    plan: planId,
    provider: 'asaas',
    status: 'pending',
  });
  await orderRepo.save(order);

  // Plan pricing
  const planPrices: Record<string, number> = {
    essencial: 247.0,
    profissional: 580.0,
    empresarial: 1247.0,
    enterprise: 2997.0,
  };

  const value = planPrices[planId] || 0;

  try {
    // Create or get customer
    const customerResponse = await axios.post(
      `${ASAAS_API_URL}/customers`,
      {
        name: userName,
        email: userEmail,
        cpfCnpj: cpfCnpj,
      },
      {
        headers: {
          'access_token': ASAAS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const customerId = customerResponse.data.id;

    // Create subscription
    const subscriptionResponse = await axios.post(
      `${ASAAS_API_URL}/subscriptions`,
      {
        customer: customerId,
        billingType: 'CREDIT_CARD',
        value: value,
        nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        cycle: 'MONTHLY',
        description: `Plano ${planId} - Nexus Atemporal`,
        externalReference: order.id,
      },
      {
        headers: {
          'access_token': ASAAS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    order.external_id = subscriptionResponse.data.id;
    order.amount = Math.round(value * 100);
    await orderRepo.save(order);

    return {
      subscriptionId: subscriptionResponse.data.id,
      checkoutUrl: subscriptionResponse.data.invoiceUrl,
    };
  } catch (error: any) {
    console.error('Asaas error:', error.response?.data || error.message);
    throw new Error('Failed to create Asaas subscription');
  }
};

export const handleAsaasWebhook = async (body: any, token: string) => {
  // Verify webhook token
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN || '';
  if (token !== expectedToken) {
    throw new Error('Invalid webhook token');
  }

  // Process webhook
  const event = body.event;
  const payment = body.payment;

  if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
    const externalReference = payment.externalReference;

    if (externalReference) {
      const orderRepo = AppDataSource.getRepository(Order);
      const order = await orderRepo.findOne({ where: { id: externalReference } });

      if (order) {
        order.status = 'paid';
        await orderRepo.save(order);

        // Trigger post-purchase
        const { sendN8nWebhook } = await import('../webhook/n8n');
        const { sendWelcomeEmail } = await import('../email/email.service');

        await sendN8nWebhook({
          orderId: order.id,
          email: order.user_email,
          plan: order.plan || '',
          amount: order.amount || 0,
          provider: 'asaas',
        });

        await sendWelcomeEmail(order.user_email, order.user_name || '', order.plan || '');
      }
    }
  }

  return { received: true };
};
