# 📊 GUIA DO USUÁRIO - Módulo de Vendas e Comissões

**Sistema:** Nexus CRM
**Versão:** v101
**Última Atualização:** 21 de Outubro de 2025
**Público-Alvo:** Gestores, Vendedores e Administrativo

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Como Acessar](#como-acessar)
3. [Dashboard - Métricas e Rankings](#dashboard)
4. [Vendedores - Cadastro e Gestão](#vendedores)
5. [Vendas - Registro e Acompanhamento](#vendas)
6. [Comissões - Cálculo e Pagamento](#comissões)
7. [Fluxo Completo](#fluxo-completo)
8. [Perguntas Frequentes](#perguntas-frequentes)
9. [Problemas Comuns](#problemas-comuns)

---

## 🎯 VISÃO GERAL

O **Módulo de Vendas e Comissões** permite:

✅ **Gestão de Vendedores**
- Cadastrar vendedores vinculados a usuários do sistema
- Definir metas mensais individuais
- Configurar percentuais de comissão personalizados
- Ativar/desativar vendedores

✅ **Controle de Vendas**
- Registrar vendas realizadas
- Vincular vendas a leads e vendedores
- Acompanhar status (pendente, paga, cancelada)
- Relatórios de vendas por período

✅ **Sistema de Comissionamento**
- Cálculo automático de comissões
- Suporte a comissão **percentual**, **fixa** ou **mista**
- Controle de pagamento de comissões
- Relatórios de comissões a pagar/pagas

✅ **Dashboard Executivo**
- Métricas em tempo real
- Ranking de vendedores
- Gráficos de performance
- Indicadores de meta

---

## 🔐 COMO ACESSAR

### **1. Fazer Login no Sistema**

```
URL: https://one.nexusatemporal.com.br
```

**Credenciais de Teste:**
- Email: `administrativo@clinicaempireexcellence.com.br`
- Senha: (solicitar ao administrador)

### **2. Navegar até o Módulo de Vendas**

1. No menu lateral, clique em **"Vendas"**
2. Você verá 4 abas principais:
   - 📊 **Dashboard** - Visão geral e métricas
   - 👥 **Vendedores** - Cadastro e gestão
   - 🛒 **Vendas** - Registro de vendas
   - 💰 **Comissões** - Relatórios e pagamentos

---

## 📊 DASHBOARD

O Dashboard exibe métricas em tempo real do desempenho comercial.

### **Métricas Principais:**

#### **1. Total de Vendas**
- Valor total de vendas no período selecionado
- Comparação com período anterior
- Indicador de crescimento (↑ ou ↓)

#### **2. Vendas Realizadas**
- Quantidade de vendas no período
- Ticket médio (valor médio por venda)

#### **3. Comissões a Pagar**
- Valor total de comissões pendentes
- Comissões calculadas mas não pagas

#### **4. Vendedores Ativos**
- Quantidade de vendedores ativos no sistema

### **Ranking de Vendedores:**

Exibe os **Top 5** vendedores do período:
- Nome do vendedor
- Quantidade de vendas
- Valor total vendido
- Percentual da meta atingida
- Comissões geradas

### **Gráficos:**

#### **Vendas por Período**
- Gráfico de linhas com evolução diária/mensal
- Permite identificar tendências

#### **Distribuição de Vendas**
- Gráfico de barras por vendedor
- Comparação visual de performance

### **Filtros Disponíveis:**

- 📅 **Período:** Hoje | Esta Semana | Este Mês | Personalizado
- 👤 **Vendedor:** Todos | Individual
- 📊 **Status:** Todas | Pagas | Pendentes | Canceladas

---

## 👥 VENDEDORES

Gerenciamento completo do cadastro de vendedores.

### **Como Cadastrar um Vendedor:**

#### **Passo 1: Abrir Formulário**
1. Clique na aba **"Vendedores"**
2. Clique no botão **"+ Novo Vendedor"** (canto superior direito)

#### **Passo 2: Preencher Dados Obrigatórios**

**Informações Básicas:**
- **Código do Vendedor:** ID único (ex: `VEND001`)
- **Usuário:** Selecione um usuário existente do sistema
- **Data de Início:** Data de admissão do vendedor

**Configuração de Comissão:**
- **Tipo de Comissão:**
  - 📊 **Percentual:** Comissão baseada em % do valor da venda
  - 💵 **Fixo:** Valor fixo por venda realizada
  - 🔀 **Misto:** Combinação de percentual + fixo

- **Percentual de Comissão:** (se tipo = Percentual ou Misto)
  - Exemplo: `10.00` = 10%
  - Máximo: 99.99%

- **Valor Fixo:** (se tipo = Fixo ou Misto)
  - Exemplo: `R$ 50,00` por venda

**Metas:**
- **Meta Mensal:** Valor esperado de vendas no mês (opcional)
  - Exemplo: `R$ 50.000,00`
  - Usado para cálculo de atingimento de meta

**Observações:**
- Campo de texto livre para anotações
- Exemplo: "Comissão dobrada em dezembro"

#### **Passo 3: Salvar**
1. Clique em **"Salvar"**
2. O vendedor aparecerá na lista de vendedores

### **Como Editar um Vendedor:**

1. Na lista de vendedores, clique no ícone **✏️ (Editar)**
2. Modifique os campos desejados
3. Clique em **"Salvar"**

### **Como Desativar um Vendedor:**

**Opção 1: Edição Manual**
1. Edite o vendedor
2. Desmarque a opção **"Ativo"**
3. Salve

**Opção 2: Botão Rápido**
1. Clique no ícone **🔴 (Desativar)** na lista
2. Confirme a ação

**Importante:**
- Vendedores desativados **não aparecem** nos filtros
- Vendas antigas permanecem vinculadas ao vendedor
- Comissões já geradas **não são afetadas**

### **Lista de Vendedores:**

A tabela exibe:
- ✅ **Status:** Ativo (verde) | Inativo (cinza)
- **Código:** ID do vendedor
- **Nome:** Nome do usuário vinculado
- **Tipo de Comissão:** Percentual | Fixo | Misto
- **Comissão:** Percentual ou valor configurado
- **Meta Mensal:** Valor da meta (se definido)
- **Total Vendido:** Soma de todas as vendas
- **Ações:** Editar | Desativar | Ver Detalhes

### **Filtros e Busca:**

- 🔍 **Busca por Nome:** Digite o nome do vendedor
- 📊 **Filtro por Status:** Todos | Ativos | Inativos
- 📈 **Ordenação:** Por nome, total vendido, data

---

## 🛒 VENDAS

Registro e acompanhamento de vendas realizadas.

### **Como Registrar uma Venda:**

#### **Passo 1: Abrir Formulário**
1. Clique na aba **"Vendas"**
2. Clique no botão **"+ Nova Venda"**

#### **Passo 2: Preencher Dados da Venda**

**Informações Obrigatórias:**
- **Vendedor:** Selecione o vendedor responsável
- **Valor da Venda:** Digite o valor total (ex: `1500.00`)
- **Data da Venda:** Data em que a venda foi fechada

**Informações Opcionais:**
- **Lead Relacionado:** Vincule a um lead (se aplicável)
- **Descrição:** Detalhes da venda
  - Exemplo: "Pacote Premium - 10 sessões"
- **Observações:** Informações adicionais

**Status:**
- 🟡 **Pendente:** Venda registrada, aguardando pagamento
- 🟢 **Paga:** Pagamento confirmado
- 🔴 **Cancelada:** Venda cancelada

#### **Passo 3: Salvar**
1. Clique em **"Salvar"**
2. A comissão será **calculada automaticamente**

### **Como Editar uma Venda:**

1. Na lista de vendas, clique no ícone **✏️ (Editar)**
2. Modifique os campos (ex: status para "Paga")
3. Salve

**Importante:**
- Se alterar o **status para "Cancelada"**, a comissão é **recalculada**
- Se alterar o **valor**, a comissão é **recalculada**

### **Como Cancelar uma Venda:**

1. Edite a venda
2. Altere o status para **"Cancelada"**
3. Salve

**Efeitos:**
- Venda não contabiliza no total do vendedor
- Comissão relacionada é **removida** ou marcada como "Cancelada"
- Não afeta vendas anteriores

### **Lista de Vendas:**

A tabela exibe:
- 📅 **Data:** Data da venda
- 👤 **Vendedor:** Nome do vendedor
- 💰 **Valor:** Valor total da venda
- 📊 **Status:** Pendente | Paga | Cancelada
- 🏷️ **Descrição:** Detalhes da venda
- 🔗 **Lead:** Lead relacionado (se houver)
- **Ações:** Editar | Ver Detalhes | Cancelar

### **Filtros Disponíveis:**

- 📅 **Período:** Última semana | Último mês | Personalizado
- 👤 **Vendedor:** Todos | Individual
- 📊 **Status:** Todas | Pendentes | Pagas | Canceladas
- 🔍 **Busca:** Por descrição ou valor

### **Relatórios de Vendas:**

#### **Exportar Relatório:**
1. Configure os filtros desejados
2. Clique em **"Exportar"**
3. Escolha o formato:
   - 📄 **PDF:** Relatório formatado
   - 📊 **Excel:** Planilha editável
   - 📋 **CSV:** Dados brutos

#### **Conteúdo do Relatório:**
- Lista de vendas do período
- Totalizadores (valor total, quantidade)
- Comissões geradas
- Gráficos (no PDF)

---

## 💰 COMISSÕES

Cálculo e controle de pagamento de comissões.

### **Como as Comissões São Calculadas:**

#### **Tipo Percentual:**
```
Comissão = Valor da Venda × (Percentual ÷ 100)
Exemplo: R$ 1.000,00 × (10 ÷ 100) = R$ 100,00
```

#### **Tipo Fixo:**
```
Comissão = Valor Fixo Configurado
Exemplo: R$ 50,00 (independente do valor da venda)
```

#### **Tipo Misto:**
```
Comissão = (Valor da Venda × Percentual) + Valor Fixo
Exemplo: (R$ 1.000,00 × 10%) + R$ 50,00 = R$ 150,00
```

### **Lista de Comissões:**

A tabela exibe:
- 📅 **Data:** Data da venda que gerou a comissão
- 👤 **Vendedor:** Nome do vendedor
- 🛒 **Venda:** ID e valor da venda
- 💰 **Comissão:** Valor calculado
- 📊 **Status:** A Pagar | Paga | Cancelada
- 📅 **Data de Pagamento:** Quando foi paga (se aplicável)
- **Ações:** Marcar como Paga | Ver Detalhes

### **Como Marcar Comissão como Paga:**

1. Na lista de comissões, localize a comissão
2. Clique no botão **"💳 Pagar"**
3. Confirme o pagamento
4. O status muda para **"Paga"**
5. A data de pagamento é registrada automaticamente

### **Filtros Disponíveis:**

- 👤 **Vendedor:** Todos | Individual
- 📊 **Status:** Todas | A Pagar | Pagas | Canceladas
- 📅 **Período:** Mês atual | Personalizado

### **Relatório de Comissões:**

#### **Comissões a Pagar:**
- Lista todas as comissões com status **"A Pagar"**
- Total a pagar (soma de todas as comissões)
- Agrupamento por vendedor

#### **Comissões Pagas:**
- Histórico de pagamentos realizados
- Filtro por período
- Total pago no período

#### **Exportar:**
1. Configure os filtros
2. Clique em **"Exportar"**
3. Escolha PDF ou Excel
4. Use para prestação de contas

---

## 🔄 FLUXO COMPLETO

### **Cenário: Registrar uma Venda e Pagar Comissão**

#### **Etapa 1: Cadastrar Vendedor (se novo)**
1. Acesse **Vendedores** → **+ Novo Vendedor**
2. Preencha:
   - Código: `VEND001`
   - Usuário: Selecione usuário existente
   - Tipo Comissão: `Percentual`
   - Percentual: `10.00%`
   - Meta Mensal: `R$ 30.000,00`
3. Salve

#### **Etapa 2: Registrar Venda**
1. Acesse **Vendas** → **+ Nova Venda**
2. Preencha:
   - Vendedor: `VEND001 - João Silva`
   - Valor: `R$ 2.500,00`
   - Data: `21/10/2025`
   - Descrição: `Pacote Premium - 5 sessões`
   - Status: `Paga`
3. Salve

**Resultado:**
- Venda registrada ✅
- Comissão calculada: `R$ 250,00` (10% de R$ 2.500,00) ✅
- Status da comissão: **A Pagar**

#### **Etapa 3: Verificar Comissão**
1. Acesse **Comissões**
2. Veja a comissão de `R$ 250,00` com status **A Pagar**

#### **Etapa 4: Pagar Comissão (no fechamento mensal)**
1. No final do mês, acesse **Comissões**
2. Filtre por vendedor e período
3. Clique em **"💳 Pagar"** em cada comissão
4. Sistema registra data de pagamento automaticamente

#### **Etapa 5: Verificar Dashboard**
1. Acesse **Dashboard**
2. Veja métricas atualizadas:
   - Total de Vendas: `R$ 2.500,00`
   - Comissões Pagas: `R$ 250,00`
   - Performance do Vendedor: `8.3%` da meta

---

## ❓ PERGUNTAS FREQUENTES

### **1. Posso ter mais de um vendedor vinculado ao mesmo usuário?**

**Resposta:** Não. Cada vendedor deve ter um usuário único do sistema. Se precisar de múltiplos vendedores, crie múltiplos usuários.

---

### **2. O que acontece se eu alterar o percentual de comissão de um vendedor?**

**Resposta:** A alteração afeta **apenas vendas futuras**. Vendas e comissões anteriores **não são afetadas**.

---

### **3. Posso excluir uma venda?**

**Resposta:** Não é recomendado excluir vendas para manter histórico. Use o status **"Cancelada"** para vendas que não devem ser contabilizadas.

---

### **4. Como funcionam as metas mensais?**

**Resposta:** As metas são **opcionais** e usadas apenas para cálculo de percentual de atingimento no Dashboard. Não afetam comissões.

---

### **5. Posso registrar uma venda sem vincular a um lead?**

**Resposta:** Sim. O campo **Lead Relacionado** é opcional. Use quando a venda veio de um lead específico.

---

### **6. Como desfazer um pagamento de comissão?**

**Resposta:** Atualmente não é possível desfazer pelo sistema. Entre em contato com o administrador.

---

### **7. Posso ter comissões diferentes para produtos diferentes?**

**Resposta:** Na versão atual (v101), a comissão é configurada **por vendedor**, não por produto. Todos os produtos têm a mesma comissão.

**Solução temporária:** Use vendedores diferentes com comissões diferentes.

---

### **8. O Dashboard atualiza em tempo real?**

**Resposta:** O Dashboard atualiza automaticamente a cada **30 segundos**. Você também pode forçar atualização recarregando a página (F5).

---

## 🔧 PROBLEMAS COMUNS

### **Problema 1: "Tela em branco ao acessar módulo de Vendas"**

**Causa:** Bug já corrigido na v101 (error handling).

**Solução:**
1. Recarregue a página (Ctrl + F5)
2. Limpe o cache do navegador
3. Se persistir, faça logout e login novamente

---

### **Problema 2: "Comissão calculada está errada"**

**Verificações:**
1. Confira o **tipo de comissão** do vendedor
2. Verifique o **percentual** ou **valor fixo** configurado
3. Confira se a venda está com status **"Paga"** (vendas pendentes/canceladas não geram comissão)

**Exemplo de cálculo:**
```
Venda: R$ 1.000,00
Tipo: Percentual 15%
Comissão esperada: R$ 150,00

Se aparecer diferente:
- Verifique se o percentual está como 15.00 (não 0.15)
- Verifique se não há descontos aplicados
```

---

### **Problema 3: "Vendedor não aparece na lista"**

**Causa:** Vendedor pode estar **inativo**.

**Solução:**
1. No filtro de status, selecione **"Todos"** ou **"Inativos"**
2. Localize o vendedor
3. Edite e marque como **"Ativo"**

---

### **Problema 4: "Não consigo criar vendedor - erro de usuário duplicado"**

**Causa:** O código do vendedor já existe no sistema.

**Solução:**
1. Use um código único (ex: `VEND002`, `VEND003`)
2. Verifique se o usuário já não está vinculado a outro vendedor

---

### **Problema 5: "Dashboard mostra valores zerados"**

**Causa:** Nenhuma venda registrada ou filtros ativos.

**Solução:**
1. Verifique se há vendas cadastradas na aba **Vendas**
2. Ajuste o filtro de período (ex: "Este Mês" → "Últimos 3 Meses")
3. Remova filtros de vendedor/status

---

### **Problema 6: "Exportação de relatório não funciona"**

**Solução Temporária:**
1. Tire um print da tela (PrintScreen)
2. Ou copie os dados da tabela para Excel manualmente

**Solução Definitiva:** Feature de exportação será implementada em versão futura.

---

## 📞 SUPORTE

### **Problemas Técnicos:**
- Entre em contato com o administrador do sistema
- Email: suporte@nexusatemporal.com.br

### **Dúvidas de Uso:**
- Consulte este guia
- Acesse o FAQ do sistema: [FAQ_SISTEMA.md](./FAQ_SISTEMA.md)

---

## 📝 CHANGELOG

### **v101 - 21/10/2025**
- ✅ Correção de 7 bugs críticos (tela branca)
- ✅ Melhorias em error handling
- ✅ Optional chaining completo

### **v100 - 20/10/2025**
- ✅ Módulo de Vendas completamente funcional
- ✅ Sistema de comissionamento implementado

### **v92-98 - 19-20/10/2025**
- ✅ Criação inicial do módulo
- ✅ Tabelas de vendedores, vendas e comissões

---

**Documento criado por:** Claude Code - Sessão B
**Data:** 21 de Outubro de 2025
**Versão do Documento:** 1.0
**Sistema:** Nexus CRM v101
