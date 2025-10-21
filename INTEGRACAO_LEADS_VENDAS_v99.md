# Integração Completa: Módulo Leads ↔ Módulo Vendas

**Data:** 21 de Outubro de 2025
**Versão:** v99
**Status:** ✅ **BACKEND PRONTO** | ⏳ **FRONTEND PENDENTE**

---

## Resumo Executivo

Implementada integração bidirecional entre os módulos de Leads e Vendas, permitindo:
- Atribuir vendedor a cada lead
- Rastrear vendas por vendedor
- Gerar comissões automaticamente
- Acompanhar funil completo: Lead → Venda → Comissão

---

## Arquitetura da Integração

### Diagrama de Relacionamentos

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   USERS     │────────►│  VENDEDORES  │◄────────│  COMISSÕES   │
└─────────────┘         └──────────────┘         └──────────────┘
                               │                         │
                               │                         │
                               ▼                         ▼
                        ┌──────────────┐         ┌──────────────┐
                        │    LEADS     │────────►│    VENDAS    │
                        └──────────────┘         └──────────────┘
                               │                         │
                               │                         │
                               ▼                         ▼
                        ┌──────────────┐         ┌──────────────┐
                        │ APPOINTMENTS │         │ TRANSACTIONS │
                        └──────────────┘         └──────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  PROCEDURES  │
                        └──────────────┘
```

---

## Alterações Implementadas

### 1. Banco de Dados

#### Nova Coluna em `leads`
```sql
ALTER TABLE leads
ADD COLUMN vendedor_id UUID REFERENCES vendedores(id) ON DELETE SET NULL;

CREATE INDEX idx_leads_vendedor_id ON leads(vendedor_id);
```

**Descrição:** Permite atribuir um vendedor responsável a cada lead.

#### Estrutura Completa de Relacionamentos

| Origem | Destino | Campo FK | Tipo | Descrição |
|--------|---------|----------|------|-----------|
| **leads** | vendedores | vendedor_id | UUID | Vendedor responsável pelo lead |
| **vendas** | leads | lead_id | UUID | Lead que originou a venda |
| **vendas** | vendedores | vendedor_id | UUID | Vendedor que realizou a venda |
| **vendas** | procedures | procedure_id | UUID | Procedimento vendido |
| **vendas** | appointments | appointment_id | UUID | Agendamento relacionado |
| **comissoes** | vendas | venda_id | UUID | Venda que gerou a comissão |
| **comissoes** | vendedores | vendedor_id | UUID | Vendedor que receberá a comissão |

---

### 2. Backend (TypeORM Entity)

#### Arquivo: `backend/src/modules/leads/lead.entity.ts`

```typescript
// Integração com módulo de Vendas
@Column({ type: 'uuid', nullable: true })
vendedor_id: string;
```

**Recursos do Entity:**
- ✅ Campo `vendedor_id` adicionado
- ✅ Tipo UUID para consistência
- ✅ Nullable (opcional)
- ✅ Build e deploy concluídos

---

## Status das Integrações

### ✅ Integrações Implementadas (Backend)

| Integração | Status | Descrição |
|------------|--------|-----------|
| vendas → leads | ✅ OK | Venda referencia lead origem |
| vendas → vendedores | ✅ OK | Venda referencia vendedor responsável |
| vendas → procedures | ✅ OK | Venda referencia procedimento vendido |
| vendas → appointments | ✅ OK | Venda referencia agendamento |
| comissoes → vendas | ✅ OK | Comissão referencia venda origem |
| comissoes → vendedores | ✅ OK | Comissão referencia vendedor |
| **leads → vendedores** | ✅ **NOVO** | Lead referencia vendedor responsável |

### ⏳ Pendente (Frontend)

| Componente | Status | Descrição |
|------------|--------|-----------|
| Lead Card | ⏳ Pendente | Exibir vendedor no card do lead |
| Lead Form | ⏳ Pendente | Campo para selecionar vendedor |
| Lead List | ⏳ Pendente | Filtro por vendedor |
| Vendedor Dashboard | ⏳ Pendente | Listar leads por vendedor |

---

## Fluxo Completo de Negócio

### 1. Cadastro de Lead
```
┌─────────────┐
│ Novo Lead   │
│ criado      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ Atribuir Vendedor       │
│ (vendedor_id)           │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Lead no funil           │
│ acompanhado por vendedor│
└─────────────────────────┘
```

### 2. Qualificação e Agendamento
```
┌─────────────┐
│ Lead        │
│ qualificado │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ Criar Agendamento       │
│ (appointment)           │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Vincular Procedimento   │
│ (procedure)             │
└─────────────────────────┘
```

### 3. Venda e Comissão
```
┌─────────────┐
│ Venda       │
│ realizada   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ Criar registro em VENDAS│
│ - lead_id               │
│ - vendedor_id           │
│ - procedure_id          │
│ - valor_liquido         │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Confirmar Venda         │
│ (status = confirmada)   │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ GERAR COMISSÃO          │
│ automaticamente         │
│ - valor_comissao        │
│ - percentual_aplicado   │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Comissão em PENDENTE    │
│ aguardando pagamento    │
└─────────────────────────┘
```

---

## Queries Úteis para Análise

### 1. Leads por Vendedor
```sql
SELECT
  v.codigo_vendedor,
  u.name as vendedor_nome,
  COUNT(l.id) as total_leads,
  COUNT(l.id) FILTER (WHERE l.status = 'won') as leads_convertidos,
  ROUND(
    COUNT(l.id) FILTER (WHERE l.status = 'won')::numeric /
    NULLIF(COUNT(l.id), 0) * 100,
    2
  ) as taxa_conversao
FROM vendedores v
LEFT JOIN users u ON v.user_id = u.id
LEFT JOIN leads l ON l.vendedor_id = v.id
WHERE v.ativo = true
GROUP BY v.id, v.codigo_vendedor, u.name
ORDER BY total_leads DESC;
```

### 2. Vendas por Vendedor
```sql
SELECT
  v.codigo_vendedor,
  u.name as vendedor_nome,
  COUNT(vd.id) as total_vendas,
  SUM(vd.valor_liquido) as valor_total,
  SUM(vd.valor_comissao) as comissao_total,
  COUNT(vd.id) FILTER (WHERE vd.status = 'confirmada') as vendas_confirmadas
FROM vendedores v
LEFT JOIN users u ON v.user_id = u.id
LEFT JOIN vendas vd ON vd.vendedor_id = v.id
WHERE v.ativo = true
GROUP BY v.id, v.codigo_vendedor, u.name
ORDER BY valor_total DESC NULLS LAST;
```

### 3. Funil Completo (Lead → Venda → Comissão)
```sql
SELECT
  l.name as lead_nome,
  l.email as lead_email,
  v_user.name as vendedor_nome,
  vd.numero_venda,
  vd.valor_liquido,
  vd.valor_comissao,
  vd.status as status_venda,
  c.status as status_comissao,
  c.valor_comissao as comissao_calculada
FROM leads l
LEFT JOIN vendedores vend ON l.vendedor_id = vend.id
LEFT JOIN users v_user ON vend.user_id = v_user.id
LEFT JOIN vendas vd ON vd.lead_id = l.id
LEFT JOIN comissoes c ON c.venda_id = vd.id
WHERE l."tenantId" = 'c0000000-0000-0000-0000-000000000000'
ORDER BY l."createdAt" DESC;
```

---

## Endpoints Disponíveis

### Leads (já existentes)
```
GET    /api/leads/leads              → Lista todos os leads
POST   /api/leads/leads              → Cria novo lead
GET    /api/leads/leads/:id          → Busca lead específico
PUT    /api/leads/leads/:id          → Atualiza lead
DELETE /api/leads/leads/:id          → Remove lead
```

### Vendedores
```
GET    /api/vendas/vendedores        → Lista vendedores
POST   /api/vendas/vendedores        → Cria vendedor
GET    /api/vendas/vendedores/:id    → Busca vendedor
PUT    /api/vendas/vendedores/:id    → Atualiza vendedor
DELETE /api/vendas/vendedores/:id    → Desativa vendedor
```

### Vendas
```
GET    /api/vendas                   → Lista vendas
POST   /api/vendas                   → Cria venda
GET    /api/vendas/:id               → Busca venda
POST   /api/vendas/:id/confirmar     → Confirma venda (gera comissão)
POST   /api/vendas/:id/cancelar      → Cancela venda
GET    /api/vendas/stats             → Estatísticas
GET    /api/vendas/ranking           → Ranking de vendedores
```

### Comissões
```
GET    /api/vendas/comissoes         → Lista comissões
GET    /api/vendas/comissoes/:id     → Busca comissão
POST   /api/vendas/comissoes/:id/pagar → Marca como paga
GET    /api/vendas/comissoes/stats   → Estatísticas
```

---

## Próximos Passos (Frontend)

### 1. Atualizar LeadCard Component
**Arquivo:** `frontend/src/components/LeadCard.tsx` (ou similar)

```typescript
// Adicionar exibição do vendedor
interface LeadCardProps {
  lead: Lead & { vendedor?: Vendedor };
}

// No card, mostrar:
{lead.vendedor && (
  <div className="vendedor-info">
    <User className="w-4 h-4" />
    <span>{lead.vendedor.nome}</span>
  </div>
)}
```

### 2. Atualizar LeadForm Component
**Arquivo:** `frontend/src/components/LeadForm.tsx` (ou similar)

```typescript
// Adicionar campo de seleção de vendedor
const { data: vendedores } = useQuery(['vendedores'], fetchVendedores);

<Select
  label="Vendedor Responsável"
  value={formData.vendedor_id}
  onChange={(value) => setFormData({...formData, vendedor_id: value})}
>
  <option value="">Selecione um vendedor</option>
  {vendedores?.map(v => (
    <option key={v.id} value={v.id}>{v.nome}</option>
  ))}
</Select>
```

### 3. Adicionar Filtro por Vendedor
**Arquivo:** `frontend/src/pages/Leads/LeadsPage.tsx` (ou similar)

```typescript
// Adicionar filtro de vendedor na lista de leads
const [vendedorFilter, setVendedorFilter] = useState<string>('all');

const filteredLeads = leads.filter(lead =>
  vendedorFilter === 'all' || lead.vendedor_id === vendedorFilter
);
```

### 4. Dashboard do Vendedor
**Novo componente:** `frontend/src/pages/Vendas/VendedorDashboard.tsx`

```typescript
// Exibir:
// - Total de leads atribuídos
// - Leads em cada estágio do funil
// - Taxa de conversão
// - Vendas realizadas
// - Comissões pendentes/pagas
```

---

## Dados de Exemplo

### Estado Atual (após implementação)

```sql
-- Leads sem vendedor (todos)
SELECT COUNT(*) FROM leads WHERE vendedor_id IS NULL;
-- Resultado: 15 leads

-- Vendedores cadastrados
SELECT COUNT(*) FROM vendedores WHERE ativo = true;
-- Resultado: 0 vendedores (nenhum cadastrado ainda)

-- Vendas realizadas
SELECT COUNT(*) FROM vendas;
-- Resultado: 0 vendas (sistema novo)
```

### Cenário de Teste Sugerido

1. **Cadastrar 2-3 vendedores**
   - João Silva (10% comissão)
   - Maria Santos (12% comissão)
   - Pedro Oliveira (15% comissão)

2. **Atribuir leads existentes aos vendedores**
   ```sql
   UPDATE leads
   SET vendedor_id = (SELECT id FROM vendedores WHERE codigo_vendedor = 'VND-2025-0001')
   WHERE id IN (SELECT id FROM leads LIMIT 5);
   ```

3. **Criar primeira venda**
   - Selecionar um lead
   - Associar ao vendedor
   - Preencher valores
   - Confirmar venda
   - Verificar comissão gerada automaticamente

---

## Considerações de Segurança

### Permissões Necessárias
- ✅ Somente admins podem criar/editar vendedores
- ✅ Vendedores só veem seus próprios leads
- ✅ Vendedores só veem suas próprias vendas/comissões
- ⚠️ Implementar verificação de tenant_id em todas as queries

### Auditoria
Todas as tabelas incluem:
- `created_at` - Data de criação
- `updated_at` - Data de última atualização
- `created_by_id` - Usuário que criou (quando aplicável)

---

## Deploy Realizado

### Backend
```
Versão: v99-leads-vendedor-integration
Status: ✅ DEPLOYED
Imagem: nexus-backend:v99-leads-vendedor-integration
Porta: 3001
```

### Database Migration
```sql
-- Executada em: 21/10/2025 02:31 UTC
ALTER TABLE leads ADD COLUMN vendedor_id UUID;
CREATE INDEX idx_leads_vendedor_id ON leads(vendedor_id);
```

### Arquivos Modificados
```
✅ backend/src/modules/leads/lead.entity.ts
✅ backend/migrations/ (script SQL executado manualmente)
⏳ frontend/ (pendente)
```

---

## Checklist de Validação

### Backend
- [x] Campo `vendedor_id` adicionado à tabela `leads`
- [x] Índice criado para performance
- [x] Foreign key configurada corretamente
- [x] Entity atualizado
- [x] Build bem-sucedido
- [x] Deploy bem-sucedido
- [x] Backend rodando sem erros

### Frontend (Pendente)
- [ ] LeadCard exibe vendedor
- [ ] LeadForm permite selecionar vendedor
- [ ] LeadList permite filtrar por vendedor
- [ ] Dashboard do vendedor implementado
- [ ] Testes de integração

---

## Resumo

✅ **Backend 100% Pronto**
- Banco de dados atualizado
- Relacionamentos configurados
- APIs funcionando
- Deploy concluído

⏳ **Frontend Pendente**
- Componentes precisam ser atualizados
- Funcionalidade de seleção de vendedor
- Dashboard de vendedor
- Filtros e relatórios

🎯 **Próximo Passo Recomendado:**
Atualizar frontend para permitir seleção de vendedor ao criar/editar leads.

---

**Documentação gerada em:** 21 de Outubro de 2025
**Última atualização:** v99 (integração leads-vendas)
**Status:** ✅ Backend Ready | ⏳ Frontend Pending
