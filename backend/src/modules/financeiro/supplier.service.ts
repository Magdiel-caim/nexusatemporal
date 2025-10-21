import { CrmDataSource } from '@/database/data-source';
import { Supplier } from './supplier.entity';
import { Like } from 'typeorm';

export class SupplierService {
  private supplierRepository = CrmDataSource.getRepository(Supplier);

  async createSupplier(data: {
    name: string;
    cnpj?: string;
    cpf?: string;
    email?: string;
    phone?: string;
    phone2?: string;
    contactName?: string;
    address?: string;
    addressNumber?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    website?: string;
    notes?: string;
    bankInfo?: any;
    tenantId: string;
  }) {
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

  async getSuppliersByTenant(
    tenantId: string,
    filters?: {
      search?: string;
      isActive?: boolean;
      city?: string;
      state?: string;
    }
  ) {
    const where: any = { tenantId };

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
        .andWhere(
          '(supplier.name ILIKE :search OR supplier.cnpj ILIKE :search OR supplier.email ILIKE :search)',
          { search: `%${filters.search}%` }
        )
        .orderBy('supplier.name', 'ASC')
        .getMany();
    }

    return this.supplierRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async getSupplierById(id: string, tenantId: string) {
    return this.supplierRepository.findOne({
      where: { id, tenantId },
    });
  }

  async updateSupplier(
    id: string,
    tenantId: string,
    data: Partial<Supplier>
  ) {
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

  async deleteSupplier(id: string, tenantId: string) {
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
      await this.supplierRepository.update(
        { id, tenantId },
        { isActive: false }
      );
      return {
        success: true,
        message:
          'Fornecedor desativado (não pode ser excluído pois possui transações vinculadas)',
      };
    }

    // Hard delete se não tiver transações
    await this.supplierRepository.delete({ id, tenantId });
    return { success: true, message: 'Fornecedor excluído com sucesso' };
  }

  async activateSupplier(id: string, tenantId: string) {
    await this.supplierRepository.update(
      { id, tenantId },
      { isActive: true }
    );
    return this.getSupplierById(id, tenantId);
  }

  async deactivateSupplier(id: string, tenantId: string) {
    await this.supplierRepository.update(
      { id, tenantId },
      { isActive: false }
    );
    return this.getSupplierById(id, tenantId);
  }

  async getSupplierStats(tenantId: string) {
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
    }, {} as Record<string, number>);

    return {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      byState,
    };
  }
}
