# 📋 Regras de Validação - Tasks e Projetos

## 🎯 Regra Principal

### Tasks e Projetos JÁ EXISTENTES
✅ **Ficam como estão!**
- Não precisam passar por validação retroativa
- Status atual é mantido
- Histórico preservado

### Tasks e Projetos NOVOS (a partir de 03/11/2025)
🔄 **Seguem workflow de validação**
- Todas as novas implementações passam por aprovação
- Sistema de revisão ativo
- Feedback obrigatório

---

## 📊 Status por Categoria

### PROJETOS

#### Projetos Existentes (21)
```
Status Atual → Mantido
├─ Approved (15) → ✅ Ficam como "Approved"
├─ In Progress (4) → 🔄 Continuam "In Progress"
└─ Pending (2) → 📋 Continuam "Pending"
```

#### Projetos Novos
```
Workflow Completo
├─ Pending → Aguardando início
├─ In Progress → Claude desenvolvendo
├─ Awaiting Approval → Você testa
├─ Needs Revision → Problemas encontrados
└─ Approved → Finalizado e validado ✅
```

### TASKS

#### Tasks Existentes (196)
```
Status Atual → Mantido
├─ Completed (0) → ✅ Ficam como "Completed"
├─ In Progress (8) → 🔄 Continuam "In Progress"
└─ Pending (13) → 📋 Continuam "Pending"
```

#### Tasks Novas
```
Workflow Completo
├─ Pending → Aguardando início
├─ In Progress → Claude desenvolvendo
├─ Awaiting Approval → Você testa
├─ Needs Revision → Problemas encontrados
└─ Completed → Finalizado e validado ✅
```

---

## 🔄 Como Identificar

### Projeto/Task EXISTENTE
- Criado antes de 03/11/2025
- Já estava no Airtable
- Status: Approved, In Progress, Pending, Completed

### Projeto/Task NOVO
- Criado a partir de 03/11/2025
- Claude marca como "Awaiting Approval" ao finalizar
- Você precisa testar e aprovar

---

## 💡 Exemplos Práticos

### Exemplo 1: Módulo Dashboard (EXISTENTE)
```
Status: Approved ✅
Ação: NENHUMA
Motivo: Já foi desenvolvido e está funcionando

Não precisa:
❌ Testar novamente
❌ Aprovar retroativamente
❌ Mudar status
```

### Exemplo 2: Nova Feature no Dashboard (NOVA)
```
Claude implementa "Export PDF"
Status: In Progress → Awaiting Approval

Você PRECISA:
✅ Testar a feature
✅ Aprovar ou reportar problemas
✅ Seguir workflow de validação
```

### Exemplo 3: Task "Criar gráficos" (EXISTENTE)
```
Status: Completed ✅
Ação: NENHUMA
Motivo: Já foi feito e está funcionando

Mantém como "Completed"
```

### Exemplo 4: Task "Adicionar filtro" (NOVA)
```
Claude implementa
Status: In Progress → Awaiting Approval

Você PRECISA:
✅ Testar o filtro
✅ Aprovar ou reportar bugs
```

---

## 🎯 Quando Aplicar Validação

### ✅ SEMPRE Validar

1. **Novos Módulos/Features**
   - Exemplo: Módulo Relatórios (novo)
   - Workflow completo obrigatório

2. **Novas Tasks**
   - Exemplo: "Implementar busca avançada"
   - Teste e aprovação necessários

3. **Correções Significativas**
   - Exemplo: Reescrever componente
   - Revalidação obrigatória

### ❌ NUNCA Validar

1. **Módulos Já Aprovados**
   - Exemplo: Módulo Dashboard (já funcionando)
   - Manter "Approved"

2. **Tasks Antigas Completadas**
   - Exemplo: "Criar tabela de usuários" (já feito)
   - Manter "Completed"

3. **Histórico Antigo**
   - Não reavaliar trabalho passado
   - Não mudar status retroativamente

---

## 📅 Marco Temporal

**Data de Corte: 03/11/2025**

- **Antes:** Mantém status atual
- **Depois:** Aplica workflow de validação

---

## 🔍 Como Claude Vai Saber

### Ao Criar Nova Feature

```javascript
// Claude vai automaticamente:
await airtableService.syncProject({
  name: 'Nova Feature X',
  status: 'In Progress'
});

// Ao finalizar
await airtableService.updateProjectStatus(
  'Nova Feature X',
  'Awaiting Approval',
  'Feature implementada, pronta para teste'
);
```

### Ao Trabalhar em Projeto Existente

```javascript
// Claude mantém status atual
// Não muda para "Awaiting Approval"
// Apenas atualiza progresso se necessário
```

---

## 📊 Resumo Visual

```
╔══════════════════════════════════════════════════════════╗
║                    REGRA DE VALIDAÇÃO                    ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  JÁ EXISTENTE          │  NOVO (03/11/2025+)            ║
║  ─────────────────     │  ───────────────               ║
║  ✅ Mantém status      │  🔄 Workflow completo          ║
║  ❌ Não valida         │  ✅ Teste obrigatório          ║
║  📋 Histórico OK       │  📝 Feedback necessário        ║
║                        │                                ║
║  Exemplos:             │  Exemplos:                     ║
║  • Módulo Dashboard    │  • Módulo Relatórios           ║
║  • Módulo Chat         │  • Feature Export PDF          ║
║  • Tasks antigas       │  • Tasks novas                 ║
║                        │                                ║
╚══════════════════════════════════════════════════════════╝
```

---

## 🎯 Benefícios Dessa Abordagem

1. **✅ Histórico Preservado**
   - Nada do trabalho passado é perdido
   - Status atuais refletem realidade

2. **✅ Qualidade Futura**
   - Novas features têm validação
   - Bugs são pegos antes de "finalizar"

3. **✅ Pragmatismo**
   - Não perde tempo revalidando o que funciona
   - Foco em novas implementações

4. **✅ Rastreabilidade**
   - Claro o que é legado vs novo
   - Fácil identificar pelo status

---

## 💡 FAQ

### P: E se eu quiser testar um módulo antigo?
**R:** Pode testar quando quiser, mas não precisa mudar status no Airtable. Se encontrar bugs, crie uma nova task "Corrigir bug X" que seguirá o workflow de validação.

### P: Tasks "In Progress" antigas seguem qual regra?
**R:** Mantém "In Progress". Quando Claude finalizar, aí sim vai para "Awaiting Approval".

### P: E se Claude mexer em código antigo?
**R:** Se for uma nova feature/correção, vira tarefa nova com workflow de validação. Se for só manutenção, mantém status atual.

### P: Como sei se é tarefa nova ou antiga?
**R:** Pergunta ao Claude! Ele vai dizer: "Esta é uma nova implementação, vou marcar como 'Awaiting Approval' quando finalizar"

---

## 🚀 Ação Imediata

**NENHUMA! 🎉**

- Sistema já está configurado corretamente
- 196 tasks antigas mantidas como estão
- 21 projetos com status preservado
- Workflow ativo para novos itens

**Próximas features seguem automaticamente o workflow de validação!**

---

**Data de Implementação:** 03/11/2025
**Status:** ✅ Ativo
**Revisão:** Não necessária
