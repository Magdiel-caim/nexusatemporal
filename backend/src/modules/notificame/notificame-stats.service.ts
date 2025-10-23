import { getAutomationDbPool } from '@/modules/marketing/automation/database';

export interface NotificaMeStats {
  totalChannels: number;
  activeChannels: number;
  messagesSent: number;
  messagesReceived: number;
  messagesLast24h: number;
  messagesLast7d: number;
  messagesLast30d: number;
  averageResponseTime: number; // em minutos
  leadsSources: {
    instagram: number;
    messenger: number;
    facebook: number;
  };
  messagesByStatus: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };
  topChannels: Array<{
    channelId: string;
    channelName: string;
    channelType: string;
    messageCount: number;
  }>;
}

export class NotificaMeStatsService {
  /**
   * Obtém estatísticas completas do Notifica.me para um tenant
   */
  async getStats(tenantId: string): Promise<NotificaMeStats> {
    const db = getAutomationDbPool();

    // 1. Total e canais ativos
    const channelsQuery = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true) as active
      FROM notificame_channels
      WHERE tenant_id = $1
    `;

    const channelsResult = await db.query(channelsQuery, [tenantId]);
    const { total, active } = channelsResult.rows[0];

    // 2. Mensagens enviadas e recebidas
    const messagesQuery = `
      SELECT
        COUNT(*) FILTER (WHERE direction = 'outbound') as sent,
        COUNT(*) FILTER (WHERE direction = 'inbound') as received,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7d,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as last_30d
      FROM notificame_messages
      WHERE tenant_id = $1
    `;

    const messagesResult = await db.query(messagesQuery, [tenantId]);
    const { sent, received, last_24h, last_7d, last_30d } = messagesResult.rows[0];

    // 3. Mensagens por status
    const statusQuery = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'sent') as sent_status,
        COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
        COUNT(*) FILTER (WHERE status = 'read') as read_status,
        COUNT(*) FILTER (WHERE status = 'failed') as failed
      FROM notificame_messages
      WHERE tenant_id = $1
      AND direction = 'outbound'
      AND created_at > NOW() - INTERVAL '30 days'
    `;

    const statusResult = await db.query(statusQuery, [tenantId]);
    const { sent_status, delivered, read_status, failed } = statusResult.rows[0];

    // 4. Leads por fonte
    const leadsQuery = `
      SELECT
        COUNT(*) FILTER (WHERE source = 'instagram') as instagram,
        COUNT(*) FILTER (WHERE source = 'messenger') as messenger,
        COUNT(*) FILTER (WHERE source = 'facebook') as facebook
      FROM leads
      WHERE "tenantId" = $1
      AND source IN ('instagram', 'messenger', 'facebook')
      AND "createdAt" > NOW() - INTERVAL '30 days'
    `;

    const leadsResult = await db.query(leadsQuery, [tenantId]);
    const leadsSources = leadsResult.rows[0];

    // 5. Tempo médio de resposta (em minutos)
    // Calculando o tempo entre mensagem recebida e primeira resposta
    const responseTimeQuery = `
      SELECT
        AVG(
          EXTRACT(EPOCH FROM (
            SELECT MIN(m2.created_at)
            FROM notificame_messages m2
            WHERE m2.channel_id = m1.channel_id
            AND m2.from_user = m1.to_user
            AND m2.to_user = m1.from_user
            AND m2.direction = 'outbound'
            AND m2.created_at > m1.created_at
            LIMIT 1
          ) - m1.created_at) / 60
        ) as avg_response_time_minutes
      FROM notificame_messages m1
      WHERE m1.tenant_id = $1
      AND m1.direction = 'inbound'
      AND m1.created_at > NOW() - INTERVAL '7 days'
    `;

    const responseTimeResult = await db.query(responseTimeQuery, [tenantId]);
    const averageResponseTime = parseFloat(responseTimeResult.rows[0]?.avg_response_time_minutes || '0');

    // 6. Top canais por mensagens
    const topChannelsQuery = `
      SELECT
        nc.channel_id,
        nc.channel_name,
        nc.channel_type,
        COUNT(nm.id) as message_count
      FROM notificame_channels nc
      LEFT JOIN notificame_messages nm ON nm.channel_id = nc.id
      WHERE nc.tenant_id = $1
      AND nm.created_at > NOW() - INTERVAL '30 days'
      GROUP BY nc.id, nc.channel_id, nc.channel_name, nc.channel_type
      ORDER BY message_count DESC
      LIMIT 5
    `;

    const topChannelsResult = await db.query(topChannelsQuery, [tenantId]);
    const topChannels = topChannelsResult.rows.map(row => ({
      channelId: row.channel_id,
      channelName: row.channel_name,
      channelType: row.channel_type,
      messageCount: parseInt(row.message_count, 10)
    }));

    return {
      totalChannels: parseInt(total, 10),
      activeChannels: parseInt(active, 10),
      messagesSent: parseInt(sent, 10),
      messagesReceived: parseInt(received, 10),
      messagesLast24h: parseInt(last_24h, 10),
      messagesLast7d: parseInt(last_7d, 10),
      messagesLast30d: parseInt(last_30d, 10),
      averageResponseTime: Math.round(averageResponseTime),
      leadsSources: {
        instagram: parseInt(leadsSources.instagram, 10),
        messenger: parseInt(leadsSources.messenger, 10),
        facebook: parseInt(leadsSources.facebook, 10)
      },
      messagesByStatus: {
        sent: parseInt(sent_status, 10),
        delivered: parseInt(delivered, 10),
        read: parseInt(read_status, 10),
        failed: parseInt(failed, 10)
      },
      topChannels
    };
  }

  /**
   * Obtém estatísticas simplificadas para o dashboard principal
   */
  async getDashboardStats(tenantId: string): Promise<{
    activeChannels: number;
    messagesLast24h: number;
    messagesLast7d: number;
    newLeads: number;
  }> {
    const db = getAutomationDbPool();

    const query = `
      SELECT
        (SELECT COUNT(*) FROM notificame_channels WHERE tenant_id = $1 AND is_active = true) as active_channels,
        (SELECT COUNT(*) FROM notificame_messages WHERE tenant_id = $1 AND created_at > NOW() - INTERVAL '24 hours') as messages_24h,
        (SELECT COUNT(*) FROM notificame_messages WHERE tenant_id = $1 AND created_at > NOW() - INTERVAL '7 days') as messages_7d,
        (SELECT COUNT(*) FROM leads WHERE "tenantId" = $1 AND source IN ('instagram','messenger','facebook') AND "createdAt" > NOW() - INTERVAL '7 days') as new_leads
    `;

    const result = await db.query(query, [tenantId]);
    const row = result.rows[0];

    return {
      activeChannels: parseInt(row.active_channels, 10),
      messagesLast24h: parseInt(row.messages_24h, 10),
      messagesLast7d: parseInt(row.messages_7d, 10),
      newLeads: parseInt(row.new_leads, 10)
    };
  }

  /**
   * Obtém histórico de mensagens para gráfico (últimos 30 dias)
   */
  async getMessageHistory(tenantId: string, days: number = 30): Promise<Array<{
    date: string;
    sent: number;
    received: number;
  }>> {
    const db = getAutomationDbPool();

    const query = `
      SELECT
        DATE(created_at) as date,
        COUNT(*) FILTER (WHERE direction = 'outbound') as sent,
        COUNT(*) FILTER (WHERE direction = 'inbound') as received
      FROM notificame_messages
      WHERE tenant_id = $1
      AND created_at > NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    const result = await db.query(query, [tenantId]);

    return result.rows.map(row => ({
      date: row.date,
      sent: parseInt(row.sent, 10),
      received: parseInt(row.received, 10)
    }));
  }
}

export default new NotificaMeStatsService();
