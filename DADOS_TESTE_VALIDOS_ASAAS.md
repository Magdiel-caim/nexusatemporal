# 📋 DADOS VÁLIDOS PARA TESTE - ASAAS SANDBOX

**Data:** 2025-11-07
**Ambiente:** Sandbox (Testes)

═══════════════════════════════════════════════════════════════════════════

## ⚠️ IMPORTANTE: USE DADOS VÁLIDOS!

O Asaas valida CPF/CNPJ mesmo no sandbox!

❌ NÃO USE: 12345678901 (inválido)
✅ USE: CPFs válidos listados abaixo

═══════════════════════════════════════════════════════════════════════════

## 🆔 CPFs VÁLIDOS PARA TESTE

```
CPF 1: 24971563792
CPF 2: 94271564656
CPF 3: 07835923000
CPF 4: 78502676050
CPF 5: 64105244030
CPF 6: 48397031030
CPF 7: 51174865051
```

═══════════════════════════════════════════════════════════════════════════

## 🏢 CNPJs VÁLIDOS PARA TESTE

```
CNPJ 1: 07526557000100
CNPJ 2: 11222333000181
CNPJ 3: 34028316000103
CNPJ 4: 00000000000191
```

═══════════════════════════════════════════════════════════════════════════

## 📱 TELEFONES VÁLIDOS

```
Telefone fixo: 4738010919
               1140401234
               2133334444

Celular:       47988781877
               11987654321
               21987654321
```

Formato: DDD (2 dígitos) + Número (8 ou 9 dígitos)

═══════════════════════════════════════════════════════════════════════════

## 📧 EMAILS PARA TESTE

Use qualquer email fictício:

```
joao.teste@example.com
maria.silva@teste.com.br
cliente.teste@email.com
teste123@asaas.com
```

**IMPORTANTE:** Use domínios de teste como:
- @example.com
- @teste.com.br
- @test.com

Evite usar domínios reais (@gmail.com, @hotmail.com) para testes.

═══════════════════════════════════════════════════════════════════════════

## 🏠 ENDEREÇOS VÁLIDOS (OPCIONAIS)

```json
{
  "address": "Rua das Flores",
  "addressNumber": "123",
  "complement": "Apto 45",
  "province": "Centro",
  "city": "São Paulo",
  "state": "SP",
  "postalCode": "01310100"
}
```

CEPs válidos para teste:
```
01310100 (Av. Paulista, SP)
20040020 (Centro, RJ)
30130100 (Centro, BH)
40020000 (Centro, Salvador)
80010000 (Centro, Curitiba)
```

═══════════════════════════════════════════════════════════════════════════

## 📋 EXEMPLO COMPLETO: CRIAR CLIENTE (JSON)

### Pessoa Física (CPF):

```json
{
  "gateway": "asaas",
  "name": "João da Silva Teste",
  "email": "joao.teste@example.com",
  "cpfCnpj": "24971563792",
  "phone": "4738010919",
  "mobilePhone": "47988781877",
  "address": "Rua das Flores",
  "addressNumber": "123",
  "province": "Centro",
  "postalCode": "01310100"
}
```

### Pessoa Jurídica (CNPJ):

```json
{
  "gateway": "asaas",
  "name": "Empresa Teste LTDA",
  "email": "contato@empresateste.com",
  "cpfCnpj": "07526557000100",
  "phone": "1140401234",
  "mobilePhone": "11987654321",
  "address": "Av. Paulista",
  "addressNumber": "1000",
  "province": "Bela Vista",
  "postalCode": "01310100",
  "company": "Empresa Teste LTDA"
}
```

═══════════════════════════════════════════════════════════════════════════

## 💳 DADOS DE CARTÃO DE CRÉDITO (TESTE)

Para testes com cartão no sandbox Asaas:

### Cartão que APROVA:
```
Número:     5162 3062 1937 8829
Validade:   12/2030
CVV:        318
Nome:       João da Silva
CPF Titular: 24971563792
```

### Cartão que RECUSA:
```
Número:     5162 3062 1937 8837
Validade:   12/2030
CVV:        318
Nome:       João da Silva
CPF Titular: 24971563792
```

═══════════════════════════════════════════════════════════════════════════

## 📋 EXEMPLO COMPLETO: CRIAR COBRANÇA PIX

```json
{
  "gateway": "asaas",
  "customer": "cus_000005188598",
  "billingType": "PIX",
  "value": 50.00,
  "dueDate": "2025-11-15",
  "description": "Teste de cobrança PIX",
  "externalReference": "TESTE-001"
}
```

═══════════════════════════════════════════════════════════════════════════

## 📋 EXEMPLO COMPLETO: CRIAR COBRANÇA BOLETO

```json
{
  "gateway": "asaas",
  "customer": "cus_000005188598",
  "billingType": "BOLETO",
  "value": 100.00,
  "dueDate": "2025-11-20",
  "description": "Teste de Boleto Bancário",
  "discount": {
    "value": 5.00,
    "dueDateLimitDays": 0
  },
  "fine": {
    "value": 1.00
  },
  "interest": {
    "value": 0.33
  }
}
```

═══════════════════════════════════════════════════════════════════════════

## 📋 EXEMPLO COMPLETO: CRIAR COBRANÇA CARTÃO

```json
{
  "gateway": "asaas",
  "customer": "cus_000005188598",
  "billingType": "CREDIT_CARD",
  "value": 75.50,
  "dueDate": "2025-11-07",
  "description": "Teste Cartão de Crédito",
  "creditCard": {
    "holderName": "João da Silva",
    "number": "5162306219378829",
    "expiryMonth": "12",
    "expiryYear": "2030",
    "ccv": "318"
  },
  "creditCardHolderInfo": {
    "name": "João da Silva",
    "email": "joao@example.com",
    "cpfCnpj": "24971563792",
    "postalCode": "01310100",
    "addressNumber": "123",
    "phone": "4738010919"
  }
}
```

═══════════════════════════════════════════════════════════════════════════

## ✅ VALIDAÇÃO DE CPF

Para gerar CPFs válidos para teste, você pode usar sites como:
- https://www.4devs.com.br/gerador_de_cpf
- https://geradornv.com.br/gerador-de-cpf/

**IMPORTANTE:** Use apenas para testes em sandbox!

═══════════════════════════════════════════════════════════════════════════

## ✅ CHECKLIST ANTES DE TESTAR

Antes de enviar a requisição, verifique:

- [ ] CPF/CNPJ é válido (11 ou 14 dígitos, com dígitos verificadores corretos)
- [ ] Email é formato válido (contém @)
- [ ] Telefone tem DDD + número (10 ou 11 dígitos no total)
- [ ] CEP tem 8 dígitos
- [ ] JSON está bem formatado (aspas duplas, vírgulas corretas)
- [ ] Campo "gateway": "asaas" está presente
- [ ] JWT Token válido no header Authorization

═══════════════════════════════════════════════════════════════════════════

## 🧪 SEQUÊNCIA DE TESTE RECOMENDADA

1. **Criar Cliente (Pessoa Física)**
   ```
   CPF: 24971563792
   ```

2. **Criar Cobrança PIX**
   ```
   Valor: R$ 50,00
   ```

3. **Simular Pagamento no Asaas**
   ```
   Painel: https://sandbox.asaas.com/
   ```

4. **Verificar Webhook Recebido**
   ```
   Logs: docker service logs nexus_backend
   ```

5. **Criar Cliente (Pessoa Jurídica)**
   ```
   CNPJ: 07526557000100
   ```

6. **Criar Cobrança Boleto**
   ```
   Valor: R$ 100,00
   ```

═══════════════════════════════════════════════════════════════════════════

## 🆘 ERROS COMUNS

### Erro: "O CPF/CNPJ informado é inválido"
- ✅ Use CPFs da lista acima
- ✅ Não use 11111111111, 12345678901, etc.

### Erro: "Expected double-quoted property name in JSON"
- ✅ Use aspas duplas (") não aspas simples (')
- ✅ Verifique se tem vírgula em todas as linhas exceto a última

### Erro: "Invalid email format"
- ✅ Email deve ter @ e domínio válido
- ✅ Exemplo correto: joao@example.com

### Erro: "Phone number is required"
- ✅ Phone ou mobilePhone deve ter pelo menos 10 dígitos
- ✅ Formato: 4738010919 (sem espaços, parênteses ou traços)

═══════════════════════════════════════════════════════════════════════════

**🎉 AGORA VOCÊ TEM TODOS OS DADOS VÁLIDOS PARA TESTAR!**

Copie os exemplos exatamente como estão e deve funcionar! 🚀
