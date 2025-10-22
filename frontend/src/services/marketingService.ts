import api from './api';

// ============================================
// INTERFACES
// ============================================

export interface Campaign {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: 'email' | 'social' | 'whatsapp' | 'mixed';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  budget?: number;
  spent?: number;
  metadata?: Record<string, any>;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialPost {
  id: string;
  tenantId: string;
  campaignId?: string;
  platform: 'instagram' | 'facebook' | 'linkedin' | 'tiktok';
  postType: 'feed' | 'story' | 'reel' | 'carousel';
  content: string;
  mediaUrls?: string[];
  scheduledAt?: string;
  publishedAt?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  metrics?: Record<string, any>;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BulkMessage {
  id: string;
  tenantId: string;
  campaignId?: string;
  name: string;
  platform: 'whatsapp' | 'instagram_dm' | 'email';
  content: string;
  mediaUrl?: string;
  scheduledAt?: string;
  sentAt?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  failedCount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BulkMessageRecipient {
  id: string;
  bulkMessageId: string;
  recipientId?: string;
  recipientType: 'lead' | 'contact' | 'custom';
  recipientData: Record<string, any>;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LandingPage {
  id: string;
  tenantId: string;
  campaignId?: string;
  name: string;
  slug: string;
  title: string;
  description?: string;
  content: Record<string, any>; // GrapesJS data
  styles?: string;
  customCss?: string;
  customJs?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  viewsCount: number;
  conversionsCount: number;
  bounceRate?: number;
  avgTimeOnPage?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIAnalysis {
  id: string;
  tenantId: string;
  aiProvider: 'groq' | 'openrouter' | 'deepseek' | 'mistral' | 'qwen' | 'ollama';
  aiModel: string;
  analysisType: 'sentiment' | 'optimization' | 'prediction' | 'copywriting' | 'image_gen';
  inputData: Record<string, any>;
  outputData: Record<string, any>;
  suggestions?: string[];
  score?: number;
  relatedType?: string;
  relatedId?: string;
  tokensUsed?: number;
  cost?: number;
  processingTimeMs?: number;
  createdBy?: string;
  createdAt: string;
}

export interface CampaignMetric {
  id: string;
  campaignId: string;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spent: number;
  revenue?: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface MarketingIntegration {
  id: string;
  tenantId: string;
  platform: 'facebook' | 'instagram' | 'google_ads' | 'google_analytics' | 'tiktok' | 'linkedin' | 'sendgrid' | 'resend';
  isActive: boolean;
  credentials: Record<string, any>;
  config?: Record<string, any>;
  lastSyncAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSpent: number;
  totalBudget: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgCtr: number;
  avgConversionRate: number;
}

// ============================================
// CAMPAIGN METHODS
// ============================================

const campaignMethods = {
  async getCampaigns(filters?: {
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Campaign[]> {
    const { data } = await api.get('/marketing/campaigns', { params: filters });
    return data;
  },

  async getCampaignById(id: string): Promise<Campaign> {
    const { data } = await api.get(`/marketing/campaigns/${id}`);
    return data;
  },

  async createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
    const { data } = await api.post('/marketing/campaigns', campaignData);
    return data;
  },

  async updateCampaign(id: string, campaignData: Partial<Campaign>): Promise<Campaign> {
    const { data } = await api.put(`/marketing/campaigns/${id}`, campaignData);
    return data;
  },

  async deleteCampaign(id: string): Promise<void> {
    await api.delete(`/marketing/campaigns/${id}`);
  },

  async getCampaignStats(): Promise<CampaignStats> {
    const { data } = await api.get('/marketing/campaigns/stats');
    return data;
  },
};

// ============================================
// SOCIAL POST METHODS
// ============================================

const socialPostMethods = {
  async getSocialPosts(filters?: {
    campaignId?: string;
    platform?: string;
    status?: string;
  }): Promise<SocialPost[]> {
    const { data } = await api.get('/marketing/social-posts', { params: filters });
    return data;
  },

  async getSocialPostById(id: string): Promise<SocialPost> {
    const { data } = await api.get(`/marketing/social-posts/${id}`);
    return data;
  },

  async createSocialPost(postData: Partial<SocialPost>): Promise<SocialPost> {
    const { data } = await api.post('/marketing/social-posts', postData);
    return data;
  },

  async updateSocialPost(id: string, postData: Partial<SocialPost>): Promise<SocialPost> {
    const { data } = await api.put(`/marketing/social-posts/${id}`, postData);
    return data;
  },

  async deleteSocialPost(id: string): Promise<void> {
    await api.delete(`/marketing/social-posts/${id}`);
  },

  async scheduleSocialPost(id: string, scheduledAt: string): Promise<SocialPost> {
    const { data } = await api.post(`/marketing/social-posts/${id}/schedule`, { scheduledAt });
    return data;
  },
};

// ============================================
// BULK MESSAGE METHODS
// ============================================

const bulkMessageMethods = {
  async getBulkMessages(filters?: {
    campaignId?: string;
    platform?: string;
    status?: string;
  }): Promise<BulkMessage[]> {
    const { data } = await api.get('/marketing/bulk-messages', { params: filters });
    return data;
  },

  async getBulkMessageById(id: string): Promise<BulkMessage> {
    const { data } = await api.get(`/marketing/bulk-messages/${id}`);
    return data;
  },

  async createBulkMessage(messageData: Partial<BulkMessage>): Promise<BulkMessage> {
    const { data } = await api.post('/marketing/bulk-messages', messageData);
    return data;
  },
};

// ============================================
// LANDING PAGE METHODS
// ============================================

const landingPageMethods = {
  async getLandingPages(filters?: {
    campaignId?: string;
    status?: string;
  }): Promise<LandingPage[]> {
    const { data } = await api.get('/marketing/landing-pages', { params: filters });
    return data;
  },

  async getLandingPageById(id: string): Promise<LandingPage> {
    const { data } = await api.get(`/marketing/landing-pages/${id}`);
    return data;
  },

  async createLandingPage(pageData: Partial<LandingPage>): Promise<LandingPage> {
    const { data } = await api.post('/marketing/landing-pages', pageData);
    return data;
  },

  async updateLandingPage(id: string, pageData: Partial<LandingPage>): Promise<LandingPage> {
    const { data } = await api.put(`/marketing/landing-pages/${id}`, pageData);
    return data;
  },

  async publishLandingPage(id: string): Promise<LandingPage> {
    const { data } = await api.post(`/marketing/landing-pages/${id}/publish`);
    return data;
  },

  async getLandingPageAnalytics(id: string, days?: number): Promise<any> {
    const { data } = await api.get(`/marketing/landing-pages/${id}/analytics`, {
      params: { days },
    });
    return data;
  },
};

// ============================================
// AI ASSISTANT METHODS
// ============================================

const aiMethods = {
  async analyzeWithAI(analysisData: {
    provider: string;
    model: string;
    analysisType: string;
    inputData: Record<string, any>;
  }): Promise<AIAnalysis> {
    const { data } = await api.post('/marketing/ai/analyze', analysisData);
    return data;
  },

  async getAIAnalyses(filters?: {
    analysisType?: string;
    relatedId?: string;
  }): Promise<AIAnalysis[]> {
    const { data } = await api.get('/marketing/ai/analyses', { params: filters });
    return data;
  },

  async optimizeCopy(copyData: {
    content: string;
    platform?: string;
    audience?: string;
    goal?: string;
  }): Promise<AIAnalysis> {
    const { data } = await api.post('/marketing/ai/optimize-copy', copyData);
    return data;
  },

  async generateImage(imageData: {
    prompt: string;
    style?: string;
    size?: string;
  }): Promise<AIAnalysis> {
    const { data } = await api.post('/marketing/ai/generate-image', imageData);
    return data;
  },
};

// ============================================
// EXPORT SERVICE
// ============================================

export const marketingService = {
  ...campaignMethods,
  ...socialPostMethods,
  ...bulkMessageMethods,
  ...landingPageMethods,
  ...aiMethods,
};

export default marketingService;
