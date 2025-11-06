#!/usr/bin/env node

/**
 * Script para finalizar sessão e preparar a próxima
 * Uso: node end-session.js "Resumo da sessão"
 */

const Airtable = require('airtable');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const API_KEY = 'patu1m6kINW6QAj8Q.20e854be4162d9eb37cd09b506d2ef188342fb5156f50ef13d8193d613427d92';
const BASE_ID = 'app9Xi4DQ8KiQw4x6';

Airtable.configure({ apiKey: API_KEY });
const base = Airtable.base(BASE_ID);
const projectsTable = base('Projects');

async function endSession(sessionSummary) {
  console.log('🔄 Finalizando sessão...\n');

  try {
    // 1. Buscar projetos pendentes no Airtable
    console.log('📊 Verificando status dos projetos no Airtable...');

    const allProjects = await projectsTable.select().all();

    const awaitingApproval = [];
    const needsRevision = [];
    const approved = [];
    const inProgress = [];

    allProjects.forEach(record => {
      const project = {
        name: record.get('Project Name'),
        status: record.get('Status'),
        progress: record.get('Overall Progress') || 0,
        feedback: record.get('Feedback') || '',
        revisionCount: record.get('Revision Count') || 0
      };

      if (project.status === 'Awaiting Approval') awaitingApproval.push(project);
      else if (project.status === 'Needs Revision') needsRevision.push(project);
      else if (project.status === 'Approved') approved.push(project);
      else if (project.status === 'In Progress') inProgress.push(project);
    });

    console.log(`\n📋 Status dos Projetos:`);
    console.log(`   - ⏳ Awaiting Approval: ${awaitingApproval.length}`);
    console.log(`   - 🔧 Needs Revision: ${needsRevision.length}`);
    console.log(`   - 🔄 In Progress: ${inProgress.length}`);
    console.log(`   - ✅ Approved: ${approved.length}`);

    // 2. Gerar arquivo PROXIMA_SESSAO.md
    console.log('\n📝 Gerando PROXIMA_SESSAO.md...');

    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR');
    const timeStr = today.toLocaleTimeString('pt-BR');

    let nextSessionContent = `# 🎯 Próxima Sessão - ${dateStr}

**Última atualização:** ${dateStr} às ${timeStr}

---

## ⚡ STATUS ATUAL

### 📊 Estatísticas Gerais
- **Total de Projetos:** ${allProjects.length}
- **Aprovados:** ${approved.length} (${Math.round(approved.length/allProjects.length*100)}%)
- **Em Progresso:** ${inProgress.length}
- **Aguardando Aprovação:** ${awaitingApproval.length}
- **Precisam Revisão:** ${needsRevision.length}

`;

    // Projetos que precisam revisão (PRIORIDADE CRÍTICA)
    if (needsRevision.length > 0) {
      nextSessionContent += `### 🔧 NEEDS REVISION (${needsRevision.length}) - PRIORIDADE CRÍTICA

`;
      needsRevision.forEach(p => {
        const priority = p.revisionCount > 2 ? '🔴 CRÍTICO' :
                        p.revisionCount > 1 ? '🟠 ALTO' : '🟡 MÉDIO';
        nextSessionContent += `- [ ] **${p.name}** ${priority}
  - Revisões: ${p.revisionCount}
  - Feedback: ${p.feedback.substring(0, 200)}${p.feedback.length > 200 ? '...' : ''}

`;
      });
    }

    // Projetos aguardando aprovação
    if (awaitingApproval.length > 0) {
      nextSessionContent += `### ⏳ AWAITING APPROVAL (${awaitingApproval.length})

`;
      awaitingApproval.forEach(p => {
        nextSessionContent += `- [ ] **${p.name}** (${p.progress}%)
  - Aguardando seu teste e aprovação
  - Última atualização: ${p.feedback.substring(0, 150)}

`;
      });
    }

    // Projetos em progresso
    if (inProgress.length > 0) {
      nextSessionContent += `### 🔄 IN PROGRESS (${inProgress.length})

`;
      inProgress.forEach(p => {
        nextSessionContent += `- [ ] **${p.name}** (${p.progress}%)
  - Em desenvolvimento

`;
      });
    }

    // Prioridades
    nextSessionContent += `## 🔥 PRIORIDADES PARA PRÓXIMA SESSÃO

`;

    if (needsRevision.length > 0) {
      nextSessionContent += `### 1️⃣ CRÍTICA: Corrigir Revisões
`;
      needsRevision.slice(0, 3).forEach(p => {
        nextSessionContent += `   - ${p.name} (${p.revisionCount} revisões)
`;
      });
    }

    if (awaitingApproval.length > 0) {
      nextSessionContent += `
### 2️⃣ ALTA: Projetos Aguardando Teste
   - ${awaitingApproval.length} projeto(s) pronto(s) para validação
`;
    }

    if (inProgress.length > 0) {
      nextSessionContent += `
### 3️⃣ MÉDIA: Continuar Desenvolvimento
   - ${inProgress.length} projeto(s) em andamento
`;
    }

    // Contexto da sessão atual
    nextSessionContent += `
## 📝 RESUMO DA SESSÃO ATUAL

${sessionSummary}

## 🎯 OBJETIVOS SUGERIDOS PARA PRÓXIMA SESSÃO

`;

    if (needsRevision.length > 0) {
      nextSessionContent += `1. [ ] Corrigir ${needsRevision.length} projeto(s) em revisão
`;
    }

    if (awaitingApproval.length > 0) {
      nextSessionContent += `2. [ ] Aguardar feedback dos ${awaitingApproval.length} projeto(s) em teste
`;
    }

    if (inProgress.length > 0) {
      nextSessionContent += `3. [ ] Continuar ${inProgress.length} projeto(s) em desenvolvimento
`;
    }

    nextSessionContent += `
## 💡 NOTAS IMPORTANTES

- Lembre-se de verificar o Airtable antes de começar
- Priorize projetos com múltiplas revisões
- Mantenha comunicação clara nos commits

## 🔗 Links Úteis

- **Airtable Projects:** https://airtable.com/${BASE_ID}
- **Repositório:** [Ver git remote]
- **Documentação:** CONTINUIDADE_SESSOES.md

---

**Para começar a próxima sessão:**
\`\`\`bash
node start-session.js
\`\`\`

Ou diga ao Claude: **"Continue de onde paramos"**
`;

    // Salvar arquivo
    const rootDir = path.join(__dirname, '..');
    fs.writeFileSync(
      path.join(rootDir, 'PROXIMA_SESSAO.md'),
      nextSessionContent
    );

    console.log('✅ PROXIMA_SESSAO.md criado!');

    // 3. Criar resumo da sessão atual
    console.log('\n📄 Gerando SESSAO_[DATA].md...');

    const dateFileName = today.toISOString().split('T')[0].replace(/-/g, '');
    const sessionFileName = `SESSAO_${dateFileName}.md`;

    const sessionContent = `# 📊 Sessão ${dateStr}

**Horário:** ${timeStr}

## 📝 Resumo

${sessionSummary}

## 📊 Status Final

- **Awaiting Approval:** ${awaitingApproval.length} projetos
- **Needs Revision:** ${needsRevision.length} projetos
- **In Progress:** ${inProgress.length} projetos
- **Approved:** ${approved.length} projetos

## 🔄 Mudanças Realizadas

${sessionSummary.includes('git log') ? 'Ver commits no git' : 'Registradas no git'}

## 🎯 Próximos Passos

Ver arquivo: \`PROXIMA_SESSAO.md\`

---

**Sessão finalizada em:** ${dateStr} às ${timeStr}
`;

    fs.writeFileSync(
      path.join(rootDir, sessionFileName),
      sessionContent
    );

    console.log(`✅ ${sessionFileName} criado!`);

    // 4. Mostrar resumo
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Sessão Finalizada!\n');
    console.log('📋 Arquivos criados:');
    console.log('   - PROXIMA_SESSAO.md');
    console.log(`   - ${sessionFileName}`);
    console.log('\n🎯 Para próxima sessão:');
    console.log('   1. Execute: node start-session.js');
    console.log('   2. Ou diga ao Claude: "Continue de onde paramos"');

    if (needsRevision.length > 0) {
      console.log(`\n⚠️  ATENÇÃO: ${needsRevision.length} projeto(s) precisam de revisão!`);
    }

    if (awaitingApproval.length > 0) {
      console.log(`\n⏳ ${awaitingApproval.length} projeto(s) aguardando seu teste`);
    }

    console.log('\n🔗 Airtable: https://airtable.com/' + BASE_ID);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Erro ao finalizar sessão:', error.message);
    throw error;
  }
}

// Processar argumentos
const args = process.argv.slice(2);
const summary = args[0] || 'Sessão de desenvolvimento';

endSession(summary)
  .then(() => {
    console.log('✅ Processo concluído com sucesso!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
