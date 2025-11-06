#!/usr/bin/env node

/**
 * Script para atualizar status de projetos no Airtable
 * Uso: node update-status.js "Nome do Projeto" <status> "Mensagem"
 *
 * Status disponíveis:
 * - pending: Pending
 * - progress: In Progress
 * - awaiting: Awaiting Approval
 * - revision: Needs Revision
 * - approved: Approved
 */

const Airtable = require('airtable');

const API_KEY = 'patu1m6kINW6QAj8Q.20e854be4162d9eb37cd09b506d2ef188342fb5156f50ef13d8193d613427d92';
const BASE_ID = 'app9Xi4DQ8KiQw4x6';

// Mapeamento de status
const STATUS_MAP = {
  'pending': 'Pending',
  'progress': 'In Progress',
  'awaiting': 'Awaiting Approval',
  'revision': 'Needs Revision',
  'approved': 'Approved'
};

// Configurar Airtable
Airtable.configure({ apiKey: API_KEY });
const base = Airtable.base(BASE_ID);
const projectsTable = base('Projects');

async function updateProjectStatus(projectName, statusKey, message) {
  try {
    console.log(`\n🔍 Buscando projeto: ${projectName}...`);

    // Buscar projeto
    const records = await projectsTable.select({
      filterByFormula: `{Project Name} = "${projectName}"`,
      maxRecords: 1
    }).firstPage();

    if (records.length === 0) {
      console.error(`❌ Projeto "${projectName}" não encontrado!`);
      console.log('\n💡 Projetos disponíveis:');
      const allProjects = await projectsTable.select({
        fields: ['Project Name'],
        maxRecords: 30
      }).all();
      allProjects.forEach(p => console.log(`   - ${p.get('Project Name')}`));
      return;
    }

    const record = records[0];
    const oldStatus = record.get('Status') || 'N/A';
    const newStatus = STATUS_MAP[statusKey];

    if (!newStatus) {
      console.error(`❌ Status inválido: ${statusKey}`);
      console.log('\n✅ Status válidos:');
      Object.entries(STATUS_MAP).forEach(([key, value]) => {
        console.log(`   - ${key} → ${value}`);
      });
      return;
    }

    console.log(`📊 Status atual: ${oldStatus}`);
    console.log(`🎯 Novo status: ${newStatus}`);

    // Preparar campos para atualização
    const fields = {
      'Status': newStatus
    };

    // Adicionar campos específicos por status
    if (statusKey === 'awaiting') {
      // Quando marca como "Awaiting Approval"
      fields['Last Updated'] = new Date().toISOString();
      if (message) {
        fields['Feedback'] = `✅ Pronto para teste:\n${message}\n\n---\nData: ${new Date().toLocaleString('pt-BR')}`;
      }
    } else if (statusKey === 'revision') {
      // Quando marca como "Needs Revision"
      const revisionCount = (record.get('Revision Count') || 0) + 1;
      fields['Revision Count'] = revisionCount;
      fields['Last Updated'] = new Date().toISOString();

      if (message) {
        const existingFeedback = record.get('Feedback') || '';
        fields['Feedback'] = `🔧 REVISÃO #${revisionCount} NECESSÁRIA:\n${message}\n\n${existingFeedback ? '---\nFeedback anterior:\n' + existingFeedback : ''}`;
      }

      console.log(`🔢 Número de revisões: ${revisionCount}`);
    } else if (statusKey === 'approved') {
      // Quando marca como "Approved"
      fields['Approved Date'] = new Date().toISOString();
      fields['Last Updated'] = new Date().toISOString();

      if (message) {
        fields['Feedback'] = `✅ APROVADO:\n${message}\n\n---\nData: ${new Date().toLocaleString('pt-BR')}`;
      }
    } else if (statusKey === 'progress') {
      // Quando marca como "In Progress"
      fields['Last Updated'] = new Date().toISOString();

      if (message) {
        fields['Feedback'] = `🔄 Em desenvolvimento:\n${message}\n\n---\nData: ${new Date().toLocaleString('pt-BR')}`;
      }
    }

    // Atualizar no Airtable
    await projectsTable.update(record.id, fields);

    console.log(`\n✅ Status atualizado com sucesso!`);

    if (fields['Revision Count']) {
      console.log(`📝 Total de revisões: ${fields['Revision Count']}`);
    }

    if (statusKey === 'approved') {
      const revisionCount = record.get('Revision Count') || 0;
      console.log(`\n🎉 PROJETO APROVADO!`);
      console.log(`   - Revisões necessárias: ${revisionCount}`);
      console.log(`   - Taxa de sucesso: ${revisionCount === 0 ? '100% (1ª tentativa!)' : `${Math.round(100/(revisionCount+1))}%`}`);
    }

    if (statusKey === 'awaiting') {
      console.log(`\n⏳ Projeto aguardando sua aprovação/validação`);
    }

    if (statusKey === 'revision') {
      console.log(`\n🔧 Projeto marcado para revisão. Claude será notificado.`);
    }

    console.log(`\n🔗 Ver no Airtable: https://airtable.com/app9Xi4DQ8KiQw4x6`);

  } catch (error) {
    console.error(`\n❌ Erro ao atualizar status:`, error.message);
  }
}

// Processar argumentos da linha de comando
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                  UPDATE STATUS - AIRTABLE                      ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Uso:                                                          ║
║    node update-status.js "Nome do Projeto" <status> "Msg"     ║
║                                                                ║
║  Status disponíveis:                                           ║
║    pending   → 📋 Pending                                      ║
║    progress  → 🔄 In Progress                                  ║
║    awaiting  → ⏳ Awaiting Approval                            ║
║    revision  → 🔧 Needs Revision                               ║
║    approved  → ✅ Approved                                     ║
║                                                                ║
║  Exemplos:                                                     ║
║                                                                ║
║    # Marcar como pronto para teste                            ║
║    node update-status.js "Módulo Dashboard" awaiting \\        ║
║      "Gráficos e KPIs implementados"                           ║
║                                                                ║
║    # Reportar problemas                                        ║
║    node update-status.js "Módulo Dashboard" revision \\        ║
║      "1. Gráfico não carrega 2. KPI errado"                    ║
║                                                                ║
║    # Aprovar projeto                                           ║
║    node update-status.js "Módulo Dashboard" approved \\        ║
║      "Testado e aprovado!"                                     ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);
  process.exit(1);
}

const projectName = args[0];
const statusKey = args[1];
const message = args[2] || '';

updateProjectStatus(projectName, statusKey, message)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
