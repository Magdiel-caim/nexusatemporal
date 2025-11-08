"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const transaction_service_1 = require("./transaction.service");
class TransactionController {
    transactionService = new transaction_service_1.TransactionService();
    createTransaction = async (req, res) => {
        try {
            const { tenantId, userId } = req.user;
            const transaction = await this.transactionService.createTransaction({
                ...req.body,
                tenantId,
                createdById: userId,
            });
            res.status(201).json(transaction);
        }
        catch (error) {
            console.error('Error creating transaction:', error);
            res.status(400).json({ error: error.message });
        }
    };
    getTransactions = async (req, res) => {
        try {
            const { tenantId } = req.user;
            const filters = {
                type: req.query.type,
                category: req.query.category,
                status: req.query.status,
                paymentMethod: req.query.paymentMethod,
                leadId: req.query.leadId,
                appointmentId: req.query.appointmentId,
                supplierId: req.query.supplierId,
                dateFrom: req.query.dateFrom,
                dateTo: req.query.dateTo,
                dueDateFrom: req.query.dueDateFrom,
                dueDateTo: req.query.dueDateTo,
                search: req.query.search,
                minAmount: req.query.minAmount ? parseFloat(req.query.minAmount) : undefined,
                maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount) : undefined,
            };
            const transactions = await this.transactionService.getTransactionsByTenant(tenantId, filters);
            res.json(transactions);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getTransaction = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const transaction = await this.transactionService.getTransactionById(id, tenantId);
            if (!transaction) {
                return res.status(404).json({ error: 'Transação não encontrada' });
            }
            res.json(transaction);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    updateTransaction = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId, userId } = req.user;
            const transaction = await this.transactionService.updateTransaction(id, tenantId, req.body, userId);
            res.json(transaction);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    confirmTransaction = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId, userId } = req.user;
            console.log('[DEBUG] confirmTransaction - id:', id);
            console.log('[DEBUG] confirmTransaction - tenantId:', tenantId);
            console.log('[DEBUG] confirmTransaction - userId:', userId);
            console.log('[DEBUG] confirmTransaction - req.body:', req.body);
            const transaction = await this.transactionService.confirmTransaction(id, tenantId, {
                ...req.body,
                approvedById: userId,
            });
            res.json(transaction);
        }
        catch (error) {
            console.error('[ERROR] confirmTransaction failed:', error.message);
            console.error('[ERROR] Stack:', error.stack);
            res.status(400).json({ error: error.message });
        }
    };
    cancelTransaction = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId, userId } = req.user;
            const { reason } = req.body;
            const transaction = await this.transactionService.cancelTransaction(id, tenantId, userId, reason);
            res.json(transaction);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    reverseTransaction = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId, userId } = req.user;
            const { reason } = req.body;
            const transaction = await this.transactionService.reverseTransaction(id, tenantId, userId, reason);
            res.json(transaction);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    deleteTransaction = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            await this.transactionService.deleteTransaction(id, tenantId);
            res.json({ success: true });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    createInstallmentTransactions = async (req, res) => {
        try {
            const { tenantId, userId } = req.user;
            const transactions = await this.transactionService.createInstallmentTransactions({
                ...req.body,
                tenantId,
                createdById: userId,
            });
            res.status(201).json(transactions);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    // Analytics
    getTransactionStats = async (req, res) => {
        try {
            const { tenantId } = req.user;
            // Helper to get today as YYYY-MM-DD string
            const getTodayString = () => {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            const dateFrom = req.query.dateFrom || getTodayString();
            const dateTo = req.query.dateTo || getTodayString();
            const stats = await this.transactionService.getTransactionStats(tenantId, dateFrom, dateTo);
            res.json(stats);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getAccountsReceivable = async (req, res) => {
        try {
            const { tenantId } = req.user;
            const dateLimit = req.query.dateLimit;
            const accounts = await this.transactionService.getAccountsReceivable(tenantId, dateLimit);
            res.json(accounts);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getAccountsPayable = async (req, res) => {
        try {
            const { tenantId } = req.user;
            const dateLimit = req.query.dateLimit;
            const accounts = await this.transactionService.getAccountsPayable(tenantId, dateLimit);
            res.json(accounts);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getOverdueTransactions = async (req, res) => {
        try {
            const { tenantId } = req.user;
            const overdue = await this.transactionService.getOverdueTransactions(tenantId);
            res.json(overdue);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getCashFlow = async (req, res) => {
        try {
            const { tenantId } = req.user;
            const month = parseInt(req.query.month) || new Date().getMonth() + 1;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const cashFlow = await this.transactionService.getCashFlow(tenantId, month, year);
            res.json(cashFlow);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}
exports.TransactionController = TransactionController;
//# sourceMappingURL=transaction.controller.js.map