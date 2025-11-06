# 🚀 INÍCIO RÁPIDO - SESSÃO v129

**Versão**: v129
**Data**: 06/11/2025
**Status**: Pronto para implementação

---

## ⚡ COMANDOS PARA COMEÇAR AGORA

```bash
# 1. Ir para o projeto
cd /root/nexusatemporalv1

# 2. Verificar backup existe
ls -lh /root/backup-sistema-completo-20251106_003408.tar.gz

# 3. Ler documento completo
cat SESSAO_06112025_PLANEJAMENTO_v129.md

# 4. Criar branch para Sprint 1
git checkout -b sprint-1-bug-fixes

# 5. Criar backup da sprint
cd /root && tar -czf backup-sprint-1-$(date +%Y%m%d).tar.gz \
  --exclude='*/node_modules' --exclude='*/dist' --exclude='.git' \
  nexusatemporalv1/
```

---

## 📊 VISÃO GERAL

### Backups Criados
✅ **Sistema completo**: `/root/backup-sistema-completo-20251106_003408.tar.gz` (420MB)

### Documentos Importantes
✅ **Planejamento completo**: `SESSAO_06112025_PLANEJAMENTO_v129.md`
✅ **Script Airtable**: `backend/add-system-improvements-tasks-v129.js`
✅ **Este guia**: `INICIO_RAPIDO_v129.md`

### Tarefas Identificadas
📋 **Total**: 43 tarefas
⏱️ **Estimativa**: ~250 horas
📅 **Sprints**: 8 sprints de 1 semana

---

## 🎯 SPRINTS PLANEJADAS

### Sprint 1: Bugs Críticos (42h)
11 tarefas de correção de bugs que impedem uso normal

### Sprint 2: Permissões (38h)
5 tarefas de sistema de permissões e hierarquias

### Sprint 3: Leads→Pacientes (27h)
5 tarefas de automação e conversão

### Sprint 4: Agenda Avançada (40h)
5 tarefas de funcionalidades complexas

### Sprint 5: Pacientes/Prontuários (31h)
5 tarefas de refatoração e melhorias

### Sprint 6: Estoque (20h)
5 tarefas de completude do módulo

### Sprint 7: Financeiro (12h)
3 tarefas finais do módulo

### Sprint 8: BI Analytics (40h) - OPCIONAL
1 projeto grande de BI personalizado

---

## 🔴 PRIORIDADE MÁXIMA - COMEÇAR POR AQUI

### 1. Navegação de Submenus (3h)
**Problema**: URL muda mas tela não atualiza
**Arquivos**: `frontend/src/App.tsx`, páginas com submenus
**Guia completo**: Seção "SPRINT 1 - TAREFA 1" no documento principal

### 2. Erro Upload Imagem (4h)
**Problema**: 500 Internal Server Error
**Endpoint**: `POST /api/pacientes/{id}/imagens`
**Guia completo**: Seção "SPRINT 1 - TAREFA 2" no documento principal

### 3. Erro Movimentação Estoque (3h)
**Problema**: "Tipo de movimentação inválida"
**Endpoint**: `POST /api/stock/movements`
**Guia completo**: Seção "SPRINT 1 - TAREFA 3" no documento principal

---

## 📚 DOCUMENTAÇÃO DE REFERÊNCIA

### Documentos do Cliente
- **Especificação completa**: `/root/nexusatemporalv1/prompt/Alterações sistema.pdf`
- **Erros de imagem**: `/root/nexusatemporalv1/prompt/Erro salvar imagem.txt`
- **Erros de estoque**: `/root/nexusatemporalv1/prompt/Erro estoque.txt`

### Sessões Anteriores
- **Agenda v128.1**: `SESSAO_04112025_DESENVOLVIMENTO_COMPLETO.md`

---

## ⚙️ CONFIGURAÇÕES NECESSÁRIAS

### SMTP Zoho (Sprint 1 - Tarefa 5)
```env
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=contato@nexusatemporal.com.br
SMTP_PASSWORD=03wCCAnBSSQB
SMTP_FROM=contato@nexusatemporal.com.br
SMTP_FROM_NAME=Nexus Atemporal
```

### Airtable (quando disponível)
```env
AIRTABLE_API_KEY=your_key
AIRTABLE_BASE_ID=your_base
AIRTABLE_TABLE_TASKS=Tasks
```

**Executar script**:
```bash
cd /root/nexusatemporalv1/backend
node add-system-improvements-tasks-v129.js
```

---

## 🗄️ ALTERAÇÕES NO BANCO DE DADOS

### ⚠️ ATENÇÃO: Migrations Necessárias

**Sprint 2** - Sistema de Permissões:
- Criar tabela `user_permissions`
- Atualizar constraint de roles

**Sprint 4** - Múltiplos Procedimentos:
- Criar tabela `appointment_procedures`
- Migration de dados existentes

**Sprint 5** - Inativação Automática:
- Adicionar campos em `pacientes`

**Sprint 6** - Categorias:
- Criar/verificar tabela `product_categories`

**Ver queries SQL completas no documento principal**

---

## 🔧 COMANDOS ÚTEIS

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

### Logs
```bash
# Backend
docker service logs nexus_backend --tail 100

# Frontend
docker service logs nexus_frontend --tail 100
```

### Database
```bash
# Conectar
PGPASSWORD='nexus2024@secure' psql -h 46.202.144.210 -U nexus_admin -d nexus_crm

# Backup
pg_dump -h 46.202.144.210 -U nexus_admin nexus_crm > backup.sql
```

---

## ✅ CHECKLIST ANTES DE COMEÇAR

- [ ] Ler documento completo `SESSAO_06112025_PLANEJAMENTO_v129.md`
- [ ] Verificar backup criado
- [ ] Criar branch da sprint
- [ ] Criar backup específico da sprint
- [ ] Verificar services Docker rodando
- [ ] Testar acesso ao sistema atual

---

## 📖 ESTRUTURA DO DOCUMENTO PRINCIPAL

O documento `SESSAO_06112025_PLANEJAMENTO_v129.md` contém:

1. **Resumo Executivo** - Visão geral do projeto
2. **Arquivos Criados** - Lista de todos os arquivos
3. **Documentos de Referência** - Onde encontrar informações
4. **Categorização das 43 Tarefas** - Por prioridade
5. **Plano de Implementação Faseado** - 8 sprints detalhadas
6. **Guias de Implementação** - Passo-a-passo para cada tarefa crítica
7. **Alterações no Banco** - Todas as migrations necessárias
8. **Configurações** - SMTP, Airtable, etc
9. **Checklists** - Para cada fase
10. **Troubleshooting** - Problemas comuns
11. **Comandos Rápidos** - Git, Docker, Database
12. **Resumo** - Como começar próxima sessão

---

## 💡 DICAS

### Se tiver pouco tempo
Comece pela **Sprint 1** - São bugs que impedem uso normal

### Se quiser impacto rápido
Comece por:
1. Navegação submenus (3h)
2. SMTP Zoho (3h)
3. Bug restrição data (2h)

Total: 8h para resolver 3 problemas visíveis

### Se quiser preparar terreno
Configure primeiro:
1. SMTP (3h)
2. Permissões e hierarquias (6h)
3. Depois implemente funcionalidades

### Para evitar problemas
- ✅ Sempre criar backup antes de mudanças grandes
- ✅ Testar migrations em desenvolvimento primeiro
- ✅ Committar frequentemente
- ✅ Testar manualmente após cada mudança
- ✅ Verificar logs após deploy

---

## 🎯 META POR SPRINT

### Sprint 1: Sistema sem bugs críticos
✅ Todos os módulos navegáveis
✅ Uploads funcionando
✅ Estoque operacional
✅ Financeiro funcional
✅ Emails enviando

### Sprint 2: Controle de acesso robusto
✅ Hierarquias corretas
✅ Permissões granulares
✅ Login por região
✅ Recuperação de senha

### Sprint 3: Automação de vendas
✅ Lead→Paciente automático
✅ WhatsApp integrado
✅ Pagamentos confirmados
✅ Dashboard atualizada

### Sprints 4-8: Funcionalidades avançadas
✅ Agenda completa
✅ Prontuários integrados
✅ Estoque completo
✅ Financeiro finalizado
✅ (Opcional) BI avançado

---

## 📞 CREDENCIAIS RÁPIDAS

**Database**:
- Host: 46.202.144.210
- User: nexus_admin
- Pass: nexus2024@secure
- DB: nexus_crm

**SMTP**:
- Host: smtp.zoho.com:587
- User: contato@nexusatemporal.com.br
- Pass: 03wCCAnBSSQB

**URLs**:
- Frontend: https://one.nexusatemporal.com.br
- API: https://api.nexusatemporal.com.br

---

## 🚦 COMO USAR ESTE GUIA

1. **Primeira vez**: Leia todo o documento principal
2. **Começar sprint**: Use checklist de início
3. **Durante trabalho**: Consulte guias de implementação
4. **Dúvida sobre migration**: Veja seção de banco de dados
5. **Erro**: Consulte troubleshooting
6. **Finalizar sprint**: Use template de relatório

---

**🎓 IMPORTANTE**: Este é um guia resumido. Para instruções completas, sempre consultar:
`SESSAO_06112025_PLANEJAMENTO_v129.md`

**Boa implementação! 🚀**
