/**
 * Entity: Payment Charge
 *
 * Represents a payment/charge created in a payment gateway
 */

export interface PaymentCharge {
  id: string;
  tenantId: string;
  gateway: 'asaas' | 'pagbank';

  // Gateway reference
  gatewayChargeId: string;
  gatewayCustomerId: string;

  // Local references
  leadId?: string;
  transactionId?: string; // Link to financial transaction

  // Charge details
  billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'UNDEFINED';
  value: number;
  dueDate: Date;
  description?: string;
  externalReference?: string;

  // Status
  status: 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED' | 'RECEIVED_IN_CASH' | 'REFUND_REQUESTED' | 'CHARGEBACK_REQUESTED' | 'CHARGEBACK_DISPUTE' | 'AWAITING_CHARGEBACK_REVERSAL' | 'DUNNING_REQUESTED' | 'DUNNING_RECEIVED' | 'AWAITING_RISK_ANALYSIS';

  // Payment info
  paymentDate?: Date;
  confirmedDate?: Date;
  creditDate?: Date;
  estimatedCreditDate?: Date;

  // Fees and discounts
  discount?: {
    value: number;
    dueDateLimitDays?: number;
    type: 'FIXED' | 'PERCENTAGE';
  };
  fine?: {
    value: number;
    type: 'FIXED' | 'PERCENTAGE';
  };
  interest?: {
    value: number;
    type: 'PERCENTAGE';
  };

  // Payment method specific data
  bankSlipUrl?: string; // Boleto URL
  invoiceUrl?: string;
  invoiceNumber?: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  creditCardToken?: string;

  // Refund info
  refundedValue?: number;
  refundedDate?: Date;
  refundReason?: string;

  // Metadata
  webhookReceived?: boolean;
  lastWebhookAt?: Date;
  rawResponse?: any; // Store full gateway response

  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date;
}

export enum BillingType {
  BOLETO = 'BOLETO',
  PIX = 'PIX',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  UNDEFINED = 'UNDEFINED'
}

export enum ChargeStatus {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  CONFIRMED = 'CONFIRMED',
  OVERDUE = 'OVERDUE',
  REFUNDED = 'REFUNDED',
  RECEIVED_IN_CASH = 'RECEIVED_IN_CASH',
  REFUND_REQUESTED = 'REFUND_REQUESTED',
  CHARGEBACK_REQUESTED = 'CHARGEBACK_REQUESTED',
  CHARGEBACK_DISPUTE = 'CHARGEBACK_DISPUTE',
  AWAITING_CHARGEBACK_REVERSAL = 'AWAITING_CHARGEBACK_REVERSAL',
  DUNNING_REQUESTED = 'DUNNING_REQUESTED',
  DUNNING_RECEIVED = 'DUNNING_RECEIVED',
  AWAITING_RISK_ANALYSIS = 'AWAITING_RISK_ANALYSIS'
}
