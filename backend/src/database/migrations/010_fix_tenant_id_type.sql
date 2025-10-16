-- Fix tenant_id column type in medical records tables
-- Change from UUID to VARCHAR to match system-wide tenant_id usage

BEGIN;

-- medical_records table
ALTER TABLE medical_records 
  ALTER COLUMN tenant_id TYPE VARCHAR(100) USING tenant_id::text;

-- anamnesis table
ALTER TABLE anamnesis 
  ALTER COLUMN tenant_id TYPE VARCHAR(100) USING tenant_id::text;

-- procedure_history table
ALTER TABLE procedure_history 
  ALTER COLUMN tenant_id TYPE VARCHAR(100) USING tenant_id::text;

COMMIT;
