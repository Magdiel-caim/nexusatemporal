#!/usr/bin/env node

/**
 * Script de teste rápido da integração Airtable
 */

const Airtable = require('airtable');

// Configuração
const API_KEY = 'patu1m6kINW6QAj8Q.20e854be4162d9eb37cd09b506d2ef188342fb5156f50ef13d8193d613427d92';
const BASE_ID = 'app9Xi4DQ8KiQw4x6';

console.log('🚀 Testando conexão com Airtable...\n');

// Configurar Airtable
Airtable.configure({
  apiKey: API_KEY
});

const base = Airtable.base(BASE_ID);
const projectsTable = base('Projects');

// Testar listagem de projetos
console.log('📊 Listando projetos existentes:\n');

projectsTable.select({
  maxRecords: 10
}).firstPage()
  .then(records => {
    console.log(`✅ Conexão bem-sucedida!`);
    console.log(`📋 Encontrados ${records.length} projetos:\n`);

    records.forEach(record => {
      const name = record.get('Project Name');
      const status = record.get('Status') || 'N/A';
      const progress = record.get('Overall Progress') || 0;

      console.log(`  • ${name}`);
      console.log(`    Status: ${status} | Progresso: ${progress}%\n`);
    });

    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('\n💡 Próximos passos:');
    console.log('   1. Criar tabela "Tasks" no Airtable');
    console.log('   2. Executar script de importação completa');
    console.log('   3. Começar a usar a API!');
  })
  .catch(error => {
    console.error('❌ Erro ao conectar com Airtable:');
    console.error(error.message);

    if (error.statusCode === 401) {
      console.log('\n⚠️  Erro de autenticação - verifique o API_KEY');
    } else if (error.statusCode === 404) {
      console.log('\n⚠️  Base ou tabela não encontrada - verifique BASE_ID');
    }
  });
