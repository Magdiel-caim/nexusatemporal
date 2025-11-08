# 🚀 MIGRAÇÃO RÁPIDA PARA PRODUÇÃO

**5 PASSOS SIMPLES**

═══════════════════════════════════════════════════════════════════════════

## 1️⃣ OBTER API KEY DE PRODUÇÃO

**Acesse:** https://www.asaas.com/ (SEM sandbox)

**Menu:** Integrações → API Key → Gerar Nova

**Copie:** `$aact_YTU5YTE0M2M2N2I4MTli...` (chave completa)

---

## 2️⃣ CONFIGURAR NO FRONTEND

**Acesse:** https://one.nexusatemporal.com.br/integracoes/pagamentos

1. Aba **Asaas**
2. Ambiente: ☑️ **Produção** (mude de Sandbox!)
3. Cole a **API Key de produção**
4. ☑️ **Ativar integração**
5. **Salvar Configuração**

---

## 3️⃣ CONFIGURAR WEBHOOK

**No painel Asaas:** https://www.asaas.com/

**Menu:** Configurações → Webhooks

**URL:**
```
https://api.nexusatemporal.com.br/api/payment-gateway/webhooks/asaas
```

**Eventos:**
```
✅ PAYMENT_RECEIVED
✅ PAYMENT_CONFIRMED
✅ PAYMENT_OVERDUE
✅ PAYMENT_DELETED
✅ PAYMENT_REFUNDED
```

**Salvar**

---

## 4️⃣ TESTAR CONEXÃO

**No frontend:**
- Clique em **"Testar Conexão"**

**Deve retornar:**
```
✅ Conexão estabelecida com sucesso!
✅ Saldo: R$ XXX
✅ Ambiente: production
```

---

## 5️⃣ TESTE COM R$ 1,00 REAL

### Via Postman:

**1. Criar cliente:**
```
POST /api/payment-gateway/customers
Body: {
  "gateway": "asaas",
  "name": "SEU_NOME",
  "email": "SEU_EMAIL@gmail.com",
  "cpfCnpj": "SEU_CPF_REAL",
  "phone": "SEU_TELEFONE"
}
```

**2. Criar cobrança PIX:**
```
POST /api/payment-gateway/charges
Body: {
  "gateway": "asaas",
  "customer": "cus_XXXXXX",
  "billingType": "PIX",
  "value": 1.00,
  "dueDate": "2025-11-08",
  "description": "Teste producao"
}
```

**3. Obter QR Code:**
```
GET /api/payment-gateway/charges/asaas/{chargeId}/pix
```

**4. Pagar de verdade:**
- Copie o código PIX
- Abra seu banco
- PIX → Copia e Cola
- Pague R$ 1,00

**5. Verificar webhook:**
```bash
docker service logs nexus_backend -f | grep webhook
```

**Deve aparecer:**
```
✅ Asaas webhook received: PAYMENT_RECEIVED
✅ Webhook processed successfully
```

**6. Verificar saldo Asaas:**
- Acesse: https://www.asaas.com/
- Dashboard → Saldo
- Deve ter: R$ 0,99 (R$ 1,00 - taxa)

═══════════════════════════════════════════════════════════════════════════

## ✅ PRONTO!

Se o teste de R$ 1,00 passou, você está **EM PRODUÇÃO**! 🎉

Agora pode usar com clientes reais!

═══════════════════════════════════════════════════════════════════════════

## ⚠️ IMPORTANTE

### Taxas Asaas (Produção):

```
PIX:             0,99% (mín. R$ 1,00)
Boleto:          R$ 3,49 fixo
Cartão Crédito:  4,99% + R$ 0,49
Cartão Débito:   2,99% + R$ 0,49
```

### Prazos de Repasse:

```
PIX:    D+1 (próximo dia útil)
Boleto: D+1 (próximo dia útil)
Cartão: D+30
```

═══════════════════════════════════════════════════════════════════════════

## 📚 GUIA COMPLETO

Para detalhes completos, consulte:
- **GUIA_MIGRACAO_PRODUCAO.md**

═══════════════════════════════════════════════════════════════════════════

**BOA SORTE! 🚀💚**
