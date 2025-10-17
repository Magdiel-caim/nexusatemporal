/**
 * Entity: Payment Webhook
 *
 * Stores webhook notifications received from payment gateways
 */

export interface PaymentWebhook {
  id: string;
  tenantId: string;
  gateway: 'asaas' | 'pagbank';

  // Webhook details
  event: string; // Event type (PAYMENT_RECEIVED, PAYMENT_CONFIRMED, etc)
  gatewayChargeId?: string;
  gatewayCustomerId?: string;

  // Processing
  status: 'pending' | 'processing' | 'processed' | 'failed' | 'ignored';
  processedAt?: Date;
  errorMessage?: string;
  retryCount: number;

  // Payload
  payload: any; // Full webhook payload
  headers?: any; // Request headers for signature validation

  // Validation
  signatureValid?: boolean;
  ipAddress?: string;

  createdAt: Date;
  updatedAt: Date;
}

export enum WebhookStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  FAILED = 'failed',
  IGNORED = 'ignored'
}

// Asaas webhook events
export enum AsaasWebhookEvent {
  PAYMENT_CREATED = 'PAYMENT_CREATED',
  PAYMENT_UPDATED = 'PAYMENT_UPDATED',
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_OVERDUE = 'PAYMENT_OVERDUE',
  PAYMENT_DELETED = 'PAYMENT_DELETED',
  PAYMENT_RESTORED = 'PAYMENT_RESTORED',
  PAYMENT_REFUNDED = 'PAYMENT_REFUNDED',
  PAYMENT_RECEIVED_IN_CASH_UNDONE = 'PAYMENT_RECEIVED_IN_CASH_UNDONE',
  PAYMENT_CHARGEBACK_REQUESTED = 'PAYMENT_CHARGEBACK_REQUESTED',
  PAYMENT_CHARGEBACK_DISPUTE = 'PAYMENT_CHARGEBACK_DISPUTE',
  PAYMENT_AWAITING_CHARGEBACK_REVERSAL = 'PAYMENT_AWAITING_CHARGEBACK_REVERSAL',
  PAYMENT_DUNNING_RECEIVED = 'PAYMENT_DUNNING_RECEIVED',
  PAYMENT_DUNNING_REQUESTED = 'PAYMENT_DUNNING_REQUESTED',
  PAYMENT_BANK_SLIP_VIEWED = 'PAYMENT_BANK_SLIP_VIEWED',
  PAYMENT_CHECKOUT_VIEWED = 'PAYMENT_CHECKOUT_VIEWED'
}
