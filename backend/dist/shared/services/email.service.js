"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("../utils/logger");
class EmailService {
    transporter;
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    async sendEmail(options) {
        try {
            const mailOptions = {
                from: `"${process.env.SMTP_FROM_NAME || 'Nexus CRM'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
                to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
                cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
                bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
            };
            const info = await this.transporter.sendMail(mailOptions);
            logger_1.logger.info(`Email sent successfully: ${info.messageId}`);
            return true;
        }
        catch (error) {
            logger_1.logger.error('Error sending email:', error);
            return false;
        }
    }
    async sendInventoryCompletedEmail(recipientEmail, recipientName, inventoryData) {
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .stats { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .stat-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .stat-item:last-child { border-bottom: none; }
          .stat-label { font-weight: 600; color: #6b7280; }
          .stat-value { font-weight: bold; color: #111827; }
          .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .success { background: #d1fae5; border-left: 4px solid #10b981; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">✅ Contagem de Inventário Concluída</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${recipientName}</strong>,</p>

            <p>A contagem de inventário foi finalizada com sucesso.</p>

            <div class="stats">
              <h3 style="margin-top: 0;">Detalhes da Contagem</h3>
              <div class="stat-item">
                <span class="stat-label">Descrição:</span>
                <span class="stat-value">${inventoryData.description}</span>
              </div>
              ${inventoryData.location ? `
              <div class="stat-item">
                <span class="stat-label">Local:</span>
                <span class="stat-value">${inventoryData.location}</span>
              </div>
              ` : ''}
              <div class="stat-item">
                <span class="stat-label">Concluída em:</span>
                <span class="stat-value">${new Date(inventoryData.completedAt).toLocaleString('pt-BR')}</span>
              </div>
            </div>

            <div class="stats">
              <h3 style="margin-top: 0;">Resultados</h3>
              <div class="stat-item">
                <span class="stat-label">Total de Produtos:</span>
                <span class="stat-value">${inventoryData.totalItems}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">✅ Conferências Corretas:</span>
                <span class="stat-value" style="color: #10b981;">${inventoryData.matches}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">➕ Sobras:</span>
                <span class="stat-value" style="color: #10b981;">${inventoryData.surpluses}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">➖ Faltas:</span>
                <span class="stat-value" style="color: #ef4444;">${inventoryData.shortages}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Diferença Total:</span>
                <span class="stat-value" style="color: ${inventoryData.totalDifference >= 0 ? '#10b981' : '#ef4444'};">
                  ${inventoryData.totalDifference >= 0 ? '+' : ''}${inventoryData.totalDifference}
                </span>
              </div>
            </div>

            ${inventoryData.shortages > 0 ? `
            <div class="alert">
              <strong>⚠️ Atenção:</strong> Foram identificadas ${inventoryData.shortages} faltas no estoque.
              Recomendamos revisar os produtos com divergência.
            </div>
            ` : `
            <div class="alert success">
              <strong>✨ Excelente!</strong> A contagem foi concluída ${inventoryData.surpluses > 0 ? 'com sobras identificadas' : 'sem divergências significativas'}.
            </div>
            `}

            <p>Acesse o sistema para visualizar o relatório completo e os detalhes de cada produto.</p>

            <div class="footer">
              <p>Este é um email automático. Por favor, não responda.</p>
              <p>Nexus CRM - Sistema de Gestão Integrada</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
        const text = `
Contagem de Inventário Concluída

Olá ${recipientName},

A contagem de inventário "${inventoryData.description}" foi finalizada com sucesso.

${inventoryData.location ? `Local: ${inventoryData.location}` : ''}
Concluída em: ${new Date(inventoryData.completedAt).toLocaleString('pt-BR')}

Resultados:
- Total de Produtos: ${inventoryData.totalItems}
- Conferências Corretas: ${inventoryData.matches}
- Sobras: ${inventoryData.surpluses}
- Faltas: ${inventoryData.shortages}
- Diferença Total: ${inventoryData.totalDifference >= 0 ? '+' : ''}${inventoryData.totalDifference}

${inventoryData.shortages > 0 ? 'ATENÇÃO: Foram identificadas faltas no estoque. Recomendamos revisar os produtos com divergência.' : ''}

Acesse o sistema para visualizar o relatório completo.

Nexus CRM
    `.trim();
        return await this.sendEmail({
            to: recipientEmail,
            subject: `✅ Inventário Concluído - ${inventoryData.description}`,
            html,
            text,
        });
    }
    async sendLowStockAlert(recipientEmail, recipientName, products) {
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .products { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .product-item { padding: 15px; margin: 10px 0; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; }
          .product-name { font-weight: bold; color: #92400e; margin-bottom: 5px; }
          .product-stock { color: #6b7280; font-size: 14px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">⚠️ Alerta de Estoque Baixo</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${recipientName}</strong>,</p>

            <p>Identificamos ${products.length} ${products.length === 1 ? 'produto' : 'produtos'} com estoque abaixo do mínimo:</p>

            <div class="products">
              ${products.map(product => `
                <div class="product-item">
                  <div class="product-name">${product.name}</div>
                  <div class="product-stock">
                    Estoque atual: <strong>${product.currentStock} ${product.unit}</strong> |
                    Mínimo: <strong>${product.minimumStock} ${product.unit}</strong>
                  </div>
                </div>
              `).join('')}
            </div>

            <p><strong>Ação necessária:</strong> Recomendamos fazer a reposição destes produtos o mais breve possível para evitar rupturas de estoque.</p>

            <div class="footer">
              <p>Este é um email automático. Por favor, não responda.</p>
              <p>Nexus CRM - Sistema de Gestão Integrada</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
        return await this.sendEmail({
            to: recipientEmail,
            subject: `⚠️ Alerta: ${products.length} ${products.length === 1 ? 'produto' : 'produtos'} com estoque baixo`,
            html,
        });
    }
}
exports.EmailService = EmailService;
exports.emailService = new EmailService();
//# sourceMappingURL=email.service.js.map