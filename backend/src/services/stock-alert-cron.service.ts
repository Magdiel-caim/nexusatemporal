import { CronJob } from 'cron';
import { StockAlertService } from '../modules/estoque/stock-alert.service';
import { EmailService } from '../shared/services/email.service';
import { CrmDataSource } from '../database/data-source';
import { logger } from '../shared/utils/logger';
import { User } from '../modules/auth/user.entity';
import { Repository } from 'typeorm';

/**
 * Stock Alert Cron Service
 * Executa verificações diárias de estoque e envia notificações
 *
 * Schedule: Todos os dias às 08:00 (horário do servidor)
 * - Verifica produtos com estoque abaixo do mínimo
 * - Verifica produtos com validade próxima (< 30 dias)
 * - Envia emails para responsáveis (owners e managers)
 */
export class StockAlertCronService {
  private cronJob: CronJob;
  private stockAlertService: StockAlertService;
  private emailService: EmailService;
  private userRepository: Repository<User>;
  private isRunning: boolean = false;

  constructor() {
    this.stockAlertService = new StockAlertService();
    this.emailService = new EmailService();
    this.userRepository = CrmDataSource.getRepository(User);

    // Schedule: Todos os dias às 08:00 (timezone: America/Sao_Paulo)
    // Cron format: second minute hour day month weekday
    this.cronJob = new CronJob(
      '0 0 8 * * *', // 08:00 todos os dias
      () => this.execute(),
      null, // onComplete
      false, // start immediately
      'America/Sao_Paulo' // timezone
    );

    logger.info('📅 Stock Alert Cron Service initialized (scheduled for 08:00 daily)');
  }

  /**
   * Inicia o cron job
   */
  start(): void {
    if (!this.cronJob.running) {
      this.cronJob.start();
      logger.info('✅ Stock Alert Cron Service started');
    }
  }

  /**
   * Para o cron job
   */
  stop(): void {
    if (this.cronJob.running) {
      this.cronJob.stop();
      logger.info('⏹️  Stock Alert Cron Service stopped');
    }
  }

  /**
   * Executa verificação manual (útil para testes)
   */
  async executeManually(): Promise<void> {
    logger.info('🔄 Manual stock alert check triggered');
    await this.execute();
  }

  /**
   * Execução principal do cron job
   */
  private async execute(): Promise<void> {
    if (this.isRunning) {
      logger.warn('⚠️  Stock alert check already running, skipping this execution');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info('🔍 Starting daily stock alert check...');

      // Executar verificação de estoque para todos os tenants
      await this.stockAlertService.checkLowStockDaily();

      // Enviar notificações por email
      await this.sendEmailNotifications();

      const duration = Date.now() - startTime;
      logger.info(`✅ Stock alert check completed in ${duration}ms`);
    } catch (error: any) {
      logger.error('❌ Error during stock alert check:', {
        error: error.message,
        stack: error.stack,
      });
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Envia notificações por email para responsáveis
   */
  private async sendEmailNotifications(): Promise<void> {
    try {
      // Buscar todos os tenants únicos com alertas ativos
      const tenants = await CrmDataSource.query(`
        SELECT DISTINCT sa."tenantId"
        FROM stock_alerts sa
        WHERE sa.status = 'active'
        AND sa."createdAt" >= NOW() - INTERVAL '24 hours'
      `);

      logger.info(`📧 Sending notifications to ${tenants.length} tenant(s)`);

      for (const tenant of tenants) {
        const tenantId = tenant.tenantId;

        try {
          // Buscar alertas ativos deste tenant criados nas últimas 24h
          const alerts = await this.stockAlertService.findAll({
            tenantId,
            status: 'active' as any,
            limit: 100,
          });

          if (alerts.data.length === 0) {
            continue;
          }

          // Buscar responsáveis (owners e managers) deste tenant
          const recipients = await this.userRepository.find({
            where: {
              tenantId,
              status: 'active' as any,
            },
            select: ['email', 'name', 'role'],
          });

          // Filtrar apenas owners e managers
          const filteredRecipients = recipients.filter(
            (user: any) => user.role === 'owner' || user.role === 'manager'
          );

          if (filteredRecipients.length === 0) {
            logger.warn(`⚠️  No recipients found for tenant ${tenantId}`);
            continue;
          }

          // Agrupar alertas por tipo
          const lowStockProducts: any[] = [];
          const outOfStockProducts: any[] = [];
          const expiringProducts: any[] = [];
          const expiredProducts: any[] = [];

          for (const alert of alerts.data) {
            const product = alert.product;
            if (!product) continue;

            const productData = {
              name: product.name,
              currentStock: alert.currentStock || 0,
              minimumStock: alert.minimumStock || 0,
              unit: product.unit || 'unidade',
              suggestedOrder: alert.suggestedOrderQuantity || 0,
              expirationDate: product.expirationDate,
            };

            switch (alert.type) {
              case 'low_stock':
                lowStockProducts.push(productData);
                break;
              case 'out_of_stock':
                outOfStockProducts.push(productData);
                break;
              case 'expiring_soon':
                expiringProducts.push(productData);
                break;
              case 'expired':
                expiredProducts.push(productData);
                break;
            }
          }

          // Enviar email para cada responsável
          for (const recipient of filteredRecipients) {
            if (!recipient.email) continue;

            try {
              await this.sendStockAlertEmail(
                recipient.email,
                recipient.name || 'Responsável',
                {
                  lowStock: lowStockProducts,
                  outOfStock: outOfStockProducts,
                  expiring: expiringProducts,
                  expired: expiredProducts,
                  totalAlerts: alerts.data.length,
                }
              );

              logger.info(`✉️  Stock alert email sent to ${recipient.email} (tenant: ${tenantId})`);
            } catch (emailError: any) {
              logger.error(`❌ Failed to send email to ${recipient.email}:`, {
                error: emailError.message,
              });
            }
          }
        } catch (tenantError: any) {
          logger.error(`❌ Error processing alerts for tenant ${tenantId}:`, {
            error: tenantError.message,
          });
        }
      }
    } catch (error: any) {
      logger.error('❌ Error sending email notifications:', {
        error: error.message,
        stack: error.stack,
      });
    }
  }

  /**
   * Envia email de alerta de estoque
   */
  private async sendStockAlertEmail(
    recipientEmail: string,
    recipientName: string,
    alerts: {
      lowStock: any[];
      outOfStock: any[];
      expiring: any[];
      expired: any[];
      totalAlerts: number;
    }
  ): Promise<boolean> {
    const hasLowStock = alerts.lowStock.length > 0;
    const hasOutOfStock = alerts.outOfStock.length > 0;
    const hasExpiring = alerts.expiring.length > 0;
    const hasExpired = alerts.expired.length > 0;

    if (!hasLowStock && !hasOutOfStock && !hasExpiring && !hasExpired) {
      return false; // Nada para enviar
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .section { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb; }
          .product-item { padding: 12px; margin: 8px 0; border-left: 4px solid; border-radius: 4px; }
          .critical { background: #fee2e2; border-color: #dc2626; }
          .warning { background: #fef3c7; border-color: #f59e0b; }
          .info { background: #dbeafe; border-color: #3b82f6; }
          .product-name { font-weight: bold; margin-bottom: 5px; }
          .product-details { font-size: 14px; color: #6b7280; }
          .summary { background: #1f2937; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .summary-item { display: inline-block; margin: 10px 20px; }
          .summary-number { font-size: 32px; font-weight: bold; color: #fbbf24; }
          .summary-label { font-size: 14px; color: #d1d5db; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .action-required { background: #dc2626; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">⚠️ Relatório Diário de Estoque</h1>
            <p style="margin: 10px 0 0 0;">Nexus CRM - ${new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
          <div class="content">
            <p>Olá <strong>${recipientName}</strong>,</p>
            <p>Identificamos <strong>${alerts.totalAlerts} alerta(s)</strong> que requerem sua atenção:</p>

            <div class="summary">
              <div class="summary-item">
                <div class="summary-number">${alerts.outOfStock.length + alerts.lowStock.length}</div>
                <div class="summary-label">Estoque Baixo/Zerado</div>
              </div>
              <div class="summary-item">
                <div class="summary-number">${alerts.expired.length + alerts.expiring.length}</div>
                <div class="summary-label">Produtos Vencendo/Vencidos</div>
              </div>
            </div>

            ${alerts.outOfStock.length > 0 ? `
            <div class="action-required">
              🚨 ${alerts.outOfStock.length} PRODUTO(S) SEM ESTOQUE - AÇÃO URGENTE NECESSÁRIA!
            </div>
            <div class="section">
              <div class="section-title" style="color: #dc2626;">🔴 Produtos Sem Estoque (${alerts.outOfStock.length})</div>
              ${alerts.outOfStock.map(product => `
                <div class="product-item critical">
                  <div class="product-name">${product.name}</div>
                  <div class="product-details">
                    <strong>Estoque Atual:</strong> ${product.currentStock} ${product.unit} |
                    <strong>Mínimo:</strong> ${product.minimumStock} ${product.unit} |
                    <strong>Sugerimos repor:</strong> ${product.suggestedOrder} ${product.unit}
                  </div>
                </div>
              `).join('')}
            </div>
            ` : ''}

            ${alerts.lowStock.length > 0 ? `
            <div class="section">
              <div class="section-title" style="color: #f59e0b;">🟡 Produtos com Estoque Baixo (${alerts.lowStock.length})</div>
              ${alerts.lowStock.map(product => `
                <div class="product-item warning">
                  <div class="product-name">${product.name}</div>
                  <div class="product-details">
                    <strong>Estoque Atual:</strong> ${product.currentStock} ${product.unit} |
                    <strong>Mínimo:</strong> ${product.minimumStock} ${product.unit} |
                    <strong>Sugerimos repor:</strong> ${product.suggestedOrder} ${product.unit}
                  </div>
                </div>
              `).join('')}
            </div>
            ` : ''}

            ${alerts.expired.length > 0 ? `
            <div class="section">
              <div class="section-title" style="color: #dc2626;">⛔ Produtos Vencidos (${alerts.expired.length})</div>
              ${alerts.expired.map(product => `
                <div class="product-item critical">
                  <div class="product-name">${product.name}</div>
                  <div class="product-details">
                    <strong>Vencimento:</strong> ${product.expirationDate ? new Date(product.expirationDate).toLocaleDateString('pt-BR') : 'N/A'} |
                    <strong>Estoque:</strong> ${product.currentStock} ${product.unit}
                  </div>
                </div>
              `).join('')}
            </div>
            ` : ''}

            ${alerts.expiring.length > 0 ? `
            <div class="section">
              <div class="section-title" style="color: #f59e0b;">⏰ Produtos Vencendo em Breve (${alerts.expiring.length})</div>
              ${alerts.expiring.map(product => `
                <div class="product-item warning">
                  <div class="product-name">${product.name}</div>
                  <div class="product-details">
                    <strong>Vencimento:</strong> ${product.expirationDate ? new Date(product.expirationDate).toLocaleDateString('pt-BR') : 'N/A'} |
                    <strong>Estoque:</strong> ${product.currentStock} ${product.unit}
                  </div>
                </div>
              `).join('')}
            </div>
            ` : ''}

            <p><strong>Recomendações:</strong></p>
            <ul>
              ${hasOutOfStock ? '<li>🚨 Produtos sem estoque: <strong>Repor imediatamente para evitar perdas de venda</strong></li>' : ''}
              ${hasLowStock ? '<li>⚠️ Produtos com estoque baixo: Programar reposição nos próximos dias</li>' : ''}
              ${hasExpired ? '<li>⛔ Produtos vencidos: Retirar do estoque imediatamente</li>' : ''}
              ${hasExpiring ? '<li>⏰ Produtos vencendo: Priorizar uso ou criar promoções</li>' : ''}
            </ul>

            <p>Acesse o sistema para visualizar detalhes completos e tomar as ações necessárias.</p>

            <div class="footer">
              <p>Este é um email automático enviado diariamente às 08:00.</p>
              <p>Para configurar alertas, acesse: <strong>Estoque → Configurações de Alertas</strong></p>
              <p>Nexus CRM - Sistema de Gestão Integrada</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
RELATÓRIO DIÁRIO DE ESTOQUE - ${new Date().toLocaleDateString('pt-BR')}

Olá ${recipientName},

Identificamos ${alerts.totalAlerts} alerta(s) que requerem sua atenção:

${alerts.outOfStock.length > 0 ? `
🔴 PRODUTOS SEM ESTOQUE (${alerts.outOfStock.length}):
${alerts.outOfStock.map(p => `- ${p.name}: ${p.currentStock} ${p.unit} (mínimo: ${p.minimumStock} ${p.unit})`).join('\n')}
` : ''}

${alerts.lowStock.length > 0 ? `
🟡 PRODUTOS COM ESTOQUE BAIXO (${alerts.lowStock.length}):
${alerts.lowStock.map(p => `- ${p.name}: ${p.currentStock} ${p.unit} (mínimo: ${p.minimumStock} ${p.unit})`).join('\n')}
` : ''}

${alerts.expired.length > 0 ? `
⛔ PRODUTOS VENCIDOS (${alerts.expired.length}):
${alerts.expired.map(p => `- ${p.name}: Vencimento ${p.expirationDate ? new Date(p.expirationDate).toLocaleDateString('pt-BR') : 'N/A'}`).join('\n')}
` : ''}

${alerts.expiring.length > 0 ? `
⏰ PRODUTOS VENCENDO EM BREVE (${alerts.expiring.length}):
${alerts.expiring.map(p => `- ${p.name}: Vencimento ${p.expirationDate ? new Date(p.expirationDate).toLocaleDateString('pt-BR') : 'N/A'}`).join('\n')}
` : ''}

Acesse o sistema para mais detalhes.

Nexus CRM
    `.trim();

    return await this.emailService.sendEmail({
      to: recipientEmail,
      subject: `⚠️ Alerta de Estoque: ${alerts.totalAlerts} item(ns) requer(em) atenção - ${new Date().toLocaleDateString('pt-BR')}`,
      html,
      text,
    });
  }

  /**
   * Retorna status do cron job
   */
  getStatus(): { running: boolean; nextExecution: Date | null; isExecuting: boolean } {
    return {
      running: this.cronJob.running,
      nextExecution: this.cronJob.nextDate()?.toJSDate() || null,
      isExecuting: this.isRunning,
    };
  }
}

// Singleton instance
let stockAlertCronInstance: StockAlertCronService | null = null;

export const getStockAlertCronService = (): StockAlertCronService => {
  if (!stockAlertCronInstance) {
    stockAlertCronInstance = new StockAlertCronService();
  }
  return stockAlertCronInstance;
};
