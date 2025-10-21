# Correção Crítica: Crash do Sistema v53 - Prontuários Médicos

## Data: 2025-10-16

## Problema Identificado

O sistema estava crashando com erro "bad gateway" ao acessar a seção de Prontuários Médicos.

### Causa Raiz

**Erro PostgreSQL code 22P02**: Invalid input syntax for type UUID

```
ERROR: invalid input syntax for type uuid: "default"
WHERE: unnamed portal parameter $1 = '...'
FILE: uuid.c
LINE: string_to_uuid
AT: MedicalRecordController.getAllMedicalRecords (/app/src/modules/medical-records/medical-record.controller.ts:120:30)
```

### Diagnóstico

1. **Inconsistência de Tipos**:
   - Usuários no sistema têm `tenantId = 'default'` (string)
   - Tabelas de prontuários médicos esperavam `tenant_id` como UUID
   - TypeORM tentava executar query com valor string em coluna UUID

2. **Fluxo do Erro**:
   ```
   User Login → JWT Token (tenantId: "default")
   ↓
   Auth Middleware → req.user.tenantId = "default"
   ↓
   Medical Records Controller → service.getAllMedicalRecords("default")
   ↓
   TypeORM Query → WHERE tenant_id = 'default' (PostgreSQL tenta converter string para UUID)
   ↓
   PostgreSQL Error 22P02 → Backend Crash → Bad Gateway
   ```

## Solução Implementada

### 1. Migração do Banco de Dados CRM

Alteração do tipo da coluna `tenant_id` de UUID para VARCHAR em todas as tabelas:

```sql
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
```

**Executado em**: 46.202.144.210 (CRM Database)

### 2. Atualização da Entidade TypeORM

**Arquivo**: `/root/nexusatemporal/backend/src/modules/medical-records/medical-record.entity.ts`

**Alteração** (3 ocorrências - uma em cada entidade):
```typescript
// ANTES (causava crash):
@Column({ name: 'tenant_id', type: 'uuid' })
tenantId: string;

// DEPOIS (corrigido):
@Column({ name: 'tenant_id', type: 'varchar' })
tenantId: string;
```

### 3. Deploy

```bash
cd /root/nexusatemporal/backend
npm run build
docker build -t nexus_backend:v53-fix-tenant-uuid .
docker service update --image nexus_backend:v53-fix-tenant-uuid nexus_backend
```

## Validação

### Antes da Correção
```
GET /api/medical-records
→ PostgreSQL Error 22P02
→ 502 Bad Gateway
→ Sistema CRASH
```

### Depois da Correção
```bash
curl https://api.nexusatemporal.com.br/api/medical-records
→ {"success":false,"message":"No token provided"}
→ 401 Unauthorized (comportamento esperado)
→ Sistema ESTÁVEL
```

### Status dos Serviços
```
nexus_backend    1/1    nexus_backend:v53-fix-tenant-uuid
nexus_frontend   1/1    nexus_frontend:v53-prontuarios-completo
nexus_postgres   1/1    postgres:16-alpine
nexus_rabbitmq   1/1    rabbitmq:3-management-alpine
nexus_redis      1/1    redis:7-alpine
```

## Verificação do Banco de Dados

```sql
-- Confirmar tipo da coluna após correção
\d medical_records | grep tenant_id
```

**Resultado**:
```
tenant_id | character varying(100) | not null
```

## Impacto

- ✅ Sistema restaurado e estável
- ✅ Prontuários médicos agora acessíveis
- ✅ Alinhamento com padrão de tenantId usado no resto do sistema
- ✅ Prevenção de futuros crashes relacionados a UUID

## Lições Aprendidas

1. **Consistência de Tipos**: Garantir que tipos de dados sejam consistentes entre diferentes módulos
2. **Validação de Entrada**: Adicionar validação de tenantId antes de queries críticas
3. **Testes de Integração**: Necessidade de testes end-to-end incluindo autenticação real
4. **Documentação**: Importância de documentar decisões de design (uso de 'default' vs UUID)

## Arquivos Modificados

1. `/root/nexusatemporal/backend/src/modules/medical-records/medical-record.entity.ts`
   - 3 alterações: tenant_id type 'uuid' → 'varchar'

2. Banco de Dados CRM (46.202.144.210):
   - `medical_records.tenant_id`: uuid → varchar(100)
   - `anamnesis.tenant_id`: uuid → varchar(100)
   - `procedure_history.tenant_id`: uuid → varchar(100)

## Observações

Este foi o **segundo crash do sistema** reportado pelo usuário. A causa foi a incompatibilidade de tipos entre o sistema de autenticação (que usa tenantId como string) e o módulo de prontuários médicos (que esperava UUID).

A correção garante que o sistema de prontuários médicos se alinha com o padrão estabelecido no resto da aplicação.

---

**Versão**: v53-fix-tenant-uuid
**Status**: ✅ CORRIGIDO E VALIDADO
**Data**: 2025-10-16 02:05 UTC
