"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashFlowController = void 0;
const cash_flow_service_1 = require("./cash-flow.service");
class CashFlowController {
    cashFlowService = new cash_flow_service_1.CashFlowService();
    openCashFlow = async (req, res) => {
        try {
            const { tenantId, userId } = req.user;
            const cashFlow = await this.cashFlowService.openCashFlow({
                ...req.body,
                tenantId,
                openedById: userId,
            });
            res.status(201).json(cashFlow);
        }
        catch (error) {
            console.error('Error opening cash flow:', error);
            res.status(400).json({ error: error.message });
        }
    };
    closeCashFlow = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId, userId } = req.user;
            const cashFlow = await this.cashFlowService.closeCashFlow({
                ...req.body,
                id,
                tenantId,
                closedById: userId,
            });
            res.json(cashFlow);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getCashFlow = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const cashFlow = await this.cashFlowService.getCashFlowById(id, tenantId);
            if (!cashFlow) {
                return res.status(404).json({ error: 'Fluxo de caixa não encontrado' });
            }
            res.json(cashFlow);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getCashFlowByDate = async (req, res) => {
        try {
            const { date } = req.params;
            const { tenantId } = req.user;
            const cashFlow = await this.cashFlowService.getCashFlowByDate(new Date(date), tenantId);
            if (!cashFlow) {
                return res.status(404).json({ error: 'Fluxo de caixa não encontrado para esta data' });
            }
            res.json(cashFlow);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getCashFlows = async (req, res) => {
        try {
            const { tenantId } = req.user;
            const filters = {
                dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom) : undefined,
                dateTo: req.query.dateTo ? new Date(req.query.dateTo) : undefined,
                isClosed: req.query.isClosed !== undefined
                    ? req.query.isClosed === 'true'
                    : undefined,
            };
            const cashFlows = await this.cashFlowService.getCashFlowsByTenant(tenantId, filters);
            res.json(cashFlows);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    updateFromTransactions = async (req, res) => {
        try {
            const { date } = req.params;
            const { tenantId } = req.user;
            const cashFlow = await this.cashFlowService.updateCashFlowFromTransactions(new Date(date), tenantId);
            res.json(cashFlow);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    recordWithdrawal = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const { amount, notes } = req.body;
            const cashFlow = await this.cashFlowService.recordWithdrawal(id, tenantId, amount, notes);
            res.json(cashFlow);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    recordDeposit = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const { amount, notes } = req.body;
            const cashFlow = await this.cashFlowService.recordDeposit(id, tenantId, amount, notes);
            res.json(cashFlow);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getCashFlowSummary = async (req, res) => {
        try {
            const { tenantId } = req.user;
            const month = parseInt(req.query.month) || new Date().getMonth() + 1;
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const summary = await this.cashFlowService.getCashFlowSummary(tenantId, month, year);
            res.json(summary);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}
exports.CashFlowController = CashFlowController;
//# sourceMappingURL=cash-flow.controller.js.map