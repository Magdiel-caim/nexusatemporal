#!/usr/bin/env node

/**
 * Script para sincronizar todos os projetos do One Nexus Atemporal com Airtable
 */

const Airtable = require('airtable');

// Configuração
const API_KEY = 'patu1m6kINW6QAj8Q.20e854be4162d9eb37cd09b506d2ef188342fb5156f50ef13d8193d613427d92';
const BASE_ID = 'app9Xi4DQ8KiQw4x6';

console.log('🚀 Sincronizando projetos com Airtable...\n');

// Configurar Airtable
Airtable.configure({
  apiKey: API_KEY
});

const base = Airtable.base(BASE_ID);
const projectsTable = base('Projects');

// Lista de todos os projetos com status e progresso
const PROJECTS = [
  {
    name: 'Integração chatwoot crm one nexus',
    status: 'Completed',
    progress: 100,
    description: 'Integração completa do Chatwoot como sistema de chat do One Nexus'
  },
  {
    name: 'Disparador',
    status: 'Completed',
    progress: 100,
    description: 'Sistema de disparador de mensagens para WhatsApp'
  },
  {
    name: 'Integração Pagbank',
    status: 'Completed',
    progress: 100,
    description: 'Integração com gateway de pagamento PagBank'
  },
  {
    name: 'Automações',
    status: 'In Progress',
    progress: 80,
    description: 'Sistema de automações e workflows com N8N'
  },
  {
    name: 'Modulo Dashboard',
    status: 'Completed',
    progress: 100,
    description: 'Dashboard principal com KPIs e métricas do sistema'
  },
  {
    name: 'Modulo Chat One Nexus',
    status: 'Completed',
    progress: 100,
    description: 'Módulo de chat integrado com WhatsApp e Chatwoot'
  },
  {
    name: 'Modulo Marketing',
    status: 'Completed',
    progress: 100,
    description: 'Módulo de marketing com campanhas, posts sociais e landing pages'
  },
  {
    name: 'Modulo Agenda',
    status: 'Completed',
    progress: 100,
    description: 'Sistema de agendamentos e calendário'
  },
  {
    name: 'Modulo LEADS',
    status: 'Completed',
    progress: 100,
    description: 'Gestão de leads e funil de vendas'
  },
  {
    name: 'Módulo Prontuários',
    status: 'Completed',
    progress: 100,
    description: 'Sistema de prontuários médicos eletrônicos'
  },
  {
    name: 'Módulo Paciente',
    status: 'Completed',
    progress: 100,
    description: 'Gestão completa de pacientes com histórico médico'
  },
  {
    name: 'Modulo Finceiro',
    status: 'In Progress',
    progress: 75,
    description: 'Sistema financeiro com contas a pagar/receber'
  },
  {
    name: 'Modulo Vendas',
    status: 'Completed',
    progress: 100,
    description: 'Gestão de vendas e comissões'
  },
  {
    name: 'Modulo Estoque',
    status: 'Completed',
    progress: 100,
    description: 'Controle de estoque e inventário'
  },
  {
    name: 'Modulo Colaboração',
    status: 'Pending',
    progress: 0,
    description: 'Sistema de colaboração entre equipes (a ser implementado)'
  },
  {
    name: 'Modulo BI',
    status: 'Completed',
    progress: 100,
    description: 'Business Intelligence com dashboards e relatórios'
  },
  {
    name: 'Modulo Redes Sociais',
    status: 'In Progress',
    progress: 60,
    description: 'Integração com redes sociais (Meta API)'
  },
  {
    name: 'Modulo Configurações',
    status: 'Completed',
    progress: 100,
    description: 'Configurações gerais do sistema'
  },
  {
    name: 'Integrações',
    status: 'In Progress',
    progress: 85,
    description: 'Integrações diversas (N8N, APIs externas, webhooks)'
  },
  {
    name: 'PABX',
    status: 'Pending',
    progress: 0,
    description: 'Integração com sistema de telefonia PABX'
  },
  {
    name: 'Integração Airtable',
    status: 'Completed',
    progress: 100,
    description: 'Integração completa com Airtable para gestão de projetos'
  }
];

async function syncProjects() {
  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const project of PROJECTS) {
    try {
      // Buscar se o projeto já existe
      const records = await projectsTable.select({
        filterByFormula: `{Project Name} = "${project.name}"`,
        maxRecords: 1
      }).firstPage();

      const fields = {
        'Project Name': project.name,
        'Status': project.status,
        'Overall Progress': project.progress
      };

      // Adiciona description apenas se o campo existir
      if (project.description) {
        fields['Description'] = project.description;
      }

      if (records.length > 0) {
        // Atualizar projeto existente
        await projectsTable.update(records[0].id, fields);
        console.log(`✅ Atualizado: ${project.name} (${project.progress}%)`);
        updated++;
      } else {
        // Criar novo projeto
        await projectsTable.create(fields);
        console.log(`✨ Criado: ${project.name} (${project.progress}%)`);
        created++;
      }

      // Aguardar um pouco para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error) {
      console.error(`❌ Erro em ${project.name}:`, error.message);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Sincronização concluída!\n');
  console.log(`📊 Estatísticas:`);
  console.log(`   - Criados: ${created} projetos`);
  console.log(`   - Atualizados: ${updated} projetos`);
  console.log(`   - Erros: ${errors}`);
  console.log(`   - Total: ${PROJECTS.length} projetos`);

  const completed = PROJECTS.filter(p => p.status === 'Completed').length;
  const inProgress = PROJECTS.filter(p => p.status === 'In Progress').length;
  const pending = PROJECTS.filter(p => p.status === 'Pending').length;

  console.log(`\n📈 Status Geral:`);
  console.log(`   - Completados: ${completed} (${(completed/PROJECTS.length*100).toFixed(1)}%)`);
  console.log(`   - Em Progresso: ${inProgress} (${(inProgress/PROJECTS.length*100).toFixed(1)}%)`);
  console.log(`   - Pendentes: ${pending} (${(pending/PROJECTS.length*100).toFixed(1)}%)`);

  const totalProgress = PROJECTS.reduce((sum, p) => sum + p.progress, 0) / PROJECTS.length;
  console.log(`\n🎯 Progresso Geral: ${totalProgress.toFixed(1)}%`);

  console.log('\n✨ Acesse seu Airtable para ver os projetos atualizados!');
}

syncProjects()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
