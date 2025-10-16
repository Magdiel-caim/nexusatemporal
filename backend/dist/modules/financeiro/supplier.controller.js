"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierController = void 0;
const supplier_service_1 = require("./supplier.service");
class SupplierController {
    supplierService = new supplier_service_1.SupplierService();
    createSupplier = async (req, res) => {
        try {
            const { tenantId } = req.user;
            const supplier = await this.supplierService.createSupplier({
                ...req.body,
                tenantId,
            });
            res.status(201).json(supplier);
        }
        catch (error) {
            console.error('Error creating supplier:', error);
            res.status(400).json({ error: error.message });
        }
    };
    getSuppliers = async (req, res) => {
        try {
            const { tenantId } = req.user;
            const filters = {
                search: req.query.search,
                isActive: req.query.isActive !== undefined
                    ? req.query.isActive === 'true'
                    : undefined,
                city: req.query.city,
                state: req.query.state,
            };
            const suppliers = await this.supplierService.getSuppliersByTenant(tenantId, filters);
            res.json(suppliers);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getSupplier = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const supplier = await this.supplierService.getSupplierById(id, tenantId);
            if (!supplier) {
                return res.status(404).json({ error: 'Fornecedor não encontrado' });
            }
            res.json(supplier);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    updateSupplier = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const supplier = await this.supplierService.updateSupplier(id, tenantId, req.body);
            res.json(supplier);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    deleteSupplier = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const result = await this.supplierService.deleteSupplier(id, tenantId);
            res.json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    activateSupplier = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const supplier = await this.supplierService.activateSupplier(id, tenantId);
            res.json(supplier);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    deactivateSupplier = async (req, res) => {
        try {
            const { id } = req.params;
            const { tenantId } = req.user;
            const supplier = await this.supplierService.deactivateSupplier(id, tenantId);
            res.json(supplier);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
    getSupplierStats = async (req, res) => {
        try {
            const { tenantId } = req.user;
            const stats = await this.supplierService.getSupplierStats(tenantId);
            res.json(stats);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}
exports.SupplierController = SupplierController;
//# sourceMappingURL=supplier.controller.js.map