import { AppDataSource } from '../../../database/data-source';
import { BulkMessage, BulkMessageStatus, BulkMessagePlatform } from '../entities';
import { BulkMessageRecipient, RecipientStatus } from '../entities';

export class BulkMessageService {
  private messageRepository = AppDataSource.getRepository(BulkMessage);
  private recipientRepository = AppDataSource.getRepository(BulkMessageRecipient);

  async create(tenantId: string, data: Partial<BulkMessage>, userId?: string): Promise<BulkMessage> {
    const message = this.messageRepository.create({
      ...data,
      tenantId,
      createdBy: userId,
      status: data.status || BulkMessageStatus.DRAFT,
      totalRecipients: data.recipients?.length || 0,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Create individual recipient tracking records
    if (data.recipients && data.recipients.length > 0) {
      const recipientRecords = data.recipients.map((recipient) =>
        this.recipientRepository.create({
          bulkMessageId: savedMessage.id,
          recipientIdentifier: recipient.phone || recipient.email || recipient.instagram_id || '',
          recipientName: recipient.name,
          status: RecipientStatus.PENDING,
        })
      );

      await this.recipientRepository.save(recipientRecords);
    }

    return savedMessage;
  }

  async findAll(tenantId: string, filters?: {
    status?: BulkMessageStatus;
    platform?: BulkMessagePlatform;
    campaignId?: string;
  }): Promise<BulkMessage[]> {
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

  async findById(id: string, tenantId: string): Promise<BulkMessage | null> {
    return await this.messageRepository.findOne({
      where: { id, tenantId },
      relations: ['campaign', 'recipientTracking'],
    });
  }

  async update(id: string, tenantId: string, data: Partial<BulkMessage>): Promise<BulkMessage | null> {
    await this.messageRepository.update({ id, tenantId }, data);
    return await this.findById(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.messageRepository.delete({ id, tenantId });
    return (result.affected ?? 0) > 0;
  }

  async schedule(id: string, tenantId: string, scheduledAt: Date): Promise<BulkMessage | null> {
    await this.messageRepository.update(
      { id, tenantId },
      {
        scheduledAt,
        status: BulkMessageStatus.SCHEDULED,
      }
    );
    return await this.findById(id, tenantId);
  }

  async updateRecipientStatus(
    recipientId: string,
    status: RecipientStatus,
    platformMessageId?: string,
    errorMessage?: string
  ): Promise<void> {
    const updates: any = { status };

    if (status === RecipientStatus.SENT) updates.sentAt = new Date();
    if (status === RecipientStatus.DELIVERED) updates.deliveredAt = new Date();
    if (status === RecipientStatus.OPENED) updates.openedAt = new Date();
    if (status === RecipientStatus.CLICKED) updates.clickedAt = new Date();
    if (status === RecipientStatus.FAILED) {
      updates.failedAt = new Date();
      updates.errorMessage = errorMessage;
    }
    if (platformMessageId) updates.platformMessageId = platformMessageId;

    await this.recipientRepository.update(recipientId, updates);

    // Update bulk message counters
    const recipient = await this.recipientRepository.findOne({ where: { id: recipientId } });
    if (recipient) {
      await this.updateMessageCounters(recipient.bulkMessageId);
    }
  }

  private async updateMessageCounters(bulkMessageId: string): Promise<void> {
    const recipients = await this.recipientRepository.find({
      where: { bulkMessageId },
    });

    const sentCount = recipients.filter((r) => [RecipientStatus.SENT, RecipientStatus.DELIVERED, RecipientStatus.OPENED, RecipientStatus.CLICKED].includes(r.status)).length;
    const deliveredCount = recipients.filter((r) => [RecipientStatus.DELIVERED, RecipientStatus.OPENED, RecipientStatus.CLICKED].includes(r.status)).length;
    const failedCount = recipients.filter((r) => r.status === RecipientStatus.FAILED).length;
    const openedCount = recipients.filter((r) => [RecipientStatus.OPENED, RecipientStatus.CLICKED].includes(r.status)).length;
    const clickedCount = recipients.filter((r) => r.status === RecipientStatus.CLICKED).length;

    await this.messageRepository.update(bulkMessageId, {
      sentCount,
      deliveredCount,
      failedCount,
      openedCount,
      clickedCount,
    });
  }

  // Placeholders for actual sending logic (to be implemented in integration sessions)
  async sendWhatsApp(message: BulkMessage): Promise<{ success: boolean; error?: string }> {
    // TODO: Implement WhatsApp Business API integration
    return { success: false, error: 'WhatsApp integration not yet implemented' };
  }

  async sendEmail(message: BulkMessage): Promise<{ success: boolean; error?: string }> {
    // TODO: Implement SendGrid/Resend integration
    return { success: false, error: 'Email integration not yet implemented' };
  }

  async sendInstagramDM(message: BulkMessage): Promise<{ success: boolean; error?: string }> {
    // TODO: Implement Instagram Messaging API integration
    return { success: false, error: 'Instagram DM integration not yet implemented' };
  }
}
