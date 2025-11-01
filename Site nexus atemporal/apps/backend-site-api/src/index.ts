import 'reflect-metadata';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { createStripeSession, handleStripeWebhook } from './modules/payments/stripe';
import { createAsaasCharge, handleAsaasWebhook } from './modules/payments/asaas';
import { createPagSeguroTransaction, handlePagSeguroWebhook } from './modules/payments/pagseguro';
import { sendContactEmail } from './modules/email/email.service';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy (behind Traefik)
app.set('trust proxy', true);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Raw body for Stripe webhooks
app.use('/api/payments/webhook/stripe', express.raw({ type: 'application/json' }));

// JSON body parser for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========================================
// PAYMENT INTENT ENDPOINT
// ========================================
app.post('/api/payments/intent', async (req: Request, res: Response) => {
  try {
    const { planId, countryCode, cpfCnpj, userEmail, userName } = req.body;

    if (!planId || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Gateway selection logic
    let provider: string;
    let result: any;

    // 1. Stripe for international
    if (countryCode && countryCode !== 'BR') {
      provider = 'stripe';
      result = await createStripeSession({
        planId,
        userEmail,
        userName,
        successUrl: 'https://nexusatemporal.com/checkout/success',
        cancelUrl: 'https://nexusatemporal.com/checkout/cancel',
      });
    }
    // 2. Asaas for Brazil with CPF/CNPJ
    else if (cpfCnpj && countryCode === 'BR') {
      provider = 'asaas';
      result = await createAsaasCharge({
        planId,
        userEmail,
        userName: userName || '',
        cpfCnpj,
      });
    }
    // 3. PagSeguro as fallback for Brazil
    else {
      provider = 'pagseguro';
      result = await createPagSeguroTransaction({
        planId,
        userEmail,
        userName: userName || '',
      });
    }

    res.json({
      provider,
      ...result,
    });
  } catch (error: any) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment intent' });
  }
});

// ========================================
// UNIFIED WEBHOOK ENDPOINT
// ========================================

// Stripe webhook
app.post('/api/payments/webhook/stripe', async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  try {
    await handleStripeWebhook(req.body, signature);
    res.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Asaas webhook
app.post('/api/payments/webhook/asaas', async (req: Request, res: Response) => {
  const token = req.headers['asaas-access-token'] as string;

  try {
    await handleAsaasWebhook(req.body, token);
    res.json({ received: true });
  } catch (error: any) {
    console.error('Asaas webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// PagSeguro webhook
app.post('/api/payments/webhook/pagseguro', async (req: Request, res: Response) => {
  const { notificationCode } = req.body;

  try {
    if (!notificationCode) {
      return res.status(400).json({ error: 'Missing notificationCode' });
    }

    await handlePagSeguroWebhook(notificationCode);
    res.json({ received: true });
  } catch (error: any) {
    console.error('PagSeguro webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// ========================================
// CONTACT FORM ENDPOINT
// ========================================
app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await sendContactEmail({ name, email, phone, message });

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ========================================
// DATABASE & SERVER STARTUP
// ========================================
const startServer = async () => {
  try {
    // Initialize database
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Run migrations if needed
    if (process.env.NODE_ENV === 'production') {
      await AppDataSource.runMigrations();
      console.log('✅ Migrations executed');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || '*'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
