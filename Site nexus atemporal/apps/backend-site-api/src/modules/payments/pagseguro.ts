import axios from 'axios';
import { AppDataSource } from '../../config/database';
import { Order } from '../../entities/Order';

const PAGSEGURO_API_URL = 'https://ws.pagseguro.uol.com.br/v2';
const PAGSEGURO_TOKEN = process.env.PAGSEGURO_TOKEN || '';
const PAGSEGURO_EMAIL = process.env.PAGSEGURO_EMAIL || '';

export interface CreatePagSeguroTransactionParams {
  planId: string;
  userEmail: string;
  userName: string;
}

export const createPagSeguroTransaction = async (params: CreatePagSeguroTransactionParams) => {
  const { planId, userEmail, userName } = params;

  // Create order
  const orderRepo = AppDataSource.getRepository(Order);
  const order = orderRepo.create({
    user_email: userEmail,
    user_name: userName,
    plan: planId,
    provider: 'pagseguro',
    status: 'pending',
  });
  await orderRepo.save(order);

  // Plan pricing
  const planPrices: Record<string, string> = {
    essencial: '247.00',
    profissional: '580.00',
    empresarial: '1247.00',
    enterprise: '2997.00',
  };

  const amount = planPrices[planId] || '0.00';

  try {
    // Create checkout session XML
    const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<checkout>
  <currency>BRL</currency>
  <items>
    <item>
      <id>${planId}</id>
      <description>Plano ${planId.charAt(0).toUpperCase() + planId.slice(1)} - Nexus Atemporal</description>
      <amount>${amount}</amount>
      <quantity>1</quantity>
    </item>
  </items>
  <reference>${order.id}</reference>
  <sender>
    <name>${userName}</name>
    <email>${userEmail}</email>
  </sender>
  <redirectURL>https://nexusatemporal.com/checkout/success</redirectURL>
</checkout>`;

    const response = await axios.post(
      `${PAGSEGURO_API_URL}/checkout?email=${PAGSEGURO_EMAIL}&token=${PAGSEGURO_TOKEN}`,
      xmlData,
      {
        headers: {
          'Content-Type': 'application/xml; charset=UTF-8',
        },
      }
    );

    // Parse XML response
    const codeMatch = response.data.match(/<code>(.*?)<\/code>/);
    const checkoutCode = codeMatch ? codeMatch[1] : null;

    if (!checkoutCode) {
      throw new Error('Failed to get checkout code from PagSeguro');
    }

    order.external_id = checkoutCode;
    order.amount = Math.round(parseFloat(amount) * 100);
    await orderRepo.save(order);

    return {
      checkoutCode,
      checkoutUrl: `https://pagseguro.uol.com.br/v2/checkout/payment.html?code=${checkoutCode}`,
    };
  } catch (error: any) {
    console.error('PagSeguro error:', error.response?.data || error.message);
    throw new Error('Failed to create PagSeguro transaction');
  }
};

export const handlePagSeguroWebhook = async (notificationCode: string) => {
  try {
    // Get notification details
    const response = await axios.get(
      `${PAGSEGURO_API_URL}/transactions/notifications/${notificationCode}?email=${PAGSEGURO_EMAIL}&token=${PAGSEGURO_TOKEN}`
    );

    const xml = response.data;

    // Parse XML (simplified - in production use a proper XML parser)
    const statusMatch = xml.match(/<status>(.*?)<\/status>/);
    const referenceMatch = xml.match(/<reference>(.*?)<\/reference>/);

    const status = statusMatch ? parseInt(statusMatch[1]) : 0;
    const orderId = referenceMatch ? referenceMatch[1] : null;

    // Status 3 = Paid, 4 = Available
    if ((status === 3 || status === 4) && orderId) {
      const orderRepo = AppDataSource.getRepository(Order);
      const order = await orderRepo.findOne({ where: { id: orderId } });

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
          provider: 'pagseguro',
        });

        await sendWelcomeEmail(order.user_email, order.user_name || '', order.plan || '');
      }
    }

    return { received: true };
  } catch (error: any) {
    console.error('PagSeguro webhook error:', error.response?.data || error.message);
    throw new Error('Failed to process PagSeguro webhook');
  }
};
