import { AppDataSource } from '../../../database/data-source';
import { Campaign, CampaignStatus } from '../entities';

export class CampaignService {
  private campaignRepository = AppDataSource.getRepository(Campaign);

  async create(tenantId: string, data: Partial<Campaign>, userId?: string): Promise<Campaign> {
    const campaign = this.campaignRepository.create({
      ...data,
      tenantId,
      createdBy: userId,
      status: data.status || CampaignStatus.DRAFT,
    });

    return await this.campaignRepository.save(campaign);
  }

  async findAll(tenantId: string, filters?: {
    status?: CampaignStatus;
    type?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Campaign[]> {
    const query = this.campaignRepository
      .createQueryBuilder('campaign')
      .where('campaign.tenant_id = :tenantId', { tenantId })
      .orderBy('campaign.created_at', 'DESC');

    if (filters?.status) {
      query.andWhere('campaign.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      query.andWhere('campaign.type = :type', { type: filters.type });
    }

    if (filters?.startDate) {
      query.andWhere('campaign.start_date >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('campaign.end_date <= :endDate', { endDate: filters.endDate });
    }

    return await query.getMany();
  }

  async findById(id: string, tenantId: string): Promise<Campaign | null> {
    return await this.campaignRepository.findOne({
      where: { id, tenantId },
      relations: ['socialPosts', 'bulkMessages', 'landingPages', 'metrics'],
    });
  }

  async update(id: string, tenantId: string, data: Partial<Campaign>): Promise<Campaign | null> {
    await this.campaignRepository.update({ id, tenantId }, data);
    return await this.findById(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.campaignRepository.delete({ id, tenantId });
    return (result.affected ?? 0) > 0;
  }

  async updateStatus(id: string, tenantId: string, status: CampaignStatus): Promise<Campaign | null> {
    await this.campaignRepository.update({ id, tenantId }, { status });
    return await this.findById(id, tenantId);
  }

  async getStats(tenantId: string): Promise<{
    total: number;
    active: number;
    draft: number;
    completed: number;
    totalSpent: number;
    totalBudget: number;
  }> {
    const campaigns = await this.findAll(tenantId);

    const stats = {
      total: campaigns.length,
      active: campaigns.filter((c) => c.status === CampaignStatus.ACTIVE).length,
      draft: campaigns.filter((c) => c.status === CampaignStatus.DRAFT).length,
      completed: campaigns.filter((c) => c.status === CampaignStatus.COMPLETED).length,
      totalSpent: campaigns.reduce((sum, c) => sum + (Number(c.spent) || 0), 0),
      totalBudget: campaigns.reduce((sum, c) => sum + (Number(c.budget) || 0), 0),
    };

    return stats;
  }
}
