"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialPostService = void 0;
const data_source_1 = require("../../../database/data-source");
const entities_1 = require("../entities");
class SocialPostService {
    postRepository = data_source_1.AppDataSource.getRepository(entities_1.SocialPost);
    async create(tenantId, data, userId) {
        const post = this.postRepository.create({
            ...data,
            tenantId,
            createdBy: userId,
            status: data.status || entities_1.SocialPostStatus.DRAFT,
        });
        return await this.postRepository.save(post);
    }
    async findAll(tenantId, filters) {
        const query = this.postRepository
            .createQueryBuilder('post')
            .where('post.tenant_id = :tenantId', { tenantId })
            .orderBy('post.created_at', 'DESC');
        if (filters?.status) {
            query.andWhere('post.status = :status', { status: filters.status });
        }
        if (filters?.platform) {
            query.andWhere('post.platform = :platform', { platform: filters.platform });
        }
        if (filters?.campaignId) {
            query.andWhere('post.campaign_id = :campaignId', { campaignId: filters.campaignId });
        }
        return await query.getMany();
    }
    async findById(id, tenantId) {
        return await this.postRepository.findOne({
            where: { id, tenantId },
            relations: ['campaign'],
        });
    }
    async update(id, tenantId, data) {
        await this.postRepository.update({ id, tenantId }, data);
        return await this.findById(id, tenantId);
    }
    async delete(id, tenantId) {
        const result = await this.postRepository.delete({ id, tenantId });
        return (result.affected ?? 0) > 0;
    }
    async schedule(id, tenantId, scheduledAt) {
        await this.postRepository.update({ id, tenantId }, {
            scheduledAt,
            status: entities_1.SocialPostStatus.SCHEDULED,
        });
        return await this.findById(id, tenantId);
    }
    async publish(id, tenantId, platformPostId, platformUrl) {
        await this.postRepository.update({ id, tenantId }, {
            status: entities_1.SocialPostStatus.PUBLISHED,
            publishedAt: new Date(),
            platformPostId,
            platformUrl,
        });
        return await this.findById(id, tenantId);
    }
    async markAsFailed(id, tenantId, errorMessage) {
        await this.postRepository.update({ id, tenantId }, {
            status: entities_1.SocialPostStatus.FAILED,
            errorMessage,
        });
        return await this.findById(id, tenantId);
    }
    async updateMetrics(id, tenantId, metrics) {
        const post = await this.findById(id, tenantId);
        if (!post)
            return null;
        const updatedMetrics = { ...post.metrics, ...metrics };
        await this.postRepository.update({ id, tenantId }, { metrics: updatedMetrics });
        return await this.findById(id, tenantId);
    }
    // Placeholder for actual publishing logic (to be implemented in integration sessions)
    async publishToInstagram(post) {
        // TODO: Implement Instagram Graph API integration
        return { success: false, error: 'Instagram integration not yet implemented' };
    }
    async publishToFacebook(post) {
        // TODO: Implement Facebook Graph API integration
        return { success: false, error: 'Facebook integration not yet implemented' };
    }
    async publishToLinkedIn(post) {
        // TODO: Implement LinkedIn Posts API integration
        return { success: false, error: 'LinkedIn integration not yet implemented' };
    }
    async publishToTikTok(post) {
        // TODO: Implement TikTok Content API integration
        return { success: false, error: 'TikTok integration not yet implemented' };
    }
}
exports.SocialPostService = SocialPostService;
//# sourceMappingURL=social-post.service.js.map