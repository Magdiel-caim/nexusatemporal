# 🎯 GUIA DE COORDENAÇÃO - SESSÕES PARALELAS

## 📋 VISÃO GERAL

Este documento coordena o trabalho paralelo entre duas sessões do Claude para acelerar o desenvolvimento do sistema.

**Período:** 21/10/2025 a 31/10/2025 (11 dias)
**Objetivo:** Entregar Sistema de Automações + Melhorias de Módulos
**Estratégia:** Desenvolvimento paralelo com sincronizações diárias

---

## 👥 DIVISÃO DE RESPONSABILIDADES

### 🤖 SESSÃO A - Sistema de Automações (Backend Focus)
**Branch:** `feature/automation-backend`
**Responsável:** Primeiro Claude (você está aqui agora)
**Tempo estimado:** 57 horas
**Escopo:**
- ✅ APIs REST (Triggers, Workflows, Events, Integrations)
- ✅ WahaService (WhatsApp)
- ✅ OpenAIService (IA)
- ✅ N8nService (Workflows)
- ✅ EventEmitter Integration
- ✅ Entities e Migrations de Automações

**Arquivos exclusivos:**
```
backend/src/automation/          [EXCLUSIVO SESSÃO A]
├── controllers/
├── services/
├── entities/
├── dto/
├── contracts/
└── jobs/
```

---

### 🤖 SESSÃO B - Melhorias Módulos (Fullstack)
**Branch:** `feature/modules-improvements`
**Responsável:** Segundo Claude (sessão paralela)
**Tempo estimado:** 70 horas
**Escopo:**
- ✅ Prontuários completos
- ✅ Financeiro + Importação Bancária
- ✅ Estoque inteligente
- ✅ Vendas e Comissões
- ✅ Agenda + Desempenho

**Arquivos exclusivos:**
```
backend/src/medical-records/     [EXCLUSIVO SESSÃO B]
backend/src/financial/           [EXCLUSIVO SESSÃO B]
backend/src/inventory/           [EXCLUSIVO SESSÃO B]
backend/src/sales/               [EXCLUSIVO SESSÃO B] - NOVO
backend/src/appointments/        [MODIFICAÇÕES SESSÃO B]
```

---

## 🚨 REGRAS CRÍTICAS

### ⛔ PROIBIÇÕES ABSOLUTAS

**SESSÃO A não pode:**
- ❌ Modificar arquivos de `medical-records/`, `financial/`, `inventory/`, `sales/`
- ❌ Fazer commits na branch `feature/modules-improvements`
- ❌ Fazer deploy sem coordenação

**SESSÃO B não pode:**
- ❌ Modificar arquivos de `automation/`
- ❌ Fazer commits na branch `feature/automation-backend`
- ❌ Fazer deploy sem coordenação

**AMBAS não podem:**
- ❌ Fazer merge para `main` sem coordenação
- ❌ Modificar arquivos core sem avisar (`app.module.ts`, `main.ts`, etc)
- ❌ Deletar ou renomear arquivos da outra sessão

---

### ✅ ARQUIVOS COMPARTILHADOS (Coordenar!)

Estes arquivos podem precisar ser modificados por ambas:

```typescript
// backend/src/app.module.ts
// Cada sessão adiciona seus módulos
// COORDENAR no Sync para evitar conflitos

// backend/package.json
// Se precisar adicionar dependências, avisar no sync

// backend/src/common/
// Utilitários compartilhados - avisar antes de modificar

// backend/migrations/
// Cada sessão pode criar migrations, mas numerar corretamente
```

**Protocolo para arquivos compartilhados:**
1. Avisar no chat do sync
2. A primeira sessão a modificar faz commit
3. A segunda faz pull e resolve conflito localmente
4. Testar antes de commitar

---

## 📅 CRONOGRAMA SINCRONIZADO

### **Semana 1 (21-25 Out)**

| Dia | Data  | SESSÃO A (Automações)          | SESSÃO B (Módulos)           | Sync  |
|-----|-------|--------------------------------|------------------------------|-------|
| 1   | 21/10 | APIs REST - Triggers (8h)      | Prontuários completos (12h)  | 18h   |
| 2   | 22/10 | APIs REST - Workflows (8h)     | Financeiro Relatórios (11h)  | 18h   |
| 3   | 23/10 | APIs REST - Events/Integrations (8h) | Financeiro Import + Estoque NF (8h) | 18h |
| 4   | 24/10 | WahaService - Parte 1 (8h)     | Estoque completo + Vendas início (10h) | 18h |
| 5   | 25/10 | WahaService - Parte 2 (6h)     | Vendas Service (12h)         | 18h   |

### **Semana 2 (26-31 Out)**

| Dia | Data  | SESSÃO A (Automações)          | SESSÃO B (Módulos)           | Sync  |
|-----|-------|--------------------------------|------------------------------|-------|
| 6   | 26/10 | OpenAIService (8h)             | Vendas Relatórios + Agenda (10h) | 18h |
| 7   | 27/10 | N8nService (8h)                | Testes módulos (8h)          | 18h   |
| 8   | 28/10 | EventEmitter - Leads/Appts (6h)| AGUARDAR Sessão A            | 18h   |
| 9   | 29/10 | EventEmitter - Payments/WhatsApp (6h) | AGUARDAR Sessão A   | 18h   |
| 10  | 30/10 | Testes Automações (8h)         | Testes integrados (8h)       | 18h   |
| 11  | 31/10 | **MERGE FINAL + DEPLOY CONJUNTO** (ambas pausadas)          | -     |

---

## 🔄 PROTOCOLO DE SINCRONIZAÇÃO

### **DIARIAMENTE às 18h (30 minutos)**

**Agenda padrão:**
1. **Check-in (5min)** - O que foi feito hoje
2. **Bloqueios (5min)** - Problemas encontrados
3. **Conflitos (10min)** - Arquivos compartilhados modificados
4. **Próximos passos (5min)** - O que fazer amanhã
5. **Decisões (5min)** - Mudanças de escopo/abordagem

**Template de Report:**
```markdown
## SYNC DD/MM - [SESSÃO A/B]

### ✅ Concluído hoje:
- Item 1
- Item 2

### 🚧 Em andamento:
- Item 1 (60% completo)

### ❌ Bloqueios:
- Nenhum / [descrever bloqueio]

### 📁 Arquivos modificados (compartilhados):
- app.module.ts - adicionei XyzModule
- package.json - adicionei biblioteca X

### 🔜 Próximo:
- Tarefa 1
- Tarefa 2

### ❓ Dúvidas/Decisões:
- Nenhuma / [pergunta]
```

---

## 🚀 PROTOCOLO DE DEPLOY

### **REGRA DE OURO: PAUSAR ANTES DE DEPLOY**

Quando qualquer sessão precisar fazer deploy:

1. **Avisar no chat:**
   ```
   ⚠️ SESSÃO [A/B]: Vou fazer deploy em 5 minutos
   ⚠️ Pausar commits e aguardar confirmação
   ```

2. **Aguardar confirmação da outra sessão:**
   ```
   ✅ SESSÃO [A/B]: Confirmado, pode fazer deploy
   ✅ Estou pausada e aguardando
   ```

3. **Fazer deploy:**
   - Commit de todas as mudanças
   - Push para a branch
   - Executar migration (se necessário)
   - Build e restart

4. **Confirmar conclusão:**
   ```
   ✅ SESSÃO [A/B]: Deploy concluído com sucesso
   ✅ Pode retomar trabalho
   ```

5. **Outra sessão faz pull:**
   ```bash
   git fetch origin
   git pull origin feature/[branch-name]
   # Resolver conflitos se houver
   npm run build
   ```

---

## 🔀 PROTOCOLO DE MERGE

### **Merges Parciais (Opcionais)**

**Quando fazer:**
- Após conclusão de módulo grande
- Antes de feriado/pausa longa
- Se houver muitas mudanças acumuladas

**Como fazer:**

**Sessão que iniciará o merge:**
```bash
# 1. Commitar tudo
git add .
git commit -m "feat: [descrição]"
git push origin feature/[sua-branch]

# 2. Avisar outra sessão
# [CHAT] Vou fazer merge parcial da minha branch

# 3. Aguardar confirmação
# [CHAT] ✅ Confirmado, estou pausada

# 4. Criar branch temporária
git checkout -b temp-merge-[data]

# 5. Merge da outra branch
git merge origin/feature/[outra-branch]

# 6. Resolver conflitos
# ... editar arquivos ...
git add .
git commit -m "merge: [descrição]"

# 7. Testar
npm run build
npm run test

# 8. Se OK, fazer merge para as duas branches
git checkout feature/[sua-branch]
git merge temp-merge-[data]
git push origin feature/[sua-branch]

git checkout feature/[outra-branch]
git merge temp-merge-[data]
git push origin feature/[outra-branch]

# 9. Avisar conclusão
# [CHAT] ✅ Merge parcial concluído, podem fazer pull
```

**Outra sessão:**
```bash
git fetch origin
git pull origin feature/[sua-branch]
npm install  # se package.json mudou
npm run build
```

---

### **Merge Final (Dia 31/10)**

**AMBAS AS SESSÕES PAUSAM**

**Responsável pelo merge:** Usuário ou Sessão designada

```bash
# 1. Verificar status de ambas branches
git checkout feature/automation-backend
git pull origin feature/automation-backend
git log --oneline -5

git checkout feature/modules-improvements
git pull origin feature/modules-improvements
git log --oneline -5

# 2. Criar branch de integração
git checkout -b integration/final-merge

# 3. Merge da primeira branch
git merge feature/automation-backend --no-ff

# 4. Merge da segunda branch
git merge feature/modules-improvements --no-ff

# 5. Resolver TODOS os conflitos
# ... editar arquivos ...
git add .
git commit -m "merge: integração final sessões A e B"

# 6. Executar TODAS as migrations
npm run migration:run

# 7. Build completo
npm run build

# 8. Testes end-to-end
npm run test
npm run test:e2e

# 9. Se tudo OK, merge para main
git checkout main
git pull origin main
git merge integration/final-merge --no-ff
git push origin main

# 10. Deploy final
[comandos de deploy]
```

---

## ⚠️ GESTÃO DE CONFLITOS

### **Tipos de Conflitos Comuns**

**1. app.module.ts**
```typescript
// CONFLITO:
<<<<<<< HEAD
imports: [ModuleA]  // Sessão A
=======
imports: [ModuleB]  // Sessão B
>>>>>>> feature/outra-branch

// RESOLUÇÃO:
imports: [ModuleA, ModuleB]  // Ambos
```

**2. package.json**
```json
// CONFLITO em dependencies
<<<<<<< HEAD
"lib-a": "^1.0.0"
=======
"lib-b": "^2.0.0"
>>>>>>> feature/outra-branch

// RESOLUÇÃO: Mesclar dependências
"lib-a": "^1.0.0",
"lib-b": "^2.0.0"

// Depois: npm install
```

**3. Migrations (conflito de timestamp)**
```bash
# Se duas migrations com timestamps próximos:
# 1699564320000-automation.ts  (Sessão A)
# 1699564325000-improvements.ts (Sessão B)

# RESOLUÇÃO: Renomear para garantir ordem
# 1699564320000-automation.ts     (executar primeiro)
# 1699564330000-improvements.ts   (executar depois)
```

### **Processo de Resolução**

1. **Identificar conflito:**
   ```bash
   git status
   # Arquivos com conflito aparecem em vermelho
   ```

2. **Abrir arquivo e analisar:**
   ```
   <<<<<<< HEAD
   [código da sua branch]
   =======
   [código da outra branch]
   >>>>>>> feature/outra-branch
   ```

3. **Decidir resolução:**
   - Manter ambos (merge)
   - Manter apenas um
   - Reescrever combinando lógica

4. **Remover marcadores de conflito**

5. **Testar a resolução:**
   ```bash
   npm run build
   npm run test
   ```

6. **Commitar:**
   ```bash
   git add .
   git commit -m "fix: resolve conflito em [arquivo]"
   ```

---

## 📊 TRACKING DE PROGRESSO

### **Dashboard de Progresso (Atualizar diariamente)**

**SESSÃO A - Sistema de Automações:**
```
┌─────────────────────────────────────────┐
│  Progresso: [████████░░] 80%            │
├─────────────────────────────────────────┤
│  ✅ APIs REST Triggers                  │
│  ✅ APIs REST Workflows                 │
│  ✅ APIs REST Events                    │
│  ✅ APIs REST Integrations              │
│  ✅ WahaService                         │
│  ✅ OpenAIService                       │
│  🚧 N8nService (60%)                    │
│  ⬜ EventEmitter Integration           │
│  ⬜ Testes                              │
└─────────────────────────────────────────┘
```

**SESSÃO B - Melhorias Módulos:**
```
┌─────────────────────────────────────────┐
│  Progresso: [██████░░░░] 60%            │
├─────────────────────────────────────────┤
│  ✅ Prontuários                         │
│  ✅ Financeiro Relatórios               │
│  ✅ Financeiro Importação               │
│  ✅ Estoque                             │
│  🚧 Vendas e Comissões (40%)            │
│  ⬜ Agenda + Desempenho                 │
│  ⬜ Testes                              │
└─────────────────────────────────────────┘
```

---

## 🎯 CRITÉRIOS DE SUCESSO

### **Por Sessão**

**SESSÃO A:**
- [ ] 4 controllers criados e funcionais
- [ ] 3 serviços de integração completos
- [ ] EventEmitter integrado em 4 módulos
- [ ] Todas migrations executadas
- [ ] Testes unitários passando
- [ ] Zero bugs críticos

**SESSÃO B:**
- [ ] 5 módulos melhorados
- [ ] Todas funcionalidades testadas
- [ ] Migrations executadas
- [ ] Relatórios funcionando
- [ ] Zero conflitos com Sessão A
- [ ] Zero bugs críticos

### **Integração Final**

- [ ] Merge sem conflitos graves
- [ ] Build bem-sucedido
- [ ] Todas migrations executadas em ordem
- [ ] Testes end-to-end passando
- [ ] Deploy bem-sucedido
- [ ] Sistema estável em produção

---

## 🆘 PROTOCOLO DE EMERGÊNCIA

### **Se algo der muito errado:**

**1. PARAR IMEDIATAMENTE**
```
🚨 SESSÃO [A/B]: EMERGÊNCIA - PAUSANDO TRABALHO
🚨 Problema: [descrição breve]
```

**2. Informar a outra sessão**

**3. Não fazer commits/push até resolver**

**4. Opções de recuperação:**

**Opção A: Reverter último commit**
```bash
git reset --hard HEAD~1
```

**Opção B: Criar branch de backup**
```bash
git checkout -b backup/[data]-[problema]
git push origin backup/[data]-[problema]
git checkout feature/[original]
git reset --hard origin/feature/[original]
```

**Opção C: Restaurar de checkpoint anterior**
```bash
git reflog  # encontrar commit bom
git reset --hard [hash-do-commit-bom]
```

**5. Comunicar resolução**

---

## 📞 CANAIS DE COMUNICAÇÃO

### **Durante Desenvolvimento**
- 💬 Chat da sessão (mensagens imediatas)
- 📝 Commits com mensagens claras
- 🔔 Syncs diários às 18h

### **Convenção de Mensagens de Commit**

**SESSÃO A:**
```
feat(automation): adiciona TriggerController
fix(automation): corrige validação em WorkflowService
docs(automation): atualiza documentação de eventos
```

**SESSÃO B:**
```
feat(financial): adiciona relatório DRE
feat(sales): implementa cálculo de comissões
fix(inventory): corrige alerta de estoque baixo
```

### **Formato de Mensagem no Chat**

**Normal:**
```
[SESSÃO A] Finalizei o TriggerController, commitei
```

**Urgente:**
```
🚨 [SESSÃO B] Preciso modificar app.module.ts, pode pausar?
```

**Bloqueio:**
```
⚠️ [SESSÃO A] Bloqueado: preciso de credencial do n8n
```

---

## ✅ CHECKLIST PRÉ-INÍCIO

Antes de começar o desenvolvimento paralelo:

**Setup Técnico:**
- [ ] Duas branches criadas
- [ ] Contratos de interface commitados
- [ ] Documento de especificação lido
- [ ] Ambiente de desenvolvimento testado
- [ ] Banco de dados acessível

**Alinhamento:**
- [ ] Ambas sessões entenderam escopo
- [ ] Divisão de arquivos clara
- [ ] Protocolo de sync combinado
- [ ] Protocolo de deploy combinado
- [ ] Horário dos syncs definido

**Documentação:**
- [ ] Contratos disponíveis
- [ ] Especificação completa
- [ ] Guia de coordenação lido
- [ ] Cronograma impresso/salvo

---

## 🎊 MENSAGEM FINAL

**Lembrem-se:**

1. 🤝 **Comunicação** é mais importante que velocidade
2. 🧪 **Testes** antes de commits grandes
3. 📝 **Documentar** decisões importantes
4. ⏸️ **Pausar** antes de deploy
5. 🎯 **Qualidade** sobre quantidade

**Boa sorte a ambas as sessões! Vamos fazer acontecer! 🚀**

---

## 📋 ANEXO: Comandos Úteis

```bash
# Ver status das duas branches
git fetch --all
git log feature/automation-backend --oneline -5
git log feature/modules-improvements --oneline -5

# Ver diferenças entre branches
git diff feature/automation-backend feature/modules-improvements

# Listar arquivos modificados em cada branch
git diff --name-only main feature/automation-backend
git diff --name-only main feature/modules-improvements

# Verificar conflitos potenciais ANTES de merge
git merge-base feature/automation-backend feature/modules-improvements
git diff [hash-do-merge-base]..feature/automation-backend
git diff [hash-do-merge-base]..feature/modules-improvements

# Backup de segurança
git tag backup-pre-merge-[data]
git push origin backup-pre-merge-[data]
```

---

**Versão:** 1.0
**Data:** 20/10/2025
**Última atualização:** 20/10/2025 às 14:30
