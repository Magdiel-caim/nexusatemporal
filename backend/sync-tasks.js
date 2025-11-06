#!/usr/bin/env node

/**
 * Script para sincronizar tasks dos projetos com Airtable
 */

const Airtable = require('airtable');

// Configuração
const API_KEY = 'patu1m6kINW6QAj8Q.20e854be4162d9eb37cd09b506d2ef188342fb5156f50ef13d8193d613427d92';
const BASE_ID = 'app9Xi4DQ8KiQw4x6';

console.log('🚀 Sincronizando tasks com Airtable...\n');

// Configurar Airtable
Airtable.configure({
  apiKey: API_KEY
});

const base = Airtable.base(BASE_ID);
const projectsTable = base('Projects');
const tasksTable = base('Tasks');

// Tasks por projeto
const PROJECT_TASKS = {
  'Integração chatwoot crm one nexus': [
    { name: 'Configurar Chatwoot no Docker', status: 'Completed' },
    { name: 'Integrar API do Chatwoot', status: 'Completed' },
    { name: 'Criar componente de iframe', status: 'Completed' },
    { name: 'Implementar autenticação SSO', status: 'Completed' },
    { name: 'Testar integração completa', status: 'Completed' }
  ],
  'Disparador': [
    { name: 'Criar serviço de disparador', status: 'Completed' },
    { name: 'Implementar queue com BullMQ', status: 'Completed' },
    { name: 'Integrar com WAHA', status: 'Completed' },
    { name: 'Criar interface de usuário', status: 'Completed' },
    { name: 'Testes de carga', status: 'Completed' }
  ],
  'Integração Pagbank': [
    { name: 'Configurar credenciais PagBank', status: 'Completed' },
    { name: 'Implementar API de pagamentos', status: 'Completed' },
    { name: 'Criar webhooks', status: 'Completed' },
    { name: 'Testar transações', status: 'Completed' }
  ],
  'Automações': [
    { name: 'Configurar N8N', status: 'Completed' },
    { name: 'Criar workflows principais', status: 'Completed' },
    { name: 'Integrar com WhatsApp', status: 'Completed' },
    { name: 'Implementar triggers avançados', status: 'In Progress' },
    { name: 'Documentar workflows', status: 'Pending' }
  ],
  'Modulo Dashboard': [
    { name: 'Criar componentes de gráficos', status: 'Completed' },
    { name: 'Implementar KPIs principais', status: 'Completed' },
    { name: 'Integrar dados em tempo real', status: 'Completed' },
    { name: 'Criar widgets customizáveis', status: 'Completed' },
    { name: 'Otimizar performance', status: 'Completed' }
  ],
  'Modulo Chat One Nexus': [
    { name: 'Integrar WAHA API', status: 'Completed' },
    { name: 'Criar interface de chat', status: 'Completed' },
    { name: 'Implementar envio de mídia', status: 'Completed' },
    { name: 'Configurar webhooks', status: 'Completed' },
    { name: 'Testes de mensagens', status: 'Completed' }
  ],
  'Modulo Marketing': [
    { name: 'Criar campanhas de email', status: 'Completed' },
    { name: 'Implementar landing pages', status: 'Completed' },
    { name: 'Integrar redes sociais', status: 'Completed' },
    { name: 'Criar sistema de templates', status: 'Completed' },
    { name: 'Analytics de campanhas', status: 'Completed' }
  ],
  'Modulo Agenda': [
    { name: 'Criar calendário interativo', status: 'Completed' },
    { name: 'Implementar agendamentos', status: 'Completed' },
    { name: 'Integrar Google Calendar', status: 'Completed' },
    { name: 'Notificações por email/SMS', status: 'Completed' },
    { name: 'Gerenciar disponibilidade', status: 'Completed' }
  ],
  'Modulo LEADS': [
    { name: 'Criar entidade Lead', status: 'Completed' },
    { name: 'Implementar funil de vendas', status: 'Completed' },
    { name: 'Sistema de pontuação', status: 'Completed' },
    { name: 'Integrar com formulários', status: 'Completed' },
    { name: 'Relatórios de conversão', status: 'Completed' }
  ],
  'Módulo Prontuários': [
    { name: 'Criar modelo de prontuário', status: 'Completed' },
    { name: 'Implementar CRUD', status: 'Completed' },
    { name: 'Sistema de templates', status: 'Completed' },
    { name: 'Assinatura digital', status: 'Completed' },
    { name: 'Histórico de versões', status: 'Completed' }
  ],
  'Módulo Paciente': [
    { name: 'Criar cadastro completo', status: 'Completed' },
    { name: 'Histórico médico', status: 'Completed' },
    { name: 'Upload de documentos', status: 'Completed' },
    { name: 'Integrar com agenda', status: 'Completed' },
    { name: 'Portal do paciente', status: 'Completed' }
  ],
  'Modulo Finceiro': [
    { name: 'Criar contas a pagar/receber', status: 'Completed' },
    { name: 'Implementar fluxo de caixa', status: 'Completed' },
    { name: 'Integrar gateways de pagamento', status: 'Completed' },
    { name: 'Relatórios financeiros', status: 'In Progress' },
    { name: 'Reconciliação bancária', status: 'Pending' }
  ],
  'Modulo Vendas': [
    { name: 'Pipeline de vendas', status: 'Completed' },
    { name: 'Sistema de comissões', status: 'Completed' },
    { name: 'Propostas comerciais', status: 'Completed' },
    { name: 'Integrar com estoque', status: 'Completed' },
    { name: 'Dashboard de vendas', status: 'Completed' }
  ],
  'Modulo Estoque': [
    { name: 'Controle de inventário', status: 'Completed' },
    { name: 'Entrada e saída', status: 'Completed' },
    { name: 'Alertas de estoque baixo', status: 'Completed' },
    { name: 'Relatórios de movimento', status: 'Completed' },
    { name: 'Integração com vendas', status: 'Completed' }
  ],
  'Modulo Colaboração': [
    { name: 'Definir arquitetura', status: 'Pending' },
    { name: 'Criar sistema de mensagens', status: 'Pending' },
    { name: 'Compartilhamento de arquivos', status: 'Pending' },
    { name: 'Notificações em tempo real', status: 'Pending' }
  ],
  'Modulo BI': [
    { name: 'Configurar data warehouse', status: 'Completed' },
    { name: 'Criar dashboards executivos', status: 'Completed' },
    { name: 'Implementar KPIs', status: 'Completed' },
    { name: 'Relatórios customizados', status: 'Completed' },
    { name: 'Exportação de dados', status: 'Completed' }
  ],
  'Modulo Redes Sociais': [
    { name: 'Integrar Meta API', status: 'Completed' },
    { name: 'Conectar Instagram', status: 'Completed' },
    { name: 'Conectar Facebook Messenger', status: 'In Progress' },
    { name: 'Agendamento de posts', status: 'Pending' },
    { name: 'Analytics de engagement', status: 'Pending' }
  ],
  'Modulo Configurações': [
    { name: 'Configurações gerais do sistema', status: 'Completed' },
    { name: 'Gerenciamento de usuários', status: 'Completed' },
    { name: 'Permissões e roles', status: 'Completed' },
    { name: 'Personalização de tema', status: 'Completed' },
    { name: 'Backup e restore', status: 'Completed' }
  ],
  'Integrações': [
    { name: 'Integração N8N', status: 'Completed' },
    { name: 'Webhooks genéricos', status: 'Completed' },
    { name: 'API Keys management', status: 'Completed' },
    { name: 'Integração WhatsApp', status: 'Completed' },
    { name: 'Documentação de APIs', status: 'In Progress' }
  ],
  'PABX': [
    { name: 'Pesquisar soluções PABX', status: 'Pending' },
    { name: 'Definir arquitetura', status: 'Pending' },
    { name: 'Implementar integração', status: 'Pending' },
    { name: 'Testar chamadas', status: 'Pending' }
  ],
  'Integração Airtable': [
    { name: 'Instalar biblioteca Airtable', status: 'Completed' },
    { name: 'Criar serviço de sincronização', status: 'Completed' },
    { name: 'Implementar API endpoints', status: 'Completed' },
    { name: 'Criar scripts de importação', status: 'Completed' },
    { name: 'Documentar integração', status: 'Completed' },
    { name: 'Popular tasks no Airtable', status: 'Completed' }
  ]
};

async function syncTasks() {
  console.log('📋 Buscando projetos...\n');

  // Buscar todos os projetos
  const projects = await projectsTable.select().all();

  const projectMap = {};
  projects.forEach(project => {
    const name = project.get('Project Name');
    projectMap[name] = project.id;
  });

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const [projectName, tasks] of Object.entries(PROJECT_TASKS)) {
    const projectId = projectMap[projectName];

    if (!projectId) {
      console.log(`⚠️  Projeto não encontrado: ${projectName}`);
      continue;
    }

    console.log(`\n📦 ${projectName} (${tasks.length} tasks)`);

    for (const task of tasks) {
      try {
        // Verificar se task já existe
        const existingTasks = await tasksTable.select({
          filterByFormula: `AND({Task Name} = "${task.name}", {Project} = "${projectId}")`,
          maxRecords: 1
        }).firstPage();

        if (existingTasks.length > 0) {
          console.log(`   ⏭️  ${task.name} (já existe)`);
          skipped++;
          continue;
        }

        // Criar nova task
        await tasksTable.create({
          'Task Name': task.name,
          'Status': task.status,
          'Project': [projectId]
        });

        const icon = task.status === 'Completed' ? '✅' :
                     task.status === 'In Progress' ? '🔄' : '📋';
        console.log(`   ${icon} ${task.name}`);
        created++;

        // Aguardar para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`   ❌ Erro em "${task.name}": ${error.message}`);
        errors++;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Sincronização de tasks concluída!\n');
  console.log(`📊 Estatísticas:`);
  console.log(`   - Criadas: ${created} tasks`);
  console.log(`   - Ignoradas (já existiam): ${skipped} tasks`);
  console.log(`   - Erros: ${errors}`);

  const totalTasks = Object.values(PROJECT_TASKS).reduce((sum, tasks) => sum + tasks.length, 0);
  console.log(`   - Total: ${totalTasks} tasks`);

  const completedTasks = Object.values(PROJECT_TASKS)
    .flat()
    .filter(t => t.status === 'Completed').length;
  const inProgressTasks = Object.values(PROJECT_TASKS)
    .flat()
    .filter(t => t.status === 'In Progress').length;
  const pendingTasks = Object.values(PROJECT_TASKS)
    .flat()
    .filter(t => t.status === 'Pending').length;

  console.log(`\n📈 Status das Tasks:`);
  console.log(`   - Completed: ${completedTasks} (${(completedTasks/totalTasks*100).toFixed(1)}%)`);
  console.log(`   - In Progress: ${inProgressTasks} (${(inProgressTasks/totalTasks*100).toFixed(1)}%)`);
  console.log(`   - Pending: ${pendingTasks} (${(pendingTasks/totalTasks*100).toFixed(1)}%)`);

  console.log('\n✨ Acesse seu Airtable para ver as tasks linkadas aos projetos!');
  console.log('🔗 https://airtable.com/app9Xi4DQ8KiQw4x6/tblP1utUVkVLo4zll/viwPrJNaL549CyF07');
}

syncTasks()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
