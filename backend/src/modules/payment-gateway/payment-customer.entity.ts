/**
 * Entity: Payment Gateway Customer
 *
 * Maps local customers/leads to payment gateway customer IDs
 */

export interface PaymentCustomer {
  id: string;
  tenantId: string;
  gateway: 'asaas' | 'pagbank';

  // Local customer reference
  leadId?: string;

  // Customer data
  name: string;
  email?: string;
  cpfCnpj?: string;
  phone?: string;
  mobilePhone?: string;

  // Address
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string; // Bairro
  postalCode?: string;
  city?: string;
  state?: string;

  // Gateway customer ID
  gatewayCustomerId: string;

  // Additional info
  externalReference?: string;
  observations?: string;

  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date;
}
