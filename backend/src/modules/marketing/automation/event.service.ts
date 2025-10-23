import { Pool } from 'pg';
import { AutomationEvent, EventStats, QueryEventsDTO } from './event.entity';

export class EventService {
  constructor(private db: Pool) {}

  /**
   * Registra um novo evento no sistema
   */
  async logEvent(
    tenantId: string,
    eventType: string,
    entityType: string,
    entityId: string,
    payload: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<AutomationEvent> {
    const query = `
      INSERT INTO automation_events (
        tenant_id, event_name, entity_type, entity_id,
        event_data, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      tenantId,
      eventType,
      entityType,
      entityId,
      JSON.stringify(payload),
      metadata ? JSON.stringify(metadata) : null
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  /**
   * Lista eventos com filtros
   */
  async findAll(dto: QueryEventsDTO): Promise<{ events: AutomationEvent[]; total: number }> {
    let query = `
      SELECT * FROM automation_events
      WHERE tenant_id = $1
    `;
    const params: any[] = [dto.tenant_id];
    let paramCount = 1;

    // Filtro por tipo de evento
    if (dto.event_type) {
      params.push(dto.event_type);
      query += ` AND event_name = $${++paramCount}`;
    }

    // Filtro por tipo de entidade
    if (dto.entity_type) {
      params.push(dto.entity_type);
      query += ` AND entity_type = $${++paramCount}`;
    }

    // Filtro por ID da entidade
    if (dto.entity_id) {
      params.push(dto.entity_id);
      query += ` AND entity_id = $${++paramCount}`;
    }

    // Filtro por data inicial
    if (dto.start_date) {
      params.push(dto.start_date);
      query += ` AND triggered_at >= $${++paramCount}`;
    }

    // Filtro por data final
    if (dto.end_date) {
      params.push(dto.end_date);
      query += ` AND triggered_at <= $${++paramCount}`;
    }

    // Total de registros
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await this.db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Ordenação e paginação
    query += ` ORDER BY triggered_at DESC`;

    if (dto.limit) {
      params.push(dto.limit);
      query += ` LIMIT $${++paramCount}`;
    }

    if (dto.offset) {
      params.push(dto.offset);
      query += ` OFFSET $${++paramCount}`;
    }

    const result = await this.db.query(query, params);

    return {
      events: result.rows,
      total
    };
  }

  /**
   * Busca evento por ID
   */
  async findById(id: string, tenantId: string): Promise<AutomationEvent | null> {
    const query = `
      SELECT * FROM automation_events
      WHERE id = $1 AND tenant_id = $2
    `;
    const result = await this.db.query(query, [id, tenantId]);
    return result.rows[0] || null;
  }

  /**
   * Obtém estatísticas de eventos
   */
  async getStats(
    tenantId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<EventStats> {
    let query = `
      SELECT
        COUNT(*) as total_events,
        COUNT(CASE WHEN processed = true THEN 1 END) as processed_events,
        COUNT(CASE WHEN processed = false THEN 1 END) as pending_events
      FROM automation_events
      WHERE tenant_id = $1
    `;
    const params: any[] = [tenantId];
    let paramCount = 1;

    if (startDate) {
      params.push(startDate);
      query += ` AND triggered_at >= $${++paramCount}`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND triggered_at <= $${++paramCount}`;
    }

    const result = await this.db.query(query, params);
    const totals = result.rows[0];

    // Eventos por tipo
    let typeQuery = `
      SELECT event_name, COUNT(*) as count
      FROM automation_events
      WHERE tenant_id = $1
    `;
    const typeParams: any[] = [tenantId];
    let typeParamCount = 1;

    if (startDate) {
      typeParams.push(startDate);
      typeQuery += ` AND triggered_at >= $${++typeParamCount}`;
    }

    if (endDate) {
      typeParams.push(endDate);
      typeQuery += ` AND triggered_at <= $${++typeParamCount}`;
    }

    typeQuery += ` GROUP BY event_name`;
    const typeResult = await this.db.query(typeQuery, typeParams);

    const eventsByType: Record<string, number> = {};
    typeResult.rows.forEach(row => {
      eventsByType[row.event_name] = parseInt(row.count);
    });

    // Eventos por entidade
    let entityQuery = `
      SELECT entity_type, COUNT(*) as count
      FROM automation_events
      WHERE tenant_id = $1
    `;
    const entityParams: any[] = [tenantId];
    let entityParamCount = 1;

    if (startDate) {
      entityParams.push(startDate);
      entityQuery += ` AND triggered_at >= $${++entityParamCount}`;
    }

    if (endDate) {
      entityParams.push(endDate);
      entityQuery += ` AND triggered_at <= $${++entityParamCount}`;
    }

    entityQuery += ` GROUP BY entity_type`;
    const entityResult = await this.db.query(entityQuery, entityParams);

    const eventsByEntity: Record<string, number> = {};
    entityResult.rows.forEach(row => {
      eventsByEntity[row.entity_type] = parseInt(row.count);
    });

    // Taxa de sucesso (baseado em eventos processados)
    const successRate = totals.total_events > 0
      ? (parseInt(totals.processed_events) / parseInt(totals.total_events)) * 100
      : 0;

    return {
      total_events: parseInt(totals.total_events),
      events_by_type: eventsByType,
      events_by_entity: eventsByEntity,
      triggers_executed: 0, // TODO: Implementar contagem real de triggers
      workflows_executed: 0, // TODO: Implementar contagem real de workflows
      success_rate: Math.round(successRate * 100) / 100,
      processed: parseInt(totals.processed_events) || 0,
      pending: parseInt(totals.pending_events) || 0,
      period: {
        start: startDate || new Date(0),
        end: endDate || new Date()
      }
    };
  }

  /**
   * Lista tipos de eventos disponíveis
   */
  async getEventTypes(tenantId: string): Promise<string[]> {
    const query = `
      SELECT DISTINCT event_name
      FROM automation_events
      WHERE tenant_id = $1
      ORDER BY event_name
    `;
    const result = await this.db.query(query, [tenantId]);
    return result.rows.map(row => row.event_name);
  }

  /**
   * Atualiza contadores de execução de um evento
   */
  async updateExecutionCounters(
    eventId: string,
    triggersExecuted: number,
    workflowsExecuted: number
  ): Promise<void> {
    const query = `
      UPDATE automation_events
      SET
        triggers_executed = triggers_executed + $1,
        workflows_executed = workflows_executed + $2,
        processed_at = NOW()
      WHERE id = $3
    `;
    await this.db.query(query, [triggersExecuted, workflowsExecuted, eventId]);
  }

  /**
   * Deleta eventos antigos (limpeza)
   */
  async deleteOldEvents(tenantId: string, daysToKeep: number = 90): Promise<number> {
    const query = `
      DELETE FROM automation_events
      WHERE tenant_id = $1
        AND triggered_at < NOW() - INTERVAL '${daysToKeep} days'
    `;
    const result = await this.db.query(query, [tenantId]);
    return result.rowCount || 0;
  }
}
