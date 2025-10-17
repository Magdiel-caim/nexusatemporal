export interface Workflow {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  workflow_type: 'n8n' | 'custom' | 'template';
  n8n_workflow_id?: string;
  config: Record<string, any>;
  is_active: boolean;
  execution_count: number;
  last_executed_at?: Date;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateWorkflowDTO {
  name: string;
  description?: string;
  workflow_type: 'n8n' | 'custom' | 'template';
  n8n_workflow_id?: string;
  config?: Record<string, any>;
  is_active?: boolean;
}

export interface UpdateWorkflowDTO {
  name?: string;
  description?: string;
  workflow_type?: 'n8n' | 'custom' | 'template';
  n8n_workflow_id?: string;
  config?: Record<string, any>;
  is_active?: boolean;
}

export interface ExecuteWorkflowDTO {
  workflow_id: string;
  input_data: Record<string, any>;
}
