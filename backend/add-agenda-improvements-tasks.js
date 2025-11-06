#!/usr/bin/env node

/**
 * Script para adicionar tarefas de melhorias no módulo de Agenda ao Airtable
 * Data: 04/11/2025
 */

const Airtable = require('airtable');

// Configurar Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tasksTable = base(process.env.AIRTABLE_TABLE_TASKS || 'Tasks');

const tasks = [
  {
    title: '[Agenda] Adicionar botão de confirmação pagamento/agendamento (apenas gestão)',
    description: `Implementar botão na visualização em lista que só aparece para usuários com role 'gestor' ou 'admin'. Quando o pagamento for confirmado, deve aparecer a opção de confirmar agendamento.`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Agenda',
    estimatedHours: 2,
    tags: ['frontend', 'permissões', 'agenda']
  },
  {
    title: '[Agenda] Implementar popup com informações do Lead ao clicar em agendamento',
    description: `No formato de visualização calendário, ao clicar em um agendamento deve abrir um popup mostrando:
- Nome do paciente
- Telefone/WhatsApp
- Email
- Procedimento agendado
- Status do agendamento
- Horário e local
- Observações
- Histórico de agendamentos
Estas informações devem vir do módulo Leads e Pacientes.`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Agenda',
    estimatedHours: 3,
    tags: ['frontend', 'agenda', 'leads', 'modal']
  },
  {
    title: '[Agenda] Adicionar busca de pacientes por nome, CPF, RG',
    description: `No card 'novo agendamento', substituir o select simples por um componente de busca que permita pesquisar pacientes por:
- Nome (busca parcial)
- CPF (busca exata)
- RG (busca exata)
A busca deve consultar tanto a tabela de Leads quanto a de Pacientes.`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Agenda',
    estimatedHours: 4,
    tags: ['frontend', 'backend', 'busca', 'agenda']
  },
  {
    title: '[Agenda] Permitir seleção de múltiplos procedimentos',
    description: `Modificar o formulário de agendamento para permitir selecionar mais de um procedimento por vez. A duração total deve ser calculada automaticamente somando a duração de todos os procedimentos selecionados.`,
    status: 'Backlog',
    priority: 'Média',
    module: 'Agenda',
    estimatedHours: 3,
    tags: ['frontend', 'backend', 'agenda']
  },
  {
    title: '[Agenda] Permitir seleção de múltiplos horários',
    description: `Adicionar funcionalidade para selecionar múltiplos horários de uma vez, criando múltiplos agendamentos simultaneamente. Útil para procedimentos que precisam de múltiplas sessões.`,
    status: 'Backlog',
    priority: 'Média',
    module: 'Agenda',
    estimatedHours: 4,
    tags: ['frontend', 'backend', 'agenda']
  },
  {
    title: '[Agenda] Corrigir bug de horários disponíveis no dia atual',
    description: `Existe um bug onde não é possível agendar horários para o dia atual, mesmo que existam horários livres. O sistema só permite agendar para o dia seguinte em diante. Corrigir a lógica de validação de datas para permitir agendamentos no dia atual.`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Agenda',
    estimatedHours: 2,
    tags: ['backend', 'bugfix', 'agenda']
  },
  {
    title: '[Agenda] Criar endpoint de busca de pacientes',
    description: `Criar novo endpoint no backend: GET /api/patients/search?q=termo&type=name|cpf|rg
Deve buscar em Leads e Pacientes e retornar resultados unificados.`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Agenda',
    estimatedHours: 2,
    tags: ['backend', 'api', 'agenda', 'busca']
  },
  {
    title: '[Agenda] Teste integrado das novas funcionalidades',
    description: `Testar todas as funcionalidades implementadas:
1. Botão de confirmação para gestão
2. Popup de detalhes no calendário
3. Busca de pacientes
4. Múltiplos procedimentos
5. Múltiplos horários
6. Agendamento no dia atual`,
    status: 'Backlog',
    priority: 'Alta',
    module: 'Agenda',
    estimatedHours: 3,
    tags: ['teste', 'qa', 'agenda']
  }
];

async function addTasks() {
  console.log('🚀 Adicionando tarefas de melhorias do módulo Agenda ao Airtable...\n');

  try {
    for (const task of tasks) {
      console.log(`📝 Criando: ${task.title}`);

      const record = await tasksTable.create({
        'Nome': task.title,
        'Descrição': task.description,
        'Status': task.status,
        'Prioridade': task.priority,
        'Módulo': task.module,
        'Horas Estimadas': task.estimatedHours,
        'Tags': task.tags.join(', '),
        'Data de Criação': new Date().toISOString(),
      });

      console.log(`✅ Criada: ${record.id}\n`);
    }

    console.log('✨ Todas as tarefas foram criadas com sucesso!');
    console.log(`\n📊 Total de tarefas criadas: ${tasks.length}`);
    console.log(`⏱️  Total de horas estimadas: ${tasks.reduce((sum, t) => sum + t.estimatedHours, 0)}h`);

  } catch (error) {
    console.error('❌ Erro ao criar tarefas:', error);
    process.exit(1);
  }
}

addTasks();
