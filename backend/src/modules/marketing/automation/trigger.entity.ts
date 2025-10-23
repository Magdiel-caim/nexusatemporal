export interface Trigger {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  event: string;
  conditions?: Record<string, any>;
  actions: Record<string, any> | Array<Record<string, any>>;
  is_active: boolean;
  execution_count: number;
  last_executed_at?: Date;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTriggerDTO {
  name: string;
  description?: string;
  event: string;
  conditions?: Record<string, any>;
  actions: Record<string, any> | Array<Record<string, any>>;
  is_active?: boolean;
}

export interface UpdateTriggerDTO {
  name?: string;
  description?: string;
  event?: string;
  conditions?: Record<string, any>;
  actions?: Record<string, any> | Array<Record<string, any>>;
  is_active?: boolean;
}
