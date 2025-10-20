/**
 * Service para integração entre Prontuários e Estoque
 * Responsável por dar baixa automática no estoque quando procedimentos são realizados
 */

import { Repository } from 'typeorm';
import { CrmDataSource } from '../../database/data-source';
import { ProcedureProduct } from '../estoque/procedure-product.entity';
import { StockMovementService } from '../estoque/stock-movement.service';

export class StockIntegrationService {
  private procedureProductRepo: Repository<ProcedureProduct>;
  private stockMovementService: StockMovementService;

  constructor() {
    this.procedureProductRepo = CrmDataSource.getRepository(ProcedureProduct);
    // StockMovementService será injetado quando necessário
  }

  /**
   * Dá baixa automática no estoque dos produtos utilizados em um procedimento
   * @param procedureId - ID do procedimento realizado
   * @param medicalRecordId - ID do prontuário
   * @param userId - ID do usuário que realizou o procedimento
   * @param tenantId - ID do tenant
   * @returns Array de movimentações criadas
   */
  async processStockExitForProcedure(
    procedureId: string,
    medicalRecordId: string,
    userId: string,
    tenantId: string
  ): Promise<{ success: boolean; movements: any[]; errors: any[] }> {
    const movements: any[] = [];
    const errors: any[] = [];

    try {
      // 1. Buscar produtos vinculados ao procedimento
      const procedureProducts = await this.procedureProductRepo.find({
        where: { procedureId, tenantId },
        relations: ['product'],
      });

      if (procedureProducts.length === 0) {
        console.log(`ℹ️ Procedimento ${procedureId} não possui produtos vinculados.`);
        return { success: true, movements: [], errors: [] };
      }

      // 2. Para cada produto, criar movimentação de saída
      for (const pp of procedureProducts) {
        try {
          // Verificar se o produto está ativo e rastreia estoque
          if (!pp.product.isActive) {
            console.warn(`⚠️ Produto ${pp.product.name} está inativo. Pulando...`);
            continue;
          }

          if (!pp.product.trackStock) {
            console.log(`ℹ️ Produto ${pp.product.name} não rastreia estoque. Pulando...`);
            continue;
          }

          // Verificar se é obrigatório ou opcional
          if (pp.isOptional) {
            console.log(`ℹ️ Produto ${pp.product.name} é opcional. Confirme se foi utilizado.`);
            // Em produção, você pode adicionar lógica para confirmar se foi usado
          }

          // Criar movimentação de saída via StockMovementService
          // Como não temos instância aqui, vamos criar um registro direto
          // Em produção, usar DI adequado
          const movement = await this.stockMovementService.createExitFromProcedure(
            pp.productId,
            pp.quantityUsed,
            medicalRecordId,
            procedureId,
            userId,
            tenantId
          );

          movements.push(movement);

          console.log(
            `✅ Baixa de ${pp.quantityUsed} ${pp.product.unit} de "${pp.product.name}" realizada com sucesso!`
          );
        } catch (error: any) {
          console.error(
            `❌ Erro ao dar baixa no produto ${pp.product.name}:`,
            error.message
          );
          errors.push({
            productId: pp.productId,
            productName: pp.product.name,
            error: error.message,
          });
        }
      }

      return {
        success: errors.length === 0,
        movements,
        errors,
      };
    } catch (error: any) {
      console.error('❌ Erro ao processar saída de estoque para procedimento:', error);
      return {
        success: false,
        movements: [],
        errors: [{ message: error.message }],
      };
    }
  }

  /**
   * Vincula produtos a um procedimento
   * @param procedureId - ID do procedimento
   * @param products - Array de { productId, quantityUsed, isOptional }
   * @param tenantId - ID do tenant
   */
  async linkProductsToProcedure(
    procedureId: string,
    products: Array<{ productId: string; quantityUsed: number; isOptional?: boolean; notes?: string }>,
    tenantId: string
  ): Promise<ProcedureProduct[]> {
    const procedureProducts: ProcedureProduct[] = [];

    for (const productData of products) {
      const pp = this.procedureProductRepo.create({
        procedureId,
        productId: productData.productId,
        quantityUsed: productData.quantityUsed,
        isOptional: productData.isOptional !== undefined ? productData.isOptional : true,
        notes: productData.notes,
        tenantId,
      });

      const saved = await this.procedureProductRepo.save(pp);
      procedureProducts.push(saved);
    }

    return procedureProducts;
  }

  /**
   * Busca produtos vinculados a um procedimento
   */
  async getProcedureProducts(procedureId: string, tenantId: string): Promise<ProcedureProduct[]> {
    return await this.procedureProductRepo.find({
      where: { procedureId, tenantId },
      relations: ['product'],
    });
  }

  /**
   * Remove vínculo de produto com procedimento
   */
  async unlinkProductFromProcedure(
    procedureId: string,
    productId: string,
    tenantId: string
  ): Promise<boolean> {
    const result = await this.procedureProductRepo.delete({
      procedureId,
      productId,
      tenantId,
    });

    return (result.affected ?? 0) > 0;
  }

  /**
   * Injeta o StockMovementService (para usar em runtime)
   */
  setStockMovementService(service: StockMovementService) {
    this.stockMovementService = service;
  }
}

export const stockIntegrationService = new StockIntegrationService();
