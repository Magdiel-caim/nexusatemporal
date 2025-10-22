"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkMessageService = void 0;
const data_source_1 = require("../../../database/data-source");
const entities_1 = require("../entities");
const entities_2 = require("../entities");
class BulkMessageService {
    messageRepository = data_source_1.AppDataSource.getRepository(entities_1.BulkMessage);
    recipientRepository = data_source_1.AppDataSource.getRepository(entities_2.BulkMessageRecipient);
    async create(tenantId, data, userId) {
        const message = this.messageRepository.create({
            ...data,
            tenantId,
            createdBy: userId,
            status: data.status || entities_1.BulkMessageStatus.DRAFT,
            totalRecipients: data.recipients?.length || 0,
        });
        const savedMessage = await this.messageRepository.save(message);
        // Create individual recipient tracking records
        if (data.recipients && data.recipients.length > 0) {
            const recipientRecords = data.recipients.map((recipient) => this.recipientRepository.create({
                bulkMessageId: savedMessage.id,
                recipientIdentifier: recipient.phone || recipient.email || recipient.instagram_id || '',
                recipientName: recipient.name,
                status: entities_2.RecipientStatus.PENDING,
            }));
            await this.recipientRepository.save(recipientRecords);
        }
        return savedMessage;
    }
    async findAll(tenantId, filters) {
        const query = this.messageRepository
            .createQueryBuilder('message')
            .where('message.tenant_id = :tenantId', { tenantId })
            .orderBy('message.created_at', 'DESC');
        if (filters?.status) {
            query.andWhere('message.status = :status', { status: filters.status });
        }
        if (filters?.platform) {
            query.andWhere('message.platform = :platform', { platform: filters.platform });
        }
        if (filters?.campaignId) {
            query.andWhere('message.campaign_id = :campaignId', { campaignId: filters.campaignId });
        }
        return await query.getMany();
    }
    async findById(id, tenantId) {
        return await this.messageRepository.findOne({
            where: { id, tenantId },
            relations: ['campaign', 'recipientTracking'],
        });
    }
    async update(id, tenantId, data) {
        await this.messageRepository.update({ id, tenantId }, data);
        return await this.findById(id, tenantId);
    }
    async delete(id, tenantId) {
        const result = await this.messageRepository.delete({ id, tenantId });
        return (result.affected ?? 0) > 0;
    }
    async schedule(id, tenantId, scheduledAt) {
        await this.messageRepository.update({ id, tenantId }, {
            scheduledAt,
            status: entities_1.BulkMessageStatus.SCHEDULED,
        });
        return await this.findById(id, tenantId);
    }
    async updateRecipientStatus(recipientId, status, platformMessageId, errorMessage) {
        const updates = { status };
        if (status === entities_2.RecipientStatus.SENT)
            updates.sentAt = new Date();
        if (status === entities_2.RecipientStatus.DELIVERED)
            updates.deliveredAt = new Date();
        if (status === entities_2.RecipientStatus.OPENED)
            updates.openedAt = new Date();
        if (status === entities_2.RecipientStatus.CLICKED)
            updates.clickedAt = new Date();
        if (status === entities_2.RecipientStatus.FAILED) {
            updates.failedAt = new Date();
            updates.errorMessage = errorMessage;
        }
        if (platformMessageId)
            updates.platformMessageId = platformMessageId;
        await this.recipientRepository.update(recipientId, updates);
        // Update bulk message counters
        const recipient = await this.recipientRepository.findOne({ where: { id: recipientId } });
        if (recipient) {
            await this.updateMessageCounters(recipient.bulkMessageId);
        }
    }
    async updateMessageCounters(bulkMessageId) {
        const recipients = await this.recipientRepository.find({
            where: { bulkMessageId },
        });
        const sentCount = recipients.filter((r) => [entities_2.RecipientStatus.SENT, entities_2.RecipientStatus.DELIVERED, entities_2.RecipientStatus.OPENED, entities_2.RecipientStatus.CLICKED].includes(r.status)).length;
        const deliveredCount = recipients.filter((r) => [entities_2.RecipientStatus.DELIVERED, entities_2.RecipientStatus.OPENED, entities_2.RecipientStatus.CLICKED].includes(r.status)).length;
        const failedCount = recipients.filter((r) => r.status === entities_2.RecipientStatus.FAILED).length;
        const openedCount = recipients.filter((r) => [entities_2.RecipientStatus.OPENED, entities_2.RecipientStatus.CLICKED].includes(r.status)).length;
        const clickedCount = recipients.filter((r) => r.status === entities_2.RecipientStatus.CLICKED).length;
        await this.messageRepository.update(bulkMessageId, {
            sentCount,
            deliveredCount,
            failedCount,
            openedCount,
            clickedCount,
        });
    }
    // Placeholders for actual sending logic (to be implemented in integration sessions)
    async sendWhatsApp(message) {
        // TODO: Implement WhatsApp Business API integration
        return { success: false, error: 'WhatsApp integration not yet implemented' };
    }
    async sendEmail(message) {
        // TODO: Implement SendGrid/Resend integration
        return { success: false, error: 'Email integration not yet implemented' };
    }
    async sendInstagramDM(message) {
        // TODO: Implement Instagram Messaging API integration
        return { success: false, error: 'Instagram DM integration not yet implemented' };
    }
}
exports.BulkMessageService = BulkMessageService;
//# sourceMappingURL=bulk-message.service.js.map