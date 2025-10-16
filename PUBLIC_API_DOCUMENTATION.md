# API Pública de Agendamentos - Nexus CRM

## Visão Geral

Esta API permite que sites externos integrem o sistema de agendamentos do Nexus CRM. As consultas (GET) não requerem autenticação, mas a criação de agendamentos requer uma chave de API.

**Base URL:** `https://api.nexusatemporal.com.br/api/public/appointments`

---

## Endpoints

### 1. Obter Slots Disponíveis

**GET** `/available-slots`

Retorna todos os slots de horário disponíveis para uma data e local específicos.

#### Parâmetros Query

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| date | string | Sim | Data no formato YYYY-MM-DD |
| location | string | Sim | Local do atendimento (moema, av_paulista, perdizes, online, a_domicilio) |
| tenantId | string | Não | ID do tenant (padrão: "default") |
| professionalId | string | Não | ID do profissional específico |
| startHour | number | Não | Hora inicial (padrão: 7) |
| endHour | number | Não | Hora final (padrão: 20) |
| interval | number | Não | Intervalo em minutos (padrão: 5) |

#### Exemplo de Requisição

```bash
curl "https://api.nexusatemporal.com.br/api/public/appointments/available-slots?date=2025-10-20&location=moema"
```

#### Exemplo de Resposta

```json
{
  "success": true,
  "data": [
    { "time": "09:00", "available": true },
    { "time": "09:05", "available": true },
    { "time": "09:10", "available": false },
    ...
  ]
}
```

---

### 2. Obter Slots Ocupados

**GET** `/occupied-slots`

Retorna apenas os horários que já estão ocupados.

#### Parâmetros Query

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| date | string | Sim | Data no formato YYYY-MM-DD |
| location | string | Sim | Local do atendimento |
| tenantId | string | Não | ID do tenant (padrão: "default") |
| professionalId | string | Não | ID do profissional específico |
| interval | number | Não | Intervalo em minutos (padrão: 5) |

#### Exemplo de Requisição

```bash
curl "https://api.nexusatemporal.com.br/api/public/appointments/occupied-slots?date=2025-10-20&location=moema"
```

#### Exemplo de Resposta

```json
{
  "success": true,
  "data": ["09:00", "09:05", "09:10", "14:30", "15:00"]
}
```

---

### 3. Verificar Disponibilidade

**POST** `/check-availability`

Verifica se um horário específico está disponível, considerando a duração do procedimento.

#### Body da Requisição

```json
{
  "scheduledDate": "2025-10-20T14:00:00.000Z",
  "duration": 60,
  "location": "moema",
  "tenantId": "default",
  "professionalId": "uuid-do-profissional" // opcional
}
```

#### Exemplo de Resposta

```json
{
  "success": true,
  "data": {
    "available": false,
    "conflicts": [
      {
        "id": "uuid",
        "scheduledDate": "2025-10-20T14:00:00.000Z",
        "lead": { "name": "João Silva" },
        "procedure": { "name": "Consulta", "duration": 60 }
      }
    ]
  }
}
```

---

### 4. Listar Locais

**GET** `/locations`

Retorna a lista de locais disponíveis para agendamento.

#### Exemplo de Requisição

```bash
curl "https://api.nexusatemporal.com.br/api/public/appointments/locations"
```

#### Exemplo de Resposta

```json
{
  "success": true,
  "data": [
    { "value": "moema", "label": "Moema" },
    { "value": "av_paulista", "label": "Av. Paulista" },
    { "value": "perdizes", "label": "Perdizes" },
    { "value": "online", "label": "Online" },
    { "value": "a_domicilio", "label": "A Domicílio" }
  ]
}
```

---

### 5. Criar Agendamento (Requer API Key)

**POST** `/`

Cria um novo agendamento. **Requer chave de API** no header `X-API-Key`.

#### Headers

| Header | Valor |
|--------|-------|
| X-API-Key | Sua chave de API |
| Content-Type | application/json |

#### Body da Requisição

```json
{
  "leadId": "uuid-do-lead",
  "procedureId": "uuid-do-procedimento",
  "scheduledDate": "2025-10-20T14:00:00.000Z",
  "location": "moema",
  "tenantId": "default",
  "paymentAmount": 300.00,
  "paymentMethod": "pix",
  "notes": "Cliente solicitou atendimento urgente"
}
```

#### Exemplo de Requisição

```bash
curl -X POST "https://api.nexusatemporal.com.br/api/public/appointments" \
  -H "X-API-Key: nexus_sua_chave_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "uuid-do-lead",
    "procedureId": "uuid-do-procedimento",
    "scheduledDate": "2025-10-20T14:00:00.000Z",
    "location": "moema"
  }'
```

#### Exemplo de Resposta

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "leadId": "uuid-do-lead",
    "procedureId": "uuid-do-procedimento",
    "scheduledDate": "2025-10-20T14:00:00.000Z",
    "location": "moema",
    "status": "aguardando_pagamento",
    "createdAt": "2025-10-16T10:30:00.000Z"
  },
  "message": "Agendamento criado com sucesso"
}
```

---

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Requisição inválida |
| 401 | Não autorizado (API key inválida) |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

---

## Como Obter uma API Key

Para criar agendamentos através da API pública, você precisa de uma chave de API. Entre em contato com o suporte em **ti.nexus@nexusatemporal.com.br** informando:

1. Nome do site/aplicação
2. Domínio do site
3. Propósito da integração

Você receberá uma chave no formato: `nexus_XXXXXXXXXXXXXXXX`

---

## Rate Limiting

A API pública possui os seguintes limites:

- **Consultas (GET):** 100 requisições por minuto
- **Criação (POST):** 10 requisições por minuto

Se você exceder esses limites, receberá um erro `429 Too Many Requests`.

---

## CORS

A API está configurada para aceitar requisições de qualquer origem. Para produção, é recomendado configurar domínios específicos.

---

## Widget JavaScript

Para facilitar a integração, disponibilizamos um widget JavaScript pronto. Veja a documentação em `WIDGET_INSTALLATION.md`.

---

## Suporte

- **Email:** ti.nexus@nexusatemporal.com.br
- **Documentação completa:** https://docs.nexusatemporal.com.br
- **Status da API:** https://status.nexusatemporal.com.br
