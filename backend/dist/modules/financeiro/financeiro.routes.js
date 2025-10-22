"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = require("./transaction.controller");
const supplier_controller_1 = require("./supplier.controller");
const invoice_controller_1 = require("./invoice.controller");
const purchase_order_controller_1 = require("./purchase-order.controller");
const cash_flow_controller_1 = require("./cash-flow.controller");
const auth_middleware_1 = require("@/shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
const transactionController = new transaction_controller_1.TransactionController();
const supplierController = new supplier_controller_1.SupplierController();
const invoiceController = new invoice_controller_1.InvoiceController();
const purchaseOrderController = new purchase_order_controller_1.PurchaseOrderController();
const cashFlowController = new cash_flow_controller_1.CashFlowController();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// ==========================================
// TRANSACTION ROUTES
// ==========================================
router.post('/transactions', transactionController.createTransaction);
router.get('/transactions', transactionController.getTransactions);
router.get('/transactions/stats', transactionController.getTransactionStats);
router.get('/transactions/accounts-receivable', transactionController.getAccountsReceivable);
router.get('/transactions/accounts-payable', transactionController.getAccountsPayable);
router.get('/transactions/overdue', transactionController.getOverdueTransactions);
router.get('/transactions/cash-flow', transactionController.getCashFlow);
router.get('/transactions/:id', transactionController.getTransaction);
router.put('/transactions/:id', transactionController.updateTransaction);
router.delete('/transactions/:id', transactionController.deleteTransaction);
router.patch('/transactions/:id/confirm', transactionController.confirmTransaction);
router.patch('/transactions/:id/cancel', transactionController.cancelTransaction);
router.patch('/transactions/:id/reverse', transactionController.reverseTransaction);
router.post('/transactions/installments', transactionController.createInstallmentTransactions);
// ==========================================
// SUPPLIER ROUTES
// ==========================================
router.post('/suppliers', supplierController.createSupplier);
router.get('/suppliers', supplierController.getSuppliers);
router.get('/suppliers/stats', supplierController.getSupplierStats);
router.get('/suppliers/:id', supplierController.getSupplier);
router.put('/suppliers/:id', supplierController.updateSupplier);
router.delete('/suppliers/:id', supplierController.deleteSupplier);
router.patch('/suppliers/:id/activate', supplierController.activateSupplier);
router.patch('/suppliers/:id/deactivate', supplierController.deactivateSupplier);
// ==========================================
// INVOICE ROUTES
// ==========================================
router.post('/invoices', invoiceController.createInvoice);
router.get('/invoices', invoiceController.getInvoices);
router.get('/invoices/stats', invoiceController.getInvoiceStats);
router.get('/invoices/number/:number', invoiceController.getInvoiceByNumber);
router.get('/invoices/:id', invoiceController.getInvoice);
router.put('/invoices/:id', invoiceController.updateInvoice);
router.patch('/invoices/:id/cancel', invoiceController.cancelInvoice);
router.patch('/invoices/:id/send', invoiceController.markAsSent);
router.patch('/invoices/:id/attach-pdf', invoiceController.attachPdf);
// ==========================================
// PURCHASE ORDER ROUTES
// ==========================================
router.post('/purchase-orders', purchaseOrderController.createPurchaseOrder);
router.get('/purchase-orders', purchaseOrderController.getPurchaseOrders);
router.get('/purchase-orders/stats', purchaseOrderController.getPurchaseOrderStats);
router.get('/purchase-orders/:id', purchaseOrderController.getPurchaseOrder);
router.put('/purchase-orders/:id', purchaseOrderController.updatePurchaseOrder);
router.patch('/purchase-orders/:id/approve', purchaseOrderController.approvePurchaseOrder);
router.patch('/purchase-orders/:id/send', purchaseOrderController.markAsSent);
router.patch('/purchase-orders/:id/in-transit', purchaseOrderController.markAsInTransit);
router.patch('/purchase-orders/:id/receive', purchaseOrderController.receivePurchaseOrder);
router.patch('/purchase-orders/:id/cancel', purchaseOrderController.cancelPurchaseOrder);
router.post('/purchase-orders/:id/attachments', purchaseOrderController.addAttachment);
// ==========================================
// CASH FLOW ROUTES
// ==========================================
router.post('/cash-flow', cashFlowController.openCashFlow);
router.get('/cash-flow', cashFlowController.getCashFlows);
router.get('/cash-flow/summary', cashFlowController.getCashFlowSummary);
router.get('/cash-flow/date/:date', cashFlowController.getCashFlowByDate);
router.get('/cash-flow/:id', cashFlowController.getCashFlow);
router.patch('/cash-flow/:id/close', cashFlowController.closeCashFlow);
router.patch('/cash-flow/:id/update', cashFlowController.updateFromTransactions);
router.post('/cash-flow/:id/withdrawal', cashFlowController.recordWithdrawal);
router.post('/cash-flow/:id/deposit', cashFlowController.recordDeposit);
exports.default = router;
//# sourceMappingURL=financeiro.routes.js.map