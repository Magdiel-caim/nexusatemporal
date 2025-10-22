# 💬 GUIA DO USUÁRIO - Módulo de Chat e WhatsApp

**Sistema:** Nexus CRM
**Versão:** v101 (v100 - Chat Dark Mode + Delete | v99 - QR Code Fix)
**Última Atualização:** 21 de Outubro de 2025
**Público-Alvo:** Atendimento, Vendas e Gestores

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Como Acessar](#como-acessar)
3. [Conexões WhatsApp](#conexões-whatsapp)
4. [Como Conectar um Número](#como-conectar-um-número)
5. [Gerenciar Conexões](#gerenciar-conexões)
6. [Histórico de Mensagens](#histórico-de-mensagens)
7. [Troubleshooting](#troubleshooting)
8. [Perguntas Frequentes](#perguntas-frequentes)
9. [Próximas Funcionalidades](#próximas-funcionalidades)

---

## 🎯 VISÃO GERAL

O **Módulo de Chat e WhatsApp** integra o Nexus CRM com o WhatsApp através da tecnologia **WAHA** (WhatsApp HTTP API).

✅ **Funcionalidades Principais:**
- Conectar múltiplos números de WhatsApp
- Escanear QR Code para autenticação
- Gerenciar conexões ativas
- Visualizar status de cada sessão
- Excluir conexões inativas
- Suporte a dark mode

✅ **Integrações Futuras:**
- Envio de mensagens automáticas
- Templates de mensagens
- Histórico de conversas
- Automações com n8n
- Notificações de novos leads

---

## 🔐 COMO ACESSAR

### **1. Fazer Login no Sistema**

```
URL: https://one.nexusatemporal.com.br
```

### **2. Navegar até o Módulo de Chat**

1. No menu lateral, clique em **"Chat"** ou **"WhatsApp"**
2. Você verá o painel de **Conexões WhatsApp**

---

## 📱 CONEXÕES WHATSAPP

O painel de conexões exibe todas as sessões WhatsApp configuradas.

### **Status de Conexões:**

#### **🟢 WORKING (Conectado)**
- Sessão ativa e funcionando normalmente
- Pode enviar e receber mensagens
- Aparece na lista de **Sessões Ativas**

#### **🟡 SCAN_QR_CODE (Aguardando)**
- Sessão criada, aguardando escaneamento do QR Code
- QR Code está disponível
- Expira em alguns minutos se não escaneado

#### **🔴 FAILED (Falhou)**
- Conexão falhou ou foi desconectada
- Possíveis causas:
  - WhatsApp desconectado no celular
  - Celular sem internet
  - Sessão expirou
- Aparece na lista de **Sessões Desconectadas**

#### **🟠 STOPPED (Parado)**
- Sessão foi parada manualmente
- Pode ser reiniciada

### **Visualização do Painel:**

O painel é dividido em 3 seções:

#### **1. Criar Nova Conexão** ➕
- Formulário para conectar um novo número
- Botão **"+ Conectar WhatsApp"**

#### **2. Sessões Ativas** ✅
- Lista de conexões funcionando (status WORKING)
- Mostra:
  - Nome da sessão (ex: `atemporal_main`, `Whatsapp_Cartuchos`)
  - Status: Badge verde "Conectado"
  - Botão de Atualizar (🔄)
  - Botão de Excluir (🗑️)

#### **3. Sessões Desconectadas** ❌
- Lista de conexões com problemas (status FAILED, STOPPED)
- Mostra:
  - Nome da sessão
  - Status: Badge vermelho "Desconectado"
  - Botão de Reconectar (🔄)
  - Botão de Excluir (🗑️)

---

## 🔗 COMO CONECTAR UM NÚMERO

### **Requisitos:**

- ✅ Ter um número de WhatsApp válido
- ✅ Acesso ao celular com WhatsApp instalado
- ✅ Internet estável

### **Passo a Passo:**

#### **Passo 1: Abrir Formulário**
1. No painel de Chat, clique em **"+ Conectar WhatsApp"**
2. Um formulário aparecerá

#### **Passo 2: Escolher Nome da Conexão**
1. Digite um **nome único** para a conexão
   - Exemplos:
     - `atemporal_main` (número principal da empresa)
     - `Whatsapp_Brasilia` (número da filial de Brasília)
     - `vendedor_joao` (número do vendedor João)
   - **Regras:**
     - Apenas letras, números e underscores (`_`)
     - Sem espaços ou caracteres especiais
     - Não pode duplicar nome existente

2. Clique em **"Gerar QR Code"**

#### **Passo 3: Aguardar QR Code**
- Sistema se conecta ao servidor WAHA
- Cria uma nova sessão
- Gera o QR Code (leva ~5-10 segundos)
- Status muda para **"QR Code gerado! Escaneie com seu WhatsApp"**

#### **Passo 4: Escanear QR Code**

**No celular:**
1. Abra o **WhatsApp**
2. Vá em:
   - **Android:** Menu (⋮) → **"Aparelhos conectados"** → **"Conectar um aparelho"**
   - **iPhone:** Configurações → **"Aparelhos conectados"** → **"Conectar um aparelho"**
3. **Escaneie o QR Code** exibido na tela do Nexus

**Importante:**
- ⏰ O QR Code **expira em 60 segundos**
- Se expirar, clique em **"Gerar Novo QR Code"**
- Não feche a tela enquanto escaneia

#### **Passo 5: Aguardar Conexão**
- Após escanear, o sistema detecta a conexão
- Status muda para **"Conectado ✅"**
- Mensagem de sucesso aparece
- Sessão é adicionada à lista de **Sessões Ativas**
- Popup fecha automaticamente em 2 segundos

**Pronto!** Seu WhatsApp está conectado ao sistema.

---

## ⚙️ GERENCIAR CONEXÕES

### **Como Atualizar uma Conexão:**

1. Na lista de conexões, localize a sessão
2. Clique no ícone **🔄 (Atualizar)**
3. Sistema busca o status atualizado do servidor WAHA
4. Status é atualizado na interface

**Quando usar:**
- Para verificar se conexão ainda está ativa
- Após reconectar o celular à internet
- Se suspeitar que a conexão caiu

### **Como Excluir uma Conexão:**

#### **⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!**

1. Na lista de conexões, clique no ícone **🗑️ (Trash2)** vermelho
2. Um alerta de confirmação aparecerá:
   ```
   Tem certeza que deseja excluir a sessão [nome_sessao]?
   Esta ação não pode ser desfeita.
   ```
3. Confirme clicando em **"Sim, excluir"**
4. Sistema:
   - Remove a sessão do servidor WAHA
   - Remove do banco de dados
   - Remove da interface
5. Mensagem de sucesso: **"Sessão excluída com sucesso"**

**Quando excluir:**
- Sessões duplicadas ou de teste
- Números que não são mais usados
- Sessões que falharam e não reconectam
- Limpeza de conexões antigas

**Importante:**
- ❌ Não é possível recuperar sessão excluída
- ❌ Histórico de mensagens (se houver) é perdido
- ✅ Pode criar nova sessão com mesmo nome depois

### **Como Reconectar uma Sessão Desconectada:**

Se uma sessão aparece na lista de **Sessões Desconectadas**:

**Opção 1: Reconectar Automaticamente (se disponível)**
1. Clique no botão **🔄 (Reconectar)**
2. Sistema tenta reiniciar a sessão
3. Se sucesso, sessão volta para **Sessões Ativas**

**Opção 2: Excluir e Criar Nova**
1. Exclua a sessão antiga
2. Crie uma nova sessão com o mesmo nome
3. Escaneie o QR Code novamente

**Opção 3: Verificar no Celular**
1. Verifique se WhatsApp está aberto no celular
2. Verifique se celular está conectado à internet
3. Vá em **"Aparelhos conectados"** e veja se a conexão está ativa
4. Se desconectou, desconecte manualmente no celular
5. Exclua a sessão no Nexus e crie uma nova

---

## 📜 HISTÓRICO DE MENSAGENS

**Status:** 🚧 **Em Desenvolvimento** (disponível em v102+)

**O que virá:**
- Visualizar todas as mensagens enviadas/recebidas
- Filtrar por sessão, data, contato
- Buscar por palavra-chave
- Exportar conversas

**Enquanto isso:**
- Mensagens são enviadas mas não ficam registradas no Nexus
- Use o WhatsApp Web/Mobile para visualizar histórico

---

## 🔧 TROUBLESHOOTING

### **Problema 1: "QR Code não aparece"**

**Causa:** Erro de conexão com servidor WAHA ou n8n.

**Soluções:**
1. **Verifique sua internet:** Conectado à internet estável?
2. **Recarregue a página:** Pressione `Ctrl + F5` (Windows) ou `Cmd + Shift + R` (Mac)
3. **Tente novamente:** Clique em **"Gerar QR Code"** novamente
4. **Verifique console:** Abra DevTools (F12) → Console → Veja se há erros
5. **Contate suporte:** Se persistir, entre em contato

### **Problema 2: "QR Code expirou antes de escanear"**

**Causa:** QR Code tem validade de 60 segundos.

**Solução:**
1. Clique em **"Gerar Novo QR Code"**
2. Escaneie rapidamente (tenha WhatsApp aberto no celular antes)

### **Problema 3: "Conexão falhou após escanear QR Code"**

**Causas possíveis:**
- Celular perdeu conexão durante autenticação
- Servidor WAHA ficou offline
- Problema de rede

**Soluções:**
1. Verifique se celular está com internet estável
2. Tente reconectar
3. Exclua a sessão e crie uma nova
4. Se persistir, aguarde 5 minutos e tente novamente

### **Problema 4: "Sessão desconecta sozinha"**

**Causas possíveis:**
- WhatsApp foi desconectado no celular (manualmente ou automaticamente)
- Celular ficou muito tempo sem internet
- Servidor WAHA foi reiniciado

**Soluções:**
1. Vá no celular → WhatsApp → **"Aparelhos conectados"**
2. Veja se a conexão ainda está ativa
3. Se não estiver, exclua a sessão no Nexus e crie nova
4. Se estiver ativa no celular mas aparece desconectada no Nexus:
   - Clique em **Atualizar** (🔄)
   - Ou exclua e reconecte

### **Problema 5: "Erro 404 ao gerar QR Code"** (Corrigido em v99)

**Causa:** Bug de URL duplicada `/api/api/...` (corrigido na v99).

**Solução:**
- ✅ Atualizar para v99 ou superior
- Se estiver na v99+, não deve ocorrer

### **Problema 6: "Não consigo ver o QR Code em dark mode"** (Corrigido em v100)

**Causa:** Contraste ruim em dark mode (corrigido na v100).

**Solução:**
- ✅ Atualizar para v100 ou superior
- Alternar para light mode temporariamente (botão no canto superior direito)

### **Problema 7: "Não consigo excluir sessão"**

**Causa:** Bug ou falta de permissões.

**Soluções:**
1. Verifique se você tem permissão de administrador
2. Recarregue a página e tente novamente
3. Abra o console (F12) e veja se há erros
4. Contate o administrador do sistema

---

## ❓ PERGUNTAS FREQUENTES

### **1. Quantos números posso conectar?**

**Resposta:** Não há limite técnico. Você pode conectar quantos números precisar (principal, filiais, vendedores, etc.).

---

### **2. Preciso manter o celular conectado à internet?**

**Resposta:** Sim. O celular deve estar:
- ✅ Conectado à internet (Wi-Fi ou dados móveis)
- ✅ Com WhatsApp aberto ou em segundo plano
- ✅ Não pode estar no modo avião

**Nota:** Similar ao WhatsApp Web - se o celular desconectar, a sessão cai.

---

### **3. Posso usar o mesmo número em múltiplas sessões?**

**Resposta:** Não. Cada número pode ter apenas 1 sessão ativa por vez. Se criar uma nova sessão com o mesmo número, a antiga será desconectada automaticamente.

---

### **4. O que acontece se eu desconectar no celular?**

**Resposta:**
- Sessão no Nexus fica com status **FAILED**
- Aparece na lista de **Sessões Desconectadas**
- Para reconectar, exclua a sessão e crie uma nova

---

### **5. As mensagens ficam salvas no Nexus?**

**Resposta:** Atualmente (v101), não. As mensagens são enviadas através do sistema mas não ficam registradas. Feature de histórico será implementada em versão futura (v102+).

---

### **6. Posso enviar mensagens pelo Nexus?**

**Resposta:** Atualmente, o módulo permite apenas **conectar** números. A funcionalidade de **enviar mensagens** está em desenvolvimento e virá em versões futuras junto com:
- Templates de mensagens
- Envio em massa
- Automações com n8n

---

### **7. Como sei se a conexão está funcionando?**

**Verificações:**
1. **No Nexus:** Sessão aparece em **Sessões Ativas** com badge verde "Conectado"
2. **No celular:** WhatsApp → Aparelhos conectados → Veja se aparece "Nexus CRM" ou nome da sessão
3. **Teste:** Envie uma mensagem de teste manualmente via API

---

### **8. O que é WAHA?**

**Resposta:** WAHA (WhatsApp HTTP API) é uma ferramenta de código aberto que permite conectar WhatsApp a sistemas através de API HTTP. É usada pelo Nexus para integração com WhatsApp.

**Servidor WAHA do Nexus:**
```
URL: https://workflow.nexusatemporal.com
```

---

### **9. Posso usar WhatsApp Business API?**

**Resposta:** Atualmente o sistema usa WAHA (WhatsApp pessoal). A integração com **WhatsApp Business API oficial** está planejada para v103+.

**Diferenças:**
- **WAHA:** Gratuito, usa número pessoal, QR Code
- **Business API:** Pago, número oficial, sem QR Code, mais recursos

---

### **10. O que acontece se o servidor WAHA cair?**

**Resposta:**
- Todas as sessões ficam offline temporariamente
- Quando servidor voltar, sessões reconectam automaticamente
- Se não reconectar, exclua e crie nova sessão

---

## 🚀 PRÓXIMAS FUNCIONALIDADES

### **Versão v102 - Templates e Envio** (Em desenvolvimento)

✨ **Templates de Mensagens:**
- Criar templates personalizados
- Variáveis dinâmicas ({{nome}}, {{data}})
- Categorias (boas-vindas, confirmação, lembrete)

✨ **Envio de Mensagens:**
- Enviar mensagem individual
- Envio em massa (lista de contatos)
- Agendamento de envio

### **Versão v103 - Histórico e Automações**

✨ **Histórico Completo:**
- Visualizar todas as conversas
- Filtros avançados
- Export de conversas

✨ **Automações:**
- Mensagem automática de boas-vindas
- Respostas automáticas (chatbot)
- Integração com n8n workflows
- Notificações de novos leads

### **Versão v104 - WhatsApp Business API**

✨ **Integração Oficial:**
- Migração para Business API oficial
- Verificação de conta (selo verde)
- Botões interativos
- Catálogo de produtos
- Métricas oficiais

---

## 🎨 DARK MODE

**Atalho:** Botão no canto superior direito da tela (☀️/🌙)

O módulo de Chat suporta **dark mode completo** (a partir da v100):
- ✅ QR Code visível em ambos os modos
- ✅ Todos os textos legíveis
- ✅ Badges com cores adaptadas
- ✅ Cards com contraste adequado

**Problema conhecido (corrigido em v100):**
- ❌ v99 e anteriores: QR Code tinha baixo contraste em dark mode

---

## 📞 SUPORTE

### **Problemas Técnicos:**
- Email: suporte@nexusatemporal.com.br
- Documente: Sistema operacional, navegador, print do erro

### **Dúvidas de Uso:**
- Consulte: [FAQ_SISTEMA.md](./FAQ_SISTEMA.md)
- Ou este guia

---

## 📝 CHANGELOG

### **v100 - 20/10/2025**
- ✅ Botão de excluir sessões implementado (ícone Trash2)
- ✅ Confirmação antes de excluir
- ✅ Dark mode completo em todos os elementos
- ✅ Cores harmoniosas em light/dark mode

### **v99 - 20/10/2025**
- ✅ Corrigido URL duplicada no QR Code (`/api/api/...` → `/api/...`)
- ✅ QR Code WhatsApp funcionando perfeitamente
- ✅ Arquivos: WhatsAppConnectionPanel.tsx (linhas 129, 246)

### **v95 - 19/10/2025**
- ✅ Módulo de Chat básico implementado
- ✅ Conexão via QR Code
- ✅ Gerenciamento de sessões

---

## 💡 DICAS DE USO

### **Dica 1: Nomes Descritivos**
Use nomes que identifiquem claramente o número:
- ✅ `atemporal_brasilia`
- ✅ `vendedor_joao_silva`
- ✅ `suporte_tecnico`
- ❌ `sessao1`, `teste`, `novo`

### **Dica 2: Teste Antes de Usar**
Antes de usar em produção:
1. Conecte um número de teste
2. Verifique se a conexão é estável
3. Teste por algumas horas/dias
4. Só depois conecte número principal

### **Dica 3: Monitore Regularmente**
- Acesse o painel de Chat diariamente
- Verifique se todas as sessões estão **WORKING**
- Se alguma falhar, reconecte imediatamente

### **Dica 4: Documentação**
Mantenha registro de:
- Quais números estão conectados
- Finalidade de cada sessão
- Responsável por cada número

---

**Documento criado por:** Claude Code - Sessão B
**Data:** 21 de Outubro de 2025
**Versão do Documento:** 1.0
**Sistema:** Nexus CRM v101 (v100 - Chat Dark Mode + Delete | v99 - QR Code Fix)
