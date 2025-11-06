import axios from 'axios';

export interface N8nWebhookPayload {
  orderId: string;
  email: string;
  plan: string;
  amount: number;
  provider: string;
}

export const sendN8nWebhook = async (payload: N8nWebhookPayload) => {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const webhookToken = process.env.N8N_WEBHOOK_TOKEN;

  if (!webhookUrl) {
    console.warn('N8N_WEBHOOK_URL not configured, skipping webhook');
    return;
  }

  try {
    await axios.post(
      webhookUrl,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': webhookToken ? `Bearer ${webhookToken}` : undefined,
        },
        timeout: 10000,
      }
    );

    console.log('n8n webhook sent successfully:', payload.orderId);
  } catch (error: any) {
    console.error('n8n webhook error:', error.response?.data || error.message);
    // Don't throw - webhook failure shouldn't block the flow
  }
};
