# 📋 Orientações para Próxima Sessão C

**Data de Criação:** 22 de Outubro de 2025
**Última Sessão:** Sessão C - v117 Marketing Module
**Próximo Desenvolvedor:** Sessão C (continuação)

---

## 🎯 Missão da Próxima Sessão

Sua missão é **completar as interfaces das tabs do Módulo Marketing**, criando formulários, listas e dashboards interativos para cada funcionalidade.

---

## ⚠️ ALERTA CRÍTICO: Erro que Derrubou o Sistema

### ❌ O QUE ACONTECEU

Na tentativa inicial de implementar o frontend do Marketing (v116), o sistema **CAIU COMPLETAMENTE** por 15 minutos devido a um erro crítico:

**Erro:** Tentativa de usar Material-UI (@mui/material) sem verificar as dependências do projeto.

**Consequência:** Frontend inteiro quebrou com erro `Failed to resolve import "@mui/material"`, impedindo acesso a TODO o sistema.

### 🚨 NUNCA FAÇA ISSO

```typescript
// ❌ ERRADO - NÃO FAÇA ISSO
import { Box, Typography, Tab, Tabs } from '@mui/material';
import { Button, Card } from '@mui/material';
```

**Por quê?** O projeto **NÃO USA Material-UI**. Usa **Tailwind CSS + Radix UI**.

### ✅ SEMPRE FAÇA ISSO

**ANTES de começar qualquer desenvolvimento frontend:**

1. **Leia o package.json** para ver as dependências disponíveis
2. **Analise páginas existentes** (ChatPage, LeadsPage, FinanceiroPage) para ver os padrões
3. **Use apenas as libs instaladas:**
   - ✅ Tailwind CSS (classes utilitárias)
   - ✅ Radix UI (@radix-ui/react-*)
   - ✅ Lucide React (ícones)
   - ✅ React Hook Form
   - ✅ React Hot Toast
   - ✅ Zustand (state)

```typescript
// ✅ CORRETO - FAÇA ASSIM
import * as Tabs from '@radix-ui/react-tabs';
import { Target, Mail, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Tailwind CSS para estilização
<div className="bg-white dark:bg-gray-800 rounded-lg p-6">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    Título
  </h1>
</div>
```

---

## 📚 Estado Atual do Sistema

### ✅ O que já está pronto

#### Backend (100% funcional)
```
✅ 14 tabelas no PostgreSQL
✅ 9 entities TypeORM
✅ 5 services completos
✅ 30+ endpoints de API
✅ Migration executada
✅ Docker deployed: nexus-backend:v116-marketing-final
```

#### Frontend (Estrutura base pronta)
```
✅ marketingService.ts - Service layer completo
✅ MarketingPage.tsx - Dashboard + Tabs funcionando
✅ 6 tabs criadas (Dashboard, Campanhas, Social, Bulk, Landing Pages, IA)
✅ Dashboard tab COMPLETO com métricas reais
✅ Docker deployed: nexus-frontend:v117-marketing-module
```

### 📋 O que falta fazer

Você precisa implementar as **interfaces completas** das 5 tabs restantes:

1. **Campanhas Tab**
2. **Redes Sociais Tab**
3. **Mensagens em Massa Tab**
4. **Landing Pages Tab**
5. **Assistente IA Tab**

---

## 🛠️ Como Começar

### Passo 1: Ler a Documentação

```bash
# Leia TUDO antes de começar
cat /root/nexusatemporal/SESSAO_C_v117_MARKETING_IMPLEMENTACAO.md
cat /root/nexusatemporal/SESSAO_C_MARKETING_MODULE_VIABILIDADE.md
cat /root/nexusatemporal/frontend/package.json
```

### Passo 2: Analisar Código Existente

```bash
# Veja como outras páginas foram feitas
cat /root/nexusatemporal/frontend/src/pages/LeadsPage.tsx
cat /root/nexusatemporal/frontend/src/pages/FinanceiroPage.tsx
cat /root/nexusatemporal/frontend/src/services/leadsService.ts
```

### Passo 3: Ver o Service Layer do Marketing

```bash
# Este arquivo tem TODAS as interfaces e métodos prontos
cat /root/nexusatemporal/frontend/src/services/marketingService.ts
```

### Passo 4: Ver a Estrutura Atual

```bash
# Veja como o Dashboard tab foi implementado
cat /root/nexusatemporal/frontend/src/pages/MarketingPage.tsx
```

---

## 📝 Tarefas Detalhadas

### Task 1: Campanhas Tab

**Objetivo:** Interface completa para gerenciar campanhas de marketing

**Componentes necessários:**

1. **CampaignForm.tsx** (criar em `/frontend/src/components/marketing/`)
   ```typescript
   interface CampaignFormProps {
     campaign?: Campaign;
     onSubmit: (data: Partial<Campaign>) => Promise<void>;
     onCancel: () => void;
   }
   ```
   - Campos: name, description, type, status, budget, start_date, end_date
   - Validação com React Hook Form + Zod
   - Componentes: Input (Tailwind), Select (Radix UI)

2. **CampaignList.tsx**
   - Lista de campanhas com filtros
   - Cards ou tabela
   - Botões de ação (editar, deletar, pausar/ativar)
   - Métricas por campanha

3. **CampaignStats.tsx**
   - Gráficos com Recharts (já instalado)
   - Cards de métricas específicas da campanha

**APIs disponíveis:**
```typescript
marketingService.getCampaigns(filters)
marketingService.createCampaign(data)
marketingService.updateCampaign(id, data)
marketingService.deleteCampaign(id)
marketingService.getCampaignStats()
```

**Referência:** LeadsPage.tsx (formulários e listas similares)

---

### Task 2: Redes Sociais Tab

**Objetivo:** Agendar posts para Instagram, Facebook, LinkedIn, TikTok

**Componentes necessários:**

1. **SocialPostForm.tsx**
   - Seletor de plataforma (4 opções)
   - Seletor de tipo (feed, story, reel, carousel)
   - Editor de texto (textarea)
   - Upload de mídia (react-dropzone já instalado)
   - Seletor de data/hora para agendamento
   - Preview do post

2. **SocialPostCalendar.tsx**
   - Calendário com posts agendados
   - react-big-calendar (já instalado)
   - Cores por plataforma

3. **SocialPostList.tsx**
   - Lista de posts (draft, scheduled, published)
   - Filtros por plataforma e status
   - Cards com preview

**APIs disponíveis:**
```typescript
marketingService.getSocialPosts(filters)
marketingService.createSocialPost(data)
marketingService.updateSocialPost(id, data)
marketingService.scheduleSocialPost(id, scheduledAt)
marketingService.deleteSocialPost(id)
```

**Referência:** AgendaPage.tsx (calendário e agendamentos)

---

### Task 3: Mensagens em Massa Tab

**Objetivo:** Enviar mensagens para múltiplos contatos via WhatsApp/Email/Instagram

**Componentes necessários:**

1. **BulkMessageForm.tsx**
   - Seletor de plataforma (whatsapp, instagram_dm, email)
   - Seletor de destinatários:
     - Todos os leads
     - Leads filtrados (por stage, status, etc)
     - Lista customizada
   - Editor de mensagem com variáveis: {nome}, {empresa}, {telefone}
   - Preview da mensagem
   - Upload de mídia opcional

2. **RecipientSelector.tsx**
   - Checkbox list de destinatários
   - Filtros (stage, status, tags)
   - Contador de selecionados

3. **BulkMessageDashboard.tsx**
   - Cards: Total enviados, Entregues, Abertos, Cliques, Falhas
   - Gráfico de progresso
   - Lista de destinatários com status individual

**APIs disponíveis:**
```typescript
marketingService.getBulkMessages(filters)
marketingService.createBulkMessage(data)
marketingService.getBulkMessageById(id) // Ver recipients
```

**Referência:** LeadsPage.tsx (seleção múltipla de leads)

---

### Task 4: Landing Pages Tab

**Objetivo:** Criar e gerenciar landing pages com editor visual

**Componentes necessários:**

1. **LandingPageEditor.tsx**
   - Integração do GrapesJS (instalar: `npm install grapesjs`)
   - Editor visual de arrastar e soltar
   - Templates pré-prontos
   - Configurações de SEO

2. **LandingPageList.tsx**
   - Lista de landing pages
   - Preview thumbnail
   - Status (draft, published, archived)
   - Botões: Editar, Publicar, Analytics, Copiar link

3. **LandingPageAnalytics.tsx**
   - Gráfico de visitas ao longo do tempo (Recharts)
   - Cards: Views, Conversions, Bounce Rate, Avg Time
   - Top referrers
   - Gráfico de visitas diárias

**APIs disponíveis:**
```typescript
marketingService.getLandingPages(filters)
marketingService.createLandingPage(data)
marketingService.updateLandingPage(id, data)
marketingService.publishLandingPage(id)
marketingService.getLandingPageAnalytics(id, days)
```

**Nota:** GrapesJS precisa ser instalado:
```bash
npm install grapesjs
npm install --save-dev @types/grapesjs
```

**Referência:** Implementação customizada (complexa)

---

### Task 5: Assistente IA Tab

**Objetivo:** Interface para análise de IA e otimização de conteúdo

**Componentes necessários:**

1. **AIProviderSelector.tsx**
   - Dropdown de providers: Groq, OpenRouter, DeepSeek, Mistral, Qwen, Ollama
   - Dropdown de modelos (depende do provider)
   - Info de custo estimado

2. **AIChatInterface.tsx**
   - Estilo chat (mensagens do usuário e IA)
   - Input de mensagem
   - Botões de ações rápidas: Otimizar, Analisar Sentimento, Gerar Variações

3. **AICopyOptimizer.tsx**
   - Textarea para conteúdo original
   - Seletores: platform, audience, goal
   - Botão "Otimizar"
   - Exibição de resultado otimizado
   - Sugestões de melhoria

4. **AIImageGenerator.tsx**
   - Input de prompt
   - Seletor de estilo
   - Seletor de tamanho
   - Botão "Gerar"
   - Preview da imagem gerada

5. **AIAnalysisHistory.tsx**
   - Lista de análises anteriores
   - Filtros por tipo
   - Cards com: input, output, score, cost

**APIs disponíveis:**
```typescript
marketingService.analyzeWithAI(data)
marketingService.getAIAnalyses(filters)
marketingService.optimizeCopy(data)
marketingService.generateImage(data)
```

**Referência:** ChatPage.tsx (interface de chat)

---

## 🎨 Padrões de Design a Seguir

### Estrutura de Componentes

```
/frontend/src/components/marketing/
├── campaigns/
│   ├── CampaignForm.tsx
│   ├── CampaignList.tsx
│   └── CampaignStats.tsx
├── social/
│   ├── SocialPostForm.tsx
│   ├── SocialPostCalendar.tsx
│   └── SocialPostList.tsx
├── bulk-messaging/
│   ├── BulkMessageForm.tsx
│   ├── RecipientSelector.tsx
│   └── BulkMessageDashboard.tsx
├── landing-pages/
│   ├── LandingPageEditor.tsx
│   ├── LandingPageList.tsx
│   └── LandingPageAnalytics.tsx
└── ai-assistant/
    ├── AIProviderSelector.tsx
    ├── AIChatInterface.tsx
    ├── AICopyOptimizer.tsx
    ├── AIImageGenerator.tsx
    └── AIAnalysisHistory.tsx
```

### Tailwind Classes Padrão

```typescript
// Card
<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">

// Título
<h2 className="text-xl font-semibold text-gray-900 dark:text-white">

// Texto normal
<p className="text-gray-600 dark:text-gray-400">

// Input
<input className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600" />

// Botão primário
<button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">

// Botão secundário
<button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg">
```

### Radix UI Components

```typescript
// Dialog (Modal)
import * as Dialog from '@radix-ui/react-dialog';

<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/50" />
    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
      <Dialog.Title className="text-xl font-semibold mb-4">
        Título
      </Dialog.Title>
      {/* Content */}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

// Select
import * as Select from '@radix-ui/react-select';

<Select.Root value={value} onValueChange={setValue}>
  <Select.Trigger className="px-4 py-2 border rounded-lg">
    <Select.Value />
  </Select.Trigger>
  <Select.Portal>
    <Select.Content className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <Select.Item value="option1" className="px-4 py-2 hover:bg-gray-100">
        <Select.ItemText>Opção 1</Select.ItemText>
      </Select.Item>
    </Select.Content>
  </Select.Portal>
</Select.Root>
```

---

## 🔧 Libs Disponíveis

```json
{
  "@radix-ui/react-dialog": "Modal/Dialog",
  "@radix-ui/react-select": "Dropdown/Select",
  "@radix-ui/react-tabs": "Tabs (já usado)",
  "@radix-ui/react-switch": "Toggle/Switch",
  "@radix-ui/react-label": "Labels",

  "lucide-react": "Ícones",
  "react-hook-form": "Formulários",
  "zod": "Validação",
  "@hookform/resolvers": "Integração Zod + RHF",

  "react-hot-toast": "Notificações",
  "recharts": "Gráficos",
  "react-big-calendar": "Calendário",
  "react-dropzone": "Upload de arquivos",
  "emoji-picker-react": "Emojis",

  "date-fns": "Manipulação de datas",
  "axios": "HTTP (via api.ts)",
  "zustand": "State management",
  "tailwind-merge": "Merge de classes",
  "clsx": "Classes condicionais"
}
```

---

## 🚫 Libs NÃO Disponíveis (NÃO INSTALE)

```
❌ @mui/material
❌ @mui/icons-material
❌ antd
❌ bootstrap
❌ chakra-ui
❌ styled-components
❌ emotion
```

Se precisar de algo novo, **PERGUNTE AO USUÁRIO PRIMEIRO**.

---

## 📋 Checklist para Cada Tab

Ao implementar cada tab, siga este checklist:

### Planejamento
- [ ] Li a documentação da API no arquivo de implementação
- [ ] Analisei o service layer (marketingService.ts)
- [ ] Vi exemplos de páginas similares no projeto
- [ ] Identifiquei quais componentes Radix UI vou usar
- [ ] Planejei a estrutura de pastas dos componentes

### Desenvolvimento
- [ ] Criei os componentes em `/components/marketing/[tab-name]/`
- [ ] Usei apenas Tailwind CSS para estilos
- [ ] Usei apenas componentes Radix UI quando necessário
- [ ] Implementei dark mode em todos os elementos
- [ ] Adicionei validação de formulários (React Hook Form + Zod)
- [ ] Implementei loading states
- [ ] Implementei error handling
- [ ] Adicionei toast notifications para sucesso/erro

### Testes
- [ ] Build sem erros TypeScript (`npm run build`)
- [ ] Testei no browser (light e dark mode)
- [ ] Testei criação de dados
- [ ] Testei edição de dados
- [ ] Testei listagem com filtros
- [ ] Testei responsividade (mobile, tablet, desktop)

### Deploy
- [ ] Build Docker image
- [ ] Deploy no Swarm
- [ ] Verificação em produção
- [ ] Atualização da documentação

---

## 🔥 Dicas Importantes

### 1. **Reutilize Componentes Existentes**

Muitos componentes já existem no sistema:

```typescript
// Modal genérico
import Modal from '@/components/ui/Modal';

// Inputs
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Outros
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
```

### 2. **Use o Service Layer**

Nunca chame `api.get()` diretamente. Use sempre o service:

```typescript
// ❌ ERRADO
const response = await api.get('/marketing/campaigns');

// ✅ CORRETO
import { marketingService } from '@/services/marketingService';
const campaigns = await marketingService.getCampaigns();
```

### 3. **Tratamento de Erros Consistente**

```typescript
try {
  await marketingService.createCampaign(data);
  toast.success('Campanha criada com sucesso!');
  onRefresh();
} catch (error) {
  console.error('Erro ao criar campanha:', error);
  toast.error('Erro ao criar campanha');
}
```

### 4. **Loading States**

```typescript
const [loading, setLoading] = useState(true);

// Durante carregamento
if (loading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
}
```

### 5. **Dark Mode Always**

Todo elemento visual deve ter classes dark:

```typescript
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
```

---

## 📦 Ordem Recomendada de Implementação

Sugestão de ordem (do mais fácil ao mais complexo):

1. **Campanhas Tab** (mais simples - CRUD básico)
2. **Mensagens em Massa Tab** (médio - seleção de destinatários)
3. **Redes Sociais Tab** (médio - calendário)
4. **Assistente IA Tab** (médio/avançado - interface chat)
5. **Landing Pages Tab** (mais complexo - editor GrapesJS)

---

## 🐛 Debug e Troubleshooting

### Erro de Build

```bash
# Se der erro de build
cd /root/nexusatemporal/frontend
npm run build

# Erro de TypeScript? Verifique:
# - Imports corretos
# - Tipos das props
# - Variáveis não usadas
```

### Teste Local (se necessário)

```bash
cd /root/nexusatemporal/frontend
npm run dev
# Acesse http://localhost:5173
```

### Verificar Backend

```bash
# Ver logs do backend
docker service logs nexus_backend --tail 100

# Testar endpoint
curl -H "Authorization: Bearer TOKEN" \
  https://api.nexusatemporal.com.br/api/marketing/campaigns/stats
```

---

## 📚 Arquivos de Referência

### Leitura Obrigatória

1. `/root/nexusatemporal/SESSAO_C_v117_MARKETING_IMPLEMENTACAO.md`
   - Estado atual completo
   - Estrutura do banco
   - Lista de endpoints

2. `/root/nexusatemporal/frontend/src/services/marketingService.ts`
   - Todas as interfaces TypeScript
   - Todos os métodos de API

3. `/root/nexusatemporal/frontend/src/pages/MarketingPage.tsx`
   - Estrutura de tabs
   - Dashboard já implementado

### Exemplos de Código

1. Formulários: `/root/nexusatemporal/frontend/src/components/leads/LeadDetails.tsx`
2. Listas: `/root/nexusatemporal/frontend/src/pages/LeadsPage.tsx`
3. Calendário: `/root/nexusatemporal/frontend/src/pages/AgendaPage.tsx`
4. Tabs: `/root/nexusatemporal/frontend/src/pages/FinanceiroPage.tsx`
5. Chat: `/root/nexusatemporal/frontend/src/pages/ChatPage.tsx`

---

## ✅ Definition of Done

Uma tab está completa quando:

- [ ] Interface implementada com todos os componentes
- [ ] Integração com API funcionando
- [ ] CRUD completo (criar, ler, editar, deletar)
- [ ] Formulários com validação
- [ ] Loading states implementados
- [ ] Error handling implementado
- [ ] Dark mode funcionando
- [ ] Responsivo (mobile, tablet, desktop)
- [ ] Build sem erros TypeScript
- [ ] Deploy em produção funcionando
- [ ] Testado manualmente na produção

---

## 🎯 Meta Final

Quando todas as 5 tabs estiverem completas, o **Módulo Marketing estará 100% funcional** e pronto para uso.

O sistema terá:
- ✅ Dashboard com métricas
- ✅ Gerenciamento completo de campanhas
- ✅ Agendamento de posts sociais
- ✅ Envio de mensagens em massa
- ✅ Criação de landing pages
- ✅ Assistente de IA para otimização

---

## 📞 Contato e Dúvidas

Se tiver dúvidas durante o desenvolvimento:

1. **Consulte este documento primeiro**
2. **Leia a documentação técnica** (arquivos .md)
3. **Analise código similar** em outras páginas
4. **Pergunte ao usuário** se não encontrar resposta

---

## 🎉 Boa Sorte!

Você tem toda a infraestrutura pronta. Backend funcional, service layer completo, estrutura de tabs criada. Agora é só implementar as interfaces seguindo os padrões do sistema.

**Lembre-se do erro crítico:** NUNCA use libs que não estão instaladas. SEMPRE verifique o package.json primeiro.

**Mantra:** Tailwind CSS + Radix UI + Lucide React = Sucesso ✅

---

**Criado por:** Claude Code (Sessão C - v117)
**Para:** Próxima Sessão C
**Status do Sistema:** ✅ FUNCIONAL E DEPLOYED
