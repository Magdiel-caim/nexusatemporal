# 🚀 SESSÃO D - PRÓXIMA IMPLEMENTAÇÃO

**Preparado por:** Sessão C
**Data de Criação:** 23 de Outubro de 2025
**Última Sessão:** v120.1-v120.4 (Sistema de Integrações de IA)
**Status Sistema:** ✅ PRODUÇÃO - Todos módulos funcionando

---

## 📊 CONTEXTO ATUAL

### O que foi feito na Sessão C (v120.1-v120.4)
- ✅ Reorganização de módulos (Automação e Integrações Sociais dentro de Marketing)
- ✅ Sistema completo de configuração de 5 IAs (OpenAI, Claude, Gemini, Groq, OpenRouter)
- ✅ Backend com AIConfigService + 3 endpoints REST
- ✅ Frontend com AIIntegrationsTab em Configurações
- ✅ Tabela `ai_configs` criada automaticamente
- ✅ Segurança: API keys mascaradas, HTTPS, tenant isolation
- ✅ 3 erros críticos resolvidos (Traefik, Mixed Content, duplicação /api)

### Estado Atual do Sistema
```
✅ Backend: Rodando em produção (Docker Swarm)
✅ Frontend: Rodando em produção (Docker Swarm)
✅ Database: PostgreSQL com tabela ai_configs
✅ Traefik: Configurado corretamente (porta 3000)
✅ HTTPS: Funcionando em todos os endpoints
```

---

## 🎯 PRIORIDADES PARA SESSÃO D

### 🔥 ALTA PRIORIDADE (Implementação Imediata)

#### 1. Integrar IAs Configuradas com Assistente IA
**Objetivo:** Fazer o Assistente IA usar as credenciais configuradas

**Onde Implementar:**
- `backend/src/modules/marketing/ai-assistant.service.ts`
- `frontend/src/pages/MarketingPage.tsx` (tab Assistente IA)

**O que fazer:**
1. Modificar `ai-assistant.service.ts` para:
   - Buscar configurações de IA via `AIConfigService.getConfig()`
   - Usar API keys armazenadas no banco
   - Implementar chamadas reais para cada provedor:
     - OpenAI: `openai` SDK
     - Claude: `@anthropic-ai/sdk`
     - Gemini: `@google/generative-ai`
     - Groq: API REST direta
     - OpenRouter: API REST direta

2. Adicionar seletor de IA no frontend:
   - Dropdown "Qual IA usar?"
   - Listar apenas IAs configuradas
   - Salvar preferência do usuário

**Exemplo de Código (Backend):**
```typescript
// backend/src/modules/marketing/ai-assistant.service.ts
import AIConfigService from './ai-config.service';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

async generateCopy(tenantId: string, provider: string, prompt: string) {
  // Buscar config da IA
  const config = await AIConfigService.getConfig(tenantId, provider);
  if (!config) throw new Error('IA não configurada');

  // Chamar IA conforme provider
  switch (provider) {
    case 'openai':
      const openai = new OpenAI({ apiKey: config.api_key });
      const response = await openai.chat.completions.create({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
      });
      return response.choices[0].message.content;

    case 'anthropic':
      const anthropic = new Anthropic({ apiKey: config.api_key });
      const message = await anthropic.messages.create({
        model: config.model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });
      return message.content[0].text;

    // ... outros provedores
  }
}
```

**Tempo Estimado:** 2-3 horas

---

#### 2. Seletor de IA em Cada Módulo
**Objetivo:** Permitir escolher qual IA usar em cada contexto

**Onde Implementar:**
- Marketing → Assistente IA
- Marketing → Mensagens em Massa (geração de texto)
- Leads (análise automática)
- Chat (respostas sugeridas)

**O que fazer:**
1. Criar componente reutilizável `<AISelector />`
2. Listar apenas IAs configuradas (buscar de `/api/marketing/ai/configs`)
3. Salvar preferência do usuário (localStorage ou backend)
4. Passar provider selecionado para API

**Exemplo de Componente:**
```typescript
// frontend/src/components/common/AISelector.tsx
interface AISelectorProps {
  value: string;
  onChange: (provider: string) => void;
}

export function AISelector({ value, onChange }: AISelectorProps) {
  const [configs, setConfigs] = useState([]);

  useEffect(() => {
    // Buscar IAs configuradas
    fetch('/api/marketing/ai/configs')
      .then(res => res.json())
      .then(data => setConfigs(data.data));
  }, []);

  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Selecione uma IA</option>
      {configs.map(config => (
        <option key={config.provider} value={config.provider}>
          {config.provider.toUpperCase()} - {config.model}
        </option>
      ))}
    </select>
  );
}
```

**Tempo Estimado:** 1-2 horas

---

#### 3. Testar Conexão Real com Cada Provedor
**Objetivo:** Validar API keys ao salvar configuração

**Onde Implementar:**
- `backend/src/modules/marketing/ai-config.service.ts` (método `testConnection`)
- `frontend/src/components/settings/AIIntegrationsTab.tsx`

**O que fazer:**
1. Implementar teste real para cada provedor no backend
2. Fazer chamada mínima à API (ex: listar modelos)
3. Retornar sucesso/falha com mensagem clara
4. Exibir feedback no frontend antes de salvar

**Exemplo (OpenAI):**
```typescript
async testConnection(config: AIConfig): Promise<{ success: boolean; message: string }> {
  try {
    switch (config.provider) {
      case 'openai':
        const openai = new OpenAI({ apiKey: config.api_key });
        await openai.models.list(); // Testa se a chave é válida
        return { success: true, message: 'Conexão com OpenAI bem-sucedida!' };

      case 'anthropic':
        // Fazer chamada mínima à API Claude
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': config.api_key,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: config.model,
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hi' }],
          }),
        });
        if (!response.ok) throw new Error('API key inválida');
        return { success: true, message: 'Conexão com Claude bem-sucedida!' };

      // ... outros provedores
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}
```

**Tempo Estimado:** 2 horas

---

### ⚙️ MÉDIA PRIORIDADE (Melhorias do Sistema)

#### 4. Dashboard de Uso de IAs
**Objetivo:** Monitorar tokens, custos e performance

**O que criar:**
1. Tabela `ai_usage_logs`:
   ```sql
   CREATE TABLE ai_usage_logs (
     id SERIAL PRIMARY KEY,
     tenant_id VARCHAR(255) NOT NULL,
     provider VARCHAR(50) NOT NULL,
     model VARCHAR(100) NOT NULL,
     prompt_tokens INT,
     completion_tokens INT,
     total_tokens INT,
     cost_usd DECIMAL(10, 6),
     response_time_ms INT,
     module VARCHAR(100), -- 'marketing', 'leads', 'chat'
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. Criar endpoint `/api/marketing/ai/usage-stats`
3. Criar componente de dashboard com gráficos:
   - Tokens usados por dia/semana/mês
   - Custo estimado por provedor
   - Tempo de resposta médio
   - Provedor mais usado

**Tempo Estimado:** 3-4 horas

---

#### 5. Rate Limiting e Controle de Uso
**Objetivo:** Evitar estouro de limites e custos excessivos

**O que implementar:**
1. Limites configuráveis por tenant:
   - Máximo de requisições por hora
   - Máximo de tokens por dia
   - Custo máximo por mês

2. Middleware de rate limiting
3. Alertas quando próximo do limite
4. Página de configuração de limites

**Tempo Estimado:** 2-3 horas

---

#### 6. Cache de Respostas
**Objetivo:** Economizar tokens e melhorar performance

**O que implementar:**
1. Tabela `ai_cache`:
   ```sql
   CREATE TABLE ai_cache (
     id SERIAL PRIMARY KEY,
     tenant_id VARCHAR(255) NOT NULL,
     provider VARCHAR(50) NOT NULL,
     prompt_hash VARCHAR(64) NOT NULL, -- MD5/SHA256 do prompt
     response TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     expires_at TIMESTAMP,
     UNIQUE(tenant_id, provider, prompt_hash)
   );
   ```

2. Lógica:
   - Antes de chamar IA, verificar se prompt já foi usado
   - Se cache válido (não expirado), retornar resposta em cache
   - Se não, chamar IA e salvar em cache

3. TTL configurável (ex: 7 dias)

**Tempo Estimado:** 2 horas

---

#### 7. Logs de Chamadas (Auditoria)
**Objetivo:** Rastrear todas as chamadas para IAs

**O que implementar:**
1. Tabela `ai_audit_logs`:
   ```sql
   CREATE TABLE ai_audit_logs (
     id SERIAL PRIMARY KEY,
     tenant_id VARCHAR(255) NOT NULL,
     user_id INT,
     provider VARCHAR(50) NOT NULL,
     prompt TEXT,
     response TEXT,
     tokens_used INT,
     success BOOLEAN,
     error_message TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. Logar automaticamente toda chamada
3. Página de visualização de logs (admin)
4. Filtros: data, provedor, usuário, sucesso/erro

**Tempo Estimado:** 2 horas

---

### 🆕 FUNCIONALIDADES NOVAS (Expansão)

#### 8. Geração de Imagens
**Objetivo:** Integrar DALL-E, Stable Diffusion, Midjourney

**Provedores:**
- OpenAI DALL-E 3
- Stability AI (Stable Diffusion)
- OpenRouter (acesso a múltiplos)

**Onde usar:**
- Marketing → Campanhas (criar imagens para posts)
- Marketing → Redes Sociais
- Landing Pages (criar banners)

**Tempo Estimado:** 3-4 horas

---

#### 9. Análise de Sentimento
**Objetivo:** Classificar mensagens de leads automaticamente

**O que fazer:**
1. Criar serviço de análise de sentimento
2. Analisar mensagens do chat em tempo real
3. Classificar: Positivo, Neutro, Negativo, Urgente
4. Exibir emoji/badge ao lado de cada conversa
5. Filtro por sentimento

**Onde usar:**
- Chat (análise de mensagens)
- Leads (priorização automática)
- Suporte (identificar clientes insatisfeitos)

**Tempo Estimado:** 2-3 horas

---

#### 10. Resumos Automáticos
**Objetivo:** Gerar resumos de conversas, leads, reuniões

**Casos de Uso:**
1. **Resumo de Conversa no Chat:**
   - Botão "Resumir Conversa"
   - IA lê todas as mensagens e gera resumo executivo

2. **Resumo de Lead:**
   - Histórico completo do lead
   - Interesses identificados
   - Próximas ações sugeridas

3. **Resumo de Reunião (Agenda):**
   - Transcrição + resumo
   - Action items extraídos

**Tempo Estimado:** 3-4 horas

---

#### 11. Tradução Automática
**Objetivo:** Multi-idioma em tempo real

**O que fazer:**
1. Detectar idioma de mensagens recebidas
2. Traduzir automaticamente para português
3. Opção de responder em idioma do cliente
4. Suporte a: PT, EN, ES, FR, IT

**Onde usar:**
- Chat (tradução de mensagens)
- Leads internacionais
- Campanhas multi-idioma

**Tempo Estimado:** 2-3 horas

---

#### 12. Implementar Fallback entre IAs
**Objetivo:** Se uma IA falhar, tentar outra automaticamente

**Lógica:**
1. Usuário define ordem de preferência: OpenAI → Claude → Groq
2. Se OpenAI falhar (erro, rate limit, etc.), tentar Claude
3. Se Claude falhar, tentar Groq
4. Logar qual IA foi usada e por que houve fallback

**Exemplo:**
```typescript
async generateWithFallback(prompt: string, providers: string[]) {
  for (const provider of providers) {
    try {
      const result = await this.callAI(provider, prompt);
      return { result, usedProvider: provider };
    } catch (error) {
      console.log(`${provider} failed, trying next...`);
      continue;
    }
  }
  throw new Error('All AI providers failed');
}
```

**Tempo Estimado:** 1-2 horas

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO SUGERIDA

### Sprint 1 (1 dia)
- [ ] Integrar IAs com Assistente IA (2-3h)
- [ ] Criar seletor de IA reutilizável (1-2h)
- [ ] Testar conexão real com cada provedor (2h)

### Sprint 2 (1 dia)
- [ ] Dashboard de uso de IAs (3-4h)
- [ ] Rate limiting e controle de uso (2-3h)

### Sprint 3 (1 dia)
- [ ] Cache de respostas (2h)
- [ ] Logs de auditoria (2h)
- [ ] Implementar fallback (1-2h)

### Sprint 4 (Funcionalidades Novas)
- [ ] Análise de sentimento (2-3h)
- [ ] Resumos automáticos (3-4h)
- [ ] Tradução automática (2-3h)
- [ ] Geração de imagens (3-4h)

---

## 🗂️ ARQUIVOS QUE SERÃO MODIFICADOS

### Backend (provável)
```
backend/src/modules/marketing/
├── ai-config.service.ts (modificar testConnection)
├── ai-assistant.service.ts (integrar IAs)
├── marketing.controller.ts (novos endpoints)
└── marketing.routes.ts (novas rotas)

backend/src/modules/chat/
└── chat.service.ts (análise de sentimento, resumos)

backend/src/modules/leads/
└── lead.service.ts (análise automática com IA)
```

### Frontend (provável)
```
frontend/src/components/
├── common/AISelector.tsx (novo)
├── marketing/AIUsageDashboard.tsx (novo)
└── settings/AIIntegrationsTab.tsx (testar conexão)

frontend/src/pages/
├── MarketingPage.tsx (usar seletor de IA)
└── ChatPage.tsx (sentimento, resumos)
```

---

## 🚨 POSSÍVEIS PROBLEMAS E SOLUÇÕES

### Problema 1: Custos elevados
**Solução:** Implementar rate limiting e cache ANTES de liberar para produção

### Problema 2: Latência alta
**Solução:** Usar provedores rápidos como Groq para tarefas em tempo real

### Problema 3: Múltiplos SDKs pesados
**Solução:** Lazy loading dos SDKs, carregar apenas quando necessário

### Problema 4: API keys expostas
**Solução:** NUNCA retornar API key completa no frontend, sempre mascarar

---

## 📚 RECURSOS E DOCUMENTAÇÃO

### SDKs Oficiais
```bash
# OpenAI
npm install openai

# Claude (Anthropic)
npm install @anthropic-ai/sdk

# Google Gemini
npm install @google/generative-ai

# Groq (API REST direta)
# OpenRouter (API REST direta)
```

### Documentação das APIs
- **OpenAI:** https://platform.openai.com/docs/api-reference
- **Claude:** https://docs.anthropic.com/
- **Gemini:** https://ai.google.dev/docs
- **Groq:** https://console.groq.com/docs/quickstart
- **OpenRouter:** https://openrouter.ai/docs

### Exemplos de Uso
Ver arquivo `SESSAO_C_v120.4_AI_INTEGRATIONS.md` para código já implementado.

---

## 🎯 RECOMENDAÇÃO FINAL

**Começar por (ordem de prioridade):**

1. **Integrar IAs com Assistente IA** (funcionalidade mais esperada)
2. **Seletor de IA** (UX essencial)
3. **Testar conexão** (validar credenciais)
4. **Dashboard de uso** (monitoramento)
5. **Fallback** (robustez)
6. **Funcionalidades novas** (expansão)

**Tempo Total Estimado:**
- Alta Prioridade: 1-2 dias
- Média Prioridade: 2-3 dias
- Funcionalidades Novas: 3-5 dias

**Total: 1-2 semanas para implementação completa**

---

## 📞 NOTAS IMPORTANTES

### Para a Próxima Sessão (Sessão D)
1. ✅ Sistema estável e em produção
2. ✅ Toda a base está pronta (tabela, endpoints, frontend)
3. ✅ Apenas precisa conectar as IAs com os módulos existentes
4. ⚠️ Lembrar de instalar SDKs: `npm install openai @anthropic-ai/sdk @google/generative-ai`
5. ⚠️ Testar em ambiente de dev antes de deploy
6. ⚠️ Monitorar custos (especialmente OpenAI)

### Documentação de Referência
- `SESSAO_C_v120.4_AI_INTEGRATIONS.md` - Documentação completa da Sessão C
- `TRAEFIK_TROUBLESHOOTING.md` - Erros comuns do Traefik
- `CHANGELOG.md` - Histórico completo de versões

---

**BOA SORTE NA IMPLEMENTAÇÃO! 🚀**

**Preparado por:** Sessão C
**Data:** 23 de Outubro de 2025
