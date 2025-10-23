"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierService = void 0;
const data_source_1 = require("../../database/data-source");
const supplier_entity_1 = require("./supplier.entity");
class SupplierService {
    supplierRepository = data_source_1.CrmDataSource.getRepository(supplier_entity_1.Supplier);
    async createSupplier(data) {
        // Validar CNPJ único se fornecido
        if (data.cnpj) {
            const existing = await this.supplierRepository.findOne({
                where: { cnpj: data.cnpj, tenantId: data.tenantId },
            });
            if (existing) {
                throw new Error('Já existe um fornecedor cadastrado com este CNPJ');
            }
        }
        const supplier = this.supplierRepository.create(data);
        const savedSupplier = await this.supplierRepository.save(supplier);
        return this.getSupplierById(savedSupplier.id, data.tenantId);
    }
    async getSuppliersByTenant(tenantId, filters) {
        const where = { tenantId };
        if (filters?.isActive !== undefined) {
            where.isActive = filters.isActive;
        }
        if (filters?.city) {
            where.city = filters.city;
        }
        if (filters?.state) {
            where.state = filters.state;
        }
        if (filters?.search) {
            return this.supplierRepository
                .createQueryBuilder('supplier')
                .where('supplier.tenantId = :tenantId', { tenantId })
                .andWhere('(supplier.name ILIKE :search OR supplier.cnpj ILIKE :search OR supplier.email ILIKE :search)', { search: `%${filters.search}%` })
                .orderBy('supplier.name', 'ASC')
                .getMany();
        }
        return this.supplierRepository.find({
            where,
            order: { name: 'ASC' },
        });
    }
    async getSupplierById(id, tenantId) {
        return this.supplierRepository.findOne({
            where: { id, tenantId },
        });
    }
    async updateSupplier(id, tenantId, data) {
        const supplier = await this.supplierRepository.findOne({
            where: { id, tenantId },
        });
        if (!supplier) {
            throw new Error('Fornecedor não encontrado');
        }
        // Validar CNPJ único se estiver sendo alterado
        if (data.cnpj && data.cnpj !== supplier.cnpj) {
            const existing = await this.supplierRepository.findOne({
                where: { cnpj: data.cnpj, tenantId },
            });
            if (existing && existing.id !== id) {
                throw new Error('Já existe um fornecedor cadastrado com este CNPJ');
            }
        }
        await this.supplierRepository.update({ id, tenantId }, data);
        return this.getSupplierById(id, tenantId);
    }
    async deleteSupplier(id, tenantId) {
        const supplier = await this.supplierRepository.findOne({
            where: { id, tenantId },
            relations: ['transactions'],
        });
        if (!supplier) {
            throw new Error('Fornecedor não encontrado');
        }
        // Verificar se tem transações vinculadas
        if (supplier.transactions && supplier.transactions.length > 0) {
            // Soft delete - apenas desativar
            await this.supplierRepository.update({ id, tenantId }, { isActive: false });
            return {
                success: true,
                message: 'Fornecedor desativado (não pode ser excluído pois possui transações vinculadas)',
            };
        }
        // Hard delete se não tiver transações
        await this.supplierRepository.delete({ id, tenantId });
        return { success: true, message: 'Fornecedor excluído com sucesso' };
    }
    async activateSupplier(id, tenantId) {
        await this.supplierRepository.update({ id, tenantId }, { isActive: true });
        return this.getSupplierById(id, tenantId);
    }
    async deactivateSupplier(id, tenantId) {
        await this.supplierRepository.update({ id, tenantId }, { isActive: false });
        return this.getSupplierById(id, tenantId);
    }
    async getSupplierStats(tenantId) {
        const suppliers = await this.supplierRepository.find({
            where: { tenantId },
        });
        const totalSuppliers = suppliers.length;
        const activeSuppliers = suppliers.filter((s) => s.isActive).length;
        const inactiveSuppliers = suppliers.filter((s) => !s.isActive).length;
        const byState = suppliers.reduce((acc, supplier) => {
            if (supplier.state) {
                acc[supplier.state] = (acc[supplier.state] || 0) + 1;
            }
            return acc;
        }, {});
        return {
            totalSuppliers,
            activeSuppliers,
            inactiveSuppliers,
            byState,
        };
    }
}
exports.SupplierService = SupplierService;
//# sourceMappingURL=supplier.service.js.map