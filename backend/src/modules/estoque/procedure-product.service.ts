import { Repository, DataSource } from 'typeorm';
import { ProcedureProduct } from './procedure-product.entity';
import { StockMovementService } from './stock-movement.service';
import { ProductService } from './product.service';
import { MovementType, MovementReason } from './stock-movement.entity';

export class ProcedureProductService {
  private repository: Repository<ProcedureProduct>;
  private movementService: StockMovementService;
  private productService: ProductService;

  constructor() {
    const AppDataSource = require('../../shared/database/data-source').AppDataSource;
    this.repository = AppDataSource.getRepository(ProcedureProduct);
    this.movementService = new StockMovementService();
    this.productService = new ProductService();
  }

  /**
   * Adicionar produto a um procedimento
   */
  async addProductToProcedure(data: {
    procedureId: string;
    productId: string;
    quantityUsed: number;
    isOptional?: boolean;
    notes?: string;
    tenantId: string;
  }): Promise<ProcedureProduct> {
    const procedureProduct = this.repository.create(data);
    return await this.repository.save(procedureProduct);
  }

  /**
   * Listar produtos de um procedimento
   */
  async getProductsByProcedure(procedureId: string, tenantId: string): Promise<ProcedureProduct[]> {
    return await this.repository.find({
      where: {
        procedureId,
        tenantId,
      },
      relations: ['product'],
      order: {
        createdAt: 'ASC',
      },
    });
  }

  /**
   * Remover produto de um procedimento
   */
  async removeProductFromProcedure(id: string, tenantId: string): Promise<void> {
    const procedureProduct = await this.repository.findOne({
      where: { id, tenantId },
    });

    if (!procedureProduct) {
      throw new Error('Vínculo produto-procedimento não encontrado');
    }

    await this.repository.remove(procedureProduct);
  }

  /**
   * Validar se há estoque suficiente para todos os produtos do procedimento
   */
  async validateStockForProcedure(procedureId: string, tenantId: string): Promise<{
    valid: boolean;
    insufficientStock: Array<{ productId: string; productName: string; required: number; available: number }>;
  }> {
    const procedureProducts = await this.getProductsByProcedure(procedureId, tenantId);
    const insufficientStock: Array<{ productId: string; productName: string; required: number; available: number }> = [];

    for (const pp of procedureProducts) {
      if (!pp.isOptional && pp.product) {
        if (pp.product.currentStock < pp.quantityUsed) {
          insufficientStock.push({
            productId: pp.productId,
            productName: pp.product.name,
            required: Number(pp.quantityUsed),
            available: pp.product.currentStock,
          });
        }
      }
    }

    return {
      valid: insufficientStock.length === 0,
      insufficientStock,
    };
  }

  /**
   * Consumir estoque ao finalizar procedimento
   * Cria movimentações de saída para todos os produtos vinculados
   */
  async consumeStockForProcedure(
    procedureId: string,
    tenantId: string,
    userId?: string,
    medicalRecordId?: string
  ): Promise<{
    success: boolean;
    movements: any[];
    errors: string[];
  }> {
    const procedureProducts = await this.getProductsByProcedure(procedureId, tenantId);
    const movements: any[] = [];
    const errors: string[] = [];

    // Validar estoque primeiro
    const validation = await this.validateStockForProcedure(procedureId, tenantId);
    if (!validation.valid) {
      const insufficientItems = validation.insufficientStock
        .map((item) => `${item.productName}: necessário ${item.required}, disponível ${item.available}`)
        .join('; ');
      throw new Error(`Estoque insuficiente para: ${insufficientItems}`);
    }

    // Criar movimentações de saída para cada produto
    for (const pp of procedureProducts) {
      try {
        // Pular produtos opcionais se não houver estoque
        if (pp.isOptional && pp.product && pp.product.currentStock < pp.quantityUsed) {
          continue;
        }

        const movement = await this.movementService.createMovement({
          productId: pp.productId,
          type: MovementType.SAIDA,
          reason: MovementReason.PROCEDIMENTO,
          quantity: Number(pp.quantityUsed),
          procedureId: procedureId,
          medicalRecordId: medicalRecordId,
          notes: pp.notes || `Consumo automático - Procedimento ${procedureId}`,
          tenantId,
          userId,
        });

        movements.push(movement);
      } catch (error: any) {
        errors.push(`Erro ao dar baixa em ${pp.product?.name}: ${error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      movements,
      errors,
    };
  }

  /**
   * Atualizar quantidade de produto em um procedimento
   */
  async updateProductQuantity(
    id: string,
    tenantId: string,
    quantityUsed: number
  ): Promise<ProcedureProduct> {
    const procedureProduct = await this.repository.findOne({
      where: { id, tenantId },
    });

    if (!procedureProduct) {
      throw new Error('Vínculo produto-procedimento não encontrado');
    }

    procedureProduct.quantityUsed = quantityUsed;
    return await this.repository.save(procedureProduct);
  }
}
