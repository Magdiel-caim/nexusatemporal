/**
 * Entity: Payment Gateway Configuration
 *
 * Stores API credentials and settings for payment gateways (Asaas, PagBank)
 * Credentials are encrypted at rest for security
 */

export interface PaymentConfig {
  id: string;
  tenantId: string;
  gateway: 'asaas' | 'pagbank';
  environment: 'production' | 'sandbox';
  apiKey: string; // Encrypted
  apiSecret?: string; // Encrypted (for gateways that require it)
  webhookSecret?: string; // For validating webhook signatures
  isActive: boolean;
  config: {
    // Gateway-specific configuration
    enableBoleto?: boolean;
    enablePix?: boolean;
    enableCreditCard?: boolean;
    enableDebit?: boolean;
    defaultDueDays?: number;
    defaultFine?: number; // Percentage
    defaultInterest?: number; // Percentage per month
    splitConfig?: {
      enabled: boolean;
      defaultRecipient?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}

export enum PaymentGateway {
  ASAAS = 'asaas',
  PAGBANK = 'pagbank'
}

export enum PaymentEnvironment {
  PRODUCTION = 'production',
  SANDBOX = 'sandbox'
}
