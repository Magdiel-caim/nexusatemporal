/**
 * Payment Gateway Controller
 *
 * Handles HTTP requests for payment gateway operations
 */

import { Request, Response } from 'express';
import { Pool } from 'pg';
import { PaymentGatewayService } from './payment-gateway.service';

export class PaymentGatewayController {
  private service: PaymentGatewayService;

  constructor(pool: Pool) {
    this.service = new PaymentGatewayService(pool);
  }

  // ==========================================
  // CONFIGURATION ENDPOINTS
  // ==========================================

  /**
   * Save payment gateway configuration
   * POST /api/payment-gateway/config
   */
  saveConfig = async (req: Request, res: Response) => {
    try {
      const tenantId = req.user?.tenantId || 'default';
      const userId = req.user?.userId || '';

      const { gateway, environment, apiKey, apiSecret, webhookSecret, isActive, config } = req.body;

      if (!gateway || !environment || !apiKey) {
        return res.status(400).json({
          error: 'Missing required fields: gateway, environment, apiKey',
        });
      }

      const result = await this.service.saveConfig(tenantId, userId, {
        gateway,
        environment,
        apiKey,
        apiSecret,
        webhookSecret,
        isActive: isActive !== undefined ? isActive : true,
        config: config || {},
      });

      // Don't return the full API key
      result.apiKey = '****' + result.apiKey.slice(-4);
      if (result.apiSecret) {
        result.apiSecret = '****';
      }

      res.json(result);
    } catch (error: any) {
      console.error('Error saving payment config:', error);
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get payment gateway configuration
   * GET /api/payment-gateway/config/:gateway/:environment
   */
  getConfig = async (req: Request, res: Response) => {
    try {
      const tenantId = req.user?.tenantId || 'default';
      const { gateway, environment } = req.params;

      const config = await this.service.getConfig(tenantId, gateway as any, environment as any);

      if (!config) {
        return res.status(404).json({ error: 'Configuration not found' });
      }

      // Mask sensitive data
      config.apiKey = '****' + config.apiKey.slice(-4);
      if (config.apiSecret) {
        config.apiSecret = '****';
      }

      res.json(config);
    } catch (error: any) {
      console.error('Error getting payment config:', error);
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * List all configurations
   * GET /api/payment-gateway/config
   */
  listConfigs = async (req: Request, res: Response) => {
    try {
      const tenantId = req.user?.tenantId || 'default';

      const configs = await this.service.listConfigs(tenantId);

      res.json(configs);
    } catch (error: any) {
      console.error('Error listing payment configs:', error);
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Delete configuration
   * DELETE /api/payment-gateway/config/:gateway/:environment
   */
  deleteConfig = async (req: Request, res: Response) => {
    try {
      const tenantId = req.user?.tenantId || 'default';
      const { gateway, environment } = req.params;

      await this.service.deleteConfig(tenantId, gateway as any, environment as any);

      res.json({ message: 'Configuration deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting payment config:', error);
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Test connection with gateway
   * POST /api/payment-gateway/test/:gateway
   */
  testConnection = async (req: Request, res: Response) => {
    try {
      const tenantId = req.user?.tenantId || 'default';
      const { gateway } = req.params;

      if (gateway === 'asaas') {
        const asaasService = await this.service.getAsaasService(tenantId);
        const balance = await asaasService.getBalance();

        res.json({
          success: true,
          message: 'Connection successful',
          balance: balance,
        });
      } else {
        res.status(400).json({ error: 'Gateway not supported yet' });
      }
    } catch (error: any) {
      console.error('Error testing connection:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  // ==========================================
  // CUSTOMER ENDPOINTS
  // ==========================================

  /**
   * Create or sync customer
   * POST /api/payment-gateway/customers
   */
  syncCustomer = async (req: Request, res: Response) => {
    try {
      const tenantId = req.user?.tenantId || 'default';
      const { gateway, ...customerData } = req.body;

      if (!gateway) {
        return res.status(400).json({ error: 'Gateway is required' });
      }

      const customer = await this.service.syncCustomer(tenantId, gateway, customerData);

      res.json(customer);
    } catch (error: any) {
      console.error('Error syncing customer:', error);
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get customer by lead ID
   * GET /api/payment-gateway/customers/lead/:leadId
   */
  getCustomerByLeadId = async (req: Request, res: Response) => {
    try {
      const tenantId = req.user?.tenantId || 'default';
      const { leadId } = req.params;
      const { gateway } = req.query;

      if (!gateway) {
        return res.status(400).json({ error: 'Gateway query parameter is required' });
      }

      const customer = await this.service.getCustomerByLeadId(tenantId, gateway as any, leadId);

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.json(customer);
    } catch (error: any) {
      console.error('Error getting customer:', error);
      res.status(500).json({ error: error.message });
    }
  };

  // ==========================================
  // PAYMENT/CHARGE ENDPOINTS (Asaas)
  // ==========================================

  /**
   * Create payment/charge
   * POST /api/payment-gateway/charges
   */
  createCharge = async (req: Request, res: Response) => {
    try {
      const tenantId = req.user?.tenantId || 'default';
      const { gateway, customer, billingType, value, dueDate, description, externalReference, discount, fine, interest } =
        req.body;

      if (!gateway || !customer || !billingType || !value || !dueDate) {
        return res.status(400).json({
          error: 'Missing required fields: gateway, customer, billingType, value, dueDate',
        });
      }

      if (gateway === 'asaas') {
        const asaasService = await this.service.getAsaasService(tenantId);

        const charge = await asaasService.createPayment({
          customer,
          billingType,
          value,
          dueDate,
          description,
          externalReference,
          discount,
          fine,
          interest,
        });

        res.json(charge);
      } else {
        res.status(400).json({ error: 'Gateway not supported yet' });
      }
    } catch (error: any) {
      console.error('Error creating charge:', error);
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get payment/charge
   * GET /api/payment-gateway/charges/:gateway/:chargeId
   */
  getCharge = async (req: Request, res: Response) => {
    try {
      const tenantId = req.user?.tenantId || 'default';
      const { gateway, chargeId } = req.params;

      if (gateway === 'asaas') {
        const asaasService = await this.service.getAsaasService(tenantId);
        const charge = await asaasService.getPayment(chargeId);

        res.json(charge);
      } else {
        res.status(400).json({ error: 'Gateway not supported yet' });
      }
    } catch (error: any) {
      console.error('Error getting charge:', error);
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * List payments/charges
   * GET /api/payment-gateway/charges/:gateway
   */
  listCharges = async (req: Request, res: Response) => {
    try {
      const tenantId = req.user?.tenantId || 'default';
      const { gateway } = req.params;

      if (gateway === 'asaas') {
        const asaasService = await this.service.getAsaasService(tenantId);
        const charges = await asaasService.listPayments(req.query as any);

        res.json(charges);
      } else {
        res.status(400).json({ error: 'Gateway not supported yet' });
      }
    } catch (error: any) {
      console.error('Error listing charges:', error);
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get PIX QR Code
   * GET /api/payment-gateway/charges/:gateway/:chargeId/pix
   */
  getPixQrCode = async (req: Request, res: Response) => {
    try {
      const tenantId = req.user?.tenantId || 'default';
      const { gateway, chargeId } = req.params;

      if (gateway === 'asaas') {
        const asaasService = await this.service.getAsaasService(tenantId);
        const pixData = await asaasService.getPixQrCode(chargeId);

        res.json(pixData);
      } else {
        res.status(400).json({ error: 'Gateway not supported yet' });
      }
    } catch (error: any) {
      console.error('Error getting PIX QR Code:', error);
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Refund payment
   * POST /api/payment-gateway/charges/:gateway/:chargeId/refund
   */
  refundCharge = async (req: Request, res: Response) => {
    try {
      const tenantId = req.user?.tenantId || 'default';
      const { gateway, chargeId } = req.params;
      const { value, description } = req.body;

      if (gateway === 'asaas') {
        const asaasService = await this.service.getAsaasService(tenantId);
        const refund = await asaasService.refundPayment(chargeId, { value, description });

        res.json(refund);
      } else {
        res.status(400).json({ error: 'Gateway not supported yet' });
      }
    } catch (error: any) {
      console.error('Error refunding charge:', error);
      res.status(500).json({ error: error.message });
    }
  };
}

export default PaymentGatewayController;
