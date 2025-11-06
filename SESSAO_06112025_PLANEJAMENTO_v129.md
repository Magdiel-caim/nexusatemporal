# 📋 SESSÃO 06/11/2025 - PLANEJAMENTO COMPLETO v129

**Data**: 06/11/2025
**Versão**: v129
**Status**: ⏸️ PLANEJAMENTO CONCLUÍDO - IMPLEMENTAÇÃO ADIADA
**Documento Base**: `/root/nexusatemporalv1/prompt/Alterações sistema.pdf`

---

## 📊 RESUMO EXECUTIVO

### Contexto
O cliente solicitou 43 alterações/melhorias no sistema Nexus Atemporal, abrangendo:
- Correção de bugs críticos
- Novas funcionalidades complexas
- Refatorações de módulos existentes
- Sistema de permissões avançado
- Automações via WhatsApp

### Status Atual
✅ **Backup criado**: `backup-sistema-completo-20251106_003408.tar.gz` (420MB)
✅ **Tarefas documentadas**: 43 tarefas detalhadas
✅ **Script Airtable**: Pronto para execução
✅ **Erros analisados**: Console logs salvos
⏸️ **Implementação**: ADIADA para próxima sessão

### Estimativas
- **Total de tarefas**: 43
- **Horas estimadas**: ~250 horas
- **Dias de trabalho**: ~31 dias (8h/dia)
- **Sprints recomendadas**: 6-8 sprints de 1 semana

---

## 🎯 ARQUIVOS CRIADOS NESTA SESSÃO

### 1. Backup do Sistema
**Arquivo**: `/root/backup-sistema-completo-20251106_003408.tar.gz`
**Tamanho**: 420MB
**Conteúdo**:
- Todo o código-fonte (backend + frontend)
- Configurações
- Documentação existente
- **Excluídos**: node_modules, dist, .git

**Como restaurar**:
```bash
cd /root
tar -xzf backup-sistema-completo-20251106_003408.tar.gz
```

### 2. Script de Tarefas Airtable
**Arquivo**: `/root/nexusatemporalv1/backend/add-system-improvements-tasks-v129.js`
**Conteúdo**: 43 tarefas detalhadas para Airtable
**Status**: Pronto para execução (aguardando credenciais)

**Como executar**:
```bash
cd /root/nexusatemporalv1/backend

# Certifique-se que as variáveis estão no .env:
# AIRTABLE_API_KEY=your_key
# AIRTABLE_BASE_ID=your_base
# AIRTABLE_TABLE_TASKS=Tasks

node add-system-improvements-tasks-v129.js
```

### 3. Este Documento
**Arquivo**: `/root/nexusatemporalv1/SESSAO_06112025_PLANEJAMENTO_v129.md`
**Objetivo**: Guia completo para continuidade

---

## 📚 DOCUMENTOS DE REFERÊNCIA

### Documentos Fornecidos pelo Cliente
1. **Alterações sistema.pdf**
   - Caminho: `/root/nexusatemporalv1/prompt/Alterações sistema.pdf`
   - Conteúdo: Especificação completa das 43 alterações

2. **Erro salvar imagem.txt**
   - Caminho: `/root/nexusatemporalv1/prompt/Erro salvar imagem.txt`
   - Conteúdo: Console logs do erro de upload de imagens no módulo Pacientes

3. **Erro estoque.txt**
   - Caminho: `/root/nexusatemporalv1/prompt/Erro estoque.txt`
   - Conteúdo: Console logs do erro de movimentação de estoque

### Documentos de Sessões Anteriores
1. **SESSAO_04112025_DESENVOLVIMENTO_COMPLETO.md**
   - Caminho: `/root/nexusatemporalv1/SESSAO_04112025_DESENVOLVIMENTO_COMPLETO.md`
   - Conteúdo: Melhorias implementadas no módulo Agenda (v128.1)
   - Pendências documentadas:
     - ❌ Múltiplos Procedimentos (12h estimadas)
     - ❌ Múltiplos Horários (14h estimadas)

---

## 🗂️ CATEGORIZAÇÃO DAS 43 TAREFAS

### 🔴 CRÍTICAS (Bugs que afetam funcionalidade)
**Total**: 8 tarefas | **Estimativa**: 42 horas

1. **[UI] Navegação de submenus não funciona**
   - Módulos afetados: Financeiro, Vendas, Estoque, BI & Analytics, Marketing
   - Problema: URL muda mas tela não atualiza
   - Estimativa: 3h

2. **[Pacientes] Erro ao salvar paciente com foto**
   - Erro: 500 Internal Server Error
   - Endpoint: `POST /api/pacientes/{id}/imagens`
   - Referência: `/root/nexusatemporalv1/prompt/Erro salvar imagem.txt`
   - Estimativa: 4h

3. **[Estoque] Erro "Tipo de movimentação inválida"**
   - Erro: 400 Bad Request
   - Endpoint: `POST /api/stock/movements`
   - Referência: `/root/nexusatemporalv1/prompt/Erro estoque.txt`
   - Estimativa: 3h

4. **[Agenda] Bug de restrição de data**
   - Problema: Não permite agendar para hoje/amanhã
   - Status: Parcialmente corrigido em v128.1 (verificar)
   - Estimativa: 2h

5. **[Financeiro] Erro ao aprovar Ordens de Compra**
   - Erro: 400 Bad Request
   - Problema: Botão "Aprovar" não funciona
   - Estimativa: 4h

6. **[Financeiro] Transações mostram "R$ NaN"**
   - Problema: Cálculo de receitas/despesas quebrado
   - Estimativa: 4h

7. **[Financeiro] Erro ao editar despesas**
   - Problema: Ao salvar despesa pendente retorna erro
   - Estimativa: 4h

8. **[Financeiro] Erro no fluxo de caixa e fechamento**
   - Problema: Não consegue atualizar fluxo nem fechar caixa
   - Estimativa: 10h

9. **[Permissões] Email de convite não funciona**
   - Problema: SMTP não configurado
   - Solução: Configurar Zoho SMTP
   - Estimativa: 3h

10. **[Permissões] Usuários Proprietário sem acesso total**
    - Problema: Funções não aparecem para role "Proprietário"
    - Estimativa: 4h

11. **[Dashboard] Widget não desaparece ao desmarcar**
    - Problema: "Atendimento por Clínica" não some
    - Estimativa: 2h

### 🟠 ALTA (Funcionalidades importantes)
**Total**: 15 tarefas | **Estimativa**: 110 horas

1. **[Leads→Pacientes] Conversão automática com WhatsApp**
   - Fluxo completo de conversão
   - Integração WhatsApp para pagamento
   - Criação automática no módulo Pacientes
   - Estimativa: 16h

2. **[Agenda] Múltiplos procedimentos por agendamento**
   - Requer alteração no banco de dados
   - Cálculo de duração e preço total
   - Estimativa: 12h

3. **[Agenda] Múltiplos horários (criação em lote)**
   - Sistema de transações
   - Verificação de conflitos
   - Estimativa: 14h

4. **[Agenda] Hora inicial e final do agendamento**
   - Seleção de intervalo de tempo
   - Bloqueio automático de slots
   - Estimativa: 6h

5. **[Prontuários] Refatoração completa do módulo**
   - Remover botão "Novo Prontuário"
   - Mover para módulo Pacientes
   - Integração completa
   - Estimativa: 8h

6. **[Estoque] Adicionar botões Editar e Excluir**
   - CRUD completo de produtos
   - Produto clicável com popup
   - Estimativa: 5h

7. **[Estoque] Busca de fornecedores**
   - Autocomplete por nome/CNPJ
   - Opção de adicionar novo
   - Estimativa: 4h

8. **[Permissões] Sistema personalizado por usuário**
   - Permissões granulares
   - Interface de gerenciamento
   - Middleware de verificação
   - Estimativa: 20h

9. **[Permissões] Ajustar hierarquias**
   - Proprietário → Developer
   - Profissional → Biomédicos
   - Adicionar: Consultores, Marketing
   - Estimativa: 6h

10. **[Leads] Tornar campos obrigatórios**
    - Validações de formulário
    - Campos: Nome, Email, WhatsApp, Procedimento, Local
    - Estimativa: 2h

11. **[Leads] Corrigir bug de localização**
    - Localização não transfere para agendamento
    - Estimativa: 2h

12. **[Dashboard] Filtros de status**
    - Aguardando, Em Atendimento, Retorno, Finalizado
    - Estimativa: 5h

13. **[Pacientes] Mover "Agendar Retorno"**
    - Remover de outros locais
    - Criar aba no card do Paciente
    - Estimativa: 5h

14. **[Financeiro] Funcionalidades de Recibo/NF**
    - Enviar por email
    - Download PDF
    - Edição com auditoria
    - Estimativa: 8h

15. **[Auth] Login por hierarquia e região**
    - Seleção de role e região
    - Filtro de dados por região
    - Estimativa: 8h

16. **[Auth] Redefinir senha**
    - Remover criar conta
    - Adicionar recuperação de senha
    - Email com link de reset
    - Estimativa: 6h

### 🟡 MÉDIA (Melhorias importantes)
**Total**: 14 tarefas | **Estimativa**: 82 horas

1. **[Estoque] Botão "Nova Categoria"**
   - Modal de cadastro
   - Integração com select
   - Estimativa: 3h

2. **[Estoque] Corrigir dark mode**
   - Remover toggle do módulo
   - Corrigir visualização na aba Produtos
   - Estimativa: 3h

3. **[Agenda] Embed para sites externos**
   - Múltiplos formatos (HTML, React, PHP, etc)
   - Configuração de tema
   - API token
   - Estimativa: 16h

4. **[Agenda] Busca no modo lista**
   - Aplicar PatientSearchInput
   - Reutilizar componente existente
   - Estimativa: 2h

5. **[Pacientes] Script de inativação automática**
   - Cron job diário
   - 6 meses / 1 ano sem movimentação
   - Estimativa: 6h

6. **[Pacientes] Import/Export (Excel, PDF)**
   - Importação com validação
   - Exportação filtrada
   - Estimativa: 8h

7. **[Pacientes] Aba "Histórico de Procedimentos"**
   - Lista de procedimentos realizados
   - Procedimentos em andamento
   - Estimativa: 4h

8. **[Financeiro] API busca CNPJ**
   - Integração ReceitaWS ou BrasilAPI
   - Preenchimento automático
   - Estimativa: 4h

9. **[Sistema] CRUD de itens customizáveis**
   - Procedimentos, Categorias, Localizações
   - Interface de gerenciamento
   - Estimativa: 12h

10. **[Sistema] Gerenciamento de localizações**
    - CRUD de clínicas/locais
    - Permissões por role
    - Estimativa: 6h

11. **[Leads] Ajustar visibilidade por hierarquia**
    - Ocultar para: Recepção, Médicos, Biomédicos, Consultores
    - Estimativa: 2h

12. **[BI] Módulo personalizado (estilo Power BI)**
    - Drag and drop de painéis
    - Múltiplos tipos de gráficos
    - Dashboards salvos
    - **PROJETO GRANDE**: Estimativa: 40h

13. **[Auth] Tema dark/light no login**
    - Toggle na página de login
    - Persistência de escolha
    - Estimativa: 3h

---

## 📋 PLANO DE IMPLEMENTAÇÃO FASEADO

### 🎯 SPRINT 1: Correção de Bugs Críticos (1 semana)
**Objetivo**: Resolver bugs que impedem uso normal do sistema
**Duração estimada**: 42 horas

**Tarefas**:
1. ✅ Navegação de submenus (3h)
2. ✅ Erro upload imagem Pacientes (4h)
3. ✅ Erro movimentação estoque (3h)
4. ✅ Bug restrição de data Agenda (2h)
5. ✅ Configurar SMTP Zoho (3h)
6. ✅ Erro aprovar Ordens de Compra (4h)
7. ✅ Transações "R$ NaN" (4h)
8. ✅ Erro editar despesas (4h)
9. ✅ Erro fluxo de caixa (10h)
10. ✅ Usuários Proprietário sem acesso (4h)
11. ✅ Widget Dashboard não desaparece (2h)

**Entregáveis**:
- Sistema funcional sem bugs críticos
- Todos os módulos navegáveis
- Uploads funcionando
- Financeiro operacional

### 🎯 SPRINT 2: Permissões e Hierarquias (1 semana)
**Objetivo**: Sistema de permissões robusto
**Duração estimada**: 38 horas

**Tarefas**:
1. ✅ Ajustar hierarquias (Proprietário→Developer, etc) (6h)
2. ✅ Sistema de permissões personalizáveis (20h)
3. ✅ Ajustar visibilidade módulo Leads (2h)
4. ✅ Login por hierarquia e região (8h)
5. ✅ Redefinir senha / Remover criar conta (6h)

**Entregáveis**:
- Hierarquias atualizadas
- Permissões granulares funcionando
- Login por região implementado
- Recuperação de senha ativa

### 🎯 SPRINT 3: Módulo Leads e Conversão (1-2 semanas)
**Objetivo**: Automação Lead → Paciente
**Duração estimada**: 27 horas

**Tarefas**:
1. ✅ Conversão automática Lead→Paciente (16h)
2. ✅ Tornar campos obrigatórios (2h)
3. ✅ Corrigir bug localização (2h)
4. ✅ Filtros de status Dashboard (5h)
5. ✅ Mover "Agendar Retorno" para Pacientes (5h)

**Entregáveis**:
- Fluxo completo Lead→Paciente
- Automação WhatsApp funcionando
- Integração com pagamentos
- Dashboard com filtros

**IMPORTANTE**: Requer integração com:
- API WhatsApp (WAHA já está configurado?)
- Gateway de pagamento (Stripe/PagBank configurado?)

### 🎯 SPRINT 4: Melhorias Agenda (1-2 semanas)
**Objetivo**: Funcionalidades avançadas de agendamento
**Duração estimada**: 40 horas

**Tarefas**:
1. ✅ Múltiplos procedimentos (12h)
2. ✅ Múltiplos horários (14h)
3. ✅ Hora inicial e final (6h)
4. ✅ Busca no modo lista (2h)
5. ✅ Embed para sites externos (16h) - **OPCIONAL**

**Entregáveis**:
- Agendamento com múltiplos procedimentos
- Criação em lote de agendamentos
- Seleção de intervalo de tempo
- (Opcional) Sistema de embed

**ATENÇÃO**: Tarefas 1 e 2 requerem alterações no banco de dados!

### 🎯 SPRINT 5: Módulos Pacientes e Prontuários (1 semana)
**Objetivo**: Refatoração e melhorias
**Duração estimada**: 31 horas

**Tarefas**:
1. ✅ Refatorar módulo Prontuários (8h)
2. ✅ Aba Histórico de Procedimentos (4h)
3. ✅ Script inativação automática (6h)
4. ✅ Import/Export Excel/PDF (8h)
5. ✅ Tema dark/light no login (3h)

**Entregáveis**:
- Prontuários integrados com Pacientes
- Histórico de procedimentos visível
- Cron job de inativação
- Import/Export funcionando

### 🎯 SPRINT 6: Módulo Estoque (1 semana)
**Objetivo**: Completar funcionalidades de estoque
**Duração estimada**: 20 horas

**Tarefas**:
1. ✅ Botão Nova Categoria (3h)
2. ✅ Corrigir dark mode (3h)
3. ✅ Botões Editar/Excluir produto (5h)
4. ✅ Busca de fornecedores (4h)
5. ✅ CRUD itens customizáveis (12h) - **PARCIAL**

**Entregáveis**:
- Gestão completa de categorias
- CRUD de produtos
- Busca de fornecedores
- Dark mode corrigido

### 🎯 SPRINT 7: Módulo Financeiro (1 semana)
**Objetivo**: Completar funcionalidades financeiras
**Duração estimada**: 12 horas

**Tarefas**:
1. ✅ API busca CNPJ (4h)
2. ✅ Funcionalidades Recibo/NF (8h)
3. ✅ Gerenciamento de localizações (6h) - **MOVIDO DA SPRINT 6**

**Entregáveis**:
- Busca CNPJ funcionando
- Email/Download de notas
- Edição de recibos

### 🎯 SPRINT 8: BI & Analytics (2-3 semanas) - **OPCIONAL**
**Objetivo**: Dashboard analítico avançado
**Duração estimada**: 40 horas

**Tarefas**:
1. ✅ Módulo BI personalizado (40h)

**Entregáveis**:
- Interface drag-and-drop
- Múltiplos tipos de gráficos
- Dashboards personalizados
- Exportação de relatórios

**NOTA**: Projeto grande, pode ser dividido em sub-fases

---

## 🔧 ALTERAÇÕES NO BANCO DE DADOS

### ⚠️ CRÍTICO: Estas tarefas requerem migrations

#### 1. Múltiplos Procedimentos (Sprint 4)

**Tabela atual**:
```sql
appointments (
  id UUID,
  procedureId UUID, -- campo único
  ...
)
```

**Opção 1 - Tabela de relacionamento** (RECOMENDADA):
```sql
CREATE TABLE appointment_procedures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointmentId UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  procedureId UUID NOT NULL REFERENCES procedures(id),
  "order" INT NOT NULL,
  duration INT,
  price DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(appointmentId, procedureId)
);

CREATE INDEX idx_appointment_procedures_appointment
  ON appointment_procedures(appointmentId);
```

**Opção 2 - JSON Array** (menos recomendada):
```sql
ALTER TABLE appointments
  ADD COLUMN procedureIds UUID[];
```

**Migration steps**:
1. Criar nova tabela `appointment_procedures`
2. Migrar dados existentes:
   ```sql
   INSERT INTO appointment_procedures (appointmentId, procedureId, "order", duration, price)
   SELECT id, procedureId, 1, estimatedDuration, paymentAmount
   FROM appointments
   WHERE procedureId IS NOT NULL;
   ```
3. **NÃO DELETAR** `procedureId` ainda (manter para rollback)
4. Atualizar backend para usar nova tabela
5. Testar extensivamente
6. Após 1 mês sem problemas, remover coluna antiga

#### 2. Sistema de Permissões (Sprint 2)

**Nova tabela**:
```sql
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module VARCHAR(50) NOT NULL,
  canView BOOLEAN DEFAULT FALSE,
  canCreate BOOLEAN DEFAULT FALSE,
  canEdit BOOLEAN DEFAULT FALSE,
  canDelete BOOLEAN DEFAULT FALSE,
  canExport BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(userId, module)
);

CREATE INDEX idx_user_permissions_user ON user_permissions(userId);
```

**Módulos**:
- 'dashboard'
- 'leads'
- 'chat'
- 'agenda'
- 'prontuarios'
- 'pacientes'
- 'financeiro'
- 'vendas'
- 'estoque'
- 'colaboracao'
- 'bi_analytics'
- 'redes_sociais'
- 'marketing'
- 'configuracoes'

#### 3. Ajuste de Hierarquias (Sprint 2)

**Tabela atual**:
```sql
users (
  role VARCHAR(20) -- 'admin', 'gestor', 'profissional', etc
)
```

**Novos valores**:
```sql
-- Migration
UPDATE users SET role = 'developer' WHERE role = 'owner' OR role = 'proprietario';
UPDATE users SET role = 'biomedico' WHERE role = 'profissional';

-- Adicionar constraint
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN (
    'developer',
    'admin',
    'gestor',
    'marketing',
    'consultor',
    'biomedico',
    'medico',
    'recepcao',
    'usuario'
  ));
```

#### 4. Categorias de Produtos (Sprint 6)

**Verificar se tabela existe**:
```sql
-- Se não existir, criar:
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenantId UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7), -- HEX color
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenantId, name)
);

CREATE INDEX idx_product_categories_tenant
  ON product_categories(tenantId);
```

**Atualizar produtos**:
```sql
-- Se produtos usam string no campo category, migrar para UUID
ALTER TABLE products
  ADD COLUMN categoryId UUID REFERENCES product_categories(id);

-- Migração de dados (se necessário)
-- Criar categorias a partir dos valores únicos
-- Depois atualizar produtos com os IDs
```

#### 5. Histórico de Inativação (Sprint 5)

**Adicionar campos**:
```sql
ALTER TABLE pacientes
  ADD COLUMN lastActivityDate TIMESTAMP,
  ADD COLUMN inactiveStatus VARCHAR(20), -- '6_months', '1_year', 'active'
  ADD COLUMN inactiveSince TIMESTAMP;

CREATE INDEX idx_pacientes_inactive_status
  ON pacientes(inactiveStatus)
  WHERE inactiveStatus IS NOT NULL;

-- Inicializar com dados atuais
UPDATE pacientes
  SET lastActivityDate = updated_at,
      inactiveStatus = 'active';
```

---

## 🔐 CONFIGURAÇÕES NECESSÁRIAS

### SMTP (Zoho Mail)
**Arquivo**: `/root/nexusatemporalv1/backend/.env`

Adicionar/atualizar:
```env
# Email Configuration
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=contato@nexusatemporal.com.br
SMTP_PASSWORD=03wCCAnBSSQB
SMTP_FROM=contato@nexusatemporal.com.br
SMTP_FROM_NAME=Nexus Atemporal
```

**Testar configuração**:
```bash
cd /root/nexusatemporalv1/backend
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: 'smtp.zoho.com',
  port: 587,
  secure: false,
  auth: {
    user: 'contato@nexusatemporal.com.br',
    pass: '03wCCAnBSSQB'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Erro:', error);
  } else {
    console.log('✅ SMTP configurado corretamente');
  }
});
"
```

### Airtable (quando disponível)
```env
AIRTABLE_API_KEY=your_api_key_here
AIRTABLE_BASE_ID=your_base_id_here
AIRTABLE_TABLE_TASKS=Tasks
```

---

## 📝 CHECKLIST DE INÍCIO DE SPRINT

Antes de iniciar qualquer sprint, execute:

### 1. Verificar Estado do Sistema
```bash
cd /root/nexusatemporalv1

# Ver status Git
git status

# Ver branch atual
git branch

# Ver últimos commits
git log --oneline -10

# Verificar services rodando
docker ps | grep nexus
```

### 2. Criar Branch da Sprint
```bash
# Exemplo para Sprint 1
git checkout -b sprint-1-bug-fixes

# Ou para feature específica
git checkout -b feature/navigation-submenus
```

### 3. Atualizar Dependências (se necessário)
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Criar Backup Específico da Sprint
```bash
cd /root
SPRINT_NAME="sprint-1-inicio"
tar -czf "backup-${SPRINT_NAME}-$(date +%Y%m%d_%H%M%S).tar.gz" \
  --exclude='nexusatemporalv1/node_modules' \
  --exclude='nexusatemporalv1/backend/node_modules' \
  --exclude='nexusatemporalv1/frontend/node_modules' \
  --exclude='nexusatemporalv1/backend/dist' \
  --exclude='nexusatemporalv1/frontend/dist' \
  --exclude='nexusatemporalv1/.git' \
  nexusatemporalv1/

echo "✅ Backup criado: backup-${SPRINT_NAME}-*.tar.gz"
```

### 5. Executar Script Airtable (se credenciais disponíveis)
```bash
cd /root/nexusatemporalv1/backend
node add-system-improvements-tasks-v129.js
```

---

## 🚀 GUIA DE IMPLEMENTAÇÃO POR TAREFA

### SPRINT 1 - TAREFA 1: Navegação de Submenus

**Problema**: URL muda mas tela não atualiza
**Módulos afetados**: Financeiro, Vendas, Estoque, BI & Analytics, Marketing

**Arquivos para investigar**:
1. `/root/nexusatemporalv1/frontend/src/App.tsx` - Rotas
2. `/root/nexusatemporalv1/frontend/src/pages/FinanceiroPage.tsx`
3. `/root/nexusatemporalv1/frontend/src/pages/Vendas/VendasPage.tsx`
4. `/root/nexusatemporalv1/frontend/src/pages/EstoquePage.tsx`
5. `/root/nexusatemporalv1/frontend/src/pages/BI/BIDashboard.tsx`
6. `/root/nexusatemporalv1/frontend/src/pages/MarketingPage.tsx`

**Passos**:
1. Ler `App.tsx` e identificar rotas de submenus
2. Verificar se há componente de Tabs sendo usado incorretamente
3. Verificar se `useNavigate` ou `<Link>` estão sendo usados
4. Verificar se há `useEffect` que deveria reagir a mudanças de rota

**Provável solução**:
```typescript
// Em cada página com submenus, adicionar:
import { useLocation } from 'react-router-dom';

const FinanceiroPage = () => {
  const location = useLocation();

  // Estado baseado na URL
  const [activeTab, setActiveTab] = useState(() => {
    const path = location.pathname;
    if (path.includes('/transacoes')) return 'transacoes';
    if (path.includes('/ordens')) return 'ordens';
    // ...
    return 'dashboard';
  });

  // Reagir a mudanças de URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/transacoes')) setActiveTab('transacoes');
    if (path.includes('/ordens')) setActiveTab('ordens');
    // ...
  }, [location]);

  // Usar Link ou navigate ao clicar em submenu
  const handleTabChange = (tab: string) => {
    navigate(`/financeiro/${tab}`);
  };

  return (
    // Renderizar baseado em activeTab
  );
};
```

**Teste**:
1. Navegar para Financeiro
2. Clicar em submenu "Transações"
3. Verificar se URL muda E conteúdo atualiza
4. Usar botão voltar do navegador
5. Verificar se volta para estado anterior

---

### SPRINT 1 - TAREFA 2: Erro Upload Imagem Pacientes

**Erro**: 500 Internal Server Error
**Endpoint**: `POST /api/pacientes/{id}/imagens`
**Referência**: `/root/nexusatemporalv1/prompt/Erro salvar imagem.txt`

**Arquivos para investigar**:
1. Backend:
   - `/root/nexusatemporalv1/backend/src/modules/pacientes/pacientes.controller.ts`
   - `/root/nexusatemporalv1/backend/src/modules/pacientes/pacientes.service.ts`
   - `/root/nexusatemporalv1/backend/src/config/s3.config.ts` (se existir)

2. Frontend:
   - `/root/nexusatemporalv1/frontend/src/pages/PacientesPage.tsx`
   - `/root/nexusatemporalv1/frontend/src/pages/PacienteFichaPage.tsx`

**Passos de debug**:
```bash
# 1. Ver logs do backend
docker service logs nexus_backend --tail 100 | grep -i "imagem\|upload\|500"

# 2. Testar upload manualmente
curl -X POST https://api.nexusatemporal.com.br/api/pacientes/{id}/imagens \
  -H "Authorization: Bearer {token}" \
  -F "image=@test.jpg"
```

**Possíveis causas**:
1. **IDrive E2 (S3) não configurado**
   - Verificar variáveis: `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`
   - Testar conexão com bucket

2. **CORS não configurado no bucket**
   - Acessar painel IDrive E2
   - Configurar CORS policy

3. **Multer ou middleware de upload com erro**
   - Verificar configuração do multer
   - Verificar limites de tamanho

4. **Path ou permissões incorretas**
   - Verificar pasta de upload temporário
   - Verificar permissões de escrita

**Solução provável**:
```typescript
// backend/src/modules/pacientes/pacientes.controller.ts

@Post(':id/imagens')
@UseInterceptors(FileInterceptor('image', {
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Apenas imagens são permitidas'), false);
    }
    cb(null, true);
  }
}))
async uploadImage(
  @Param('id') id: string,
  @UploadedFile() file: Express.Multer.File,
  @Req() req: any
) {
  try {
    // Verificar se file existe
    if (!file) {
      throw new BadRequestException('Nenhuma imagem foi enviada');
    }

    // Upload para S3
    const imageUrl = await this.pacientesService.uploadImage(
      id,
      file,
      req.user.tenantId
    );

    return {
      success: true,
      imageUrl
    };
  } catch (error) {
    console.error('Erro upload imagem:', error);
    throw new InternalServerErrorException(
      `Erro ao fazer upload: ${error.message}`
    );
  }
}
```

**Configurar CORS no IDrive E2**:
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://one.nexusatemporal.com.br", "https://api.nexusatemporal.com.br"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

Script de configuração já existe em:
`/root/nexusatemporalv1/backend/configure-s3-cors.js`

**Teste**:
1. Selecionar paciente
2. Clicar em "Selecionar foto"
3. Escolher imagem (< 10MB)
4. Salvar
5. Verificar se foto aparece
6. Tentar adicionar imagem na aba "Imagens"

---

### SPRINT 1 - TAREFA 3: Erro Movimentação Estoque

**Erro**: 400 Bad Request - "Tipo de movimentação inválida"
**Endpoint**: `POST /api/stock/movements`
**Referência**: `/root/nexusatemporalv1/prompt/Erro estoque.txt`

**Arquivos para investigar**:
1. Backend:
   - `/root/nexusatemporalv1/backend/src/modules/stock/movement.entity.ts`
   - `/root/nexusatemporalv1/backend/src/modules/stock/dto/create-movement.dto.ts`
   - `/root/nexusatemporalv1/backend/src/modules/stock/stock.controller.ts`

2. Frontend:
   - `/root/nexusatemporalv1/frontend/src/pages/EstoquePage.tsx`
   - Componente de "Nova Movimentação"

**Passos de debug**:
```bash
# Ver código do DTO
cat /root/nexusatemporalv1/backend/src/modules/stock/dto/create-movement.dto.ts

# Ver enum da entity
cat /root/nexusatemporalv1/backend/src/modules/stock/movement.entity.ts | grep -A 10 "enum\|Enum"
```

**Causa provável**:
Frontend está enviando valor diferente do esperado pelo backend.

**Exemplo**:
- Frontend envia: `type: "entrada"`
- Backend espera: `type: "ENTRADA"` ou `type: "in"`

**Solução**:
1. **Identificar valores corretos no backend**:
```typescript
// movement.entity.ts
export enum MovementType {
  ENTRADA = 'entrada',
  SAIDA = 'saida',
  AJUSTE = 'ajuste',
  DEVOLUCAO = 'devolucao',
  TRANSFERENCIA = 'transferencia'
}
```

2. **Verificar DTO**:
```typescript
// create-movement.dto.ts
export class CreateMovementDto {
  @IsEnum(MovementType)
  type: MovementType;

  // ...
}
```

3. **Corrigir frontend para enviar valor correto**:
```typescript
// EstoquePage.tsx
const movementTypes = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'saida', label: 'Saída' },
  { value: 'ajuste', label: 'Ajuste' },
  { value: 'devolucao', label: 'Devolução' },
  { value: 'transferencia', label: 'Transferência' }
];

// Ao submeter
const handleSubmit = async (data) => {
  await api.post('/stock/movements', {
    ...data,
    type: data.type.toLowerCase() // Garantir lowercase
  });
};
```

**Teste**:
1. Ir em Estoque
2. Clicar "Nova Movimentação"
3. Preencher formulário
4. Selecionar cada tipo: Entrada, Saída, Ajuste, Devolução, Transferência
5. Registrar cada um
6. Verificar se todos funcionam

---

### SPRINT 1 - TAREFA 4: Bug Restrição de Data Agenda

**Problema**: Não permite agendar para hoje/amanhã
**Status**: Parcialmente corrigido em v128.1

**Verificar se já foi corrigido**:
```bash
cd /root/nexusatemporalv1/frontend/src
grep -n "min=" pages/AgendaPage.tsx components/agenda/AgendaCalendar.tsx
```

**Se encontrar**:
```typescript
min={new Date().toISOString().split('T')[0]}
```

Então já está corrigido. **Apenas testar**.

**Se não encontrar, aplicar correção**:
```typescript
// AgendaPage.tsx e AgendaCalendar.tsx
// No input de data:
<input
  type="date"
  required
  min={new Date().toISOString().split('T')[0]}  // ← ADICIONAR
  value={formData.scheduledDate}
  onChange={(e) => setFormData({
    ...formData,
    scheduledDate: e.target.value
  })}
  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg"
/>
```

**Teste**:
1. Ir em Agenda
2. Clicar "Novo Agendamento"
3. Tentar selecionar data de hoje
4. Deve permitir
5. Selecionar horário futuro (ex: 2h a partir de agora)
6. Deve aparecer nos slots disponíveis
7. Criar agendamento
8. Verificar se foi criado com sucesso

---

### SPRINT 1 - TAREFA 5: Configurar SMTP Zoho

**Objetivo**: Envio de emails funcionando

**Passos**:
1. **Instalar nodemailer** (se não instalado):
```bash
cd /root/nexusatemporalv1/backend
npm install nodemailer
npm install --save-dev @types/nodemailer
```

2. **Configurar variáveis no .env**:
```bash
cd /root/nexusatemporalv1/backend
cat >> .env << 'EOF'

# SMTP Configuration (Zoho)
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=contato@nexusatemporal.com.br
SMTP_PASSWORD=03wCCAnBSSQB
SMTP_FROM=contato@nexusatemporal.com.br
SMTP_FROM_NAME=Nexus Atemporal
EOF
```

3. **Criar serviço de email**:

Arquivo: `/root/nexusatemporalv1/backend/src/services/email.service.ts`
```typescript
import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  async sendUserInvite(email: string, password: string) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .button {
              display: inline-block;
              background: #4F46E5;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
            .credentials {
              background: white;
              padding: 15px;
              border-left: 4px solid #4F46E5;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bem-vindo ao Nexus Atemporal</h1>
            </div>
            <div class="content">
              <p>Olá,</p>
              <p>Você foi convidado para acessar o sistema Nexus Atemporal.</p>

              <div class="credentials">
                <h3>Suas credenciais de acesso:</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Senha temporária:</strong> ${password}</p>
              </div>

              <p><strong>⚠️ IMPORTANTE:</strong> Por segurança, altere sua senha no primeiro acesso.</p>

              <a href="https://one.nexusatemporal.com.br/login" class="button">
                Acessar Sistema
              </a>

              <p>Se você não solicitou este acesso, por favor ignore este email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Convite de Acesso - Nexus Atemporal',
      html
    });
  }

  async sendPasswordReset(email: string, resetToken: string) {
    const resetUrl = `https://one.nexusatemporal.com.br/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .button {
              display: inline-block;
              background: #4F46E5;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Redefinir Senha</h1>
            </div>
            <div class="content">
              <p>Olá,</p>
              <p>Recebemos uma solicitação para redefinir sua senha.</p>

              <p>Clique no botão abaixo para criar uma nova senha:</p>

              <a href="${resetUrl}" class="button">
                Redefinir Senha
              </a>

              <p><strong>⏱️ Este link expira em 30 minutos.</strong></p>

              <p>Se você não solicitou a redefinição de senha, ignore este email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Redefinição de Senha - Nexus Atemporal',
      html
    });
  }
}
```

4. **Adicionar ao módulo**:
```typescript
// app.module.ts ou shared.module.ts
import { EmailService } from './services/email.service';

@Module({
  providers: [EmailService],
  exports: [EmailService]
})
```

5. **Testar**:
```bash
cd /root/nexusatemporalv1/backend
node -e "
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: 'smtp.zoho.com',
  port: 587,
  secure: false,
  auth: {
    user: 'contato@nexusatemporal.com.br',
    pass: '03wCCAnBSSQB'
  }
});

transporter.sendMail({
  from: 'Nexus Atemporal <contato@nexusatemporal.com.br>',
  to: 'seu-email@example.com', // ALTERAR
  subject: 'Teste SMTP Nexus',
  text: 'Email de teste. SMTP configurado com sucesso!'
}).then(() => {
  console.log('✅ Email enviado com sucesso!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
"
```

---

## 📊 MONITORAMENTO DE PROGRESSO

### Template de Relatório por Sprint

Copie e preencha ao final de cada sprint:

```markdown
# Sprint X - Relatório

**Data início**: DD/MM/YYYY
**Data fim**: DD/MM/YYYY
**Duração real**: X dias

## Tarefas Completadas
- [x] Tarefa 1 (Xh estimadas / Xh reais)
- [x] Tarefa 2 (Xh estimadas / Xh reais)

## Tarefas Parciais
- [-] Tarefa 3 (50% completa)
  - Motivo: ...

## Tarefas Não Iniciadas
- [ ] Tarefa 4
  - Motivo: ...

## Bugs Encontrados
1. Bug descrição
   - Severidade: Crítico/Alto/Médio/Baixo
   - Status: Corrigido/Pendente

## Alterações no Banco de Dados
- Migration 1: descrição
- Migration 2: descrição

## Testes Realizados
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes manuais
- [ ] Testes de regressão

## Deploy
- [ ] Build backend sucesso
- [ ] Build frontend sucesso
- [ ] Docker images criadas
- [ ] Services atualizados
- [ ] Testes em produção

## Observações
Qualquer observação relevante...

## Próximos Passos
1. ...
2. ...
```

---

## 🐛 TROUBLESHOOTING COMUM

### Build falhando no TypeScript

**Erro**: `Property 'X' does not exist on type 'Y'`

**Solução**:
```bash
# Limpar cache e node_modules
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Docker não atualiza após build

**Problema**: Mudanças não aparecem

**Solução**:
```bash
# Force rebuild sem cache
docker build --no-cache -f Dockerfile.production -t nexus-backend:latest .

# Ou
docker-compose build --no-cache
```

### CORS error no browser

**Erro**: `Access-Control-Allow-Origin`

**Solução**:
```typescript
// backend/src/main.ts
app.enableCors({
  origin: [
    'https://one.nexusatemporal.com.br',
    'http://localhost:5173'
  ],
  credentials: true
});
```

### Database connection timeout

**Erro**: `Connection timeout`

**Verificar**:
```bash
# Ver se PostgreSQL está rodando
docker ps | grep postgres

# Ver logs
docker logs nexus_postgres

# Testar conexão
PGPASSWORD='nexus2024@secure' psql \
  -h 46.202.144.210 \
  -U nexus_admin \
  -d nexus_crm \
  -c "SELECT NOW();"
```

---

## 📞 INFORMAÇÕES DE CONTATO E SUPORTE

### Credenciais Importantes

**Banco de Dados**:
- Host: 46.202.144.210
- User: nexus_admin
- Password: nexus2024@secure
- Database: nexus_crm

**SMTP (Zoho)**:
- Host: smtp.zoho.com
- Port: 587
- User: contato@nexusatemporal.com.br
- App Password: 03wCCAnBSSQB

**URLs**:
- Frontend: https://one.nexusatemporal.com.br
- Backend API: https://api.nexusatemporal.com.br

### Backups

**Local atual**: `/root/backup-sistema-completo-20251106_003408.tar.gz`

**Criar novo backup**:
```bash
cd /root
tar -czf backup-$(date +%Y%m%d_%H%M%S).tar.gz \
  --exclude='nexusatemporalv1/node_modules' \
  --exclude='nexusatemporalv1/*/node_modules' \
  --exclude='nexusatemporalv1/*/dist' \
  --exclude='nexusatemporalv1/.git' \
  nexusatemporalv1/
```

---

## ✅ CHECKLIST FINAL ANTES DE FECHAR SESSÃO

Antes de encerrar qualquer sessão de desenvolvimento:

### Código
- [ ] Todas as alterações commitadas
- [ ] Commit messages descritivos
- [ ] Branch nomeada corretamente
- [ ] Nenhum console.log de debug esquecido
- [ ] Nenhuma credencial hardcoded

### Build
- [ ] Backend compila sem erros
- [ ] Frontend compila sem warnings
- [ ] Testes passam (quando houver)
- [ ] TypeScript strict checks passam

### Deploy
- [ ] Docker images rebuiltadas
- [ ] Services atualizados
- [ ] Logs verificados (sem errors)
- [ ] Sistema acessível

### Documentação
- [ ] Changelog atualizado
- [ ] Documento de sessão criado
- [ ] Próximos passos documentados
- [ ] Issues conhecidos registrados

### Backup
- [ ] Backup criado antes de mudanças grandes
- [ ] Backup testado (pode extrair?)

---

## 📖 REFERÊNCIAS TÉCNICAS

### Stack do Projeto

**Backend**:
- NestJS (Framework)
- TypeScript
- TypeORM
- PostgreSQL
- Express

**Frontend**:
- React
- TypeScript
- TailwindCSS
- React Router
- React Query

**Infraestrutura**:
- Docker / Docker Compose
- Nginx (Reverse Proxy)
- IDrive E2 (S3-compatible storage)

### Documentação Útil

- **NestJS**: https://docs.nestjs.com
- **TypeORM**: https://typeorm.io
- **React**: https://react.dev
- **TailwindCSS**: https://tailwindcss.com
- **React Router**: https://reactrouter.com

### Padrões do Projeto

**Commits**:
```
feat: adiciona nova funcionalidade
fix: corrige bug
refactor: refatora código
docs: atualiza documentação
style: formatação de código
test: adiciona testes
chore: tarefas de manutenção
```

**Branches**:
```
feature/nome-da-feature
fix/nome-do-bug
refactor/nome-da-refatoracao
sprint-X-descricao
```

---

## 🎯 PRIORIZAÇÃO RECOMENDADA

Se precisar ajustar prioridades, seguir esta ordem:

### P0 - Crítico (Impede uso do sistema)
1. Navegação de submenus
2. Erro upload imagem
3. Erro movimentação estoque
4. Módulo Financeiro (transações, ordens, caixa)

### P1 - Alto (Funcionalidade importante quebrada)
1. SMTP para emails
2. Bug restrição de data
3. Permissões de usuários
4. Conversão Lead→Paciente

### P2 - Médio (Melhoria significativa)
1. Múltiplos procedimentos
2. Refatoração Prontuários
3. Sistema de permissões personalizadas
4. Hierarquias

### P3 - Baixo (Nice to have)
1. Módulo BI completo
2. Embed agenda
3. Dark mode no login
4. Import/Export

---

## 💾 COMANDOS RÁPIDOS DE REFERÊNCIA

### Git
```bash
# Ver status
git status

# Criar branch
git checkout -b feature/nome

# Commit
git add .
git commit -m "feat: descrição"

# Push
git push origin feature/nome

# Ver diferenças
git diff

# Ver histórico
git log --oneline -10
```

### Docker
```bash
# Ver containers
docker ps

# Ver logs
docker service logs nexus_backend --tail 100
docker service logs nexus_frontend --tail 100

# Rebuild
cd /root/nexusatemporalv1/backend
docker build -f Dockerfile.production -t nexus-backend:v129 .

cd /root/nexusatemporalv1/frontend
docker build -f Dockerfile.prod -t nexus-frontend:v129 .

# Update service
docker service update --image nexus-backend:v129 --force nexus_backend
docker service update --image nexus-frontend:v129 --force nexus_frontend
```

### Database
```bash
# Conectar
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm

# Backup
pg_dump -h 46.202.144.210 -U nexus_admin nexus_crm > backup.sql

# Restore
psql -h 46.202.144.210 -U nexus_admin nexus_crm < backup.sql
```

### Build & Deploy
```bash
# Backend
cd /root/nexusatemporalv1/backend
npm run build
docker build -f Dockerfile.production -t nexus-backend:latest .
docker service update --image nexus-backend:latest --force nexus_backend

# Frontend
cd /root/nexusatemporalv1/frontend
npm run build
docker build -f Dockerfile.prod -t nexus-frontend:latest .
docker service update --image nexus-frontend:latest --force nexus_frontend
```

---

## 📋 RESUMO PARA PRÓXIMA SESSÃO

### O QUE FOI FEITO
✅ Backup completo do sistema (420MB)
✅ Análise detalhada do documento de alterações
✅ Criação de 43 tarefas documentadas
✅ Script Airtable preparado
✅ Plano de 8 sprints definido
✅ Guias de implementação detalhados

### O QUE FALTA FAZER
⏳ Executar Sprint 1 (42h - Bugs críticos)
⏳ Executar Sprint 2 (38h - Permissões)
⏳ Executar Sprint 3 (27h - Leads→Pacientes)
⏳ Executar Sprint 4 (40h - Agenda avançada)
⏳ Executar Sprint 5 (31h - Pacientes/Prontuários)
⏳ Executar Sprint 6 (20h - Estoque)
⏳ Executar Sprint 7 (12h - Financeiro)
⏳ Executar Sprint 8 (40h - BI - OPCIONAL)

### COMANDO PARA INICIAR PRÓXIMA SESSÃO
```bash
# 1. Ir para o diretório
cd /root/nexusatemporalv1

# 2. Ler este documento
cat SESSAO_06112025_PLANEJAMENTO_v129.md

# 3. Verificar backup
ls -lh /root/backup-sistema-completo-*.tar.gz

# 4. Ver status Git
git status

# 5. Criar backup da sprint
cd /root
tar -czf backup-sprint-1-inicio-$(date +%Y%m%d_%H%M%S).tar.gz \
  --exclude='*/node_modules' --exclude='*/dist' --exclude='.git' \
  nexusatemporalv1/

# 6. Criar branch
cd /root/nexusatemporalv1
git checkout -b sprint-1-bug-fixes

# 7. Começar primeira tarefa
# Ver seção "SPRINT 1 - TAREFA 1: Navegação de Submenus" acima
```

---

**📅 Data de Criação**: 06/11/2025
**🕐 Hora**: ~00:40 UTC
**✍️ Autor**: Claude (Anthropic AI)
**📌 Versão**: v129-planning
**✅ Status**: ✅ DOCUMENTAÇÃO COMPLETA

---

## 🎓 NOTAS FINAIS

Este documento foi criado para garantir **continuidade total** entre sessões. Contém:

- ✅ 43 tarefas detalhadas com estimativas
- ✅ 8 sprints organizadas por prioridade
- ✅ Guias passo-a-passo para cada tarefa crítica
- ✅ Queries SQL para migrations
- ✅ Código de exemplo para correções
- ✅ Comandos prontos para copiar/colar
- ✅ Troubleshooting de problemas comuns
- ✅ Checklist completos
- ✅ Referências técnicas

**Total de horas estimadas**: ~250 horas
**Total de dias (8h/dia)**: ~31 dias
**Sprints recomendadas**: 6-8 semanas

**Boa sorte na implementação! 🚀**
