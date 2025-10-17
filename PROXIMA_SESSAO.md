# 🚀 Próxima Sessão de Desenvolvimento

**Branch:** feature/leads-procedures-config
**Objetivo Original:** Configuração de procedimentos para leads
**Status Atual:** Infraestrutura RBAC completa (v73-v75)

---

## 🎯 Objetivo Principal da Próxima Sessão

### Implementar Sistema de Configuração de Procedimentos

A branch atual `feature/leads-procedures-config` foi criada para implementar o sistema de configuração de procedimentos, que permitirá:

1. Cadastrar procedimentos disponíveis na clínica
2. Definir valores padrão para cada procedimento
3. Associar procedimentos aos leads
4. Calcular automaticamente valor estimado baseado nos procedimentos selecionados

**Por que parou aqui?**
Antes de implementar os procedimentos, foi necessário criar o sistema completo de permissões e gerenciamento de usuários (v73-v75). Agora que isso está pronto, podemos voltar ao objetivo original.

---

## 📋 Tarefas Prioritárias

### 1. Backend - Tabela de Procedimentos

**Criar migration:** `backend/migrations/create_procedures_table.sql`

```sql
-- Tabela de procedimentos
CREATE TABLE procedures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    "defaultPrice" DECIMAL(10,2),
    duration INTEGER, -- em minutos
    active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_procedures_tenant ON procedures("tenantId");
CREATE INDEX idx_procedures_active ON procedures(active);

-- Tabela de relação leads <-> procedures
CREATE TABLE lead_procedures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "leadId" UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    "procedureId" UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    "customPrice" DECIMAL(10,2), -- permite override do preço padrão
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("leadId", "procedureId")
);

CREATE INDEX idx_lead_procedures_lead ON lead_procedures("leadId");
CREATE INDEX idx_lead_procedures_procedure ON lead_procedures("procedureId");

-- Comentários
COMMENT ON TABLE procedures IS 'Procedimentos disponíveis na clínica';
COMMENT ON TABLE lead_procedures IS 'Relação entre leads e procedimentos de interesse';
COMMENT ON COLUMN procedures."defaultPrice" IS 'Preço padrão do procedimento em BRL';
COMMENT ON COLUMN procedures.duration IS 'Duração estimada do procedimento em minutos';
COMMENT ON COLUMN lead_procedures."customPrice" IS 'Preço customizado para este lead (override do padrão)';
```

### 2. Backend - Controller e Routes

**Criar:** `backend/src/modules/procedures/procedures.controller.ts`

```typescript
// Endpoints necessários:
// GET    /api/procedures              - Listar procedimentos (filtrar por tenant)
// POST   /api/procedures              - Criar procedimento
// GET    /api/procedures/:id          - Obter procedimento
// PUT    /api/procedures/:id          - Atualizar procedimento
// DELETE /api/procedures/:id          - Excluir procedimento (soft delete)

// GET    /api/leads/:id/procedures    - Listar procedimentos de um lead
// POST   /api/leads/:id/procedures    - Adicionar procedimento a um lead
// DELETE /api/leads/:leadId/procedures/:procedureId - Remover procedimento do lead
```

**Permissões necessárias:**
```typescript
// Adicionar em backend/src/modules/permissions/permission.types.ts
export enum Permission {
  // ... outras permissões

  // Procedures
  PROCEDURES_VIEW_ALL = 'procedures.view_all',
  PROCEDURES_CREATE = 'procedures.create',
  PROCEDURES_UPDATE = 'procedures.update',
  PROCEDURES_DELETE = 'procedures.delete',
  PROCEDURES_MANAGE_PRICES = 'procedures.manage_prices',
}
```

**Adicionar permissões ao OWNER e ADMIN:**
```sql
-- Executar após criar as permissões
INSERT INTO permissions (name, description, module) VALUES
('procedures.view_all', 'Visualizar todos os procedimentos', 'procedures'),
('procedures.create', 'Criar procedimentos', 'procedures'),
('procedures.update', 'Atualizar procedimentos', 'procedures'),
('procedures.delete', 'Excluir procedimentos', 'procedures'),
('procedures.manage_prices', 'Gerenciar preços dos procedimentos', 'procedures');

-- Atribuir ao OWNER
INSERT INTO role_permissions (role, permission_id)
SELECT 'owner', id FROM permissions WHERE module = 'procedures';

-- Atribuir ao ADMIN
INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', id FROM permissions WHERE module = 'procedures';
```

### 3. Frontend - Interface de Procedimentos

**Criar:** `frontend/src/pages/ProceduresPage.tsx`

Estrutura similar a `UsersManagement.tsx`:
- Lista de procedimentos
- Busca por nome/categoria
- Filtro por categoria
- Cards com: Nome, Categoria, Preço, Duração, Status
- Botões: Novo, Editar, Excluir

**Criar:** `frontend/src/components/procedures/ProcedureFormModal.tsx`

Campos:
- Nome do procedimento*
- Descrição
- Categoria (select: Facial, Corporal, Capilar, Estética, etc.)
- Preço padrão*
- Duração (minutos)
- Status (Ativo/Inativo)

**Criar:** `frontend/src/components/procedures/ProcedureSelector.tsx`

Componente reutilizável para selecionar procedimentos:
- Usado em formulário de leads
- Multi-select com quantidade
- Mostra preço de cada procedimento
- Calcula total automaticamente

### 4. Integração com Leads

**Atualizar:** `frontend/src/components/leads/LeadForm.tsx`

Adicionar seção:
```tsx
<div className="space-y-4">
  <h3>Procedimentos de Interesse</h3>
  <ProcedureSelector
    selectedProcedures={formData.procedures}
    onChange={(procedures) => setFormData({ ...formData, procedures })}
  />
  <div className="text-lg font-bold">
    Valor Estimado Total: R$ {calculateTotal(formData.procedures)}
  </div>
</div>
```

**Atualizar backend:** `backend/src/modules/leads/leads.controller.ts`

- Ao criar/atualizar lead, salvar procedimentos selecionados
- Calcular e armazenar `estimatedValue` automaticamente

### 5. Menu de Navegação

**Atualizar:** `frontend/src/components/Layout.tsx` (ou onde está o menu)

Adicionar item:
```tsx
{
  path: '/procedimentos',
  icon: <Scissors />, // ou outro ícone apropriado
  label: 'Procedimentos',
  permission: Permission.PROCEDURES_VIEW_ALL,
}
```

---

## 🗺️ Roadmap de Implementação

### Sessão 1: Backend Base (2-3 horas)

1. ✅ Ler este documento
2. ⬜ Criar migration `create_procedures_table.sql`
3. ⬜ Executar migration no banco
4. ⬜ Adicionar permissões ao `permission.types.ts`
5. ⬜ Criar `procedures.controller.ts`
6. ⬜ Criar `procedures.routes.ts`
7. ⬜ Registrar rotas no `backend/src/routes/index.ts`
8. ⬜ Testar endpoints via Postman/curl
9. ⬜ Build e deploy backend
10. ⬜ Commit: `feat(backend): Implementa API de procedimentos`

### Sessão 2: Frontend UI (2-3 horas)

1. ⬜ Criar types em `frontend/src/types/procedures.ts`
2. ⬜ Criar `ProceduresPage.tsx`
3. ⬜ Criar `ProcedureFormModal.tsx`
4. ⬜ Criar `DeleteProcedureModal.tsx`
5. ⬜ Adicionar rota em `App.tsx` ou `routes.tsx`
6. ⬜ Adicionar item no menu
7. ⬜ Testar CRUD completo na UI
8. ⬜ Build e deploy frontend
9. ⬜ Commit: `feat(frontend): Implementa interface de procedimentos`

### Sessão 3: Integração com Leads (1-2 horas)

1. ⬜ Criar `ProcedureSelector.tsx`
2. ⬜ Atualizar `LeadForm.tsx`
3. ⬜ Atualizar backend `leads.controller.ts`
4. ⬜ Criar endpoint `GET/POST/DELETE /api/leads/:id/procedures`
5. ⬜ Testar fluxo completo: criar lead → adicionar procedimentos → ver valor total
6. ⬜ Build e deploy
7. ⬜ Commit: `feat: Integra procedimentos aos leads`

### Sessão 4: Finalização (1 hora)

1. ⬜ Adicionar procedimentos padrão via seed (opcional)
2. ⬜ Testar em produção
3. ⬜ Documentar no CHANGELOG.md
4. ⬜ Criar backup do banco
5. ⬜ Merge para main/master (ou criar PR)
6. ⬜ Tag: `v76-procedures-system`
7. ⬜ GitHub Release

---

## 🧪 Scripts de Teste

### Testar API de Procedimentos

```bash
# Login
TOKEN=$(curl -s -X POST https://api.nexusatemporal.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ti.nexus@nexusatemporal.com.br","password":"sua_senha"}' \
  | jq -r '.token')

# Criar procedimento
curl -X POST https://api.nexusatemporal.com.br/api/procedures \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Limpeza de Pele Profunda",
    "description": "Limpeza facial completa com extração",
    "category": "Facial",
    "defaultPrice": 150.00,
    "duration": 60
  }'

# Listar procedimentos
curl -H "Authorization: Bearer $TOKEN" \
  https://api.nexusatemporal.com.br/api/procedures

# Adicionar procedimento a um lead
LEAD_ID="uuid-do-lead"
PROCEDURE_ID="uuid-do-procedimento"

curl -X POST https://api.nexusatemporal.com.br/api/leads/$LEAD_ID/procedures \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "procedureId": "'$PROCEDURE_ID'",
    "quantity": 1,
    "customPrice": 140.00,
    "notes": "Cliente pediu desconto"
  }'
```

---

## 📊 Dados de Exemplo

### Procedimentos Padrão para Seeding

```sql
-- Procedimentos de exemplo (executar após migration)
INSERT INTO procedures ("tenantId", name, description, category, "defaultPrice", duration) VALUES
('default', 'Limpeza de Pele Profunda', 'Limpeza facial completa com extração de cravos', 'Facial', 150.00, 60),
('default', 'Peeling Químico', 'Renovação celular com ácidos', 'Facial', 200.00, 45),
('default', 'Drenagem Linfática', 'Massagem para redução de inchaço', 'Corporal', 120.00, 60),
('default', 'Massagem Modeladora', 'Massagem para redução de medidas', 'Corporal', 140.00, 60),
('default', 'Hidratação Facial', 'Hidratação profunda da pele', 'Facial', 100.00, 45),
('default', 'Depilação a Laser', 'Remoção de pelos com laser', 'Estética', 180.00, 30),
('default', 'Botox', 'Aplicação de toxina botulínica', 'Estética', 800.00, 30),
('default', 'Preenchimento Labial', 'Preenchimento com ácido hialurônico', 'Estética', 1200.00, 45),
('default', 'Microagulhamento', 'Estímulo de colágeno', 'Facial', 250.00, 60),
('default', 'Criolipólise', 'Redução de gordura localizada por congelamento', 'Corporal', 600.00, 90);
```

### Categorias Sugeridas

```typescript
// frontend/src/types/procedures.ts
export enum ProcedureCategory {
  FACIAL = 'Facial',
  CORPORAL = 'Corporal',
  CAPILAR = 'Capilar',
  ESTETICA = 'Estética',
  DEPILACAO = 'Depilação',
  MASSAGEM = 'Massagem',
  OUTROS = 'Outros',
}
```

---

## 🎨 Design da Interface

### ProceduresPage Layout

```
┌─────────────────────────────────────────────────────────┐
│ 🔧 Procedimentos                        [+ Novo]         │
├─────────────────────────────────────────────────────────┤
│ 🔍 [Buscar...] [Categoria ▼] [Status ▼]                │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┬──────────┬─────────┬─────┬─────────┐   │
│ │ Nome        │ Categoria│ Preço   │ Dur.│ Ações   │   │
│ ├─────────────┼──────────┼─────────┼─────┼─────────┤   │
│ │ Limpeza ... │ Facial   │ R$ 150  │ 60m │ ✏️ 🗑️  │   │
│ │ Peeling ... │ Facial   │ R$ 200  │ 45m │ ✏️ 🗑️  │   │
│ │ Drenagem... │ Corporal │ R$ 120  │ 60m │ ✏️ 🗑️  │   │
│ └─────────────┴──────────┴─────────┴─────┴─────────┘   │
├─────────────────────────────────────────────────────────┤
│ 📊 Total: 10 procedimentos | Ativos: 9                  │
└─────────────────────────────────────────────────────────┘
```

### ProcedureSelector in LeadForm

```
┌─────────────────────────────────────────────────┐
│ Procedimentos de Interesse                      │
├─────────────────────────────────────────────────┤
│ [+ Adicionar Procedimento]                      │
│                                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ ✓ Limpeza de Pele Profunda                  │ │
│ │   Qtd: [1] | Preço: R$ 150,00      [Remover]│ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ ✓ Botox                                      │ │
│ │   Qtd: [1] | Preço: R$ 800,00      [Remover]│ │
│ └─────────────────────────────────────────────┘ │
│                                                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 💰 Valor Estimado Total: R$ 950,00              │
└─────────────────────────────────────────────────┘
```

---

## ⚠️ Pontos de Atenção

### 1. Multi-tenancy
- Sempre filtrar procedimentos por `tenantId`
- Não permitir que um tenant veja procedimentos de outro
- Validar `tenantId` no backend em todas as operações

### 2. Cálculo de Valor Estimado
- Permitir override de preço por lead
- Multiplicar por quantidade
- Armazenar no campo `leads.estimatedValue`
- Recalcular quando procedimentos são adicionados/removidos

### 3. Soft Delete
- Não deletar procedimentos do banco
- Marcar como `active: false`
- Manter histórico de leads que usaram procedimentos deletados

### 4. Performance
- Criar índices nas tabelas
- Usar joins eficientes em queries
- Paginar lista de procedimentos se houver muitos

### 5. Validações
- Preço não pode ser negativo
- Duração não pode ser negativa
- Nome é obrigatório
- Categoria deve ser de uma lista pré-definida

---

## 📞 Perguntas para o Usuário (se necessário)

Durante a implementação, você pode precisar perguntar:

1. **Quais categorias de procedimentos usar?**
   - Usar lista sugerida acima ou customizar?

2. **Permitir múltiplos procedimentos do mesmo tipo em um lead?**
   - Ex: 3x Limpeza de Pele

3. **Como calcular desconto?**
   - Desconto por procedimento individual?
   - Desconto no total?
   - Ambos?

4. **Histórico de preços?**
   - Manter histórico de alterações de preço?
   - Ou apenas usar preço atual?

5. **Procedimentos obrigatórios?**
   - Todo lead deve ter ao menos 1 procedimento?
   - Ou é opcional?

---

## ✅ Checklist de Conclusão

Ao finalizar a implementação, verificar:

- [ ] Migration executada com sucesso
- [ ] Permissões criadas e atribuídas
- [ ] API de procedimentos funcionando
- [ ] UI de procedimentos acessível
- [ ] CRUD de procedimentos completo
- [ ] Integração com leads funcionando
- [ ] Cálculo de valor estimado correto
- [ ] Multi-tenancy funcionando
- [ ] Testes manuais passando
- [ ] Backend deployado
- [ ] Frontend deployado
- [ ] Backup do banco criado
- [ ] Commit e push realizados
- [ ] Tag criada
- [ ] Release no GitHub
- [ ] CHANGELOG atualizado
- [ ] Documentação atualizada

---

## 🔗 Links Rápidos

**Documentação de referência:**
- SESSAO_CHECKPOINT.md - Estado atual completo
- /root/nexusatemporal/prompt/Especificacoesdosistema.pdf

**Exemplos de código:**
- UsersManagement: `frontend/src/components/users/UsersManagement.tsx`
- UserFormModal: `frontend/src/components/users/UserFormModal.tsx`
- Users Controller: `backend/src/modules/users/users.controller.ts`
- Permissions Migration: `backend/migrations/create_permissions_system.sql`

---

**📅 Última atualização:** 2025-10-17 10:45
**🎯 Foco:** Sistema de Procedimentos (branch feature/leads-procedures-config)
**🚀 Pronto para começar!**
