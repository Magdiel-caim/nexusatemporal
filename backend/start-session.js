#!/usr/bin/env node

/**
 * Script para iniciar uma nova sessão
 * Uso: node start-session.js
 */

const Airtable = require('airtable');
const fs = require('fs');
const path = require('path');

const API_KEY = 'patu1m6kINW6QAj8Q.20e854be4162d9eb37cd09b506d2ef188342fb5156f50ef13d8193d613427d92';
const BASE_ID = 'app9Xi4DQ8KiQw4x6';

Airtable.configure({ apiKey: API_KEY });
const base = Airtable.base(BASE_ID);
const projectsTable = base('Projects');

async function startSession() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║              🚀 INICIANDO NOVA SESSÃO                          ║
║              One Nexus Atemporal - Claude Code                 ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

  try {
    // 1. Ler arquivo PROXIMA_SESSAO.md
    console.log('📖 Lendo contexto da sessão anterior...\n');

    const rootDir = path.join(__dirname, '..');
    const nextSessionPath = path.join(rootDir, 'PROXIMA_SESSAO.md');

    let hasNextSession = false;
    if (fs.existsSync(nextSessionPath)) {
      const content = fs.readFileSync(nextSessionPath, 'utf-8');

      // Extrair informações principais
      const awaitingMatch = content.match(/AWAITING APPROVAL \((\d+)\)/);
      const revisionMatch = content.match(/NEEDS REVISION \((\d+)\)/);
      const progressMatch = content.match(/IN PROGRESS \((\d+)\)/);

      if (awaitingMatch || revisionMatch || progressMatch) {
        hasNextSession = true;
        console.log('✅ Contexto da sessão anterior encontrado!\n');
      }
    }

    // 2. Buscar status atual no Airtable
    console.log('📊 Consultando Airtable...\n');

    const allProjects = await projectsTable.select().all();

    const stats = {
      awaiting: [],
      revision: [],
      progress: [],
      approved: [],
      pending: []
    };

    allProjects.forEach(record => {
      const project = {
        name: record.get('Project Name'),
        status: record.get('Status'),
        progress: record.get('Overall Progress') || 0,
        feedback: record.get('Feedback') || '',
        revisionCount: record.get('Revision Count') || 0
      };

      switch (project.status) {
        case 'Awaiting Approval':
          stats.awaiting.push(project);
          break;
        case 'Needs Revision':
          stats.revision.push(project);
          break;
        case 'In Progress':
          stats.progress.push(project);
          break;
        case 'Approved':
          stats.approved.push(project);
          break;
        case 'Pending':
          stats.pending.push(project);
          break;
      }
    });

    // 3. Mostrar resumo visual
    console.log('═'.repeat(60));
    console.log('                   📊 STATUS ATUAL');
    console.log('═'.repeat(60));
    console.log('');

    // Estatísticas gerais
    console.log(`Total de Projetos: ${allProjects.length}`);
    console.log(`Progresso Geral: ${Math.round(stats.approved.length / allProjects.length * 100)}%\n`);

    // Status detalhado
    if (stats.revision.length > 0) {
      console.log('🔧 NEEDS REVISION - PRIORIDADE CRÍTICA!');
      console.log('─'.repeat(60));
      stats.revision.forEach(p => {
        const priority = p.revisionCount > 2 ? '🔴' :
                        p.revisionCount > 1 ? '🟠' : '🟡';
        console.log(`   ${priority} ${p.name}`);
        console.log(`      Revisões: ${p.revisionCount}`);
        if (p.feedback) {
          const feedbackPreview = p.feedback
            .replace(/\n/g, ' ')
            .substring(0, 80);
          console.log(`      Feedback: ${feedbackPreview}...`);
        }
        console.log('');
      });
    }

    if (stats.awaiting.length > 0) {
      console.log('⏳ AWAITING APPROVAL - Aguardando Teste');
      console.log('─'.repeat(60));
      stats.awaiting.forEach(p => {
        console.log(`   📦 ${p.name} (${p.progress}%)`);
      });
      console.log('');
    }

    if (stats.progress.length > 0) {
      console.log('🔄 IN PROGRESS - Em Desenvolvimento');
      console.log('─'.repeat(60));
      stats.progress.forEach(p => {
        console.log(`   ⚙️  ${p.name} (${p.progress}%)`);
      });
      console.log('');
    }

    console.log('✅ APPROVED - Aprovados');
    console.log('─'.repeat(60));
    console.log(`   ${stats.approved.length} projetos aprovados\n`);

    // 4. Sugerir prioridades
    console.log('═'.repeat(60));
    console.log('                🎯 PRIORIDADES SUGERIDAS');
    console.log('═'.repeat(60));
    console.log('');

    let priority = 1;

    if (stats.revision.length > 0) {
      console.log(`${priority}. 🔴 CRÍTICO: Corrigir ${stats.revision.length} projeto(s) em revisão`);
      stats.revision.slice(0, 3).forEach(p => {
        console.log(`   • ${p.name} (${p.revisionCount} revisões)`);
      });
      console.log('');
      priority++;
    }

    if (stats.awaiting.length > 0) {
      console.log(`${priority}. 🟠 ALTO: Aguardar validação de ${stats.awaiting.length} projeto(s)`);
      console.log(`   (Estes projetos estão prontos para teste)\n`);
      priority++;
    }

    if (stats.progress.length > 0) {
      console.log(`${priority}. 🟡 MÉDIO: Continuar ${stats.progress.length} projeto(s) em desenvolvimento\n`);
      priority++;
    }

    if (stats.pending.length > 0) {
      console.log(`${priority}. 🟢 BAIXO: Iniciar ${stats.pending.length} projeto(s) pendente(s)\n`);
    }

    // 5. Recomendação de ação
    console.log('═'.repeat(60));
    console.log('                  💡 RECOMENDAÇÃO');
    console.log('═'.repeat(60));
    console.log('');

    if (stats.revision.length > 0) {
      const criticalProject = stats.revision[0];
      console.log(`🎯 Recomendo começar por: "${criticalProject.name}"`);
      console.log(`   Motivo: ${criticalProject.revisionCount} revisão(ões) pendente(s)\n`);

      if (criticalProject.feedback) {
        console.log('📋 Feedback:');
        console.log(criticalProject.feedback.substring(0, 300));
        if (criticalProject.feedback.length > 300) console.log('   ...');
        console.log('');
      }

      console.log('🤖 Comando sugerido:');
      console.log(`   "Claude, corrija o projeto '${criticalProject.name}'`);
      console.log(`    conforme o feedback no Airtable"\n`);

    } else if (stats.progress.length > 0) {
      const progressProject = stats.progress[0];
      console.log(`🎯 Recomendo continuar: "${progressProject.name}"`);
      console.log(`   Progresso atual: ${progressProject.progress}%\n`);

    } else if (stats.pending.length > 0) {
      const pendingProject = stats.pending[0];
      console.log(`🎯 Recomendo iniciar: "${pendingProject.name}"\n`);

    } else if (stats.awaiting.length > 0) {
      console.log(`🎯 ${stats.awaiting.length} projeto(s) aguardando sua aprovação`);
      console.log(`   Teste quando possível e dê feedback no Airtable\n`);

    } else {
      console.log(`🎉 Parabéns! Todos os projetos estão aprovados!`);
      console.log(`   Pronto para iniciar novas features\n`);
    }

    // 6. Links úteis
    console.log('═'.repeat(60));
    console.log('                    🔗 LINKS ÚTEIS');
    console.log('═'.repeat(60));
    console.log('');
    console.log(`📊 Airtable: https://airtable.com/${BASE_ID}`);
    console.log(`📖 Documentação: CONTINUIDADE_SESSOES.md`);
    console.log(`📝 Próxima Sessão: PROXIMA_SESSAO.md`);
    console.log('');

    // 7. Como começar
    console.log('═'.repeat(60));
    console.log('                  🚀 COMO COMEÇAR');
    console.log('═'.repeat(60));
    console.log('');
    console.log('Diga ao Claude Code:');
    console.log('');

    if (stats.revision.length > 0) {
      console.log(`   "Claude, corrija o projeto '${stats.revision[0].name}'"`);
    } else if (stats.progress.length > 0) {
      console.log(`   "Claude, continue o projeto '${stats.progress[0].name}'"`);
    } else if (stats.pending.length > 0) {
      console.log(`   "Claude, implemente '${stats.pending[0].name}'"`);
    } else {
      console.log(`   "Claude, qual projeto devo priorizar?"`);
    }

    console.log('   "Claude, continue de onde paramos"');
    console.log('   "Claude, mostre o status dos projetos"');
    console.log('');
    console.log('═'.repeat(60));
    console.log('');

  } catch (error) {
    console.error('\n❌ Erro ao iniciar sessão:', error.message);
    console.error('\n💡 Certifique-se de que:');
    console.error('   - Airtable está configurado corretamente');
    console.error('   - Arquivo .env contém AIRTABLE_API_KEY e AIRTABLE_BASE_ID');
    throw error;
  }
}

startSession()
  .then(() => {
    console.log('✅ Sessão inicializada! Bom trabalho! 🚀\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
