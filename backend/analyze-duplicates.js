#!/usr/bin/env node

/**
 * 🔍 SCRIPT DE ANÁLISE DE CONTATOS DUPLICADOS
 *
 * ⚠️ ESTE SCRIPT APENAS LÊ (READ-ONLY)
 * ⚠️ NÃO DELETA NADA
 * ⚠️ APENAS MOSTRA QUANTOS DUPLICADOS EXISTEM
 *
 * Data: 03/11/2025
 */

const { Client } = require('pg');
require('dotenv').config();

console.log('🔍 ANÁLISE DE CONTATOS DUPLICADOS (READ-ONLY)\n');
console.log('⚠️  Este script APENAS LISTA duplicados, NÃO DELETA nada!\n');
console.log('='.repeat(80) + '\n');

// Configuração do banco
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'nexusatemporal',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function analyzeDuplicates() {
  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados\n');

    // Query 1: Contar total de conversas
    const totalResult = await client.query('SELECT COUNT(*) as total FROM conversations');
    const totalConversations = parseInt(totalResult.rows[0].total);
    console.log(`📊 Total de conversas no banco: ${totalConversations}\n`);

    // Query 2: Identificar duplicados (mesmo phoneNumber + whatsappInstanceId)
    const duplicatesQuery = `
      SELECT
        phone_number,
        whatsapp_instance_id,
        COUNT(*) as count,
        STRING_AGG(id::text, ', ' ORDER BY created_at DESC) as conversation_ids,
        MIN(created_at) as first_created,
        MAX(created_at) as last_created
      FROM conversations
      GROUP BY phone_number, whatsapp_instance_id
      HAVING COUNT(*) > 1
      ORDER BY count DESC, phone_number;
    `;

    const duplicatesResult = await client.query(duplicatesQuery);
    const duplicates = duplicatesResult.rows;

    if (duplicates.length === 0) {
      console.log('✅ NENHUM DUPLICADO ENCONTRADO!\n');
      console.log('🎉 Banco de dados está OK, todos os contatos são únicos.\n');
      return;
    }

    console.log(`⚠️  DUPLICADOS ENCONTRADOS: ${duplicates.length} casos\n`);
    console.log('='.repeat(80) + '\n');

    let totalDuplicatedRecords = 0;

    duplicates.forEach((dup, index) => {
      const extraRecords = dup.count - 1; // O primeiro é legítimo, o resto é duplicata
      totalDuplicatedRecords += extraRecords;

      console.log(`\n📍 CASO ${index + 1}:`);
      console.log(`   Telefone: ${dup.phone_number}`);
      console.log(`   Sessão WhatsApp: ${dup.whatsapp_instance_id || 'NULL'}`);
      console.log(`   Quantidade de duplicatas: ${dup.count} registros`);
      console.log(`   Primeira criação: ${new Date(dup.first_created).toLocaleString('pt-BR')}`);
      console.log(`   Última criação: ${new Date(dup.last_created).toLocaleString('pt-BR')}`);
      console.log(`   IDs das conversas:`);
      const ids = dup.conversation_ids.split(', ');
      ids.forEach((id, i) => {
        console.log(`      ${i === 0 ? '✅ MANTER' : '❌ DELETAR'}: ${id}`);
      });
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 RESUMO DA ANÁLISE:\n');
    console.log(`   Total de conversas: ${totalConversations}`);
    console.log(`   Casos de duplicação: ${duplicates.length}`);
    console.log(`   Registros duplicados a remover: ${totalDuplicatedRecords}`);
    console.log(`   Registros legítimos a manter: ${duplicates.length}`);
    console.log(`   Percentual de duplicação: ${((totalDuplicatedRecords / totalConversations) * 100).toFixed(2)}%\n`);

    // Query 3: Verificar se duplicados têm mensagens
    console.log('📨 Verificando se duplicados têm mensagens associadas...\n');

    for (const dup of duplicates) {
      const ids = dup.conversation_ids.split(', ');
      for (let i = 0; i < ids.length; i++) {
        const conversationId = ids[i];
        const messagesResult = await client.query(
          'SELECT COUNT(*) as count FROM messages WHERE conversation_id = $1',
          [conversationId]
        );
        const messageCount = parseInt(messagesResult.rows[0].count);

        if (messageCount > 0) {
          console.log(`   ⚠️  Conversa ${conversationId} (${dup.phone_number}): ${messageCount} mensagens`);
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n💡 RECOMENDAÇÕES:\n');
    console.log('1. Antes de deletar, fazer BACKUP do banco de dados');
    console.log('2. Manter apenas a conversa mais ANTIGA (primeira criada)');
    console.log('3. Se duplicata tem mensagens, MESCLAR antes de deletar');
    console.log('4. Adicionar constraint UNIQUE após limpeza:');
    console.log('   ALTER TABLE conversations ADD CONSTRAINT unique_phone_instance');
    console.log('   UNIQUE (phone_number, whatsapp_instance_id);');
    console.log('\n⚠️  NÃO EXECUTAR DELETE SEM APROVAÇÃO!\n');

    // Gerar script SQL de limpeza (APENAS MOSTRAR, NÃO EXECUTAR)
    console.log('\n📝 Script SQL para limpeza (NÃO EXECUTADO AUTOMATICAMENTE):\n');
    console.log('-- ⚠️  FAZER BACKUP ANTES DE EXECUTAR!');
    console.log('-- ⚠️  REVISAR CADA DELETE MANUALMENTE!\n');

    duplicates.forEach((dup) => {
      const ids = dup.conversation_ids.split(', ');
      if (ids.length > 1) {
        // Manter apenas o primeiro (mais antigo), deletar o resto
        const idsToDelete = ids.slice(1);
        console.log(`-- Deletar duplicatas de ${dup.phone_number}:`);
        idsToDelete.forEach(id => {
          console.log(`DELETE FROM conversations WHERE id = '${id}'; -- ${dup.phone_number}`);
        });
        console.log('');
      }
    });

  } catch (error) {
    console.error('\n❌ Erro ao analisar duplicados:', error.message);
    console.error(error);
  } finally {
    await client.end();
    console.log('\n✅ Conexão com banco encerrada\n');
  }
}

analyzeDuplicates()
  .then(() => {
    console.log('🎯 Análise concluída!\n');
    console.log('📋 Próximo passo: Revisar resultados e decidir se quer executar limpeza\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
