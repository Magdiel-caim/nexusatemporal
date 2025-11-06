#!/usr/bin/env node

/**
 * Script para adicionar tarefas de melhorias sistêmicas ao Airtable
 * Data: 06/11/2025
 * Versão: v129
 * Documento base: Alterações sistema.pdf
 */

const Airtable = require('airtable');

// Configurar Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tasksTable = base(process.env.AIRTABLE_TABLE_TASKS || 'Tasks');

const tasks = [
  // === NAVEGAÇÃO E UI ===
  {
    title: '[UI] Corrigir navegação de submenus (Financeiro, Vendas, Estoque, BI, Marketing)',
    description: `Problema: Ao clicar nos submenus dentro dos módulos Financeiro, Vendas, Estoque, BI & Analytics e Marketing, a URL muda mas a tela não é atualizada.

Solução: Investigar e corrigir o sistema de roteamento dos submenus. Garantir que ao clicar em um submenu, a página correspondente seja renderizada.

IMPORTANTE: Não alterar funcionalidades que estão funcionando e ter muito cuidado com alterações no banco de dados.`,
    status: 'Backlog',
    priority: 'Crítica',
    module: 'UI/UX',
    estimatedHours: 3,
    tags: ['frontend', 'routing', 'navegação', 'bug']
  },

  // === MÓDULO LEADS → PACIENTES ===
  {
    title: '[Leads] Implementar conversão automática Lead → Paciente após pagamento',
    description: `Fluxo completo de conversão de Lead para Paciente:

1. Quando lead estiver em "Aguardando Pagamento":
   - Enviar mensagem WhatsApp automática
   - Perguntar forma de pagamento (Cartão ou PIX)
   - Enviar link de pagamento conforme escolha

2. Após pagamento confirmado:
   - Alterar status para "Fechado"
   - Enviar confirmação de pagamento via WhatsApp
   - Solicitar horário e localidade (apenas para clínicas multi-local)
   - Solicitar data de nascimento do paciente
   - Confirmar demais dados (nome, CPF, WhatsApp, email já existem)

3. Criar registro no módulo Pacientes:
   - Transferir todos os dados do Lead
   - Criar ficha completa do paciente
   - Manter Lead na sessão "Fechado" por 24 horas
   - Após 24h, remover da visualização (mas manter no BI)

4. Garantir dados para BI:
   - Leads fechados devem continuar contando nas estatísticas
   - Não perder histórico ao remover da visualização`,
    status: 'Backlog',
    priority: 'Crítica',
    module: 'Leads',
    estimatedHours: 16,
    tags: ['backend', 'frontend', 'whatsapp', 'automação', 'integração']
  },

  // === MÓDULO PACIENTES ===
  {
    title: '[Pacientes] Corrigir erro ao salvar paciente com foto',
    description: `Erro atual: "erro ao salvar paciente. tente novamente"

Problema identificado:
- Botão "Selecionar foto" em "Editar paciente" retorna erro
- Upload de imagem na aba "Imagens" retorna "erro ao fazer upload da imagem"
- Console mostra erro 500 no endpoint: POST /api/pacientes/{id}/imagens

Arquivo de referência: /root/nexusatemporalv1/prompt/Erro salvar imagem.txt

Solução:
- Investigar endpoint de upload backend
- Verificar configuração do IDrive E2 (S3)
- Corrigir tratamento de erros
- Testar upload completo`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Pacientes',
    estimatedHours: 4,
    tags: ['backend', 'frontend', 'upload', 'bug', 's3']
  },
  {
    title: '[Pacientes] Implementar script de inativação automática (6 meses/1 ano)',
    description: `Criar script automático (cron job) que:

1. Verifica pacientes sem movimentação há 6 meses
   - Marcar como "Inativo - 6 meses"

2. Verifica pacientes sem movimentação há 1 ano
   - Marcar como "Inativo - 1 ano"

3. Facilitar ações de marketing:
   - Poder filtrar por status de inatividade
   - Criar campanhas de reativação

4. Configuração:
   - Executar diariamente à meia-noite
   - Registrar log das alterações
   - Enviar relatório por email`,
    status: 'Backlog',
    priority: 'Média',
    module: 'Pacientes',
    estimatedHours: 6,
    tags: ['backend', 'automação', 'cron', 'marketing']
  },
  {
    title: '[Pacientes] Adicionar importação/exportação (Excel, PDF)',
    description: `Implementar funcionalidades de import/export:

**Importação:**
- Suportar todos os formatos Excel (.xls, .xlsx, .csv)
- Validar dados antes de importar
- Mostrar preview dos dados
- Identificar e tratar duplicados
- Feedback de progresso

**Exportação:**
- Exportar para Excel (.xlsx)
- Exportar para PDF
- Aplicar filtros antes de exportar
- Incluir campos selecionáveis

**Campos do Excel:**
- Nome, CPF, RG, Data Nascimento
- Telefone, WhatsApp, Email
- Endereço completo
- Status, Observações`,
    status: 'Backlog',
    priority: 'Média',
    module: 'Pacientes',
    estimatedHours: 8,
    tags: ['frontend', 'backend', 'excel', 'pdf', 'import', 'export']
  },
  {
    title: '[Pacientes] Adicionar aba "Histórico de Procedimentos" no card do paciente',
    description: `Criar nova aba no card de visualização do paciente que mostre:

1. Lista de procedimentos realizados
2. Procedimentos em andamento (retorno agendado)
3. Data de cada procedimento
4. Status (Concluído, Em andamento, Cancelado)
5. Médico responsável
6. Observações

Ordenar por data (mais recente primeiro).`,
    status: 'Backlog',
    priority: 'Média',
    module: 'Pacientes',
    estimatedHours: 4,
    tags: ['frontend', 'histórico']
  },
  {
    title: '[Pacientes] Mover "Agendar Retorno" para dentro do card do Paciente',
    description: `Remover opção "Agendar retorno" dos locais atuais e criar:

1. Nova aba "Retornos" no card do paciente
2. Botão "Agendar Retorno" visível apenas para médicos
3. Formulário de agendamento de retorno integrado
4. Lista de retornos agendados
5. Status de cada retorno

Esta opção deve aparecer APENAS no módulo Pacientes, não no módulo Leads ou Agenda.`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Pacientes',
    estimatedHours: 5,
    tags: ['frontend', 'backend', 'agenda', 'retorno']
  },

  // === MÓDULO AGENDA ===
  {
    title: '[Agenda] Implementar seleção de múltiplos procedimentos',
    description: `Permitir selecionar múltiplos procedimentos em um único agendamento:

**Alterações necessárias:**
1. Banco de dados: Criar relacionamento many-to-many
2. Backend: Ajustar cálculo de duração e preço total
3. Frontend: Component de seleção múltipla com checkboxes
4. TimeSlotPicker: Calcular horários com base na duração total

**Funcionalidades:**
- Selecionar vários procedimentos
- Calcular duração total automaticamente
- Calcular valor total
- Exibir resumo antes de confirmar
- Validar disponibilidade de horário

NOTA: Requer alteração no modelo de dados. MUITO CUIDADO.`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Agenda',
    estimatedHours: 12,
    tags: ['backend', 'frontend', 'database', 'complexo']
  },
  {
    title: '[Agenda] Implementar seleção de múltiplos horários (criação em lote)',
    description: `Permitir selecionar múltiplos horários e criar vários agendamentos de uma vez:

**Funcionalidades:**
1. Seleção múltipla de slots de horário
2. Visual feedback (checkboxes)
3. Verificação de disponibilidade em lote
4. Criação com transação (tudo ou nada)
5. Rollback automático em caso de conflito

**Técnico:**
- Sistema de transações no backend
- Verificação de conflitos otimizada
- UX clara para seleção múltipla
- Feedback de progresso
- Tratamento robusto de erros

NOTA: Alta complexidade técnica. Requer testes extensivos.`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Agenda',
    estimatedHours: 14,
    tags: ['backend', 'frontend', 'transações', 'complexo']
  },
  {
    title: '[Agenda] Corrigir bug de restrição de data (permitir agendamento para hoje/amanhã)',
    description: `Bug atual: Sistema não permite agendar para o mesmo dia nem para o dia seguinte, apenas a partir de 2 dias depois.

Exemplo:
- Hoje: 05/11/2025
- Sistema bloqueia: 05/11 e 06/11
- Permite apenas: 07/11 em diante

Solução:
- Permitir agendamento para o dia atual (horários futuros)
- Permitir agendamento para o dia seguinte
- TimeSlotPicker já filtra horários passados corretamente
- Ajustar validação no formato calendário

NOTA: Correção já foi parcialmente implementada na v128.1, verificar se persiste.`,
    status: 'Backlog',
    priority: 'Crítica',
    module: 'Agenda',
    estimatedHours: 2,
    tags: ['frontend', 'bug', 'validação']
  },
  {
    title: '[Agenda] Implementar embed da agenda para sites externos',
    description: `Criar sistema de embed da agenda para incorporar em sites:

**Formatos de código:**
- HTML/JavaScript
- iFrame
- React Component
- JSON API
- PHP snippet
- Java snippet

**Funcionalidades do embed:**
- Visualização de horários disponíveis
- Seleção de procedimento
- Formulário de agendamento
- Tema customizável (cores da marca)
- Responsivo (mobile-first)

**Segurança:**
- Token de API por tenant
- Rate limiting
- Validação de domínio permitido
- CORS configurado

**Painel de configuração:**
- Gerar código de embed
- Escolher campos visíveis
- Customizar cores e logo
- Preview em tempo real`,
    status: 'Backlog',
    priority: 'Média',
    module: 'Agenda',
    estimatedHours: 16,
    tags: ['frontend', 'backend', 'api', 'embed', 'integração']
  },
  {
    title: '[Agenda] Adicionar opção de hora inicial e final no agendamento',
    description: `Permitir selecionar hora de início E fim do procedimento:

**Cenário:**
- Procedimento de 2 horas
- Início às 14:00
- Fim às 16:00
- Bloquear horários 14:00, 14:30, 15:00, 15:30 automaticamente

**Ao finalizar:**
- Opção "Agendar Retorno" (apenas para médico)
- Opção "Finalizar Atendimento"

**Validação:**
- Verificar se horários estão disponíveis
- Calcular duração automaticamente
- Alertar sobre conflitos`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Agenda',
    estimatedHours: 6,
    tags: ['frontend', 'backend', 'horário']
  },
  {
    title: '[Agenda] Aplicar busca de pacientes no modo lista (igual ao calendário)',
    description: `A funcionalidade de busca de pacientes (nome, CPF, RG) já foi implementada no modo calendário na v128.1.

Tarefa: Aplicar a mesma funcionalidade no modo de visualização em lista.

Reutilizar componente PatientSearchInput.tsx existente.`,
    status: 'Backlog',
    priority: 'Média',
    module: 'Agenda',
    estimatedHours: 2,
    tags: ['frontend', 'busca', 'reutilização']
  },

  // === MÓDULO PRONTUÁRIOS ===
  {
    title: '[Prontuários] Remover botão "Novo Prontuário" e refatorar módulo',
    description: `Refatorar completamente o módulo Prontuários:

**O que fazer:**
1. Remover botão "Novo Prontuário"
2. Módulo Prontuários = apenas PESQUISA
3. Conectar com módulo Pacientes
4. Conectar com banco de dados de pacientes

**Mover "Informações Médicas":**
- Atualmente está no formulário do prontuário
- Deve ir para o módulo Pacientes
- Dentro do card do paciente
- Na aba "Prontuários"
- Botão "Novo Prontuário" APENAS ali

**Novo fluxo:**
1. Acesso Pacientes → Selecionar paciente → Aba Prontuários
2. Ver histórico de prontuários
3. Botão "Novo Prontuário" cria registro
4. Formulário com "Informações Médicas"

**Módulo Prontuários vira busca:**
- Pesquisar prontuários por paciente
- Filtrar por data
- Filtrar por médico
- Visualizar detalhes`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Prontuários',
    estimatedHours: 8,
    tags: ['frontend', 'backend', 'refatoração', 'pacientes']
  },

  // === MÓDULO ESTOQUE ===
  {
    title: '[Estoque] Adicionar botão "Nova Categoria" para cadastro de categorias',
    description: `No card "Novo Produto", existe um campo "Categoria" que precisa de melhoria:

**Implementar:**
1. Botão "Nova Categoria" ao lado de "Novo Produto"
2. Modal para cadastrar nova categoria
3. Campos: Nome, Descrição, Cor (opcional)
4. Salvar no banco de dados
5. Atualizar select de categorias automaticamente

**Validações:**
- Nome obrigatório
- Evitar duplicados
- Mínimo 2 caracteres`,
    status: 'Backlog',
    priority: 'Média',
    module: 'Estoque',
    estimatedHours: 3,
    tags: ['frontend', 'backend', 'categorias']
  },
  {
    title: '[Estoque] Remover toggle dark/light do módulo (mover para header)',
    description: `Problema: Toggle dark/light está aparecendo ao lado de "Novo Produto" dentro do módulo de Estoque.

Solução:
- Remover toggle do módulo Estoque
- Deve aparecer APENAS no menu superior
- Igual aos demais módulos

Também verificar e corrigir:
- Modo dark não está refletindo em todas as seções do módulo
- Erro na aba "Produto" em dark mode afeta visualização`,
    status: 'Backlog',
    priority: 'Média',
    module: 'Estoque',
    estimatedHours: 2,
    tags: ['frontend', 'ui', 'dark-mode']
  },
  {
    title: '[Estoque] Corrigir visualização em dark mode (aba Produtos)',
    description: `Erro identificado: Quando ativado o modo dark na aba Produtos, há erros que afetam:
- Visualização das informações
- Legibilidade do texto
- Contraste de elementos

Solução:
- Validar todas as classes Tailwind dark:
- Corrigir contraste de texto
- Corrigir background dos cards
- Testar em todas as abas do módulo`,
    status: 'Backlog',
    priority: 'Média',
    module: 'Estoque',
    estimatedHours: 3,
    tags: ['frontend', 'dark-mode', 'css']
  },
  {
    title: '[Estoque] Adicionar botões Editar e Excluir produto',
    description: `Adicionar funcionalidades de gerenciamento de produtos:

**Botão Editar:**
- Ícone de lápis
- Abrir modal com dados preenchidos
- Permitir edição de todos os campos
- Salvar alterações

**Botão Excluir:**
- Ícone de lixeira
- Confirmação antes de excluir
- Verificar se produto tem movimentações
- Alertar sobre impacto no estoque

**Tornar produto clicável:**
- Click no produto abre popup
- Mostrar todas as informações
- Histórico de movimentações
- Opções de Editar/Excluir no popup`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Estoque',
    estimatedHours: 5,
    tags: ['frontend', 'backend', 'crud']
  },
  {
    title: '[Estoque] Implementar busca de fornecedores no campo "Fornecedor Principal"',
    description: `Problema: Campo "Fornecedor Principal" não está trazendo lista de fornecedores cadastrados.

Implementar:
1. Campo de busca autocomplete
2. Pesquisa por Nome ou CNPJ
3. Consulta ao banco de dados
4. Exibir resultados em dropdown
5. Permitir selecionar da lista

Também adicionar:
- Opção "Adicionar novo fornecedor" no dropdown
- Modal rápido para cadastro
- Validação de CNPJ`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Estoque',
    estimatedHours: 4,
    tags: ['frontend', 'backend', 'busca', 'fornecedores']
  },
  {
    title: '[Estoque] Corrigir erro "Tipo de movimentação inválida"',
    description: `Bug crítico: Ao tentar registrar qualquer tipo de movimentação, sistema retorna erro "tipo de movimentação inválida".

Erro identificado:
- Arquivo: /root/nexusatemporalv1/prompt/Erro estoque.txt
- Endpoint: POST /api/stock/movements
- Status: 400 Bad Request

Investigar:
1. Validação do campo "tipo" no backend
2. Valores esperados vs valores enviados
3. Enum de tipos de movimentação
4. Validação no DTO

Tipos devem incluir:
- Entrada
- Saída
- Ajuste
- Devolução
- Transferência

Corrigir validação e testar todos os tipos.`,
    status: 'Backlog',
    priority: 'Crítica',
    module: 'Estoque',
    estimatedHours: 3,
    tags: ['backend', 'bug', 'validação']
  },

  // === SISTEMA DE PERMISSÕES ===
  {
    title: '[Permissões] Configurar SMTP Zoho para envio de emails',
    description: `Configurar envio de emails usando SMTP do Zoho:

**Configurações:**
- Servidor: smtp.zoho.com
- Porta: 587
- Email: contato@nexusatemporal.com.br
- Senha de app: 03wCCAnBSSQB
- Segurança: STARTTLS

**Testar:**
- Envio de convite para novos usuários
- Email de redefinição de senha
- Notificações do sistema

**Backend:**
- Configurar nodemailer ou similar
- Variáveis de ambiente
- Templates de email
- Tratamento de erros`,
    status: 'Backlog',
    priority: 'Crítica',
    module: 'Sistema',
    estimatedHours: 3,
    tags: ['backend', 'email', 'smtp', 'configuração']
  },
  {
    title: '[Permissões] Implementar sistema de permissões personalizáveis por usuário',
    description: `Criar sistema completo de permissões granulares:

**Dois tipos de acesso:**
1. Acesso Padrão (pré-definido por role)
2. Acesso Personalizado (custom por usuário)

**Permissões por página/módulo:**
- Visualizar página (sim/não)
- Criar registros
- Editar registros
- Excluir registros
- Exportar dados

**Interface:**
- Tela de gerenciamento de permissões
- Checkboxes por módulo
- Checkboxes por ação
- Preview do acesso
- Salvar perfil personalizado

**Backend:**
- Tabela de permissões
- Middleware de verificação
- Cache de permissões
- Validação em cada endpoint`,
    status: 'Backlog',
    priority: 'Crítica',
    module: 'Permissões',
    estimatedHours: 20,
    tags: ['backend', 'frontend', 'segurança', 'rbac']
  },
  {
    title: '[Permissões] Ajustar hierarquias de usuários',
    description: `Modificar sistema de roles:

**Alterações:**
1. "Proprietário" → "Developer"
2. "Profissional" → "Biomédicos"
3. Adicionar "Consultores"
4. Adicionar "Marketing"

**Hierarquia completa:**
- Developer (acesso total, igual teste)
- Administrador
- Gestor
- Marketing
- Consultores
- Biomédicos
- Recepção
- Usuário

**Regras especiais:**
- Developer = acesso 100% ao sistema
- Marketing = apenas módulos de marketing/leads
- Consultores = acesso a leads e relatórios
- Biomédicos = agenda, pacientes, prontuários

**Atualizar:**
- Enum no backend
- Dropdown no frontend
- Filtros de acesso
- Documentação`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Permissões',
    estimatedHours: 6,
    tags: ['backend', 'frontend', 'roles', 'hierarquia']
  },
  {
    title: '[Permissões] Ajustar visibilidade do módulo Leads por hierarquia',
    description: `Módulo Leads não deve aparecer para:
- Recepção
- Médicos
- Biomédicos
- Consultores

Deve aparecer APENAS para:
- Desenvolvedores
- Administradores
- Gestores

Implementar:
- Filtro no menu lateral baseado em role
- Rota protegida no backend
- Redirect automático se acessar URL diretamente`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Permissões',
    estimatedHours: 2,
    tags: ['frontend', 'backend', 'acesso', 'leads']
  },
  {
    title: '[Permissões] Corrigir acesso de usuários Proprietário/Developer',
    description: `Bug: Quando usuários são marcados como "Proprietário", funções específicas não estão aparecendo.

Correção:
- Usuários "Proprietário" (agora "Developer") devem ter ACESSO TOTAL
- Mesmo nível da conta de teste
- 100% das funcionalidades visíveis
- Sem restrições

Verificar todos os checks de permissão no código que usam role === 'admin' e incluir 'developer'.`,
    status: 'Backlog',
    priority: 'Crítica',
    module: 'Permissões',
    estimatedHours: 4,
    tags: ['backend', 'frontend', 'bug', 'acesso']
  },

  // === DASHBOARD ===
  {
    title: '[Dashboard] Corrigir widget "Atendimento por Clínica" (não desaparece)',
    description: `Bug: Ao desmarcar "Atendimento por Clínica" em "Personalizar Dashboard", o widget não desaparece da visualização.

Correção:
- Verificar estado do widget
- Garantir que checkbox controla visibilidade
- Salvar preferência no localStorage ou banco
- Aplicar filtro de renderização`,
    status: 'Backlog',
    priority: 'Média',
    module: 'Dashboard',
    estimatedHours: 2,
    tags: ['frontend', 'bug', 'dashboard']
  },
  {
    title: '[Dashboard] Implementar filtros de status em "Agendamentos Hoje"',
    description: `Adicionar opções de filtro na sessão "Agendamentos Hoje":

**Filtros:**
- Aguardando Atendimento
- Em Atendimento
- Agendar Retorno
- Atendimento Finalizado

**Comportamento:**
- Quando marcado "Retorno Agendado" → sair da sessão automaticamente
- Filtros devem ser checkboxes múltiplos
- Atualização em tempo real
- Contador por status

**Regra importante:**
Pacientes devem aparecer APENAS após:
1. Pagamento confirmado
2. Horário confirmado`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Dashboard',
    estimatedHours: 5,
    tags: ['frontend', 'dashboard', 'filtros', 'agenda']
  },

  // === MÓDULO LEADS ===
  {
    title: '[Leads] Tornar campos obrigatórios no card de Lead',
    description: `Campos obrigatórios ao criar/editar Lead:
- Nome *
- Email *
- WhatsApp *
- Procedimento de Interesse *
- Local de Atendimento *

Campo "Responsável Atendimento" → mudar para "Consultor"

Validações:
- Email válido
- WhatsApp formato correto
- Todos os campos preenchidos antes de salvar`,
    status: 'Backlog',
    priority: 'Média',
    module: 'Leads',
    estimatedHours: 2,
    tags: ['frontend', 'validação', 'forms']
  },
  {
    title: '[Leads] Corrigir bug de localização no agendamento direto',
    description: `Bug: Ao fazer agendamento direto pelo card do Lead, a localização selecionada não é transferida para o agendamento.

Exemplo:
- Seleciono "Moema" no card do Lead
- Crio agendamento
- Local de atendimento fica vazio

Solução:
- Passar localização do Lead para o formulário
- Preencher automaticamente o campo
- Validar que está sendo salvo corretamente`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Leads',
    estimatedHours: 2,
    tags: ['frontend', 'bug', 'agenda']
  },

  // === MÓDULO FINANCEIRO ===
  {
    title: '[Financeiro] Implementar API de busca por CNPJ para fornecedores',
    description: `Integrar API pública de consulta CNPJ (ReceitaWS ou similar):

**Funcionalidades:**
1. Campo de CNPJ com máscara
2. Botão "Buscar" ao lado
3. Consulta API pública
4. Preenchimento automático dos campos:
   - Razão Social
   - Nome Fantasia
   - Endereço completo
   - Telefone
   - Email (se disponível)
   - Situação Cadastral

**Validações:**
- CNPJ válido (dígitos verificadores)
- Empresa ativa
- Feedback de loading
- Tratamento de erros (CNPJ não encontrado)

**APIs sugeridas:**
- ReceitaWS (gratuita)
- BrasilAPI (gratuita)
- Consulta.dev`,
    status: 'Backlog',
    priority: 'Média',
    module: 'Financeiro',
    estimatedHours: 4,
    tags: ['backend', 'api', 'integração', 'cnpj']
  },
  {
    title: '[Financeiro] Corrigir módulo completo - Ordens de Compra',
    description: `Bug crítico: Erro ao clicar em "Aprovar" em Ordens de Compra.
Erro: "Request failed with status code 400"

**Problemas identificados:**
1. Ordens não são editáveis após criação
2. Botão "Aprovar" retorna erro 400
3. Sistema não está calculando receitas/despesas
4. Transações mostram "R$ NaN"
5. Campo Lead(ID) não está associado (busca necessária)

**Correções necessárias:**
- Revisar endpoint de aprovação
- Implementar edição de ordens
- Corrigir cálculo de receitas/despesas
- Corrigir exibição de transações
- Adicionar busca por nome, CNPJ, CPF no campo Lead`,
    status: 'Backlog',
    priority: 'Crítica',
    module: 'Financeiro',
    estimatedHours: 12,
    tags: ['backend', 'frontend', 'bug', 'ordens']
  },
  {
    title: '[Financeiro] Implementar funcionalidades de Recibo/Nota Fiscal',
    description: `Melhorias no sistema de recibos/notas:

**Funcionalidades:**
1. Enviar nota por email
2. Compartilhar link da nota
3. Download em PDF
4. Edição de nota emitida (com auditoria)

**Correções no formulário:**
- Aba "Itens do recibo": permitir adicionar valor
- Colunas: Descrição | Quantidade | Valor unitário | Total
- Remover campos "Transação" e "Data de vencimento"
- Calcular total automaticamente

**Validações:**
- Todos os itens devem ter valor
- Total deve bater com soma dos itens
- Data de emissão obrigatória`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Financeiro',
    estimatedHours: 8,
    tags: ['frontend', 'backend', 'pdf', 'email']
  },
  {
    title: '[Financeiro] Corrigir edição e salvamento de despesas',
    description: `Bug: Ao tentar editar uma despesa pendente e salvar, sistema retorna erro.

Investigar:
- Endpoint de atualização de despesas
- Validações no backend
- Campos obrigatórios
- Formato de dados esperado

Testar todos os status:
- Pendente
- Paga
- Atrasada
- Cancelada`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Financeiro',
    estimatedHours: 4,
    tags: ['backend', 'bug', 'despesas']
  },
  {
    title: '[Financeiro] Corrigir fluxo de caixa e fechamento',
    description: `Bugs no fluxo de caixa:

1. Erro ao "Atualizar Fluxo de Caixa" em "Caixa Aberto"
2. Não consegue fechar o caixa
3. Valores não estão sendo calculados

**Revisão completa necessária:**
- Endpoint de atualização de fluxo
- Endpoint de fechamento de caixa
- Cálculo de saldo inicial/final
- Registros de movimentações
- Conciliação bancária

**Testar:**
- Abrir caixa
- Registrar movimentações
- Atualizar fluxo
- Fechar caixa
- Reabrir histórico`,
    status: 'Backlog',
    priority: 'Crítica',
    module: 'Financeiro',
    estimatedHours: 10,
    tags: ['backend', 'frontend', 'bug', 'fluxo-caixa']
  },

  // === MÓDULO BI & ANALYTICS ===
  {
    title: '[BI] Criar módulo BI personalizado estilo Microsoft Power BI',
    description: `Criar sistema de BI avançado e personalizável:

**Funcionalidades principais:**
1. Drag and drop de painéis
2. Múltiplos tipos de visualização:
   - Gráfico de barras
   - Gráfico de linhas
   - Gráfico de pizza
   - Funil de vendas
   - Mapa de calor
   - KPI cards
   - Tabelas dinâmicas

3. Personalização de dados:
   - Selecionar métricas para visualizar
   - Filtros dinâmicos (período, região, status)
   - Comparações (mês anterior, ano anterior)
   - Drill-down em dados

4. Exemplos de análises:
   - Produto mais vendido
   - Receita por período
   - Taxa de conversão de leads
   - Desempenho por região
   - Procedimentos mais realizados

**UX/UI:**
- Interface arrasta e solta
- Painéis reposicionáveis
- Temas personalizáveis
- Exportação de relatórios (PDF, Excel)
- Dashboards salvos e compartilháveis

**Tecnologias sugeridas:**
- Chart.js ou Recharts
- React-Grid-Layout para drag-and-drop
- Backend com queries otimizadas

NOTA: Projeto grande, dividir em fases.`,
    status: 'Backlog',
    priority: 'Média',
    module: 'BI & Analytics',
    estimatedHours: 40,
    tags: ['frontend', 'backend', 'charts', 'analytics', 'complexo']
  },

  // === LOGIN E AUTENTICAÇÃO ===
  {
    title: '[Auth] Implementar login por hierarquia e região',
    description: `Modificar fluxo de login para incluir seleção:

**Fluxo:**
1. Usuário digita email e senha
2. Sistema valida credenciais
3. Antes de entrar, mostrar:
   - Dropdown "Logar como" (hierarquias do usuário)
   - Dropdown "Região" (apenas para médicos, biomédicos, consultores)

**Lógica:**
- Administradores e Developers: NÃO passam por seleção de região
- Médicos, Biomédicos, Consultores: DEVEM selecionar região

**Após seleção:**
- Sistema filtra dados pela região escolhida
- Apenas informações da região aparecem
- Salvar preferência para próximos logins

**Interface:**
- Tela intermediária após validação
- Botão "Continuar"
- Opção "Lembrar escolha"`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Autenticação',
    estimatedHours: 8,
    tags: ['frontend', 'backend', 'auth', 'filtros']
  },
  {
    title: '[Auth] Adicionar "Redefinir Senha" e remover "Criar Conta"',
    description: `Modificar tela de login:

**Remover:**
- Link "Criar conta"
- Formulário de registro

**Adicionar:**
- Link "Esqueci minha senha"
- Fluxo de redefinição:
  1. Informar email
  2. Sistema envia link por email (SMTP Zoho)
  3. Link com token temporário
  4. Tela para nova senha
  5. Confirmação de senha alterada

**Validações:**
- Email existente no sistema
- Token válido (30 minutos)
- Senha forte (mínimo 8 caracteres, letra maiúscula, número, símbolo)
- Senhas coincidem

**Backend:**
- Gerar token único
- Salvar com expiração
- Endpoint de validação
- Endpoint de reset
- Email com template HTML`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Autenticação',
    estimatedHours: 6,
    tags: ['frontend', 'backend', 'auth', 'email']
  },
  {
    title: '[Auth] Aplicar tema dark/light na página de login',
    description: `Estender sistema de temas para a página de login:

**Implementar:**
- Toggle dark/light no canto superior direito
- Salvar preferência no localStorage
- Aplicar tema antes do login
- Consistência com resto do sistema

**Cores dark mode:**
- Background: cinza escuro
- Cards: cinza médio
- Texto: branco/cinza claro
- Inputs: fundo escuro com borda
- Botões: manter identidade visual

**Teste:**
- Troca de tema funcionando
- Persistência da escolha
- Transição suave
- Contraste adequado (acessibilidade)`,
    status: 'Backlog',
    priority: 'Baixa',
    module: 'Autenticação',
    estimatedHours: 3,
    tags: ['frontend', 'ui', 'dark-mode']
  },

  // === PERSONALIZAÇÕES GLOBAIS ===
  {
    title: '[Sistema] Implementar CRUD de itens customizáveis (procedimentos, produtos, etc)',
    description: `Adicionar opções para que clientes possam gerenciar seus próprios dados:

**Itens editáveis:**
- Procedimentos
- Categorias de produtos
- Localizações/Clínicas
- Formas de pagamento
- Status customizados
- Tipos de despesas

**Para cada item:**
- Botão "Adicionar"
- Botão "Editar"
- Botão "Excluir" (com validação de uso)
- Reordenar (drag and drop)

**Restrições:**
- Apenas admin e developers podem editar
- Validar uso antes de excluir
- Não permitir excluir se em uso
- Opção de "Inativar" ao invés de excluir

**Interface:**
- Página de "Configurações Gerais"
- Tabs por tipo de item
- CRUD inline ou modal
- Feedback visual de mudanças`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Sistema',
    estimatedHours: 12,
    tags: ['frontend', 'backend', 'crud', 'customização']
  },
  {
    title: '[Sistema] Permitir edição de localizações por administradores',
    description: `Implementar gerenciamento de localizações/clínicas:

**Funcionalidades:**
- Listar todas as localizações
- Adicionar nova localização
- Editar localização existente
- Excluir localização (se não em uso)
- Inativar localização

**Campos:**
- Nome da clínica
- Endereço completo
- Telefone
- Horário de funcionamento
- Status (Ativa/Inativa)
- Observações

**Permissões:**
- Admin e Developer podem gerenciar
- Gestores podem visualizar
- Outros roles: apenas visualização

**Validações:**
- Nome obrigatório
- Não permitir duplicados
- Verificar uso antes de excluir`,
    status: 'Backlog',
    priority: 'Média',
    module: 'Sistema',
    estimatedHours: 6,
    tags: ['frontend', 'backend', 'crud', 'localizações']
  }
];

async function addTasks() {
  console.log('🚀 Iniciando adição de tarefas ao Airtable...\n');

  let success = 0;
  let errors = 0;

  for (const [index, task] of tasks.entries()) {
    try {
      console.log(`[${index + 1}/${tasks.length}] Criando: ${task.title}`);

      await tasksTable.create([
        {
          fields: {
            'Task Name': task.title
          }
        }
      ]);

      success++;
      console.log(`✅ Criada com sucesso!\n`);
    } catch (error) {
      errors++;
      console.error(`❌ Erro ao criar tarefa: ${error.message}\n`);
    }
  }

  console.log('\n📊 RESUMO:');
  console.log(`✅ Tarefas criadas com sucesso: ${success}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`📋 Total de tarefas: ${tasks.length}`);

  // Calcular total de horas estimadas
  const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
  console.log(`⏱️  Total de horas estimadas: ${totalHours}h`);
  console.log(`📅 Estimativa de dias (8h/dia): ${(totalHours / 8).toFixed(1)} dias`);
}

// Executar
addTasks().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
