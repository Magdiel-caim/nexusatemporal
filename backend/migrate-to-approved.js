#!/usr/bin/env node

/**
 * Script para migrar projetos "Completed" para "Approved"
 */

const Airtable = require('airtable');

const API_KEY = 'patu1m6kINW6QAj8Q.20e854be4162d9eb37cd09b506d2ef188342fb5156f50ef13d8193d613427d92';
const BASE_ID = 'app9Xi4DQ8KiQw4x6';

Airtable.configure({ apiKey: API_KEY });
const base = Airtable.base(BASE_ID);
const projectsTable = base('Projects');

async function migrateCompletedToApproved() {
  console.log('🔄 Migrando projetos "Completed" para "Approved"...\n');

  try {
    // Buscar todos os projetos com status "Completed"
    const records = await projectsTable.select({
      filterByFormula: `{Status} = "Completed"`,
    }).all();

    console.log(`📋 Encontrados ${records.length} projetos "Completed"\n`);

    if (records.length === 0) {
      console.log('✅ Nenhum projeto para migrar!');
      return;
    }

    let updated = 0;
    let errors = 0;

    for (const record of records) {
      const projectName = record.get('Project Name');

      try {
        await projectsTable.update(record.id, {
          'Status': 'Approved',
          'Approved Date': new Date().toISOString(),
          'Feedback': `✅ Migrado automaticamente de "Completed" para "Approved"\nData: ${new Date().toLocaleString('pt-BR')}`
        });

        console.log(`✅ ${projectName}`);
        updated++;

        // Aguardar para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`❌ Erro em ${projectName}:`, error.message);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Migração concluída!\n');
    console.log(`📊 Estatísticas:`);
    console.log(`   - Migrados: ${updated} projetos`);
    console.log(`   - Erros: ${errors}`);
    console.log(`\n✨ Todos os projetos "Completed" agora são "Approved"!`);

  } catch (error) {
    console.error('\n❌ Erro na migração:', error.message);
  }
}

migrateCompletedToApproved()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
