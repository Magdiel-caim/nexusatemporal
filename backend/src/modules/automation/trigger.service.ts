import { Pool } from 'pg';
import { Trigger, CreateTriggerDTO, UpdateTriggerDTO } from './trigger.entity';

export class TriggerService {
  constructor(private db: Pool) {}

  async findAll(tenantId: string, filters?: any): Promise<Trigger[]> {
    let query = `
      SELECT * FROM triggers
      WHERE tenant_id = $1
    `;
    const params: any[] = [tenantId];

    if (filters?.is_active !== undefined) {
      params.push(filters.is_active);
      query += ` AND is_active = $${params.length}`;
    }

    if (filters?.event) {
      params.push(filters.event);
      query += ` AND event = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await this.db.query(query, params);
    return result.rows;
  }

  async findById(id: string, tenantId: string): Promise<Trigger | null> {
    const query = `
      SELECT * FROM triggers
      WHERE id = $1 AND tenant_id = $2
    `;
    const result = await this.db.query(query, [id, tenantId]);
    return result.rows[0] || null;
  }

  async create(dto: CreateTriggerDTO, userId: string, tenantId: string): Promise<Trigger> {
    const query = `
      INSERT INTO triggers (
        tenant_id, name, description, event, conditions, actions,
        is_active, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      tenantId,
      dto.name,
      dto.description || null,
      dto.event,
      JSON.stringify(dto.conditions || {}),
      JSON.stringify(dto.actions),
      dto.is_active !== undefined ? dto.is_active : true,
      userId
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async update(id: string, dto: UpdateTriggerDTO, tenantId: string): Promise<Trigger | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (dto.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(dto.name);
    }

    if (dto.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(dto.description);
    }

    if (dto.event !== undefined) {
      fields.push(`event = $${paramCount++}`);
      values.push(dto.event);
    }

    if (dto.conditions !== undefined) {
      fields.push(`conditions = $${paramCount++}`);
      values.push(JSON.stringify(dto.conditions));
    }

    if (dto.actions !== undefined) {
      fields.push(`actions = $${paramCount++}`);
      values.push(JSON.stringify(dto.actions));
    }

    if (dto.is_active !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(dto.is_active);
    }

    if (fields.length === 0) {
      return this.findById(id, tenantId);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id, tenantId);

    const query = `
      UPDATE triggers
      SET ${fields.join(', ')}
      WHERE id = $${paramCount++} AND tenant_id = $${paramCount++}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const query = `
      DELETE FROM triggers
      WHERE id = $1 AND tenant_id = $2
    `;
    const result = await this.db.query(query, [id, tenantId]);
    return (result.rowCount || 0) > 0;
  }

  async toggleActive(id: string, tenantId: string): Promise<Trigger | null> {
    const query = `
      UPDATE triggers
      SET is_active = NOT is_active, updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2
      RETURNING *
    `;
    const result = await this.db.query(query, [id, tenantId]);
    return result.rows[0] || null;
  }

  async getStats(tenantId: string): Promise<any> {
    const query = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true) as active,
        COUNT(*) FILTER (WHERE is_active = false) as inactive,
        SUM(execution_count) as total_executions
      FROM triggers
      WHERE tenant_id = $1
    `;
    const result = await this.db.query(query, [tenantId]);
    return result.rows[0];
  }

  async getEventTypes(tenantId: string): Promise<string[]> {
    const query = `
      SELECT DISTINCT event
      FROM triggers
      WHERE tenant_id = $1
      ORDER BY event
    `;
    const result = await this.db.query(query, [tenantId]);
    return result.rows.map(row => row.event);
  }
}
