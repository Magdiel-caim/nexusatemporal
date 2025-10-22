"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignService = void 0;
const data_source_1 = require("../../../database/data-source");
const entities_1 = require("../entities");
class CampaignService {
    campaignRepository = data_source_1.AppDataSource.getRepository(entities_1.Campaign);
    async create(tenantId, data, userId) {
        const campaign = this.campaignRepository.create({
            ...data,
            tenantId,
            createdBy: userId,
            status: data.status || entities_1.CampaignStatus.DRAFT,
        });
        return await this.campaignRepository.save(campaign);
    }
    async findAll(tenantId, filters) {
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
    async findById(id, tenantId) {
        return await this.campaignRepository.findOne({
            where: { id, tenantId },
            relations: ['socialPosts', 'bulkMessages', 'landingPages', 'metrics'],
        });
    }
    async update(id, tenantId, data) {
        await this.campaignRepository.update({ id, tenantId }, data);
        return await this.findById(id, tenantId);
    }
    async delete(id, tenantId) {
        const result = await this.campaignRepository.delete({ id, tenantId });
        return (result.affected ?? 0) > 0;
    }
    async updateStatus(id, tenantId, status) {
        await this.campaignRepository.update({ id, tenantId }, { status });
        return await this.findById(id, tenantId);
    }
    async getStats(tenantId) {
        const campaigns = await this.findAll(tenantId);
        const stats = {
            total: campaigns.length,
            active: campaigns.filter((c) => c.status === entities_1.CampaignStatus.ACTIVE).length,
            draft: campaigns.filter((c) => c.status === entities_1.CampaignStatus.DRAFT).length,
            completed: campaigns.filter((c) => c.status === entities_1.CampaignStatus.COMPLETED).length,
            totalSpent: campaigns.reduce((sum, c) => sum + (Number(c.spent) || 0), 0),
            totalBudget: campaigns.reduce((sum, c) => sum + (Number(c.budget) || 0), 0),
        };
        return stats;
    }
}
exports.CampaignService = CampaignService;
//# sourceMappingURL=campaign.service.js.map