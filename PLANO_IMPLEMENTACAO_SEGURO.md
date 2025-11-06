# 🛡️ PLANO DE IMPLEMENTAÇÃO SEGURO - Módulo Chat

**Data:** 03/11/2025
**Princípios:** NÃO quebrar o que funciona | Cuidado extremo com banco de dados

---

## ✅ JÁ CONCLUÍDO (NÃO MEXER!)

### 1. Webhook WAHA → Backend ✅
- **Status:** FUNCIONANDO PERFEITAMENTE
- **Não alterar:** Configuração webhook, endpoint `/api/chat/webhook/waha/message`
- **Backup:** `/root/nexusatemporalv1/backup-waha-webhook-config.json`

### 2. Mensagens de Texto ✅
- **Status:** 100% funcional
- **Não alterar:** Processamento de mensagens de texto
- **Logs confirmam:** Mensagens salvando e aparecendo no frontend

---

## 🔧 CORREÇÕES APLICADAS (FRONTEND APENAS - SEGURO)

### ✅ Correção #1: Hook useMediaUrl.ts
**Arquivo:** `/root/nexusatemporalv1/frontend/src/hooks/useMediaUrl.ts`

**O que foi corrigido:**
- ✅ Base64 agora é usado diretamente (não concatena com API URL)
- ✅ URLs S3 são usadas diretamente (aguarda CORS)
- ✅ Logs no console para debug
- ✅ Fallbacks em caso de erro

**Impacto:**
- ✅ Corrige problema de URLs malformadas (`https://api.../apidata:image...`)
- ✅ Permite que base64 antigas sejam exibidas
- ✅ Permite que URLs S3 sejam carregadas (após CORS)

**Segurança:**
- ✅ **ZERO mudanças no backend**
- ✅ **ZERO mudanças no banco**
- ✅ Apenas lógica do frontend
- ✅ Se der erro, mostra mensagem amigável

---

## 📋 PRÓXIMOS PASSOS (SEGUROS E INCREMENTAIS)

### PASSO 1: Testar Correção do Frontend ⏳
**Ações:**
1. ✅ Código corrigido: `useMediaUrl.ts`
2. ⏳ Build do frontend (aguardando)
3. ⏳ Deploy do frontend
4. ⏳ Testar no navegador (imagens antigas com base64)

**Sem riscos porque:**
- Não mexe no backend
- Não mexe no banco
- Apenas muda como frontend processa URLs

---

### PASSO 2: Configurar CORS (MANUAL) ⏳
**Ações:**
1. ✅ Guia criado: `CONFIGURAR_CORS_IDRIVE_E2.md`
2. ⏳ Você configura manualmente no painel IDrive E2
3. ⏳ Teste: imagens S3 devem carregar

**Sem riscos porque:**
- Configuração externa (IDrive E2)
- Não afeta código do sistema
- Reversível (pode desativar CORS)

---

### PASSO 3: Remover Duplicados (COM CUIDADO!) 🔴
**⚠️ REQUER APROVAÇÃO ANTES DE EXECUTAR**

**Plano:**
1. Criar script **READ-ONLY** para **LISTAR** duplicados
2. Mostrar para você quantos e quais
3. **Aguardar sua aprovação** antes de deletar qualquer coisa
4. Criar backup antes de executar

**Script seguro de análise:**
```sql
-- APENAS LISTAR duplicados (NÃO DELETA)
SELECT
  phone_number,
  whatsapp_instance_id,
  COUNT(*) as total
FROM conversations
GROUP BY phone_number, whatsapp_instance_id
HAVING COUNT(*) > 1;
```

**Não executo sem sua confirmação!**

---

### PASSO 4: Status de Entrega (BACKEND NOVO - SEGURO) 🟡
**Plano:**
1. Criar **NOVA** migration para adicionar coluna `delivery_status`
2. **NÃO ALTERAR** dados existentes
3. Apenas novas mensagens terão status
4. Webhook novo do WAHA (message.ack)

**Segurança:**
- Migration **aditiva** (apenas ADD COLUMN)
- Não altera mensagens existentes
- Se der erro, rollback fácil

---

### PASSO 5: Tags, Arquivar, Prioridade (BACKEND NOVO - SEGURO) 🟡
**Plano:**
1. Criar **NOVAS TABELAS**:
   - `conversation_tags`
   - Adicionar colunas: `archived`, `priority` na tabela `conversations`
2. Migration **aditiva**
3. Endpoints novos (não altera existentes)

**Segurança:**
- Não mexe em dados existentes
- Apenas adiciona funcionalidades
- Tabelas novas (zero conflito)

---

### PASSO 6: Identificação de Atendente (BACKEND - MÉDIO RISCO) 🟡
**Plano:**
1. Adicionar coluna `sent_by_user_id` na tabela `messages`
2. Migration **aditiva** (permite NULL)
3. Mensagens antigas: `sent_by_user_id = NULL` (OK)
4. Mensagens novas: salvar userId

**Segurança:**
- Coluna **opcional** (NULL permitido)
- Não quebra mensagens antigas
- Funcionalidade gradual

---

## 🔴 REGRAS DE SEGURANÇA

### ❌ NUNCA FAZER SEM CONFIRMAR:
1. ❌ DELETE no banco de dados
2. ❌ ALTER TABLE que modifica dados existentes
3. ❌ DROP TABLE ou DROP COLUMN
4. ❌ Mudar endpoints que já funcionam
5. ❌ Reconfigurar webhook WAHA (já funciona!)

### ✅ SEMPRE FAZER:
1. ✅ Criar **backup** antes de migrations
2. ✅ Testar em **ambiente isolado** (se possível)
3. ✅ Migrations **reversíveis** (com DOWN)
4. ✅ Mostrar SQL para você **aprovar** antes de executar
5. ✅ Logs detalhados de cada operação

---

## 📊 RESUMO DO QUE PODE SER FEITO AGORA (SEM RISCOS)

### ✅ Seguro para fazer AGORA:
- ✅ Finalizar build do frontend (apenas código frontend)
- ✅ Deploy do frontend atualizado
- ✅ Você configurar CORS manualmente
- ✅ Criar script de **análise** de duplicados (READ-ONLY)
- ✅ Planejar migrations (mostrar para você antes)

### ⏸️ Aguardar sua aprovação:
- ⏸️ Qualquer migration no banco
- ⏸️ Deletar duplicados
- ⏸️ Novos endpoints (mostrar código antes)

### ❌ NÃO FAZER de jeito nenhum:
- ❌ Mexer no webhook WAHA
- ❌ Alterar processamento de mensagens de texto
- ❌ Modificar dados existentes no banco

---

## 🎯 PROPOSTA PARA CONTINUAR AGORA

Posso prosseguir com:

1. **✅ Finalizar build do frontend** (só código frontend, zero risco)
2. **✅ Criar script de análise de duplicados** (só LEITURA, não deleta nada)
3. **✅ Planejar migrations** (mostrar SQL para você aprovar)
4. **✅ Documentar próximos passos**

**Aguardo sua confirmação para continuar! 🚀**
