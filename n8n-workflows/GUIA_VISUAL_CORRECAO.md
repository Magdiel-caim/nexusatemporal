# 🔧 GUIA VISUAL - Correção do Response Body

## ❌ PROBLEMA ATUAL

O erro **"Unexpected end of JSON input"** acontece porque a concatenação da URL está quebrada em várias linhas.

**Código problemático (com quebras de linha):**
```javascript
= {{
    {
      "success": true,
      "sessionName": $('1. Criar Sessão WAHA').item.json.name,
      "status": $('2. Iniciar Sessão').item.json.status,
      "qrCodeUrl": "https://apiwts.nexusatemporal.com.br/api/screenshot?session=" + $('1. Criar Sessão WAHA').item.json.name +
  "&screenshotType=qr&api_key=bd0c416348b2f04d198ff8971b608a87"
    }
  }}
```

**Problema:** A linha `"&screenshotType=qr&api_key=..."` está quebrada!

---

## ✅ SOLUÇÃO 1: Código Correto (RECOMENDADO)

**Cole exatamente isto no campo "Response Body":**

```javascript
={{
  {
    "success": true,
    "sessionName": $('1. Criar Sessão WAHA').item.json.name,
    "status": $('2. Iniciar Sessão').item.json.status,
    "qrCodeUrl": "https://apiwts.nexusatemporal.com.br/api/screenshot?session=" + $('1. Criar Sessão WAHA').item.json.name + "&screenshotType=qr&api_key=bd0c416348b2f04d198ff8971b608a87"
  }
}}
```

**Importante:**
- Toda a URL deve estar em UMA LINHA SÓ
- Sem quebras de linha no meio da string
- Fechar aspas corretamente

---

## ✅ SOLUÇÃO 2: Código Simplificado (MAIS FÁCIL)

Se a Solução 1 não funcionar, use esta versão mais simples:

```javascript
={{
  {
    "success": true,
    "sessionName": $json.name,
    "qrCodeUrl": "https://apiwts.nexusatemporal.com.br/api/screenshot?session=" + $json.name + "&screenshotType=qr&api_key=bd0c416348b2f04d198ff8971b608a87"
  }
}}
```

**Diferença:** Usa `$json.name` ao invés de referenciar outro nó.

---

## 📝 PASSO A PASSO NO N8N

### 1. Abrir o Workflow
```
N8N → Workflows → criar_sessao_waha
```

### 2. Localizar o Nó
```
Procure o nó chamado: "Responder com QR Code"
Tipo: Respond to Webhook
```

### 3. Editar o Campo Response Body

**Onde está:**
```
┌─────────────────────────────────┐
│ Responder com QR Code           │
├─────────────────────────────────┤
│ Respond With: [json ▼]         │
│                                 │
│ Response Body:                  │
│ ┌─────────────────────────────┐ │
│ │ ={{ { ... } }}              │ │ ← AQUI!
│ │                             │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**O que fazer:**
1. **Clique** dentro do campo "Response Body"
2. **CTRL+A** (selecionar tudo)
3. **DELETE** (apagar tudo)
4. **COLE** o código da Solução 1 ou 2
5. **CTRL+S** ou clique em "Save"

### 4. Verificar Sintaxe

O N8N deve mostrar uma **prévia** do JSON sem erros:

```json
{
  "success": true,
  "sessionName": "session_...",
  "qrCodeUrl": "https://apiwts.nexusatemporal.com.br/api/screenshot?..."
}
```

Se aparecer **erro vermelho**, verifique:
- [ ] Fechou todas as aspas `"`
- [ ] Fechou todas as chaves `{}`
- [ ] Não tem vírgula sobrando
- [ ] URL está em uma linha só

### 5. Salvar e Ativar

1. Clique em **"Save"** (canto superior direito)
2. Certifique-se que o toggle está **ATIVO** (azul/verde)
3. Feche e abra novamente para confirmar que salvou

---

## 🧪 TESTE DEPOIS DE SALVAR

**No terminal:**
```bash
curl -X POST "https://workflow.nexusatemporal.com/webhook/waha-create-session" \
  -H "Content-Type: application/json" \
  -d '{"sessionName":"teste_corrigido"}'
```

**Resposta esperada:**
```json
{
  "success": true,
  "sessionName": "session_01k...",
  "qrCodeUrl": "https://apiwts.nexusatemporal.com.br/api/screenshot?session=session_01k...&screenshotType=qr&api_key=bd0c416348b2f04d198ff8971b608a87"
}
```

**Se retornar isso → FUNCIONOU! ✅**

---

## 📱 TESTE NO FRONTEND

Depois que funcionar o teste acima:

1. **Acesse:** https://one.nexusatemporal.com.br
2. **Login:** teste@nexusatemporal.com.br / 123456
3. **Menu:** Chat
4. **Botão:** "Conectar WhatsApp"
5. **Digite:** "atendimento" (ou qualquer nome)
6. **Aguarde:** QR Code deve aparecer!

---

## 🆘 SE CONTINUAR COM ERRO

**Erros comuns:**

### Erro: "Unexpected end of JSON input"
✅ Solução: Certifique-se que a URL está em UMA linha só (sem quebras)

### Erro: "Cannot read property 'json' of undefined"
✅ Solução: Use a Solução 2 (com `$json.name`)

### Erro: "The item 0 doesn't have the json property"
✅ Solução: Verifique se o nó "1. Criar Sessão WAHA" existe e tem esse nome exato

### Nenhum erro, mas não retorna qrCodeUrl
✅ Solução: Verifique se salvou o workflow (CTRL+S)

---

## 📞 CHECKLIST FINAL

- [ ] Código colado sem quebras de linha
- [ ] Workflow salvo (ícone de disquete)
- [ ] Workflow ativo (toggle verde/azul)
- [ ] Teste curl retorna `qrCodeUrl`
- [ ] Frontend exibe QR Code

---

**Data:** 2025-10-08
**Arquivo:** GUIA_VISUAL_CORRECAO.md
**Status:** Pronto para aplicar
