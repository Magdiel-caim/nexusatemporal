import { Pool } from 'pg';
import { Workflow, CreateWorkflowDTO, UpdateWorkflowDTO, ExecuteWorkflowDTO } from './workflow.entity';

export class WorkflowService {
  constructor(private db: Pool) {}

  async findAll(tenantId: string, filters?: any): Promise<Workflow[]> {
    let query = `
      SELECT * FROM workflows
      WHERE tenant_id = $1
    `;
    const params: any[] = [tenantId];

    if (filters?.is_active !== undefined) {
      params.push(filters.is_active);
      query += ` AND is_active = $${params.length}`;
    }

    if (filters?.workflow_type) {
      params.push(filters.workflow_type);
      query += ` AND workflow_type = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await this.db.query(query, params);
    return result.rows;
  }

  async findById(id: string, tenantId: string): Promise<Workflow | null> {
    const query = `
      SELECT * FROM workflows
      WHERE id = $1 AND tenant_id = $2
    `;
    const result = await this.db.query(query, [id, tenantId]);
    return result.rows[0] || null;
  }

  async create(dto: CreateWorkflowDTO, userId: string, tenantId: string): Promise<Workflow> {
    const query = `
      INSERT INTO workflows (
        tenant_id, name, description, workflow_type, n8n_workflow_id,
        config, is_active, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      tenantId,
      dto.name,
      dto.description || null,
      dto.workflow_type,
      dto.n8n_workflow_id || null,
      JSON.stringify(dto.config || {}),
      dto.is_active !== undefined ? dto.is_active : true,
      userId
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async update(id: string, dto: UpdateWorkflowDTO, tenantId: string): Promise<Workflow | null> {
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

    if (dto.workflow_type !== undefined) {
      fields.push(`workflow_type = $${paramCount++}`);
      values.push(dto.workflow_type);
    }

    if (dto.n8n_workflow_id !== undefined) {
      fields.push(`n8n_workflow_id = $${paramCount++}`);
      values.push(dto.n8n_workflow_id);
    }

    if (dto.config !== undefined) {
      fields.push(`config = $${paramCount++}`);
      values.push(JSON.stringify(dto.config));
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
      UPDATE workflows
      SET ${fields.join(', ')}
      WHERE id = $${paramCount++} AND tenant_id = $${paramCount++}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const query = `
      DELETE FROM workflows
      WHERE id = $1 AND tenant_id = $2
    `;
    const result = await this.db.query(query, [id, tenantId]);
    return (result.rowCount || 0) > 0;
  }

  async execute(dto: ExecuteWorkflowDTO, tenantId: string): Promise<any> {
    const workflow = await this.findById(dto.workflow_id, tenantId);

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    if (!workflow.is_active) {
      throw new Error('Workflow is not active');
    }

    // Log execution start
    const logQuery = `
      INSERT INTO workflow_logs (
        workflow_id, tenant_id, status, input, started_at
      ) VALUES ($1, $2, $3, $4, NOW())
      RETURNING id
    `;

    const logResult = await this.db.query(logQuery, [
      dto.workflow_id,
      tenantId,
      'running',
      JSON.stringify(dto.input_data)
    ]);

    const executionId = logResult.rows[0].id;

    try {
      // TODO: Execute based on workflow type
      let result;

      switch (workflow.workflow_type) {
        case 'n8n':
          // TODO: Call N8nService
          result = { message: 'N8n execution not implemented yet', executionId };
          break;
        case 'custom':
          // TODO: Execute custom workflow
          result = { message: 'Custom workflow execution not implemented yet', executionId };
          break;
        case 'template':
          // TODO: Execute template workflow
          result = { message: 'Template workflow execution not implemented yet', executionId };
          break;
        default:
          throw new Error(`Unknown workflow type: ${workflow.workflow_type}`);
      }

      // Update execution log - success
      await this.db.query(`
        UPDATE workflow_logs
        SET status = $1, output = $2, completed_at = NOW(),
            duration_ms = EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000
        WHERE id = $3
      `, ['success', JSON.stringify(result), executionId]);

      // Update workflow execution count
      await this.db.query(`
        UPDATE workflows
        SET execution_count = execution_count + 1,
            last_executed_at = NOW()
        WHERE id = $1
      `, [dto.workflow_id]);

      return {
        success: true,
        executionId,
        result
      };

    } catch (error: any) {
      // Update execution log - error
      await this.db.query(`
        UPDATE workflow_logs
        SET status = $1, error = $2, completed_at = NOW(),
            duration_ms = EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000
        WHERE id = $3
      `, ['error', error.message, executionId]);

      throw error;
    }
  }

  async getExecutionLogs(workflowId: string, tenantId: string, limit = 50): Promise<any[]> {
    const query = `
      SELECT * FROM workflow_logs
      WHERE workflow_id = $1 AND tenant_id = $2
      ORDER BY started_at DESC
      LIMIT $3
    `;
    const result = await this.db.query(query, [workflowId, tenantId, limit]);
    return result.rows;
  }

  async getStats(tenantId: string): Promise<any> {
    const query = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true) as active,
        COUNT(*) FILTER (WHERE is_active = false) as inactive,
        SUM(execution_count) as total_executions,
        COUNT(*) FILTER (WHERE workflow_type = 'n8n') as n8n_workflows,
        COUNT(*) FILTER (WHERE workflow_type = 'custom') as custom_workflows,
        COUNT(*) FILTER (WHERE workflow_type = 'template') as template_workflows
      FROM workflows
      WHERE tenant_id = $1
    `;
    const result = await this.db.query(query, [tenantId]);
    return result.rows[0];
  }
}
