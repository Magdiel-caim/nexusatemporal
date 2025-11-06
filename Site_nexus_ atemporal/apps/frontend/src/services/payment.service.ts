import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://api.nexusatemporal.com';

export interface CreatePaymentIntentParams {
  planId: string;
  userEmail: string;
  userName?: string;
  countryCode?: string;
  cpfCnpj?: string;
}

export interface PaymentIntentResponse {
  provider: 'stripe' | 'asaas' | 'pagseguro';
  sessionId?: string;
  url?: string;
  checkoutUrl?: string;
  orderId?: string;
}

export interface ContactFormParams {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

/**
 * Creates a payment intent with automatic gateway selection
 * - Stripe: International payments
 * - Asaas: Brazil with CPF/CNPJ
 * - PagSeguro: Brazil fallback
 */
export const createPaymentIntent = async (
  params: CreatePaymentIntentParams
): Promise<PaymentIntentResponse> => {
  try {
    const response = await axios.post<PaymentIntentResponse>(
      `${API_BASE_URL}/api/payments/intent`,
      params,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Payment intent error:', error);
    throw new Error(
      error.response?.data?.error || 'Failed to create payment intent'
    );
  }
};

/**
 * Redirects user to checkout based on payment provider
 */
export const redirectToCheckout = (paymentResponse: PaymentIntentResponse) => {
  const checkoutUrl = paymentResponse.url || paymentResponse.checkoutUrl;

  if (!checkoutUrl) {
    throw new Error('No checkout URL provided');
  }

  // Redirect to checkout
  window.location.href = checkoutUrl;
};

/**
 * Complete payment flow: create intent and redirect
 */
export const initiateCheckout = async (params: CreatePaymentIntentParams) => {
  try {
    // Create payment intent
    const paymentResponse = await createPaymentIntent(params);

    // Redirect to checkout
    redirectToCheckout(paymentResponse);
  } catch (error: any) {
    console.error('Checkout error:', error);
    throw error;
  }
};

/**
 * Send contact form
 */
export const sendContactForm = async (
  params: ContactFormParams
): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/api/contact`, params, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Contact form error:', error);
    throw new Error(
      error.response?.data?.error || 'Failed to send contact form'
    );
  }
};

/**
 * Plan pricing (matches backend)
 */
export const PLAN_PRICES = {
  essencial: {
    monthly: 247,
    annual: 197, // ~20% discount
  },
  profissional: {
    monthly: 580,
    annual: 464,
  },
  empresarial: {
    monthly: 1247,
    annual: 997,
  },
  enterprise: {
    monthly: 2997,
    annual: 2397,
  },
};
