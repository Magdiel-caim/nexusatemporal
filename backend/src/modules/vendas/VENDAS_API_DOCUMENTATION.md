# 📚 API de Vendas e Comissões

Documentação completa dos endpoints da API de Vendas e Comissões do Sistema Nexus Atemporal.

**Base URL:** `https://api.nexusatemporal.com.br/api/vendas`
**Autenticação:** Bearer Token (obrigatório em todas as rotas)

---

## 📋 Índice

1. [Vendedores](#vendedores)
2. [Vendas](#vendas)
3. [Comissões](#comissões)
4. [Estatísticas e Rankings](#estatísticas-e-rankings)

---

## 👤 VENDEDORES

### 1. Criar Vendedor

Cadastra um novo vendedor no sistema.

```http
POST /api/vendas/vendedores
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "uuid-do-usuario",
  "percentualComissaoPadrao": 10.00,
  "tipoComissao": "percentual",
  "valorFixoComissao": null,
  "metaMensal": 50000.00,
  "dataInicio": "2025-10-20",
  "observacoes": "Vendedor senior com meta alta"
}
```

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "codigoVendedor": "VND-2025-0001",
  "userId": "uuid-do-usuario",
  "percentualComissaoPadrao": 10.00,
  "tipoComissao": "percentual",
  "metaMensal": 50000.00,
  "ativo": true,
  "dataInicio": "2025-10-20T00:00:00.000Z",
  "createdAt": "2025-10-20T10:30:00.000Z"
}
```

---

### 2. Listar Vendedores

Lista todos os vendedores do tenant.

```http
GET /api/vendas/vendedores
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "codigoVendedor": "VND-2025-0001",
    "user": {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@example.com"
    },
    "percentualComissaoPadrao": 10.00,
    "tipoComissao": "percentual",
    "metaMensal": 50000.00,
    "ativo": true
  }
]
```

---

### 3. Buscar Vendedor

Busca um vendedor específico por ID.

```http
GET /api/vendas/vendedores/:id
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "codigoVendedor": "VND-2025-0001",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "percentualComissaoPadrao": 10.00,
  "tipoComissao": "percentual",
  "metaMensal": 50000.00,
  "ativo": true,
  "dataInicio": "2025-10-20"
}
```

---

### 4. Atualizar Vendedor

Atualiza dados de um vendedor.

```http
PUT /api/vendas/vendedores/:id
```

**Body:**
```json
{
  "percentualComissaoPadrao": 12.00,
  "metaMensal": 60000.00
}
```

**Response:** `200 OK`

---

### 5. Desativar Vendedor

Desativa um vendedor (soft delete).

```http
DELETE /api/vendas/vendedores/:id
```

**Response:** `204 No Content`

---

### 6. Listar Vendas de um Vendedor

Lista todas as vendas de um vendedor específico.

```http
GET /api/vendas/vendedores/:id/vendas?status=confirmada&dataInicio=2025-10-01&dataFim=2025-10-31
```

**Query Params:**
- `status` (optional): `pendente`, `confirmada`, `cancelada`
- `dataInicio` (optional): Data início (ISO 8601)
- `dataFim` (optional): Data fim (ISO 8601)

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "numeroVenda": "VND-2025-0001",
    "valorBruto": 5000.00,
    "desconto": 500.00,
    "valorLiquido": 4500.00,
    "status": "confirmada",
    "dataVenda": "2025-10-20T10:00:00Z",
    "dataConfirmacao": "2025-10-20T14:30:00Z"
  }
]
```

---

## 💰 VENDAS

### 1. Criar Venda

Cria uma nova venda.

```http
POST /api/vendas
```

**Body:**
```json
{
  "vendedorId": "uuid-vendedor",
  "leadId": "uuid-lead",
  "appointmentId": "uuid-agendamento",
  "procedureId": "uuid-procedimento",
  "valorBruto": 5000.00,
  "desconto": 500.00,
  "percentualComissao": 10.00,
  "formaPagamento": "pix",
  "observacoes": "Cliente pagou à vista"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "numeroVenda": "VND-2025-0001",
  "vendedorId": "uuid",
  "leadId": "uuid",
  "valorBruto": 5000.00,
  "desconto": 500.00,
  "valorLiquido": 4500.00,
  "percentualComissao": 10.00,
  "valorComissao": 450.00,
  "status": "pendente",
  "dataVenda": "2025-10-20T10:00:00Z"
}
```

---

### 2. Listar Vendas

Lista vendas com filtros.

```http
GET /api/vendas?vendedorId=uuid&status=confirmada&dataInicio=2025-10-01&dataFim=2025-10-31
```

**Query Params:**
- `vendedorId` (optional): Filtrar por vendedor
- `status` (optional): `pendente`, `confirmada`, `cancelada`
- `dataInicio` (optional): Data início
- `dataFim` (optional): Data fim

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "numeroVenda": "VND-2025-0001",
    "vendedor": {
      "codigoVendedor": "VND-2025-0001",
      "nome": "João Silva"
    },
    "lead": {
      "name": "Maria Santos"
    },
    "valorLiquido": 4500.00,
    "status": "confirmada"
  }
]
```

---

### 3. Buscar Venda

Busca uma venda específica.

```http
GET /api/vendas/:id
```

**Response:** `200 OK`

---

### 4. Confirmar Venda

Confirma uma venda e gera comissão automaticamente.

```http
POST /api/vendas/:id/confirmar
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "numeroVenda": "VND-2025-0001",
  "status": "confirmada",
  "dataConfirmacao": "2025-10-20T14:30:00Z",
  "valorComissao": 450.00
}
```

---

### 5. Cancelar Venda

Cancela uma venda.

```http
POST /api/vendas/:id/cancelar
```

**Body:**
```json
{
  "motivo": "Cliente solicitou cancelamento"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "status": "cancelada",
  "dataCancelamento": "2025-10-20T15:00:00Z",
  "motivoCancelamento": "Cliente solicitou cancelamento"
}
```

---

## 📊 COMISSÕES

### 1. Listar Comissões

Lista comissões com filtros.

```http
GET /api/vendas/comissoes?vendedorId=uuid&status=pendente&mes=10&ano=2025
```

**Query Params:**
- `vendedorId` (optional): Filtrar por vendedor
- `status` (optional): `pendente`, `paga`, `cancelada`
- `mes` (optional): Mês de competência (1-12)
- `ano` (optional): Ano de competência

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "vendaId": "uuid",
    "vendedorId": "uuid",
    "valorBaseCalculo": 4500.00,
    "percentualAplicado": 10.00,
    "valorComissao": 450.00,
    "mesCompetencia": 10,
    "anoCompetencia": 2025,
    "periodoCompetencia": "Outubro/2025",
    "status": "pendente"
  }
]
```

---

### 2. Buscar Comissão

Busca uma comissão específica.

```http
GET /api/vendas/comissoes/:id
```

**Response:** `200 OK`

---

### 3. Marcar Comissão como Paga

Marca uma comissão como paga.

```http
POST /api/vendas/comissoes/:id/pagar
```

**Body:**
```json
{
  "transactionId": "uuid-transacao-financeira"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "status": "paga",
  "dataPagamento": "2025-10-25T10:00:00Z",
  "transactionId": "uuid"
}
```

---

### 4. Relatório Mensal de Comissões

Gera relatório detalhado de comissões de um vendedor em um mês.

```http
GET /api/vendas/comissoes/relatorio?vendedorId=uuid&mes=10&ano=2025
```

**Query Params (obrigatórios):**
- `vendedorId`: ID do vendedor
- `mes`: Mês (1-12)
- `ano`: Ano

**Response:** `200 OK`
```json
{
  "vendedor": {
    "id": "uuid",
    "codigoVendedor": "VND-2025-0001",
    "nome": "João Silva"
  },
  "periodo": {
    "mes": 10,
    "ano": 2025,
    "descricao": "Outubro/2025"
  },
  "resumo": {
    "totalComissoes": 15,
    "totalPendente": 5,
    "totalPago": 10,
    "totalCancelado": 0,
    "valorTotal": 6750.00,
    "valorPendente": 2250.00,
    "valorPago": 4500.00
  },
  "comissoes": [
    {
      "id": "uuid",
      "valorComissao": 450.00,
      "status": "paga",
      "dataPagamento": "2025-10-25"
    }
  ]
}
```

---

## 📈 ESTATÍSTICAS E RANKINGS

### 1. Estatísticas de Vendas

Retorna estatísticas gerais de vendas.

```http
GET /api/vendas/stats?vendedorId=uuid
```

**Query Params:**
- `vendedorId` (optional): Filtrar por vendedor

**Response:** `200 OK`
```json
{
  "total_vendas": "100",
  "vendas_confirmadas": "85",
  "vendas_pendentes": "10",
  "vendas_canceladas": "5",
  "valor_total": "425000.00",
  "ticket_medio": "5000.00"
}
```

---

### 2. Estatísticas de Comissões

Retorna estatísticas gerais de comissões.

```http
GET /api/vendas/comissoes/stats?vendedorId=uuid
```

**Response:** `200 OK`
```json
{
  "total_comissoes": "85",
  "comissoes_pendentes": "15",
  "comissoes_pagas": "70",
  "comissoes_canceladas": "0",
  "valor_total": "42500.00",
  "valor_pendente": "7500.00",
  "valor_pago": "35000.00"
}
```

---

### 3. Ranking de Vendedores

Retorna ranking de vendedores por comissões.

```http
GET /api/vendas/ranking?mes=10&ano=2025
```

**Query Params:**
- `mes` (optional): Filtrar por mês
- `ano` (optional): Filtrar por ano

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "codigo_vendedor": "VND-2025-0001",
    "vendedor_nome": "João Silva",
    "total_comissoes": "20",
    "valor_pago": "10000.00",
    "valor_pendente": "3000.00",
    "valor_total": "13000.00"
  },
  {
    "id": "uuid",
    "codigo_vendedor": "VND-2025-0002",
    "vendedor_nome": "Maria Santos",
    "total_comissoes": "15",
    "valor_total": "9500.00"
  }
]
```

---

## 🔐 Autenticação

Todas as rotas requerem autenticação via Bearer Token.

**Header obrigatório:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

O token deve ser obtido através da rota de login:
```http
POST /api/auth/login
```

---

## ⚠️ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 204 | Sem conteúdo (sucesso) |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Não autorizado |
| 404 | Não encontrado |
| 500 | Erro interno do servidor |

---

## 📝 Notas Importantes

1. **Geração Automática de Comissões:** Quando uma venda é confirmada (`POST /vendas/:id/confirmar`), uma comissão é gerada automaticamente.

2. **Cancelamento de Vendas:** Ao cancelar uma venda, todas as comissões pendentes relacionadas são automaticamente canceladas.

3. **Período de Competência:** As comissões são agrupadas por mês/ano de competência baseado na data de confirmação da venda.

4. **Códigos Únicos:** Os códigos de vendedor e número de venda são gerados automaticamente no formato `VND-YYYY-NNNN`.

5. **Multi-tenancy:** Todas as consultas são filtradas automaticamente pelo `tenantId` do usuário autenticado.

---

## 🔄 Fluxo Completo

```mermaid
graph LR
    A[Criar Vendedor] --> B[Criar Venda]
    B --> C{Venda Confirmada?}
    C -->|Sim| D[Gerar Comissão]
    C -->|Não| E[Status: Pendente]
    D --> F[Relatório Mensal]
    F --> G[Pagar Comissão]
```

---

**Versão:** v92
**Última atualização:** 20 de Outubro de 2025
**Autor:** Claude Code - Terminal A
