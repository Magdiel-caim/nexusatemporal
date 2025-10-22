# 📦 GUIA DO USUÁRIO - Módulo de Estoque

**Sistema:** Nexus CRM
**Versão:** v101 (v98 - Stock Integrations Complete)
**Última Atualização:** 21 de Outubro de 2025
**Público-Alvo:** Gestores, Operacional e Administrativo

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Como Acessar](#como-acessar)
3. [Dashboard - Métricas de Estoque](#dashboard)
4. [Produtos - Cadastro e Gestão](#produtos)
5. [Movimentações - Entrada e Saída](#movimentações)
6. [Alertas - Estoque Baixo e Vencimentos](#alertas)
7. [Relatórios - Análises Avançadas](#relatórios)
8. [Estoque de Procedimentos](#procedimentos)
9. [Contagem de Inventário](#inventário)
10. [Fluxo Completo](#fluxo-completo)
11. [Perguntas Frequentes](#perguntas-frequentes)
12. [Problemas Comuns](#problemas-comuns)

---

## 🎯 VISÃO GERAL

O **Módulo de Estoque** permite o controle completo de produtos, movimentações e inventário.

✅ **Gestão de Produtos**
- Cadastrar produtos com código, nome, categoria
- Definir estoque mínimo e unidade de medida
- Controlar validade de produtos
- Ativar/desativar produtos

✅ **Controle de Movimentações**
- Registrar entradas (compra, devolução, ajuste)
- Registrar saídas (venda, uso em procedimento, perda)
- Histórico completo de movimentações
- Rastreabilidade por usuário e data

✅ **Sistema de Alertas**
- Alertas de estoque baixo (< estoque mínimo)
- Alertas de produto zerado (estoque = 0)
- Alertas de produtos próximos ao vencimento
- Alertas de produtos vencidos

✅ **Relatórios Avançados**
- Valor total do estoque
- Produtos mais utilizados
- Movimentações por período
- Relatório de inventário

✅ **Estoque de Procedimentos**
- Vincular produtos a procedimentos
- Consumo automático de estoque ao realizar procedimento
- Quantidade padrão por procedimento

✅ **Contagem de Inventário**
- Criar contagens físicas periódicas
- Comparar estoque físico vs. sistema
- Ajustar divergências automaticamente
- Enviar relatórios por email

---

## 🔐 COMO ACESSAR

### **1. Fazer Login no Sistema**

```
URL: https://one.nexusatemporal.com.br
```

### **2. Navegar até o Módulo de Estoque**

1. No menu lateral, clique em **"Estoque"**
2. Você verá 7 abas principais:
   - 📊 **Dashboard** - Visão geral e métricas
   - 📦 **Produtos** - Cadastro de produtos
   - 📤📥 **Movimentações** - Entradas e saídas
   - ⚠️ **Alertas** - Notificações de estoque
   - 📈 **Relatórios** - Análises detalhadas
   - 💉 **Procedimentos** - Produtos por procedimento
   - 📋 **Inventário** - Contagem física

---

## 📊 DASHBOARD

Visão geral em tempo real do estoque.

### **Cards de Métricas:**

#### **1. Valor Total do Estoque**
- 💰 Valor total de todos os produtos (custo × quantidade)
- Exemplo: `R$ 45.320,00`
- Atualizado automaticamente

#### **2. Total de Produtos**
- 📦 Quantidade de produtos diferentes cadastrados
- Exemplo: `127 produtos`

#### **3. Total de Itens**
- 📊 Soma de todas as quantidades em estoque
- Exemplo: `2.543 unidades`

#### **4. Alertas Ativos**
- ⚠️ Total de alertas críticos
- **Tipos:**
  - 🔴 **OUT_OF_STOCK:** Produto zerado
  - 🟡 **LOW_STOCK:** Estoque baixo (< mínimo)
  - 🟠 **EXPIRING_SOON:** Vencimento próximo (< 30 dias)
  - 🔴 **EXPIRED:** Produto vencido

### **Listas Rápidas:**

#### **Produtos com Estoque Baixo**
- Lista dos produtos abaixo do estoque mínimo
- Mostra: Nome, Estoque atual, Estoque mínimo
- Ação rápida: **"+ Entrada"** (registrar compra)

#### **Produtos Próximos ao Vencimento**
- Produtos que vencem nos próximos 30 dias
- Mostra: Nome, Data de vencimento, Dias restantes
- Classificação por urgência

---

## 📦 PRODUTOS

Cadastro e gestão de produtos do estoque.

### **Como Cadastrar um Produto:**

#### **Passo 1: Abrir Formulário**
1. Clique na aba **"Produtos"**
2. Clique no botão **"+ Novo Produto"**

#### **Passo 2: Preencher Dados Obrigatórios**

**Informações Básicas:**
- **Código:** Código único do produto (ex: `PROD001`, `SER-123`)
  - Não pode ser duplicado
  - Usado para busca rápida
- **Nome:** Nome descritivo do produto
  - Exemplo: `Ácido Hialurônico 2ml`
- **Categoria:** Tipo do produto
  - Exemplo: `Injetável`, `Cosmético`, `Descartável`
- **Unidade:** Unidade de medida
  - Exemplo: `Unidade`, `Frasco`, `Caixa`, `ml`, `g`

**Controle de Estoque:**
- **Quantidade Inicial:** Estoque no momento do cadastro
  - Exemplo: `10`
- **Estoque Mínimo:** Quando alertar de estoque baixo
  - Exemplo: `5` (alerta quando estoque < 5)
- **Custo Unitário:** Preço de custo do produto
  - Exemplo: `R$ 150,00`

**Informações Opcionais:**
- **Data de Validade:** Data de vencimento do lote
  - Sistema alerta 30 dias antes
- **Descrição:** Informações adicionais
  - Exemplo: `Lote #AB123 - Validade 12/2026`

**Status:**
- ✅ **Ativo:** Produto disponível para uso
- ❌ **Inativo:** Produto descontinuado (não aparece em filtros)

#### **Passo 3: Salvar**
1. Clique em **"Salvar"**
2. Produto aparecerá na lista
3. Movimentação de entrada é criada automaticamente (quantidade inicial)

### **Como Editar um Produto:**

1. Na lista de produtos, clique no ícone **✏️ (Editar)**
2. Modifique os campos desejados
3. **Atenção:** Alterar quantidade aqui **não cria movimentação**
   - Use a aba **Movimentações** para entradas/saídas

### **Como Desativar um Produto:**

1. Edite o produto
2. Desmarque **"Ativo"**
3. Salve

**Efeitos:**
- Produto não aparece em buscas e filtros
- Movimentações antigas permanecem
- Pode ser reativado a qualquer momento

### **Lista de Produtos:**

A tabela exibe:
- ✅ **Status:** Badge verde (Ativo) ou cinza (Inativo)
- **Código:** Código único
- **Nome:** Nome do produto
- **Categoria:** Tipo do produto
- **Estoque Atual:** Quantidade disponível
- **Estoque Mínimo:** Limite de alerta
- **Unidade:** Unidade de medida
- **Custo Unitário:** Preço de custo
- **Valor Total:** Custo × Quantidade
- **Validade:** Data de vencimento (se aplicável)
- **Ações:** Editar | Movimentar | Ver Histórico

### **Filtros e Busca:**

- 🔍 **Busca:** Por código ou nome
- 📂 **Categoria:** Filtrar por tipo
- ⚠️ **Status:** Todos | Ativos | Inativos | Estoque Baixo | Vencidos
- 📊 **Ordenação:** Por nome, estoque, valor, validade

---

## 📤📥 MOVIMENTAÇÕES

Registro de entradas e saídas de estoque.

### **Tipos de Movimentação:**

#### **ENTRADAS (aumentam estoque):**
- 🛒 **ENTRADA_COMPRA:** Compra de fornecedor
- 🔄 **ENTRADA_DEVOLUCAO:** Devolução de cliente
- ⚙️ **ENTRADA_AJUSTE:** Ajuste manual (correção)
- 🏭 **ENTRADA_PRODUCAO:** Produção interna (se aplicável)

#### **SAÍDAS (diminuem estoque):**
- 🛍️ **SAIDA_VENDA:** Venda ao cliente
- 💉 **SAIDA_USO:** Uso em procedimento
- 🗑️ **SAIDA_PERDA:** Perda/extravio/vencimento
- ⚙️ **SAIDA_AJUSTE:** Ajuste manual (correção)

### **Como Registrar uma Entrada:**

#### **Exemplo: Compra de Produtos**

1. Clique na aba **"Movimentações"**
2. Clique em **"+ Nova Movimentação"**
3. Preencha:
   - **Tipo:** `ENTRADA_COMPRA`
   - **Produto:** Selecione o produto
   - **Quantidade:** `20` (unidades)
   - **Motivo:** `Compra do fornecedor XYZ - NF 12345`
4. Salve

**Resultado:**
- Estoque do produto aumenta em 20 unidades ✅
- Movimentação registrada no histórico ✅
- Timestamp e usuário salvos automaticamente ✅

### **Como Registrar uma Saída:**

#### **Exemplo: Uso em Procedimento**

1. Clique em **"+ Nova Movimentação"**
2. Preencha:
   - **Tipo:** `SAIDA_USO`
   - **Produto:** Selecione o produto usado
   - **Quantidade:** `2` (unidades)
   - **Motivo:** `Procedimento #123 - Cliente Maria Silva`
3. Salve

**Resultado:**
- Estoque diminui em 2 unidades ✅
- Se estoque ficar < mínimo, **alerta é criado** automaticamente ⚠️

### **Como Registrar uma Perda:**

#### **Exemplo: Produto Vencido**

1. Clique em **"+ Nova Movimentação"**
2. Preencha:
   - **Tipo:** `SAIDA_PERDA`
   - **Produto:** Produto vencido
   - **Quantidade:** `5`
   - **Motivo:** `Produto vencido - Lote #AB123`
3. Salve

**Dica:** Use o motivo para documentar razão da perda (auditoria).

### **Lista de Movimentações:**

A tabela exibe:
- 📅 **Data:** Data e hora da movimentação
- **Tipo:** Badge colorido (verde = entrada, vermelho = saída)
- **Produto:** Nome do produto
- **Quantidade:** Quantidade movimentada (+ ou -)
- **Saldo Anterior:** Estoque antes da movimentação
- **Saldo Atual:** Estoque após movimentação
- **Usuário:** Quem registrou
- **Motivo:** Descrição da movimentação

### **Filtros Disponíveis:**

- 📅 **Período:** Últimos 7 dias | Último mês | Personalizado
- 📦 **Produto:** Todos | Individual
- 🔀 **Tipo:** Todos | Entradas | Saídas | Tipo específico
- 👤 **Usuário:** Todos | Individual

### **Exportar Movimentações:**

1. Configure filtros desejados
2. Clique em **"Exportar"**
3. Escolha formato: **PDF** | **Excel** | **CSV**

**Conteúdo:**
- Lista completa de movimentações
- Totalizadores (entradas, saídas, saldo)
- Análise por produto

---

## ⚠️ ALERTAS

Sistema automático de notificações de estoque.

### **Tipos de Alertas:**

#### **1. Estoque Zerado (OUT_OF_STOCK)** 🔴
- **Quando:** Estoque = 0
- **Ação:** Comprar produto urgentemente
- **Prioridade:** CRÍTICA

#### **2. Estoque Baixo (LOW_STOCK)** 🟡
- **Quando:** Estoque < Estoque Mínimo
- **Ação:** Planejar compra
- **Prioridade:** ALTA

#### **3. Produto Vencendo (EXPIRING_SOON)** 🟠
- **Quando:** Vencimento em 30 dias ou menos
- **Ação:** Usar produto prioritariamente
- **Prioridade:** MÉDIA

#### **4. Produto Vencido (EXPIRED)** 🔴
- **Quando:** Produto passou da validade
- **Ação:** Descartar produto (registrar SAIDA_PERDA)
- **Prioridade:** CRÍTICA

### **Lista de Alertas:**

A tabela exibe:
- ⚠️ **Tipo:** Badge colorido
- **Produto:** Nome do produto
- **Estoque Atual:** Quantidade disponível
- **Estoque Mínimo:** Limite configurado
- **Validade:** Data de vencimento (se aplicável)
- **Status:** Ativo | Resolvido
- **Ações:** Movimentar | Editar Produto | Marcar como Resolvido

### **Como Resolver um Alerta:**

#### **Estoque Baixo/Zerado:**
1. Clique no botão **"+ Entrada"** direto no alerta
2. Registre a compra
3. Alerta é **resolvido automaticamente** quando estoque > mínimo

#### **Produto Vencendo:**
1. Use o produto em procedimentos (prioridade)
2. Ou registre descarte se vencido

#### **Produto Vencido:**
1. Registre **SAIDA_PERDA** com motivo "Vencido"
2. Alerta é **resolvido automaticamente**

### **Notificações (Futuro):**

**Em desenvolvimento (v102+):**
- 📧 Email automático para responsável
- 📱 Notificações push no sistema
- ⏰ Lembretes programados

---

## 📈 RELATÓRIOS

Análises avançadas do estoque.

### **Relatórios Disponíveis:**

#### **1. Relatório de Valor de Estoque**
- Valor total por categoria
- Produtos mais valiosos
- Gráfico de distribuição

#### **2. Relatório de Movimentações**
- Movimentações por período
- Gráfico de entradas vs. saídas
- Produtos mais movimentados

#### **3. Relatório de Produtos Críticos**
- Produtos com estoque baixo
- Produtos vencidos/vencendo
- Produtos inativos com estoque

#### **4. Relatório de Inventário**
- Resumo completo do estoque
- Listagem de todos os produtos
- Totalizadores por categoria

### **Como Gerar um Relatório:**

1. Clique na aba **"Relatórios"**
2. Selecione o tipo de relatório
3. Configure filtros:
   - 📅 Período
   - 📂 Categoria
   - 👤 Usuário (para movimentações)
4. Clique em **"Gerar Relatório"**
5. Visualize na tela
6. Exporte para **PDF** ou **Excel**

### **Análises Disponíveis:**

- 📊 **Giro de Estoque:** Produtos mais/menos utilizados
- 💰 **Curva ABC:** Produtos por valor
- 📈 **Tendências:** Projeção de consumo
- ⏱️ **Tempo de Reposição:** Análise de compras

---

## 💉 PROCEDIMENTOS

Vinculação de produtos a procedimentos para consumo automático.

### **Como Funciona:**

1. Cada procedimento pode ter produtos vinculados
2. Ao realizar o procedimento, o estoque é **debitado automaticamente**
3. Quantidade padrão é configurada (pode ser ajustada na hora)

### **Como Vincular Produto a Procedimento:**

1. Clique na aba **"Procedimentos"**
2. Selecione um procedimento
3. Clique em **"+ Adicionar Produto"**
4. Preencha:
   - **Produto:** Selecione da lista
   - **Quantidade Padrão:** Exemplo: `2` (unidades)
   - **Obrigatório:** Se é item essencial do procedimento
5. Salve

### **Exemplo Prático:**

**Procedimento:** Aplicação de Botox
**Produtos Vinculados:**
- Toxina Botulínica: 1 frasco
- Seringa 1ml: 2 unidades
- Algodão: 3 unidades
- Luva descartável: 2 unidades

**Ao realizar o procedimento:**
- Sistema **debita automaticamente** todos os produtos
- Movimentação tipo **SAIDA_USO** é criada
- Motivo: `Procedimento #123 - Cliente João Silva`

### **Como Editar Produtos do Procedimento:**

1. Na lista, clique em **✏️ Editar**
2. Altere a quantidade padrão
3. Marque/desmarque "Obrigatório"
4. Salve

### **Como Remover Produto do Procedimento:**

1. Clique no ícone **🗑️ Remover**
2. Confirme
3. Produto é desvinculado (não afeta estoque)

---

## 📋 INVENTÁRIO

Contagem física periódica do estoque.

### **O que é Inventário:**

**Inventário** é a contagem física dos produtos para comparar com o sistema e corrigir divergências.

**Quando fazer:**
- 📅 Mensalmente (recomendado)
- 🔍 Quando suspeitar de divergências
- 📊 Antes de relatórios fiscais

### **Como Criar uma Contagem de Inventário:**

#### **Passo 1: Iniciar Contagem**
1. Clique na aba **"Inventário"**
2. Clique em **"+ Nova Contagem"**
3. Preencha:
   - **Título:** Exemplo: `Inventário Mensal - Outubro 2025`
   - **Descrição:** Motivo da contagem
   - **Data de Início:** Data atual (automático)
4. Salve

**Status:** `EM_ANDAMENTO`

#### **Passo 2: Contar Produtos Fisicamente**
1. Vá ao estoque físico com tablet/celular
2. Para cada produto:
   - Clique em **"+ Adicionar Item"**
   - Selecione o produto
   - Digite a **quantidade física** contada
   - Clique em **"Adicionar"**

**Sistema mostra:**
- ✅ **Quantidade no Sistema:** Estoque atual
- 🔢 **Quantidade Física:** Quantidade contada
- ⚖️ **Diferença:** Sistema - Físico
  - Verde: Sem divergência
  - Amarelo: Pequena divergência
  - Vermelho: Grande divergência

#### **Passo 3: Revisar Divergências**
1. Revise todos os produtos com diferença
2. Se houver erro na contagem, corrija
3. Se a diferença estiver correta, prossiga

#### **Passo 4: Finalizar Inventário**
1. Após contar todos os produtos, clique em **"Finalizar Inventário"**
2. Sistema mostra resumo:
   - Total de produtos contados
   - Total de divergências
   - Ajustes a serem feitos
3. Confirme

**Resultado:**
- ✅ Status muda para `CONCLUIDO`
- ✅ Movimentações de ajuste são criadas automaticamente
- ✅ Estoque é corrigido
- ✅ Relatório é gerado
- ✅ Email é enviado (se configurado)

### **Como Visualizar Histórico de Inventários:**

1. Na aba **"Inventário"**, veja a lista de contagens
2. Clique em um inventário para ver detalhes:
   - Produtos contados
   - Divergências encontradas
   - Ajustes realizados
   - Usuário responsável

### **Relatório de Inventário:**

Após finalizar, você pode:
- 📄 **Exportar PDF:** Relatório completo
- 📊 **Exportar Excel:** Dados para análise
- 📧 **Enviar por Email:** Para gestor/contador

**Conteúdo do Relatório:**
- Data e responsável
- Lista de produtos contados
- Divergências (sistema vs. físico)
- Ajustes realizados
- Totalizadores

---

## 🔄 FLUXO COMPLETO

### **Cenário: Compra, Uso e Inventário**

#### **Etapa 1: Cadastrar Produto**
1. **Produtos** → **+ Novo Produto**
2. Preencha:
   - Código: `BOTO-001`
   - Nome: `Toxina Botulínica 100U`
   - Categoria: `Injetável`
   - Unidade: `Frasco`
   - Quantidade: `0` (ainda não comprou)
   - Estoque Mínimo: `5`
   - Custo: `R$ 800,00`
3. Salve

**Resultado:** Produto cadastrado. Alerta de **OUT_OF_STOCK** ativo ⚠️

#### **Etapa 2: Registrar Compra**
1. **Movimentações** → **+ Nova Movimentação**
2. Preencha:
   - Tipo: `ENTRADA_COMPRA`
   - Produto: `BOTO-001 - Toxina Botulínica`
   - Quantidade: `10`
   - Motivo: `Compra Fornecedor ABC - NF 98765`
3. Salve

**Resultado:**
- Estoque: 0 → 10 ✅
- Alerta resolvido ✅
- Valor em estoque: R$ 8.000,00 ✅

#### **Etapa 3: Vincular a Procedimento**
1. **Procedimentos** → Selecione `Aplicação de Botox`
2. **+ Adicionar Produto**
3. Preencha:
   - Produto: `BOTO-001`
   - Quantidade: `1` (frasco por procedimento)
   - Obrigatório: ✅
4. Salve

#### **Etapa 4: Realizar Procedimento (automático)**
- Ao realizar procedimento `Aplicação de Botox`
- Sistema **debita automaticamente** 1 frasco
- Estoque: 10 → 9 ✅

#### **Etapa 5: Inventário Mensal**
1. **Inventário** → **+ Nova Contagem**
2. Título: `Inventário Out/2025`
3. Contar fisicamente: `BOTO-001` = 8 frascos
4. Sistema mostra:
   - Sistema: 9
   - Físico: 8
   - Diferença: -1 (perda de 1 frasco)
5. Finalizar Inventário

**Resultado:**
- Estoque ajustado: 9 → 8 ✅
- Movimentação `SAIDA_AJUSTE` criada ✅
- Relatório enviado por email ✅

---

## ❓ PERGUNTAS FREQUENTES

### **1. Posso ter produtos com o mesmo nome?**

**Resposta:** Sim, desde que tenham **códigos diferentes**. O código é único.

---

### **2. O que acontece se eu registrar uma saída maior que o estoque?**

**Resposta:** O sistema **permite** registrar saída negativa, mas exibe **alerta** e recomenda revisão.

---

### **3. Como desfazer uma movimentação errada?**

**Resposta:** Não é possível excluir movimentações (auditoria). Faça uma **movimentação de ajuste** inversa:
- Se registrou entrada errada: Faça SAIDA_AJUSTE
- Se registrou saída errada: Faça ENTRADA_AJUSTE

---

### **4. Posso importar produtos de uma planilha?**

**Resposta:** Não na versão atual (v101). Cadastro é manual. Feature de importação prevista para v103+.

---

### **5. Como funciona o email de inventário?**

**Resposta:** Após finalizar inventário, um email é enviado automaticamente para o email configurado nas variáveis de ambiente (SMTP_USER). Se não estiver configurado, o relatório fica disponível apenas para download.

---

### **6. Posso ter múltiplos inventários em andamento?**

**Resposta:** Sim, mas é recomendado finalizar um antes de iniciar outro para evitar confusão.

---

### **7. Os alertas somem automaticamente?**

**Resposta:** Sim. Alertas são recalculados automaticamente:
- **Estoque baixo:** Resolvido quando estoque > mínimo
- **Vencido:** Resolvido quando produto é descartado (saída)
- **Vencendo:** Resolvido quando produto é usado ou passa dos 30 dias

---

### **8. Como altero o estoque mínimo de um produto?**

**Resposta:**
1. **Produtos** → Editar produto
2. Altere o campo **"Estoque Mínimo"**
3. Salve

Alertas são recalculados automaticamente.

---

## 🔧 PROBLEMAS COMUNS

### **Problema 1: "Alerta de estoque baixo não desaparece"**

**Causa:** Estoque ainda está abaixo do mínimo.

**Solução:**
1. Verifique o **estoque mínimo** do produto
2. Verifique o **estoque atual**
3. Registre entrada para que estoque atual > mínimo

---

### **Problema 2: "Não consigo finalizar inventário"**

**Causa:** Produtos obrigatórios não foram contados.

**Solução:**
1. Revise a lista de produtos
2. Garanta que todos os produtos ativos foram contados
3. Ou remova produtos não contados da lista

---

### **Problema 3: "Movimentação não aparece no histórico"**

**Causa:** Filtro de período ou produto pode estar ativo.

**Solução:**
1. Limpe todos os filtros
2. Selecione período **"Todos"**
3. Recarregue a página (F5)

---

### **Problema 4: "Email de inventário não foi enviado"**

**Causa:** Variáveis SMTP não configuradas no servidor.

**Solução Temporária:**
1. Exporte relatório em PDF
2. Envie manualmente por email

**Solução Definitiva:** Solicitar ao administrador configurar SMTP (ver `ORIENTACAO_SESSAO_B_v102.md`).

---

### **Problema 5: "Valor do estoque está errado"**

**Causa:** Custo unitário pode estar desatualizado.

**Verificação:**
1. Acesse **Produtos**
2. Verifique o **custo unitário** de cada produto
3. Atualize se necessário

**Cálculo:**
```
Valor Total = Soma(Custo Unitário × Quantidade)
```

---

## 📞 SUPORTE

### **Problemas Técnicos:**
- Email: suporte@nexusatemporal.com.br

### **Dúvidas de Uso:**
- Consulte: [FAQ_SISTEMA.md](./FAQ_SISTEMA.md)

---

## 📝 CHANGELOG

### **v98 - 20/10/2025**
- ✅ Integrações completas (12 novos métodos de API)
- ✅ Sistema de email profissional com Nodemailer
- ✅ Relatórios avançados de inventário
- ✅ Sistema completo de auditoria (Audit Logs)
- ✅ 6 novos arquivos backend (email.service, audit-log.entity, audit-log.service)

### **v97 - 19/10/2025**
- ✅ Módulo de estoque básico implementado
- ✅ Produtos, movimentações e alertas

---

**Documento criado por:** Claude Code - Sessão B
**Data:** 21 de Outubro de 2025
**Versão do Documento:** 1.0
**Sistema:** Nexus CRM v101 (Backend v98 - Stock Integrations Complete)
