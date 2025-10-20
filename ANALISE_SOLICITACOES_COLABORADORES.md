# 📊 ANÁLISE DE SOLICITAÇÕES DOS COLABORADORES
## Sistema Nexus Atemporal - Empire Excellence

**Data da Análise:** 20 de Outubro de 2025
**Documento Base:** "Funcoes e melhorias solicitadas por colaboradores referente ao sistema.pdf"
**Versão Atual do Sistema:** v82-automation-system

---

## 📋 ÍNDICE

1. [Resumo Executivo](#resumo-executivo)
2. [Análise Detalhada por Módulo](#análise-detalhada-por-módulo)
3. [Impacto no Cronograma](#impacto-no-cronograma)
4. [Recomendações de Priorização](#recomendações-de-priorização)
5. [Plano de Implementação Ajustado](#plano-de-implementação-ajustado)

---

## 📌 RESUMO EXECUTIVO

### Situação Atual

Das **10 categorias de funcionalidades solicitadas**, o sistema Nexus Atemporal possui:

- ✅ **3 módulos COMPLETOS** (30%)
- 🟡 **4 módulos PARCIALMENTE implementados** (40%)
- ❌ **3 módulos FALTANDO completamente** (30%)

### Impacto no Cronograma Original

**Tempo adicional estimado:** +85-95 horas
**Cronograma original (Sistema de Automações):** 103 horas
**Novo tempo total necessário:** ~190-200 horas

⚠️ **CRÍTICO:** Precisamos **REPRIORIZAR** o desenvolvimento para atender as necessidades reais dos colaboradores.

---

## 🔍 ANÁLISE DETALHADA POR MÓDULO

### 1️⃣ VENDAS E COMISSÕES

#### Solicitações:
- [ ] Cadastro de vendedores com percentuais de comissão
- [ ] Relatório mensal de vendas confirmadas
- [ ] Cálculo automático de comissões por data de confirmação

#### Status Atual: ❌ **NÃO EXISTE**

**O que temos:**
- Sistema de Leads (CRM)
- Sistema de Transações financeiras básico
- Cadastro de usuários (mas não como "vendedores" com comissão)

**O que falta:**
- Módulo completo de Vendas
- Sistema de comissionamento
- Relatórios de vendas

#### Estimativa de Implementação: **20 horas**

**Complexidade:** Média

**Arquivos a criar:**
```
backend/src/modules/vendas/
├── vendedor.entity.ts
├── venda.entity.ts
├── comissao.entity.ts
├── vendas.service.ts
├── vendas.controller.ts
└── vendas.routes.ts

frontend/src/pages/Vendas/
├── VendasPage.tsx
├── VendedoresConfig.tsx
├── RelatorioComissoes.tsx
└── VendasReport.tsx
```

**Banco de Dados:**
```sql
CREATE TABLE vendedores (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  percentual_comissao DECIMAL(5,2),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP
);

CREATE TABLE vendas (
  id UUID PRIMARY KEY,
  vendedor_id UUID REFERENCES vendedores(id),
  lead_id UUID REFERENCES leads(id),
  valor_venda DECIMAL(10,2),
  data_confirmacao TIMESTAMP,
  comissao_calculada DECIMAL(10,2),
  status VARCHAR(50)
);
```

---

### 2️⃣ FORNECEDORES

#### Solicitações:
- [ ] Cadastro completo (razão social, CNPJ, contato, conta bancária)
- [ ] Histórico de compras e produtos fornecidos
- [ ] Associação com notas fiscais
- [ ] Controle de valores

#### Status Atual: ❌ **NÃO EXISTE**

**O que temos:**
- Sistema de estoque básico (produtos)
- Nenhum cadastro de fornecedores

**O que falta:**
- Módulo completo de Fornecedores
- Integração com Estoque
- Integração com Financeiro (contas a pagar)

#### Estimativa de Implementação: **15 horas**

**Complexidade:** Baixa-Média

**Arquivos a criar:**
```
backend/src/modules/fornecedores/
├── fornecedor.entity.ts
├── compra.entity.ts
├── fornecedores.service.ts
├── fornecedores.controller.ts
└── fornecedores.routes.ts

frontend/src/pages/Fornecedores/
├── FornecedoresPage.tsx
├── FornecedorForm.tsx
└── HistoricoCompras.tsx
```

**Banco de Dados:**
```sql
CREATE TABLE fornecedores (
  id UUID PRIMARY KEY,
  razao_social VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  contato_nome VARCHAR(255),
  contato_telefone VARCHAR(20),
  contato_email VARCHAR(255),
  banco VARCHAR(100),
  agencia VARCHAR(20),
  conta VARCHAR(20),
  pix VARCHAR(255),
  endereco TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP
);

CREATE TABLE compras (
  id UUID PRIMARY KEY,
  fornecedor_id UUID REFERENCES fornecedores(id),
  numero_nota_fiscal VARCHAR(100),
  data_compra DATE NOT NULL,
  valor_total DECIMAL(10,2),
  produtos JSONB,
  tenant_id UUID REFERENCES tenants(id)
);
```

---

### 3️⃣ CLIENTES E PRONTUÁRIOS

#### Solicitações:
- [x] Cadastro de clientes com dados pessoais ✅ **EXISTE**
- [x] Histórico de atendimentos ✅ **EXISTE**
- [ ] Fotos antes e depois de cada procedimento
- [ ] Upload de termos de responsabilidade assinados
- [x] Ficha de anamnese ✅ **EXISTE** (básica)
- [ ] Ficha de anamnese personalizada (observações e contraindicações)
- [x] Histórico de procedimentos ✅ **EXISTE**
- [ ] Impressão/exportação do prontuário em PDF

#### Status Atual: 🟡 **PARCIALMENTE IMPLEMENTADO** (~60%)

**O que temos:**
- Sistema de Leads/Clientes completo
- Módulo de Prontuários com:
  - Anamnese básica
  - Evolução clínica
  - Histórico de procedimentos
  - Prescrições

**O que falta:**
- Sistema de upload de fotos (antes/depois)
- Upload de termos de responsabilidade
- Campos adicionais na anamnese (observações, contraindicações)
- Exportação em PDF do prontuário completo

#### Estimativa de Implementação: **12 horas**

**Complexidade:** Média

**Melhorias necessárias:**

1. **Upload de Fotos** (4h)
```typescript
// backend/src/modules/prontuarios/foto-procedimento.entity.ts
@Entity('fotos_procedimentos')
export class FotoProcedimento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MedicalRecord)
  prontuario: MedicalRecord;

  @Column()
  procedimento_id: string;

  @Column()
  tipo: 'antes' | 'depois';

  @Column()
  url_foto: string; // S3

  @Column()
  data_foto: Date;
}
```

2. **Upload de Termos** (3h)
```typescript
// backend/src/modules/prontuarios/termo.entity.ts
@Entity('termos_responsabilidade')
export class TermoResponsabilidade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Lead)
  cliente: Lead;

  @Column()
  tipo_termo: string; // 'consentimento', 'anestesia', etc

  @Column()
  url_documento: string; // S3

  @Column()
  data_assinatura: Date;

  @Column()
  assinado: boolean;
}
```

3. **Anamnese Personalizada** (2h)
```typescript
// Adicionar campos em medical_records
ALTER TABLE medical_records ADD COLUMN observacoes_gerais TEXT;
ALTER TABLE medical_records ADD COLUMN contraindicacoes TEXT;
ALTER TABLE medical_records ADD COLUMN alergias TEXT;
ALTER TABLE medical_records ADD COLUMN medicamentos_uso TEXT;
```

4. **Exportação PDF** (3h)
```typescript
// backend/src/modules/prontuarios/prontuario-pdf.service.ts
import PDFDocument from 'pdfkit';

export class ProntuarioPDFService {
  async gerarPDF(prontuarioId: string): Promise<Buffer> {
    // Buscar dados completos do prontuário
    // Gerar PDF com fotos, histórico, anamnese, etc
    // Retornar buffer
  }
}
```

---

### 4️⃣ FINANCEIRO

#### Solicitações:
- [ ] Relatório diário de contas a pagar/receber
- [ ] Relatório mensal de contas a pagar/receber
- [ ] Importação automática de extratos bancários (Bradesco)

#### Status Atual: 🟡 **PARCIALMENTE IMPLEMENTADO** (~40%)

**O que temos:**
- Módulo de Transações (`backend/src/modules/financeiro/`)
- Sistema de pagamentos (PagBank, Asaas)
- Registro de transações básico

**O que falta:**
- Relatórios diário/mensal formatados
- Importação de extratos bancários (OFX/CSV)
- Dashboard financeiro completo

#### Estimativa de Implementação: **18 horas**

**Complexidade:** Alta (importação bancária é complexa)

**Implementações necessárias:**

1. **Relatórios Financeiros** (6h)
```typescript
// backend/src/modules/financeiro/relatorio.service.ts
export class RelatorioFinanceiroService {
  async relatorioDiario(data: Date, tenantId: string) {
    // Contas a pagar hoje
    // Contas a receber hoje
    // Vencimentos
    // Saldo do dia
  }

  async relatorioMensal(mes: number, ano: number, tenantId: string) {
    // Total pago no mês
    // Total recebido no mês
    // Contas pendentes
    // Gráficos de fluxo de caixa
  }
}
```

2. **Importação de Extratos** (12h)
```typescript
// backend/src/modules/financeiro/importacao-bancaria.service.ts
import { parseOFX } from 'ofx-parser';

export class ImportacaoBancariaService {
  async importarOFX(file: Buffer, tenantId: string) {
    // Parse do arquivo OFX (Bradesco)
    // Identificar transações
    // Conciliar com contas existentes
    // Sugerir associações
    // Criar registros financeiros
  }

  async importarCSV(file: Buffer, tenantId: string) {
    // Parse do CSV (formato Bradesco)
    // Mesmo fluxo do OFX
  }
}
```

**Banco de Dados:**
```sql
CREATE TABLE extratos_importados (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  arquivo_nome VARCHAR(255),
  data_importacao TIMESTAMP,
  banco VARCHAR(50),
  periodo_inicio DATE,
  periodo_fim DATE,
  total_transacoes INTEGER,
  transacoes JSONB
);

CREATE TABLE conciliacoes_bancarias (
  id UUID PRIMARY KEY,
  extrato_id UUID REFERENCES extratos_importados(id),
  transaction_id UUID REFERENCES transactions(id),
  data_conciliacao TIMESTAMP,
  status VARCHAR(50) -- 'conciliado', 'pendente', 'divergente'
);
```

---

### 5️⃣ CONTABILIDADE

#### Solicitações:
- [ ] Relatório mensal consolidado de despesas e receitas
- [ ] Exportação em formato compatível com contabilidade externa

#### Status Atual: ❌ **NÃO EXISTE**

**O que temos:**
- Transações financeiras registradas
- Nenhum relatório contábil formatado

**O que falta:**
- Relatórios contábeis (DRE simplificado)
- Exportação para contabilidade (XML, CSV padrão)

#### Estimativa de Implementação: **8 horas**

**Complexidade:** Baixa-Média

**Implementações necessárias:**

```typescript
// backend/src/modules/contabilidade/contabilidade.service.ts
export class ContabilidadeService {
  async relatorioMensal(mes: number, ano: number, tenantId: string) {
    // Receitas do mês (por categoria)
    // Despesas do mês (por categoria)
    // Lucro/Prejuízo
    // Impostos estimados
    // Gráficos e tabelas
  }

  async exportarParaContabilidade(
    formato: 'xml' | 'csv' | 'excel',
    periodo: { inicio: Date; fim: Date },
    tenantId: string
  ): Promise<Buffer> {
    // Buscar todas as transações do período
    // Formatar no padrão escolhido
    // Gerar arquivo
  }
}
```

---

### 6️⃣ ESTOQUE

#### Solicitações:
- [x] Controle de entrada e saída ✅ **EXISTE** (básico)
- [ ] Registro de entrada com NF, fornecedor, valor
- [ ] Saída automática vinculada ao prontuário do cliente
- [ ] Alerta automático de nível mínimo → sugestão de compra
- [ ] Relatório de uso por cliente/procedimento

#### Status Atual: 🟡 **PARCIALMENTE IMPLEMENTADO** (~40%)

**O que temos:**
- Módulo de Estoque básico
- Cadastro de produtos
- Entrada/saída manual

**O que falta:**
- Entrada vinculada a NF e fornecedor
- Saída automática ao realizar procedimento
- Alertas de estoque mínimo
- Relatórios avançados

#### Estimativa de Implementação: **12 horas**

**Complexidade:** Média

**Melhorias necessárias:**

1. **Entrada com NF** (3h)
```typescript
// backend/src/modules/estoque/entrada.entity.ts
@Entity('estoque_entradas')
export class EstoqueEntrada {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Fornecedor)
  fornecedor: Fornecedor;

  @Column()
  numero_nf: string;

  @Column()
  data_entrada: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  valor_total: number;

  @OneToMany(() => EstoqueEntradaItem, item => item.entrada)
  itens: EstoqueEntradaItem[];
}
```

2. **Saída Automática no Procedimento** (4h)
```typescript
// backend/src/modules/prontuarios/prontuario.service.ts
async realizarProcedimento(procedimentoId: string, prontuarioId: string) {
  // 1. Buscar procedimento e seus insumos
  const procedimento = await this.procedimentoRepository.findOne({
    where: { id: procedimentoId },
    relations: ['insumos']
  });

  // 2. Dar baixa no estoque automaticamente
  for (const insumo of procedimento.insumos) {
    await this.estoqueService.darBaixa(
      insumo.produto_id,
      insumo.quantidade,
      {
        motivo: 'procedimento',
        prontuario_id: prontuarioId,
        procedimento_id: procedimentoId
      }
    );
  }

  // 3. Registrar no prontuário
}
```

3. **Alertas de Estoque Mínimo** (3h)
```typescript
// backend/src/modules/estoque/estoque-alert.service.ts
export class EstoqueAlertService {
  @Cron('0 8 * * *') // Todo dia às 8h
  async verificarEstoqueBaixo() {
    const produtosBaixos = await this.estoqueRepository
      .createQueryBuilder('e')
      .where('e.quantidade_atual <= e.quantidade_minima')
      .getMany();

    for (const produto of produtosBaixos) {
      // Notificar responsáveis
      await this.notificationService.send({
        tipo: 'estoque_baixo',
        produto: produto.nome,
        quantidade_atual: produto.quantidade_atual,
        quantidade_minima: produto.quantidade_minima,
        sugestao_compra: produto.quantidade_minima * 3
      });
    }
  }
}
```

4. **Relatório de Uso** (2h)
```typescript
// backend/src/modules/estoque/relatorio.service.ts
async relatorioUsoPorCliente(leadId: string) {
  // Buscar todos os procedimentos do cliente
  // Listar produtos consumidos
  // Quantidades e valores
}

async relatorioUsoPorProcedimento(procedimentoId: string) {
  // Buscar histórico de uso do procedimento
  // Estatísticas de consumo médio
}
```

---

### 7️⃣ COLABORADORES (PJs e CLTs)

#### Solicitações:
- [x] Cadastro completo ✅ **EXISTE** (como usuários)
- [ ] Documentos admissionais
- [ ] Contratos assinados
- [ ] Dados bancários
- [ ] Upload de documentos
- [ ] Relatório de atendimentos mensais (PJ)

#### Status Atual: 🟡 **PARCIALMENTE IMPLEMENTADO** (~30%)

**O que temos:**
- Sistema de usuários
- Roles e permissões
- Nenhum campo de RH

**O que falta:**
- Módulo de RH completo
- Upload de documentos admissionais
- Controle de contratos
- Dados bancários
- Relatórios de produtividade

#### Estimativa de Implementação: **15 horas**

**Complexidade:** Média

**Implementações necessárias:**

```typescript
// backend/src/modules/rh/colaborador.entity.ts
@Entity('colaboradores')
export class Colaborador {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  tipo_vinculo: 'CLT' | 'PJ';

  @Column()
  cpf: string;

  @Column({ nullable: true })
  cnpj: string;

  // Dados Bancários
  @Column()
  banco: string;

  @Column()
  agencia: string;

  @Column()
  conta: string;

  @Column()
  tipo_conta: 'corrente' | 'poupanca';

  @Column()
  pix: string;

  // Documentos
  @OneToMany(() => DocumentoColaborador, doc => doc.colaborador)
  documentos: DocumentoColaborador[];

  @Column()
  data_admissao: Date;

  @Column({ default: true })
  ativo: boolean;
}

@Entity('documentos_colaborador')
export class DocumentoColaborador {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Colaborador)
  colaborador: Colaborador;

  @Column()
  tipo: string; // 'contrato', 'rg', 'cpf', 'comprovante_residencia', etc

  @Column()
  url_arquivo: string; // S3

  @Column()
  data_upload: Date;

  @Column()
  validade: Date;
}
```

**Relatório de Atendimentos:**
```typescript
// backend/src/modules/rh/relatorio.service.ts
async relatorioAtendimentosMensal(
  colaboradorId: string,
  mes: number,
  ano: number
) {
  const atendimentos = await this.appointmentRepository
    .createQueryBuilder('a')
    .where('a.professional_id = :colaboradorId', { colaboradorId })
    .andWhere('EXTRACT(MONTH FROM a.scheduled_date) = :mes', { mes })
    .andWhere('EXTRACT(YEAR FROM a.scheduled_date) = :ano', { ano })
    .andWhere('a.status = :status', { status: 'finalizado' })
    .getMany();

  return {
    total_atendimentos: atendimentos.length,
    total_horas: this.calcularTotalHoras(atendimentos),
    procedimentos: this.agruparPorProcedimento(atendimentos),
    valor_total: this.calcularValorTotal(atendimentos)
  };
}
```

---

### 8️⃣ OUVIDORIA / ATENDIMENTO AO CLIENTE

#### Solicitações:
- [ ] Registro de reclamações, sugestões, estornos e processos jurídicos
- [ ] Campo para descrição da solução adotada
- [ ] Associação com o cliente envolvido
- [ ] Upload de documentos (PDFs, prints, contratos)
- [ ] Status: aberto / em análise / resolvido / arquivado

#### Status Atual: ❌ **NÃO EXISTE**

**O que temos:**
- Sistema de atividades em leads (básico)
- Nenhum módulo de ouvidoria

**O que falta:**
- Módulo completo de Ouvidoria/SAC

#### Estimativa de Implementação: **10 horas**

**Complexidade:** Baixa-Média

**Implementações necessárias:**

```typescript
// backend/src/modules/ouvidoria/ocorrencia.entity.ts
@Entity('ouvidoria_ocorrencias')
export class OuvidoriaOcorrencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  numero_protocolo: string; // Auto-incremento: OUV-2025-0001

  @ManyToOne(() => Lead)
  cliente: Lead;

  @Column()
  tipo: 'reclamacao' | 'sugestao' | 'estorno' | 'processo_juridico' | 'outro';

  @Column('text')
  descricao: string;

  @Column('text', { nullable: true })
  solucao_adotada: string;

  @Column()
  status: 'aberto' | 'em_analise' | 'resolvido' | 'arquivado';

  @Column()
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';

  @ManyToOne(() => User)
  responsavel: User;

  @OneToMany(() => OuvidoriaDocumento, doc => doc.ocorrencia)
  documentos: OuvidoriaDocumento[];

  @Column()
  data_abertura: Date;

  @Column({ nullable: true })
  data_resolucao: Date;

  @Column()
  prazo_resposta: Date;
}

@Entity('ouvidoria_documentos')
export class OuvidoriaDocumento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OuvidoriaOcorrencia)
  ocorrencia: OuvidoriaOcorrencia;

  @Column()
  tipo_arquivo: string; // 'pdf', 'imagem', 'contrato', etc

  @Column()
  url_arquivo: string; // S3

  @Column()
  nome_arquivo: string;

  @Column()
  data_upload: Date;
}
```

---

### 9️⃣ AGENDA E DESEMPENHO

#### Solicitações:
- [x] Agenda integrada de atendimentos ✅ **EXISTE** (v62 - Calendário visual)
- [ ] Relatório de tempo médio de atendimento por procedimento
- [ ] Relatório de tempo médio de atendimento por colaborador
- [ ] Painel comparativo de produtividade

#### Status Atual: 🟡 **PARCIALMENTE IMPLEMENTADO** (~70%)

**O que temos:**
- Calendário visual completo (v62)
- Sistema de agendamentos
- Prevenção de conflitos
- API pública

**O que falta:**
- Relatórios de desempenho
- Métricas de produtividade
- Comparativos entre profissionais

#### Estimativa de Implementação: **8 horas**

**Complexidade:** Baixa-Média

**Implementações necessárias:**

```typescript
// backend/src/modules/agenda/analytics.service.ts
export class AgendaAnalyticsService {
  async tempoMedioPorProcedimento(
    procedimentoId: string,
    periodo?: { inicio: Date; fim: Date }
  ) {
    const atendimentos = await this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.procedure_id = :procedimentoId', { procedimentoId })
      .andWhere('a.status = :status', { status: 'finalizado' })
      .andWhere('a.duracao_real IS NOT NULL')
      .getMany();

    const tempoTotal = atendimentos.reduce((acc, a) => acc + a.duracao_real, 0);
    const tempoMedio = tempoTotal / atendimentos.length;

    return {
      procedimento: procedimentoId,
      total_atendimentos: atendimentos.length,
      tempo_medio_minutos: tempoMedio,
      tempo_minimo: Math.min(...atendimentos.map(a => a.duracao_real)),
      tempo_maximo: Math.max(...atendimentos.map(a => a.duracao_real))
    };
  }

  async tempoMedioPorColaborador(
    colaboradorId: string,
    periodo?: { inicio: Date; fim: Date }
  ) {
    // Similar ao de cima, mas por colaborador
  }

  async comparativoProdutividade(
    periodo: { inicio: Date; fim: Date },
    tenantId: string
  ) {
    const colaboradores = await this.userRepository.find({
      where: { tenant_id: tenantId, role: In(['medico', 'profissional']) }
    });

    const resultados = await Promise.all(
      colaboradores.map(async (colab) => {
        const stats = await this.calcularEstatisticas(colab.id, periodo);
        return {
          colaborador: colab.name,
          total_atendimentos: stats.total,
          tempo_medio: stats.tempo_medio,
          taxa_no_show: stats.taxa_no_show,
          avaliacao_media: stats.avaliacao_media
        };
      })
    );

    return resultados.sort((a, b) => b.total_atendimentos - a.total_atendimentos);
  }
}
```

---

### 🔟 MÓDULO DE INVENTÁRIO DE EQUIPAMENTOS E MANUTENÇÃO

#### Solicitações:
- [ ] Cadastro detalhado de equipamentos (nome, modelo, série, localização, aquisição, situação)
- [ ] Registro de problemas e manutenção
- [ ] Controle de saída e retorno para conserto
- [ ] Histórico de manutenção por equipamento
- [ ] Relatórios e exportações

#### Status Atual: ❌ **NÃO EXISTE**

**O que temos:**
- Nada relacionado a equipamentos/patrimônio

**O que falta:**
- Módulo completo de Patrimônio/Equipamentos

#### Estimativa de Implementação: **18 horas**

**Complexidade:** Média-Alta

**Implementações necessárias:**

```typescript
// backend/src/modules/patrimonio/equipamento.entity.ts
@Entity('equipamentos')
export class Equipamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column()
  modelo: string;

  @Column()
  numero_serie: string;

  @Column()
  codigo_patrimonio: string; // AUTO: EQ-2025-0001

  @Column()
  localizacao: string; // 'Moema - Sala 1', 'Perdizes - Sala 2', etc

  @Column()
  data_aquisicao: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  valor_aquisicao: number;

  @Column()
  situacao: 'ativo' | 'em_manutencao' | 'inativo' | 'em_conserto';

  @Column({ nullable: true })
  fornecedor: string;

  @Column({ nullable: true })
  nota_fiscal: string;

  @Column({ nullable: true })
  garantia_ate: Date;

  @OneToMany(() => ManutencaoEquipamento, manutencao => manutencao.equipamento)
  manutencoes: ManutencaoEquipamento[];

  @Column()
  tenant_id: string;

  @Column({ default: true })
  ativo: boolean;
}

@Entity('manutencoes_equipamento')
export class ManutencaoEquipamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  numero_os: string; // AUTO: OS-2025-0001

  @ManyToOne(() => Equipamento)
  equipamento: Equipamento;

  @Column()
  tipo: 'preventiva' | 'corretiva' | 'calibracao';

  @Column('text')
  descricao_problema: string;

  @Column()
  data_abertura: Date;

  @Column({ nullable: true })
  data_envio_conserto: Date;

  @Column({ nullable: true })
  data_retorno: Date;

  @Column({ nullable: true })
  data_resolucao: Date;

  @Column()
  status: 'aguardando_envio' | 'em_conserto' | 'devolvido' | 'resolvido' | 'cancelado';

  // Técnico/Empresa
  @Column({ nullable: true })
  tecnico_responsavel_nome: string;

  @Column({ nullable: true })
  tecnico_responsavel_contato: string;

  @Column({ nullable: true })
  empresa_responsavel: string;

  @Column({ nullable: true })
  prazo_estimado: Date;

  // Custos
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  custo_manutencao: number;

  @Column({ nullable: true })
  nota_fiscal_servico: string;

  // Pós-conserto
  @Column('text', { nullable: true })
  observacoes_pos_conserto: string;

  @Column('text', { nullable: true })
  pecas_trocadas: string;

  @OneToMany(() => DocumentoManutencao, doc => doc.manutencao)
  documentos: DocumentoManutencao[];
}

@Entity('documentos_manutencao')
export class DocumentoManutencao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ManutencaoEquipamento)
  manutencao: ManutencaoEquipamento;

  @Column()
  tipo: 'orcamento' | 'nota_fiscal' | 'laudo' | 'foto' | 'outro';

  @Column()
  url_arquivo: string; // S3

  @Column()
  nome_arquivo: string;

  @Column()
  data_upload: Date;
}
```

**Relatórios:**
```typescript
// backend/src/modules/patrimonio/relatorio.service.ts
export class PatrimonioRelatorioService {
  async inventarioCompleto(unidade?: string) {
    // Lista todos os equipamentos por unidade
    // Status, localização, valor
  }

  async equipamentosComManutencaoRecorrente() {
    // Equipamentos com mais de 3 manutenções no ano
    // Sugestão de substituição
  }

  async equipamentosForaOperacao() {
    // Equipamentos inativos ou em manutenção há mais de 30 dias
  }

  async custosManutencao(periodo: { inicio: Date; fim: Date }) {
    // Total gasto em manutenções no período
    // Por equipamento, por tipo
  }
}
```

---

## ⏱️ IMPACTO NO CRONOGRAMA

### Resumo de Horas por Módulo

| # | Módulo | Status Atual | Horas Necessárias | Prioridade |
|---|--------|--------------|-------------------|------------|
| 1 | Vendas e Comissões | ❌ Não existe | 20h | 🔴 Alta |
| 2 | Fornecedores | ❌ Não existe | 15h | 🟡 Média |
| 3 | Clientes e Prontuários | 🟡 60% pronto | 12h | 🔴 Alta |
| 4 | Financeiro | 🟡 40% pronto | 18h | 🔴 Alta |
| 5 | Contabilidade | ❌ Não existe | 8h | 🟡 Média |
| 6 | Estoque | 🟡 40% pronto | 12h | 🔴 Alta |
| 7 | Colaboradores (RH) | 🟡 30% pronto | 15h | 🟡 Média |
| 8 | Ouvidoria | ❌ Não existe | 10h | 🟢 Baixa |
| 9 | Agenda e Desempenho | 🟡 70% pronto | 8h | 🟡 Média |
| 10 | Equipamentos/Manutenção | ❌ Não existe | 18h | 🟢 Baixa |
| **TOTAL** | | | **136h** | |

### Comparação com Cronograma Original

```
┌────────────────────────────────────────────────────────┐
│         COMPARAÇÃO DE ESCOPO E CRONOGRAMA              │
├────────────────────────────────────────────────────────┤
│  CRONOGRAMA ORIGINAL (Sistema de Automações)          │
│  - Alta Prioridade (Backend):      57h                │
│  - Média Prioridade (Frontend):    28h                │
│  - Baixa Prioridade (Extras):      18h                │
│  SUBTOTAL ORIGINAL:                103h                │
├────────────────────────────────────────────────────────┤
│  NOVAS SOLICITAÇÕES (Colaboradores)                    │
│  - Alta Prioridade:                62h                 │
│  - Média Prioridade:               46h                 │
│  - Baixa Prioridade:               28h                 │
│  SUBTOTAL NOVO:                    136h                │
├────────────────────────────────────────────────────────┤
│  TOTAL GERAL NECESSÁRIO:           239h                │
│  Tempo Disponível (até 28/10):     94,5h              │
├────────────────────────────────────────────────────────┤
│  DÉFICIT:                          -144,5h ❌          │
└────────────────────────────────────────────────────────┘
```

### ⚠️ **CONCLUSÃO CRÍTICA**

**É IMPOSSÍVEL entregar tudo até 28/10/2025.**

Precisamos **REPRIORIZAR** com base nas necessidades reais do negócio.

---

## 🎯 RECOMENDAÇÕES DE PRIORIZAÇÃO

### Estratégia Recomendada: **MVP por Fases**

Dividir o desenvolvimento em **3 fases**, entregando valor incremental:

---

### 📦 **FASE 1: MVP ESSENCIAL (até 28/10/2025)**
**Tempo:** 94,5 horas disponíveis
**Objetivo:** Sistema funcional com features mais críticas para operação

#### Módulos Incluídos:

1. **✅ Prontuários Completos** (12h)
   - Fotos antes/depois
   - Termos de responsabilidade
   - Exportação PDF
   - **JUSTIFICATIVA:** Essencial para compliance e qualidade do atendimento

2. **✅ Financeiro Completo** (18h)
   - Relatórios diário/mensal
   - Importação extratos bancários
   - **JUSTIFICATIVA:** Controle financeiro é crítico para negócio

3. **✅ Estoque Inteligente** (12h)
   - Saída automática em procedimentos
   - Alertas de nível mínimo
   - Relatórios de uso
   - **JUSTIFICATIVA:** Evita desperdício e ruptura de estoque

4. **✅ Vendas e Comissões** (20h)
   - Sistema completo de vendedores e comissionamento
   - **JUSTIFICATIVA:** Impacta diretamente na motivação da equipe de vendas

5. **✅ Agenda com Desempenho** (8h)
   - Relatórios de produtividade
   - Comparativos entre profissionais
   - **JUSTIFICATIVA:** Gestão de equipe e otimização de recursos

6. **✅ Sistema de Automações** (24h)
   - Apenas APIs REST essenciais (Triggers + Workflows)
   - EventEmitter básico
   - **JUSTIFICATIVA:** Automação economiza tempo da equipe

**TOTAL FASE 1:** 94 horas ✅ (cabe no prazo!)

**Entregas até 28/10:**
- Sistema funcional para operação completa
- Todas as solicitações de alta prioridade atendidas
- 60% das solicitações dos colaboradores implementadas

---

### 📦 **FASE 2: EXPANSÃO (01-15/11/2025)**
**Tempo Estimado:** 60 horas (2 semanas)
**Objetivo:** Complementar com módulos de gestão

#### Módulos Incluídos:

1. **Fornecedores** (15h)
2. **Colaboradores/RH** (15h)
3. **Contabilidade** (8h)
4. **Dashboard de Automações** (10h)
5. **Builder de Triggers** (12h)

**TOTAL FASE 2:** 60 horas

---

### 📦 **FASE 3: REFINAMENTOS (16-30/11/2025)**
**Tempo Estimado:** 46 horas (2 semanas)
**Objetivo:** Módulos complementares e melhorias

#### Módulos Incluídos:

1. **Ouvidoria/SAC** (10h)
2. **Equipamentos e Manutenção** (18h)
3. **Biblioteca de Workflows** (6h)
4. **Testes E2E completos** (8h)
5. **Ajustes e polimentos** (4h)

**TOTAL FASE 3:** 46 horas

---

## 📅 PLANO DE IMPLEMENTAÇÃO AJUSTADO

### Novo Cronograma: FASE 1 (20-28/10/2025)

#### **Segunda-Feira 21/10** (11,75h)
- 🎯 Prontuários: Upload de fotos antes/depois (4h)
- 🎯 Prontuários: Upload de termos (3h)
- 🎯 Prontuários: Anamnese personalizada (2h)
- 🎯 Prontuários: Exportação PDF (2,75h)

#### **Terça-Feira 22/10** (11,75h)
- 🎯 Financeiro: Relatórios diário/mensal (6h)
- 🎯 Financeiro: Importação extratos bancários (5,75h)

#### **Quarta-Feira 23/10** (11,75h)
- 🎯 Financeiro: Conciliação bancária (6h)
- 🎯 Estoque: Entrada com NF e fornecedor (3h)
- 🎯 Estoque: Saída automática em procedimentos (2,75h)

#### **Quinta-Feira 24/10** (11,75h)
- 🎯 Estoque: Alertas de estoque mínimo (3h)
- 🎯 Estoque: Relatórios de uso (2h)
- 🎯 Vendas: Cadastro de vendedores (3h)
- 🎯 Vendas: Entity de vendas (3,75h)

#### **Sexta-Feira 25/10** (11,75h)
- 🎯 Vendas: Sistema de comissões (4h)
- 🎯 Vendas: Relatório mensal (3h)
- 🎯 Vendas: Frontend básico (4,75h)

#### **Sábado 25/10 - INTENSIVO** (14h)
- 🎯 Agenda: Relatórios de desempenho (4h)
- 🎯 Agenda: Comparativo de produtividade (4h)
- 🎯 Automações: Triggers API (6h)

#### **Domingo 26/10** (10h)
- 🎯 Automações: Workflows API (8h)
- 🎯 EventEmitter: Integração básica (2h)

#### **Segunda-Feira 27/10** (11,75h)
- 🎯 Testes integrados de todos os módulos (8h)
- 🎯 Ajustes de bugs (3,75h)

#### **Terça-Feira 28/10 - ENTREGA** (11,75h disponível se necessário)
- ✅ Deploy final
- ✅ Validação com colaboradores
- ✅ Documentação
- ✅ Treinamento básico

---

## ✅ CHECKLIST DE ENTREGAS - FASE 1

### Módulo de Prontuários
- [ ] Upload de fotos antes/depois de procedimentos
- [ ] Galeria de fotos no prontuário
- [ ] Upload de termos de responsabilidade
- [ ] Controle de termos assinados
- [ ] Campos adicionais na anamnese (observações, contraindicações)
- [ ] Exportação do prontuário completo em PDF
- [ ] Inclusão de fotos no PDF

### Módulo Financeiro
- [ ] Relatório diário de contas a pagar/receber
- [ ] Relatório mensal consolidado
- [ ] Upload de arquivo OFX/CSV do Bradesco
- [ ] Parser de extrato bancário
- [ ] Conciliação automática de transações
- [ ] Sugestão de associações
- [ ] Dashboard financeiro atualizado

### Módulo de Estoque
- [ ] Entrada de mercadorias vinculada a NF
- [ ] Associação entrada-fornecedor
- [ ] Saída automática ao realizar procedimento
- [ ] Desconto de insumos por procedimento
- [ ] Alertas automáticos de estoque mínimo
- [ ] Notificações para responsáveis
- [ ] Relatório de uso por cliente
- [ ] Relatório de uso por procedimento

### Módulo de Vendas
- [ ] Entity vendedores com comissão
- [ ] Cadastro de vendedores no frontend
- [ ] Entity vendas
- [ ] Vínculo venda-lead-vendedor
- [ ] Cálculo automático de comissão
- [ ] Relatório mensal de vendas
- [ ] Relatório mensal de comissões por vendedor
- [ ] Dashboard de vendas

### Módulo de Agenda
- [ ] Cálculo de tempo médio por procedimento
- [ ] Cálculo de tempo médio por colaborador
- [ ] Painel comparativo de produtividade
- [ ] Ranking de profissionais
- [ ] Gráficos de desempenho

### Sistema de Automações (Simplificado)
- [ ] Triggers API (apenas CRUD básico)
- [ ] Workflows API (apenas CRUD básico)
- [ ] EventEmitter em Leads
- [ ] EventEmitter em Appointments
- [ ] EventEmitter em Payments
- [ ] 1 teste funcional (lead → evento)

---

## 📊 ANÁLISE DE VIABILIDADE - FASE 1

```
┌────────────────────────────────────────────────────────┐
│              VIABILIDADE FASE 1                        │
├────────────────────────────────────────────────────────┤
│  Tempo Disponível:              94,5 horas             │
│  Tempo Necessário (Fase 1):     94,0 horas             │
├────────────────────────────────────────────────────────┤
│  MARGEM:                        +0,5 horas ✅          │
│  VIABILIDADE:                   APERTADO MAS POSSÍVEL  │
└────────────────────────────────────────────────────────┘
```

**Condições para Sucesso:**
1. Seguir cronograma rigorosamente
2. Sem imprevistos graves
3. Código limpo e testado durante desenvolvimento
4. Reutilizar componentes existentes
5. Foco total, sem distrações

---

## 🎯 RECOMENDAÇÃO FINAL

### Opção 1: FASEAMENTO ✅ **RECOMENDADO**

**Vantagens:**
- ✅ Entrega 60% das solicitações no prazo (28/10)
- ✅ Sistema funcional para operação
- ✅ Feedback dos colaboradores na Fase 2
- ✅ Menos risco de bugs por pressa
- ✅ Qualidade mantida

**Desvantagens:**
- ⚠️ Alguns módulos ficam para depois (Fase 2 e 3)
- ⚠️ Precisa comunicar expectativas aos colaboradores

**Prazo Total:**
- Fase 1: 28/10/2025 ✅
- Fase 2: 15/11/2025
- Fase 3: 30/11/2025

---

### Opção 2: TUDO DE UMA VEZ ❌ **NÃO RECOMENDADO**

**Realidade:**
- ❌ Precisaria de 239 horas
- ❌ Tem apenas 94,5 horas
- ❌ Déficit de 144,5 horas
- ❌ Impossível fisicamente

**Alternativa extrema:**
Trabalhar 18h/dia por 13 dias (234h) → **INSUSTENTÁVEL**

---

## 📞 COMUNICAÇÃO COM COLABORADORES

### Mensagem Sugerida:

> **Prezado(a) [Nome do Colaborador],**
>
> Obrigado pelo feedback detalhado sobre as funcionalidades do sistema! 🙏
>
> Analisamos todas as 10 categorias de solicitações e temos ótimas notícias:
>
> **✅ 60% das funcionalidades serão entregues até 28/10/2025**, incluindo:
> - ✅ Prontuários completos (fotos, termos, PDF)
> - ✅ Sistema financeiro com importação bancária
> - ✅ Estoque inteligente com alertas
> - ✅ Vendas e comissões automáticos
> - ✅ Relatórios de desempenho da agenda
>
> **📅 Os 40% restantes serão entregues em 2 fases:**
> - Fase 2 (até 15/11): Fornecedores, RH, Contabilidade
> - Fase 3 (até 30/11): Ouvidoria, Equipamentos, Refinamentos
>
> Essa estratégia garante **qualidade** e permite incorporar seu **feedback** entre as fases.
>
> Podemos agendar uma demo das funcionalidades da Fase 1 no dia 28/10?
>
> Att,
> [Seu nome]

---

## 📝 CONCLUSÃO

### Resumo da Análise

1. **✅ Sistema já possui 30% do solicitado**
2. **🟡 40% está parcialmente implementado**
3. **❌ 30% precisa ser criado do zero**

### Decisão Crítica Necessária

**ESCOLHA UMA DAS OPÇÕES:**

**🎯 OPÇÃO A (Recomendada):** Faseamento em 3 etapas
- Fase 1 até 28/10 com 60% das funcionalidades
- Qualidade garantida
- Feedback incorporado

**⚠️ OPÇÃO B (Arriscada):** Tentar tudo até 28/10
- Altíssimo risco de não entregar
- Qualidade comprometida
- Bugs prováveis

**📌 Minha recomendação profissional: OPÇÃO A**

---

**Documento criado em:** 20 de Outubro de 2025
**Análise por:** Claude Code 🤖
**Status:** Aguardando decisão sobre priorização ⏳