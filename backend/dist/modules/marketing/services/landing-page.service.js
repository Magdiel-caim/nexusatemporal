"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LandingPageService = void 0;
const data_source_1 = require("../../../database/data-source");
const entities_1 = require("../entities");
class LandingPageService {
    pageRepository = data_source_1.AppDataSource.getRepository(entities_1.LandingPage);
    eventRepository = data_source_1.AppDataSource.getRepository(entities_1.LandingPageEvent);
    async create(tenantId, data, userId) {
        const page = this.pageRepository.create({
            ...data,
            tenantId,
            createdBy: userId,
            status: data.status || entities_1.LandingPageStatus.DRAFT,
        });
        return await this.pageRepository.save(page);
    }
    async findAll(tenantId, filters) {
        const query = this.pageRepository
            .createQueryBuilder('page')
            .where('page.tenant_id = :tenantId', { tenantId })
            .orderBy('page.created_at', 'DESC');
        if (filters?.status) {
            query.andWhere('page.status = :status', { status: filters.status });
        }
        if (filters?.campaignId) {
            query.andWhere('page.campaign_id = :campaignId', { campaignId: filters.campaignId });
        }
        return await query.getMany();
    }
    async findById(id, tenantId) {
        return await this.pageRepository.findOne({
            where: { id, tenantId },
            relations: ['campaign'],
        });
    }
    async findBySlug(slug, tenantId) {
        return await this.pageRepository.findOne({
            where: { slug, tenantId, status: entities_1.LandingPageStatus.PUBLISHED },
        });
    }
    async update(id, tenantId, data) {
        await this.pageRepository.update({ id, tenantId }, data);
        return await this.findById(id, tenantId);
    }
    async delete(id, tenantId) {
        const result = await this.pageRepository.delete({ id, tenantId });
        return (result.affected ?? 0) > 0;
    }
    async publish(id, tenantId) {
        await this.pageRepository.update({ id, tenantId }, {
            status: entities_1.LandingPageStatus.PUBLISHED,
            publishedAt: new Date(),
        });
        return await this.findById(id, tenantId);
    }
    async unpublish(id, tenantId) {
        await this.pageRepository.update({ id, tenantId }, {
            status: entities_1.LandingPageStatus.DRAFT,
        });
        return await this.findById(id, tenantId);
    }
    async trackEvent(pageId, eventType, data) {
        const event = this.eventRepository.create({
            landingPageId: pageId,
            eventType,
            ...data,
        });
        await this.eventRepository.save(event);
        // Update page counters
        if (eventType === entities_1.LandingPageEventType.VIEW) {
            await this.pageRepository.increment({ id: pageId }, 'viewsCount', 1);
        }
        else if (eventType === entities_1.LandingPageEventType.CONVERSION) {
            await this.pageRepository.increment({ id: pageId }, 'conversionsCount', 1);
        }
    }
    async getAnalytics(id, tenantId, days = 30) {
        const page = await this.findById(id, tenantId);
        if (!page) {
            throw new Error('Landing page not found');
        }
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const events = await this.eventRepository
            .createQueryBuilder('event')
            .where('event.landing_page_id = :pageId', { pageId: id })
            .andWhere('event.created_at >= :startDate', { startDate })
            .getMany();
        const views = events.filter((e) => e.eventType === entities_1.LandingPageEventType.VIEW).length;
        const uniqueVisitors = new Set(events.map((e) => e.visitorId).filter(Boolean)).size;
        const conversions = events.filter((e) => e.eventType === entities_1.LandingPageEventType.CONVERSION).length;
        const conversionRate = views > 0 ? (conversions / views) * 100 : 0;
        // Top referrers
        const referrerCounts = {};
        events.forEach((event) => {
            if (event.referrer) {
                referrerCounts[event.referrer] = (referrerCounts[event.referrer] || 0) + 1;
            }
        });
        const topReferrers = Object.entries(referrerCounts)
            .map(([referrer, count]) => ({ referrer, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        // Daily views
        const dailyCounts = {};
        events
            .filter((e) => e.eventType === entities_1.LandingPageEventType.VIEW)
            .forEach((event) => {
            const date = event.createdAt.toISOString().split('T')[0];
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        });
        const dailyViews = Object.entries(dailyCounts)
            .map(([date, views]) => ({ date, views }))
            .sort((a, b) => a.date.localeCompare(b.date));
        return {
            views,
            uniqueVisitors,
            conversions,
            conversionRate: Number(conversionRate.toFixed(2)),
            topReferrers,
            dailyViews,
        };
    }
}
exports.LandingPageService = LandingPageService;
//# sourceMappingURL=landing-page.service.js.map