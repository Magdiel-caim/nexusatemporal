#!/usr/bin/env node

/**
 * Script para ajustar status das tasks existentes
 * Tasks já completadas ficam como "Completed"
 * Workflow de validação vale apenas para novas tasks
 */

const Airtable = require('airtable');

const API_KEY = 'patu1m6kINW6QAj8Q.20e854be4162d9eb37cd09b506d2ef188342fb5156f50ef13d8193d613427d92';
const BASE_ID = 'app9Xi4DQ8KiQw4x6';

Airtable.configure({ apiKey: API_KEY });
const base = Airtable.base(BASE_ID);
const tasksTable = base('Tasks');

async function adjustTasksStatus() {
  console.log('🔄 Ajustando status das tasks existentes...\n');

  try {
    // Buscar todas as tasks
    const allTasks = await tasksTable.select().all();

    console.log(`📋 Total de tasks encontradas: ${allTasks.length}\n`);

    const completed = allTasks.filter(t => t.get('Status') === 'Completed').length;
    const inProgress = allTasks.filter(t => t.get('Status') === 'In Progress').length;
    const pending = allTasks.filter(t => t.get('Status') === 'Pending').length;

    console.log('📊 Status Atual das Tasks:');
    console.log(`   ✅ Completed: ${completed}`);
    console.log(`   🔄 In Progress: ${inProgress}`);
    console.log(`   📋 Pending: ${pending}`);
    console.log('');

    console.log('✅ Decisão: Manter todas as tasks existentes como estão!\n');
    console.log('📝 Explicação:');
    console.log('   - Tasks "Completed" = Trabalho já validado e aprovado');
    console.log('   - Tasks "In Progress" = Continuam em desenvolvimento');
    console.log('   - Tasks "Pending" = Aguardam início\n');

    console.log('🎯 Novo Workflow de Validação:');
    console.log('   Será aplicado apenas para NOVAS tasks a partir de agora\n');

    console.log('💡 Como funcionará:');
    console.log('');
    console.log('   TASKS ANTIGAS (já existentes):');
    console.log('   ├─ Completed → Ficam como estão ✅');
    console.log('   ├─ In Progress → Continuam em desenvolvimento 🔄');
    console.log('   └─ Pending → Aguardam início 📋');
    console.log('');
    console.log('   TASKS NOVAS (a partir de agora):');
    console.log('   ├─ 1. Pending → Aguardando início');
    console.log('   ├─ 2. In Progress → Claude desenvolvendo');
    console.log('   ├─ 3. Awaiting Approval → Pronto para você testar');
    console.log('   ├─ 4a. Approved → Aprovado! ✅');
    console.log('   └─ 4b. Needs Revision → Você encontrou problemas');
    console.log('        └─ volta para In Progress → Claude corrige');
    console.log('');

    console.log('=' .repeat(60));
    console.log('✅ NENHUMA ALTERAÇÃO NECESSÁRIA!\n');
    console.log('📋 Resumo:');
    console.log(`   - ${allTasks.length} tasks mantidas como estão`);
    console.log(`   - Workflow de validação ativo para novas tasks`);
    console.log(`   - Histórico preservado integralmente`);
    console.log('');
    console.log('🎉 Sistema pronto para uso!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    throw error;
  }
}

adjustTasksStatus()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
