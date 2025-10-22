import { AppDataSource } from '../../../config/database';
import { LandingPage, LandingPageStatus, LandingPageEvent, LandingPageEventType } from '../entities';

export class LandingPageService {
  private pageRepository = AppDataSource.getRepository(LandingPage);
  private eventRepository = AppDataSource.getRepository(LandingPageEvent);

  async create(tenantId: string, data: Partial<LandingPage>, userId?: string): Promise<LandingPage> {
    const page = this.pageRepository.create({
      ...data,
      tenantId,
      createdBy: userId,
      status: data.status || LandingPageStatus.DRAFT,
    });

    return await this.pageRepository.save(page);
  }

  async findAll(tenantId: string, filters?: {
    status?: LandingPageStatus;
    campaignId?: string;
  }): Promise<LandingPage[]> {
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

  async findById(id: string, tenantId: string): Promise<LandingPage | null> {
    return await this.pageRepository.findOne({
      where: { id, tenantId },
      relations: ['campaign'],
    });
  }

  async findBySlug(slug: string, tenantId: string): Promise<LandingPage | null> {
    return await this.pageRepository.findOne({
      where: { slug, tenantId, status: LandingPageStatus.PUBLISHED },
    });
  }

  async update(id: string, tenantId: string, data: Partial<LandingPage>): Promise<LandingPage | null> {
    await this.pageRepository.update({ id, tenantId }, data);
    return await this.findById(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const result = await this.pageRepository.delete({ id, tenantId });
    return (result.affected ?? 0) > 0;
  }

  async publish(id: string, tenantId: string): Promise<LandingPage | null> {
    await this.pageRepository.update(
      { id, tenantId },
      {
        status: LandingPageStatus.PUBLISHED,
        publishedAt: new Date(),
      }
    );
    return await this.findById(id, tenantId);
  }

  async unpublish(id: string, tenantId: string): Promise<LandingPage | null> {
    await this.pageRepository.update(
      { id, tenantId },
      {
        status: LandingPageStatus.DRAFT,
      }
    );
    return await this.findById(id, tenantId);
  }

  async trackEvent(
    pageId: string,
    eventType: LandingPageEventType,
    data: Partial<LandingPageEvent>
  ): Promise<void> {
    const event = this.eventRepository.create({
      landingPageId: pageId,
      eventType,
      ...data,
    });

    await this.eventRepository.save(event);

    // Update page counters
    if (eventType === LandingPageEventType.VIEW) {
      await this.pageRepository.increment({ id: pageId }, 'viewsCount', 1);
    } else if (eventType === LandingPageEventType.CONVERSION) {
      await this.pageRepository.increment({ id: pageId }, 'conversionsCount', 1);
    }
  }

  async getAnalytics(id: string, tenantId: string, days: number = 30): Promise<{
    views: number;
    uniqueVisitors: number;
    conversions: number;
    conversionRate: number;
    topReferrers: Array<{ referrer: string; count: number }>;
    dailyViews: Array<{ date: string; views: number }>;
  }> {
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

    const views = events.filter((e) => e.eventType === LandingPageEventType.VIEW).length;
    const uniqueVisitors = new Set(events.map((e) => e.visitorId).filter(Boolean)).size;
    const conversions = events.filter((e) => e.eventType === LandingPageEventType.CONVERSION).length;
    const conversionRate = views > 0 ? (conversions / views) * 100 : 0;

    // Top referrers
    const referrerCounts: Record<string, number> = {};
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
    const dailyCounts: Record<string, number> = {};
    events
      .filter((e) => e.eventType === LandingPageEventType.VIEW)
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
