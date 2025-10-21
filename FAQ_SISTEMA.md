# ❓ FAQ E TROUBLESHOOTING - Nexus CRM

**Sistema:** Nexus CRM
**Versão:** v101
**Última Atualização:** 21 de Outubro de 2025
**Documento de Referência Geral**

---

## 📋 ÍNDICE

1. [Perguntas Gerais](#perguntas-gerais)
2. [Login e Autenticação](#login-e-autenticação)
3. [Navegação e Interface](#navegação-e-interface)
4. [Módulos Específicos](#módulos-específicos)
5. [Problemas Comuns](#problemas-comuns)
6. [Performance e Velocidade](#performance-e-velocidade)
7. [Segurança e Dados](#segurança-e-dados)
8. [Integrações](#integrações)
9. [Comandos Úteis (Admin)](#comandos-úteis-admin)
10. [Contatos de Suporte](#contatos-de-suporte)

---

## 🌐 PERGUNTAS GERAIS

### **1. O que é o Nexus CRM?**

O **Nexus CRM** é um sistema completo de gestão de relacionamento com clientes desenvolvido especificamente para clínicas e centros estéticos. Integra em uma única plataforma:

- 📊 Gestão de Leads e Vendas
- 📅 Agendamentos e Procedimentos
- 📦 Controle de Estoque
- 💰 Financeiro
- 💬 Chat e WhatsApp
- 🤖 Automações com IA

---

### **2. Quais navegadores são suportados?**

**Navegadores Recomendados:**
- ✅ **Google Chrome** (versão 100+)
- ✅ **Microsoft Edge** (versão 100+)
- ✅ **Firefox** (versão 95+)
- ✅ **Safari** (versão 15+)

**Não Recomendados:**
- ❌ Internet Explorer (descontinuado)
- ❌ Navegadores muito antigos

**Dica:** Use sempre a versão mais recente do navegador para melhor performance.

---

### **3. O sistema funciona em dispositivos móveis?**

**Resposta:** Sim, parcialmente.

- ✅ **Responsivo:** Interface adapta ao tamanho da tela
- ✅ **Tablets:** Funciona bem
- ⚠️ **Smartphones:** Funciona, mas experiência é melhor em telas maiores

**Recomendação:** Use desktop/laptop para tarefas administrativas e tablet/celular para consultas rápidas.

---

### **4. Preciso instalar algum software?**

**Resposta:** Não! O Nexus é 100% web-based (cloud).

- ✅ Acesse de qualquer lugar via navegador
- ✅ Sem instalação
- ✅ Atualizações automáticas
- ✅ Dados salvos na nuvem

---

### **5. Meus dados estão seguros?**

**Resposta:** Sim! Medidas de segurança implementadas:

- 🔐 **HTTPS:** Conexão criptografada (SSL/TLS)
- 🔒 **Autenticação:** Login com email e senha
- 🛡️ **Backup Automático:** Diário em servidor seguro (iDrive E2)
- 👤 **Permissões:** Controle de acesso por usuário/função
- 📊 **Auditoria:** Registro de todas as ações (audit logs)
- 🇧🇷 **LGPD:** Sistema em conformidade com Lei Geral de Proteção de Dados

---

## 🔐 LOGIN E AUTENTICAÇÃO

### **6. Como faço login no sistema?**

1. Acesse: `https://one.nexusatemporal.com.br`
2. Digite seu **email** cadastrado
3. Digite sua **senha**
4. Clique em **"Entrar"**

**Primeira vez?** Solicite credenciais ao administrador do sistema.

---

### **7. Esqueci minha senha. O que fazer?**

**Atualmente (v101):** Não há opção de "Esqueci a Senha" automatizada.

**Solução:**
1. Entre em contato com o **administrador do sistema**
2. Informe seu email cadastrado
3. Administrador irá resetar sua senha
4. Você receberá nova senha temporária
5. Faça login e altere para senha pessoal

**Versão Futura (v102+):** Sistema de recuperação automática por email.

---

### **8. Posso alterar minha senha?**

**Resposta:** Sim, na seção de **Perfil** ou **Configurações**.

1. Clique no seu **nome/foto** no canto superior direito
2. Selecione **"Meu Perfil"** ou **"Configurações"**
3. Procure **"Alterar Senha"**
4. Digite:
   - Senha atual
   - Nova senha
   - Confirmar nova senha
5. Clique em **"Salvar"**

**Requisitos de Senha:**
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 número
- Recomendado: 1 caractere especial (@, #, $, etc.)

---

### **9. O sistema desconecta sozinho?**

**Resposta:** Sim, por segurança.

- ⏰ **Timeout:** Após **30 minutos de inatividade**
- 🔒 Você será desconectado automaticamente
- 💾 Dados não salvos podem ser perdidos

**Dica:** Salve frequentemente e mantenha atividade se estiver trabalhando em algo importante.

---

### **10. Posso estar logado em múltiplos dispositivos?**

**Resposta:** Sim, mas com cuidado.

- ✅ Pode logar em PC + tablet + celular simultaneamente
- ⚠️ Cuidado com ações conflitantes (editar mesmo registro em 2 lugares)
- 🔒 Por segurança, faça logout ao sair

---

## 🧭 NAVEGAÇÃO E INTERFACE

### **11. Como navego entre os módulos?**

**Menu Lateral Esquerdo:**
- 🏠 **Dashboard:** Visão geral
- 👥 **Leads:** Gestão de leads
- 📅 **Agendamentos:** Calendário
- 💉 **Procedimentos:** Histórico de procedimentos
- 📦 **Estoque:** Controle de produtos
- 💰 **Vendas:** Vendas e comissões
- 💵 **Financeiro:** Contas a pagar/receber
- 💬 **Chat:** WhatsApp
- 🤖 **Automações:** Integrações e workflows

**Dica:** Menu pode ser recolhido clicando no ícone ☰ (hambúrguer)

---

### **12. O que é dark mode? Como ativar?**

**Dark Mode:** Tema escuro que reduz brilho da tela (melhor para ambientes com pouca luz).

**Como ativar:**
1. Procure o ícone **☀️/🌙** no canto superior direito
2. Clique para alternar entre light/dark mode
3. Preferência é salva automaticamente

**Benefícios:**
- 🌙 Reduz cansaço visual
- 🔋 Economiza bateria (telas OLED)
- 🎨 Aparência moderna

---

### **13. A interface está muito pequena/grande. Como ajustar?**

**Zoom do Navegador:**
- **Aumentar:** `Ctrl + +` (Windows) ou `Cmd + +` (Mac)
- **Diminuir:** `Ctrl + -` (Windows) ou `Cmd + -` (Mac)
- **Resetar:** `Ctrl + 0` (Windows) ou `Cmd + 0` (Mac)

**Recomendação:** Zoom entre 90% e 110%

---

### **14. Consigo personalizar o dashboard?**

**Atualmente (v101):** Não, dashboards são fixos por módulo.

**Versão Futura (v102 - Módulo BI):**
- ✨ Dashboards personalizados
- ✨ Arrastar e soltar widgets
- ✨ Salvar layouts personalizados

---

## 📦 MÓDULOS ESPECÍFICOS

Para perguntas detalhadas de cada módulo, consulte os guias específicos:

- 📊 **Vendas:** [GUIA_USUARIO_VENDAS.md](./GUIA_USUARIO_VENDAS.md)
- 📦 **Estoque:** [GUIA_USUARIO_ESTOQUE.md](./GUIA_USUARIO_ESTOQUE.md)
- 💬 **Chat:** [GUIA_USUARIO_CHAT.md](./GUIA_USUARIO_CHAT.md)

### **15. Qual módulo devo usar primeiro?**

**Ordem Recomendada de Configuração:**

1. ⚙️ **Usuários e Permissões** (admin)
2. 📦 **Estoque** (cadastrar produtos)
3. 💉 **Procedimentos** (vincular produtos a procedimentos)
4. 👥 **Leads** (cadastrar leads)
5. 💰 **Vendedores** (cadastrar vendedores)
6. 📅 **Agendamentos** (começar a agendar)
7. 💬 **Chat** (conectar WhatsApp)
8. 🤖 **Automações** (configurar automações)

---

## 🔧 PROBLEMAS COMUNS

### **16. Sistema está lento. O que fazer?**

**Soluções:**

#### **1. Limpar Cache do Navegador**
```
Chrome/Edge:
Ctrl + Shift + Delete → Selecionar "Cache" → Limpar

Firefox:
Ctrl + Shift + Delete → Selecionar "Cache" → Limpar
```

#### **2. Recarregar Página (Hard Reload)**
```
Windows: Ctrl + F5
Mac: Cmd + Shift + R
```

#### **3. Verificar Internet**
- Teste velocidade: https://fast.com
- Recomendado: > 10 Mbps

#### **4. Fechar Abas Desnecessárias**
- Muitas abas abertas consomem RAM
- Feche abas não usadas

#### **5. Reiniciar Navegador**
- Feche completamente o navegador
- Abra novamente

#### **6. Verificar Status do Servidor**
- Contate administrador
- Pode ser manutenção programada

---

### **17. Dados não estão aparecendo. O que fazer?**

**Verificações:**

#### **1. Recarregar Página**
- Pressione `F5`
- Ou clique no botão de atualizar do navegador

#### **2. Verificar Filtros Ativos**
- Muitos módulos têm filtros (período, status, categoria)
- Limpe todos os filtros
- Selecione "Todos" nos dropdowns

#### **3. Verificar Permissões**
- Talvez você não tenha permissão para ver certos dados
- Contate administrador

#### **4. Aguardar Sincronização**
- Dados podem levar alguns segundos para aparecer
- Aguarde 10-30 segundos e recarregue

---

### **18. Recebi erro 500/404/401. O que significa?**

#### **Erro 401 - Não Autorizado**
- **Causa:** Sessão expirou ou sem permissão
- **Solução:** Faça logout e login novamente

#### **Erro 404 - Não Encontrado**
- **Causa:** Recurso não existe ou URL errada
- **Solução:** Volte à página inicial e navegue novamente

#### **Erro 500 - Erro do Servidor**
- **Causa:** Problema no backend
- **Solução:**
  1. Recarregue a página
  2. Aguarde 5 minutos
  3. Se persistir, contate administrador
  4. Documente: o que estava fazendo, print do erro

---

### **19. Formulário não salva. O que fazer?**

**Verificações:**

#### **1. Campos Obrigatórios**
- Verifique se todos os campos marcados com `*` estão preenchidos
- Campos em vermelho indicam erro

#### **2. Formato de Dados**
- **Emails:** devem ter @
- **Datas:** formato DD/MM/AAAA
- **Valores:** usar vírgula (,) para decimais

#### **3. Conexão com Internet**
- Verifique se está conectado

#### **4. Erro de Validação**
- Leia a mensagem de erro exibida
- Corrija os campos indicados

#### **5. Timeout**
- Se demorar muito, recarregue e tente novamente

---

### **20. Tela ficou em branco. O que fazer?**

**Passos:**

1. **Recarregue a página** (Ctrl + F5)
2. **Abra o Console** (F12) → Aba "Console"
3. **Veja se há erros em vermelho**
4. **Tire um print do console**
5. **Envie para o administrador**

**Causa Comum (Corrigida em v101):**
- Bug em módulo de Vendas (tela branca)
- ✅ Corrigido na v101 (7 bugs)

**Se estiver em v100 ou anterior:**
- Solicite atualização para v101

---

## ⚡ PERFORMANCE E VELOCIDADE

### **21. Como melhorar a velocidade do sistema?**

**Dicas:**

#### **1. Use Navegador Atualizado**
- Chrome/Edge versão mais recente

#### **2. Desabilite Extensões Desnecessárias**
- Bloqueadores de anúncio podem interferir
- Teste em aba anônima (sem extensões)

#### **3. Feche Programas Pesados**
- Outros programas consumindo RAM
- Feche Photoshop, jogos, etc.

#### **4. Conexão Estável**
- Use cabo ethernet (melhor que Wi-Fi)
- Evite usar 3G/4G quando possível

#### **5. Horários de Menor Uso**
- Sistema pode ficar lento em horários de pico
- Use em horários alternativos se possível

---

## 🔒 SEGURANÇA E DADOS

### **22. Meus dados podem ser recuperados se eu excluir?**

**Depende:**

- ✅ **Backup Diário:** Dados de até 30 dias podem ser recuperados pelo admin
- ❌ **Exclusões Muito Antigas:** Após 30 dias, pode não ser possível
- ⚠️ **Exclusões Críticas:** Algumas exclusões são irreversíveis (ex: excluir sessão WhatsApp)

**Dica:** Sempre confirme antes de excluir. Use "Inativar" ao invés de "Excluir" quando possível.

---

### **23. Outras pessoas podem ver meus dados?**

**Depende das Permissões:**

- **Administradores:** Veem todos os dados
- **Gestores:** Veem dados da sua equipe/filial
- **Usuários Comuns:** Veem apenas seus próprios dados
- **Clientes/Leads:** Não têm acesso ao sistema

**Controle de Acesso:**
- Sistema usa **roles** (funções)
- Cada função tem permissões específicas
- Consulte administrador sobre suas permissões

---

### **24. O sistema está em conformidade com a LGPD?**

**Resposta:** Sim, o Nexus CRM implementa medidas de conformidade:

- ✅ **Consentimento:** Termos de uso e política de privacidade
- ✅ **Finalidade:** Dados usados apenas para gestão de relacionamento
- ✅ **Segurança:** Criptografia, backup, auditoria
- ✅ **Acesso:** Controle de quem acessa o quê
- ✅ **Exclusão:** Possibilidade de excluir dados (direito ao esquecimento)
- ✅ **Auditoria:** Logs de todas as ações

**Responsabilidade:** A clínica/empresa é controladora dos dados. O Nexus é operador.

---

## 🔗 INTEGRAÇÕES

### **25. Quais integrações estão disponíveis?**

**Atualmente (v101):**

- ✅ **WhatsApp** (via WAHA)
- ✅ **n8n** (automações)
- ✅ **OpenAI** (IA para análise de leads)
- ✅ **Email** (envio de relatórios) - *Requer configuração SMTP*

**Em Desenvolvimento (v102+):**

- 🚧 **WhatsApp Business API** (oficial)
- 🚧 **Calendários** (Google Calendar, Outlook)
- 🚧 **Pagamentos** (Mercado Pago, PagSeguro)
- 🚧 **NFe** (emissão de nota fiscal)

---

### **26. Como configurar automações com n8n?**

**Guia Completo:** Consulte [GUIA_AUTOMACOES_COMPLETO.md](./GUIA_AUTOMACOES_COMPLETO.md)

**Resumo:**
1. Acesse n8n: `https://automacao.nexusatemporal.com.br`
2. Credenciais: Solicite ao admin
3. Crie workflows visuais (drag & drop)
4. Conecte Nexus CRM → OpenAI → WhatsApp

**Exemplo Prático:** [EXEMPLO_PRATICO_AUTOMACAO.md](./EXEMPLO_PRATICO_AUTOMACAO.md)

---

## 🛠️ COMANDOS ÚTEIS (ADMINISTRADOR)

### **27. Como verificar se os serviços estão rodando?**

```bash
docker service ls | grep nexus
```

**Output esperado:**
```
nexus_backend    REPLICATED   1/1   (image)  [CONVERGED]
nexus_frontend   REPLICATED   1/1   (image)  [CONVERGED]
```

---

### **28. Como ver logs do backend?**

```bash
docker service logs nexus_backend --tail 100 --follow
```

**Atalhos:**
- `--tail 100`: últimas 100 linhas
- `--follow`: continua mostrando novos logs
- `--since 10m`: logs dos últimos 10 minutos
- `| grep error`: filtrar apenas erros

---

### **29. Como acessar o banco de dados?**

```bash
PGPASSWORD=nexus2024@secure psql -h 46.202.144.210 -U nexus_admin -d nexus_crm
```

**Queries úteis:**
```sql
-- Ver todas as tabelas
\dt

-- Contar usuários
SELECT COUNT(*) FROM users;

-- Ver últimos leads
SELECT id, name, email, status FROM leads ORDER BY created_at DESC LIMIT 10;

-- Sair
\q
```

---

### **30. Como fazer backup manual?**

```bash
# Backup completo
BACKUP_DIR="/root/backups/nexus_$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup do banco
PGPASSWORD=nexus2024@secure pg_dump -h 46.202.144.210 -U nexus_admin nexus_crm > $BACKUP_DIR/database.sql

# Backup de arquivos
cp -r /root/nexusatemporal $BACKUP_DIR/

# Compactar
tar -czf ${BACKUP_DIR}.tar.gz $BACKUP_DIR/

# Upload para iDrive E2
export AWS_ACCESS_KEY_ID="qFzk5gw00zfSRvj5BQwm"
export AWS_SECRET_ACCESS_KEY="bIxbc653Y9SYXIaPWqxa4SDXR85ehHQQGf0x8wL8"
aws s3 cp ${BACKUP_DIR}.tar.gz s3://backupsistemaonenexus/backups/ \
  --endpoint-url https://o0m5.va.idrivee2-26.com
```

---

## 📞 CONTATOS DE SUPORTE

### **Suporte Técnico:**
- 📧 **Email:** suporte@nexusatemporal.com.br
- 📱 **WhatsApp:** (XX) XXXX-XXXX *(solicitar ao admin)*
- ⏰ **Horário:** Segunda a Sexta, 9h às 18h

### **Reportar Bugs:**
- 🐛 **GitHub Issues:** https://github.com/nexusatemporal/issues *(se aplicável)*
- 📧 **Email:** bugs@nexusatemporal.com.br

### **Sugestões de Melhorias:**
- 💡 **Email:** sugestoes@nexusatemporal.com.br
- 📝 **Formulário:** *(em desenvolvimento)*

---

## 📚 DOCUMENTAÇÃO ADICIONAL

### **Guias de Usuário:**
- [GUIA_USUARIO_VENDAS.md](./GUIA_USUARIO_VENDAS.md)
- [GUIA_USUARIO_ESTOQUE.md](./GUIA_USUARIO_ESTOQUE.md)
- [GUIA_USUARIO_CHAT.md](./GUIA_USUARIO_CHAT.md)

### **Guias Técnicos:**
- [GUIA_AUTOMACOES_COMPLETO.md](./GUIA_AUTOMACOES_COMPLETO.md)
- [EXEMPLO_PRATICO_AUTOMACAO.md](./EXEMPLO_PRATICO_AUTOMACAO.md)

### **Documentação de Desenvolvimento:**
- [ORIENTACAO_PROXIMA_SESSAO_v100.md](./ORIENTACAO_PROXIMA_SESSAO_v100.md) (Sessão A)
- [ORIENTACAO_SESSAO_B_v102.md](./ORIENTACAO_SESSAO_B_v102.md) (Sessão B)

---

## 🔄 ATUALIZAÇÕES DESTE DOCUMENTO

- **v1.0 - 21/10/2025:** Criação inicial (30 perguntas)
- *Próximas versões:* Adicionar mais perguntas conforme feedback

---

**Documento criado por:** Claude Code - Sessão B
**Data:** 21 de Outubro de 2025
**Versão do Documento:** 1.0
**Sistema:** Nexus CRM v101
