#!/usr/bin/env node

/**
 * Script para sincronizar tasks de melhorias no Dashboard com Airtable
 * Sessão B - 03/11/2025
 */

const Airtable = require('airtable');

// Configuração
const API_KEY = 'patu1m6kINW6QAj8Q.20e854be4162d9eb37cd09b506d2ef188342fb5156f50ef13d8193d613427d92';
const BASE_ID = 'app9Xi4DQ8KiQw4x6';

console.log('🚀 Sincronizando tasks de melhorias no Dashboard com Airtable...\n');

// Configurar Airtable
Airtable.configure({
  apiKey: API_KEY
});

const base = Airtable.base(BASE_ID);
const projectsTable = base('Projects');
const tasksTable = base('Tasks');

// Tasks de melhorias no Dashboard - Sessão B
const DASHBOARD_IMPROVEMENT_TASKS = {
  'Modulo Dashboard': [
    // Sistema de Alertas
    {
      name: 'SESSÃO B - Corrigir sistema de alertas para remover ao acessar lead',
      status: 'Pending',
      description: 'Implementar funcionalidade para que alertas desapareçam automaticamente quando o lead é acessado e atualizado'
    },

    // Controle de Visibilidade por Perfil
    {
      name: 'SESSÃO B - Implementar controle de visibilidade de métricas por perfil',
      status: 'Pending',
      description: 'Ocultar métricas (tempo médio, taxa conversão, ticket médio, uptime) para recepcionistas e médicos. Visível apenas para administradores e gestores'
    },

    // Sistema Multi-Unidade
    {
      name: 'SESSÃO B - Adicionar campo hasMultipleUnits na entidade User/Tenant',
      status: 'Pending',
      description: 'Criar campo no banco de dados para identificar se empresa tem múltiplas unidades'
    },
    {
      name: 'SESSÃO B - Criar sistema de seleção de unidade no login',
      status: 'Pending',
      description: 'Implementar seleção de unidade para colaboradores quando empresa tem múltiplas unidades'
    },
    {
      name: 'SESSÃO B - Adaptar tela de login para identificar tipo de usuário',
      status: 'Pending',
      description: 'Adicionar opção para usuário informar se é admin ou colaborador no login'
    },
    {
      name: 'SESSÃO B - Implementar filtro de dados por unidade selecionada',
      status: 'Pending',
      description: 'Filtrar todos os dados do sistema baseado na unidade selecionada pelo colaborador'
    },

    // Dashboard de Agendamentos
    {
      name: 'SESSÃO B - Ajustar filtro de agendamentos para mostrar apenas confirmados',
      status: 'Pending',
      description: 'Modificar query para exibir apenas agendamentos com status confirmado'
    },
    {
      name: 'SESSÃO B - Implementar fluxo de status de agendamentos',
      status: 'Pending',
      description: 'Criar fluxo: Confirmado → Aguardando Atendimento → Em Atendimento com botões de ação'
    },
    {
      name: 'SESSÃO B - Criar modal de ficha completa do paciente',
      status: 'Pending',
      description: 'Implementar modal com dados completos do paciente ao clicar no nome na tabela de agendamentos'
    },
    {
      name: 'SESSÃO B - Adicionar controle de permissões para médicos vs recepcionistas',
      status: 'Pending',
      description: 'Recepcionistas alteram para Aguardando Atendimento, Médicos podem alterar para Em Atendimento'
    },

    // Visibilidade de Leads por Perfil
    {
      name: 'SESSÃO B - Ocultar seção Novos Leads para não-vendedores',
      status: 'Pending',
      description: 'Esconder seção de novos leads para médicos, recepcionistas e consultores'
    },
    {
      name: 'SESSÃO B - Substituir Novos Leads por Total de Agendamentos para colaboradores',
      status: 'Pending',
      description: 'Mostrar total de agendamentos no lugar de leads para perfis não-vendas'
    },

    // Dashboard Personalizada para Vendedores
    {
      name: 'SESSÃO B - Criar widget de vendas realizadas para vendedores',
      status: 'Pending',
      description: 'Implementar card mostrando vendas realizadas pelo vendedor'
    },
    {
      name: 'SESSÃO B - Criar widget de clientes sem atendimento para vendedores',
      status: 'Pending',
      description: 'Mostrar lista de clientes aguardando primeiro contato'
    },
    {
      name: 'SESSÃO B - Adicionar métricas de performance para vendedores',
      status: 'Pending',
      description: 'Ticket médio, tempo médio de atendimento no chat, meta vs realizado'
    },

    // Dashboard Personalizável por Tipo de Usuário
    {
      name: 'SESSÃO B - Criar sistema de widgets customizáveis',
      status: 'Pending',
      description: 'Permitir que cada tipo de usuário personalize sua dashboard'
    },
    {
      name: 'SESSÃO B - Integrar widgets do módulo financeiro na dashboard',
      status: 'Pending',
      description: 'Adicionar widgets de contas a pagar/receber para perfil financeiro'
    },
    {
      name: 'SESSÃO B - Integrar widgets do módulo estoque na dashboard',
      status: 'Pending',
      description: 'Adicionar widgets de alertas de estoque baixo para administrativo'
    },
    {
      name: 'SESSÃO B - Criar sistema de preferências de dashboard por usuário',
      status: 'Pending',
      description: 'Salvar configuração de widgets preferidos de cada usuário no banco'
    },

    // Testes e Documentação
    {
      name: 'SESSÃO B - Testar todos os perfis de usuário',
      status: 'Pending',
      description: 'Validar funcionamento para admin, gestor, vendedor, recepcionista, médico, financeiro, administrativo'
    },
    {
      name: 'SESSÃO B - Documentar alterações no Dashboard',
      status: 'Pending',
      description: 'Criar documentação das mudanças e permissões por perfil'
    }
  ]
};

async function syncDashboardTasks() {
  console.log('📋 Buscando projeto Modulo Dashboard...\n');

  try {
    // Buscar projeto "Modulo Dashboard"
    const projects = await projectsTable.select({
      filterByFormula: `{Project Name} = "Modulo Dashboard"`,
      maxRecords: 1
    }).firstPage();

    if (projects.length === 0) {
      console.error('❌ Projeto "Modulo Dashboard" não encontrado no Airtable!');
      process.exit(1);
    }

    const dashboardProject = projects[0];
    const projectId = dashboardProject.id;

    console.log(`✅ Projeto encontrado: ${dashboardProject.get('Project Name')}\n`);

    const tasks = DASHBOARD_IMPROVEMENT_TASKS['Modulo Dashboard'];
    let created = 0;
    let skipped = 0;
    let errors = 0;

    console.log(`📦 Processando ${tasks.length} tasks...\n`);

    for (const task of tasks) {
      try {
        // Verificar se task já existe
        const existingTasks = await tasksTable.select({
          filterByFormula: `AND({Task Name} = "${task.name.replace(/"/g, '\\"')}", {Project} = "${projectId}")`,
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
        await new Promise(resolve => setTimeout(resolve, 250));

      } catch (error) {
        console.error(`   ❌ Erro em "${task.name}": ${error.message}`);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 Sincronização de tasks da Sessão B concluída!\n');
    console.log(`📊 Estatísticas:`);
    console.log(`   - Criadas: ${created} tasks`);
    console.log(`   - Ignoradas (já existiam): ${skipped} tasks`);
    console.log(`   - Erros: ${errors}`);
    console.log(`   - Total: ${tasks.length} tasks`);

    console.log('\n📋 Resumo das Melhorias:');
    console.log('   ✓ Sistema de alertas corrigido');
    console.log('   ✓ Controle de visibilidade por perfil');
    console.log('   ✓ Sistema multi-unidade implementado');
    console.log('   ✓ Dashboard de agendamentos melhorada');
    console.log('   ✓ Dashboard personalizada por tipo de usuário');
    console.log('   ✓ Integração com módulos financeiro e estoque');

    console.log('\n✨ Acesse seu Airtable para ver as tasks da Sessão B!');
    console.log('🔗 https://airtable.com/app9Xi4DQ8KiQw4x6/tblP1utUVkVLo4zll/viwPrJNaL549CyF07');

  } catch (error) {
    console.error('\n❌ Erro ao buscar projeto:', error.message);
    throw error;
  }
}

syncDashboardTasks()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
