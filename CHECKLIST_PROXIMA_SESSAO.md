# ✅ CHECKLIST - PRÓXIMA SESSÃO

**Versão**: v129
**Data de criação**: 06/11/2025

---

## 📋 ANTES DE COMEÇAR

### Verificações Iniciais
- [ ] Ler `RESUMO_EXECUTIVO_v129.md`
- [ ] Ler `INICIO_RAPIDO_v129.md`
- [ ] Ler `SESSAO_06112025_PLANEJAMENTO_v129.md`
- [ ] Verificar backup existe: `ls -lh /root/backup-sistema-completo-*.tar.gz`
- [ ] Verificar sistema rodando: `docker ps | grep nexus`
- [ ] Testar acesso: `curl -I https://one.nexusatemporal.com.br`

---

## 🚀 PREPARAR AMBIENTE

### Git
- [ ] Ver status: `git status`
- [ ] Ver branch atual: `git branch`
- [ ] Ver últimos commits: `git log --oneline -10`
- [ ] Criar branch Sprint 1: `git checkout -b sprint-1-bug-fixes`

### Backup da Sprint
- [ ] Criar backup específico:
```bash
cd /root
tar -czf backup-sprint-1-$(date +%Y%m%d).tar.gz \
  --exclude='*/node_modules' --exclude='*/dist' --exclude='.git' \
  nexusatemporalv1/
```
- [ ] Verificar backup criado: `ls -lh backup-sprint-1-*.tar.gz`

### Dependências
- [ ] Backend: `npm install`
- [ ] Frontend: `cd /root/nexusatemporalv1/frontend && npm install`

---

## 📊 AIRTABLE (OPCIONAL)

Se tiver credenciais do Airtable:

- [ ] Adicionar ao `.env`:
```
AIRTABLE_API_KEY=your_key
AIRTABLE_BASE_ID=your_base
AIRTABLE_TABLE_TASKS=Tasks
```
- [ ] Executar script: `node backend/add-system-improvements-tasks-v129.js`
- [ ] Verificar tarefas criadas no Airtable

Se NÃO tiver, pular esta seção.

---

## 🔴 SPRINT 1: BUGS CRÍTICOS

### Tarefa 1: Navegação Submenus (3h)
- [ ] Ler guia: Seção "SPRINT 1 - TAREFA 1" no planejamento
- [ ] Investigar arquivos:
  - [ ] `frontend/src/App.tsx`
  - [ ] `frontend/src/pages/FinanceiroPage.tsx`
  - [ ] `frontend/src/pages/EstoquePage.tsx`
  - [ ] Outros módulos com submenus
- [ ] Implementar correção
- [ ] Testar: Clicar em cada submenu
- [ ] Verificar: URL muda E conteúdo atualiza
- [ ] Commit: `git commit -m "fix: corrige navegação de submenus"`

### Tarefa 2: Erro Upload Imagem (4h)
- [ ] Ler logs de erro: `cat prompt/Erro salvar imagem.txt`
- [ ] Ler guia: Seção "SPRINT 1 - TAREFA 2" no planejamento
- [ ] Ver logs backend: `docker service logs nexus_backend --tail 100 | grep -i imagem`
- [ ] Investigar arquivos:
  - [ ] `backend/src/modules/pacientes/pacientes.controller.ts`
  - [ ] `backend/src/modules/pacientes/pacientes.service.ts`
- [ ] Configurar CORS no IDrive E2 (se necessário)
- [ ] Implementar correção
- [ ] Testar upload de imagem
- [ ] Commit: `git commit -m "fix: corrige upload de imagens no módulo Pacientes"`

### Tarefa 3: Erro Movimentação Estoque (3h)
- [ ] Ler logs de erro: `cat prompt/Erro estoque.txt`
- [ ] Ler guia: Seção "SPRINT 1 - TAREFA 3" no planejamento
- [ ] Investigar arquivos:
  - [ ] `backend/src/modules/stock/movement.entity.ts`
  - [ ] `backend/src/modules/stock/dto/create-movement.dto.ts`
  - [ ] `frontend/src/pages/EstoquePage.tsx`
- [ ] Identificar valores corretos do enum
- [ ] Corrigir frontend para enviar valores corretos
- [ ] Testar cada tipo de movimentação
- [ ] Commit: `git commit -m "fix: corrige validação de tipo de movimentação"`

### Tarefa 4: Bug Restrição Data (2h)
- [ ] Verificar se já foi corrigido em v128.1
- [ ] Se não, aplicar correção `min={new Date().toISOString().split('T')[0]}`
- [ ] Testar agendamento para hoje
- [ ] Testar agendamento para amanhã
- [ ] Commit: `git commit -m "fix: permite agendamento para data atual"`

### Tarefa 5: Configurar SMTP (3h)
- [ ] Instalar nodemailer: `npm install nodemailer @types/nodemailer`
- [ ] Adicionar variáveis ao `.env`
- [ ] Criar `EmailService`
- [ ] Testar envio de email
- [ ] Commit: `git commit -m "feat: configura SMTP Zoho para envio de emails"`

### Tarefas 6-11: Módulo Financeiro
- [ ] Seguir guias no documento de planejamento
- [ ] Corrigir aprovação de Ordens (4h)
- [ ] Corrigir cálculo de transações (4h)
- [ ] Corrigir edição de despesas (4h)
- [ ] Corrigir fluxo de caixa (10h)
- [ ] Corrigir acesso de Proprietários (4h)
- [ ] Corrigir widget Dashboard (2h)

---

## 🏗️ BUILD E DEPLOY

### Backend
- [ ] Build: `cd backend && npm run build`
- [ ] Verificar erros: Zero errors esperado
- [ ] Docker build: `docker build -f Dockerfile.production -t nexus-backend:v129 .`
- [ ] Update service: `docker service update --image nexus-backend:v129 --force nexus_backend`
- [ ] Ver logs: `docker service logs nexus_backend --tail 50`

### Frontend
- [ ] Build: `cd frontend && npm run build`
- [ ] Verificar warnings: Zero warnings esperado
- [ ] Docker build: `docker build -f Dockerfile.prod -t nexus-frontend:v129 .`
- [ ] Update service: `docker service update --image nexus-frontend:v129 --force nexus_frontend`
- [ ] Ver logs: `docker service logs nexus_frontend --tail 50`

### Verificação
- [ ] Acessar sistema: https://one.nexusatemporal.com.br
- [ ] Fazer login
- [ ] Testar cada correção
- [ ] Verificar logs de erro no console

---

## 📝 DOCUMENTAÇÃO

### Ao Final da Sprint
- [ ] Criar arquivo: `SPRINT_1_RELATORIO.md`
- [ ] Preencher template (ver documento de planejamento)
- [ ] Listar tarefas completadas
- [ ] Documentar problemas encontrados
- [ ] Atualizar CHANGELOG.md

---

## 🔄 COMMIT E PUSH

### Finalizar Sprint
- [ ] Ver todas as mudanças: `git status`
- [ ] Adicionar tudo: `git add .`
- [ ] Commit final: `git commit -m "feat: Sprint 1 - Correção de bugs críticos v129"`
- [ ] Push: `git push origin sprint-1-bug-fixes`
- [ ] Criar Pull Request (se aplicável)

---

## 💾 BACKUP FINAL

### Após Sprint Completada
- [ ] Criar backup pós-sprint:
```bash
cd /root
tar -czf backup-sprint-1-completa-$(date +%Y%m%d).tar.gz \
  --exclude='*/node_modules' --exclude='*/dist' --exclude='.git' \
  nexusatemporalv1/
```
- [ ] Verificar: `ls -lh backup-sprint-1-*.tar.gz`

---

## 📊 RELATÓRIO

### Métricas da Sprint
- [ ] Horas trabalhadas: _____h
- [ ] Tarefas completadas: ____ de 11
- [ ] Bugs encontrados: ____
- [ ] Tarefas pendentes: ____

### Observações
- [ ] Documentar dificuldades
- [ ] Documentar soluções não previstas
- [ ] Sugestões de melhoria

---

## 🎯 PRÓXIMA SPRINT

### Preparar Sprint 2
- [ ] Criar branch: `git checkout -b sprint-2-permissions`
- [ ] Criar backup: Similar ao da Sprint 1
- [ ] Ler seção Sprint 2 no planejamento
- [ ] Revisar migrations necessárias

---

## 📞 SUPORTE

**Em caso de dúvidas**:
- Consultar: `SESSAO_06112025_PLANEJAMENTO_v129.md`
- Seção Troubleshooting
- Seção Comandos Rápidos

**Credenciais**:
- DB: nexus_admin / nexus2024@secure @ 46.202.144.210
- SMTP: contato@nexusatemporal.com.br / 03wCCAnBSSQB

---

**✅ Quando marcar todas as checkboxes desta lista, a Sprint 1 estará completa!**

**Boa implementação! 🚀**
