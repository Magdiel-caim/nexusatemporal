# 📧 Guia de Desbloqueio - Zoho Mail

**Data**: 06/11/2025
**Status**: ⚠️ CONTA BLOQUEADA
**Email**: contato@nexusatemporal.com.br

---

## 🔴 PROBLEMA IDENTIFICADO

### Erro Atual
```
550 5.4.6 Unusual sending activity detected.
Learn more: https://www.zoho.com/mail/help/usage-policy.html
To unblock: https://mail.zoho.com/UnblockMe
```

### Causa
O Zoho detectou "atividade suspeita" e bloqueou temporariamente o envio de emails da conta `contato@nexusatemporal.com.br`.

Isso pode acontecer quando:
- Muitos emails são enviados em curto período
- Emails são enviados para destinatários inexistentes
- Primeira vez usando SMTP com a conta
- Padrão de envio considerado anormal

---

## ✅ SOLUÇÃO - DESBLOQUEAR CONTA

### Passo 1: Acessar Portal de Desbloqueio
**URL**: https://mail.zoho.com/UnblockMe

### Passo 2: Fazer Login
- **Email**: contato@nexusatemporal.com.br
- **Senha**: 03wCCAnBSSQB (senha fornecida)

### Passo 3: Seguir Instruções
O Zoho vai:
1. Verificar sua identidade
2. Solicitar confirmação que você é o dono da conta
3. Pode pedir para resolver um CAPTCHA
4. Desbloquear a conta após confirmação

### Passo 4: Aguardar Processamento
- Desbloqueio geralmente leva **5-15 minutos**
- Em alguns casos pode levar até **1 hora**

---

## 🔍 VERIFICAR SE FOI DESBLOQUEADO

### Método 1: Teste no Sistema
1. Acessar: https://one.nexusatemporal.com.br
2. Ir em **Usuários**
3. Selecionar um usuário
4. Clicar em **Reenviar Email de Boas-Vindas**
5. Se funcionar = conta desbloqueada ✅

### Método 2: Teste Direto (Backend)
```bash
# SSH no servidor
ssh root@servernexus

# Ver logs em tempo real
docker service logs nexus_backend -f

# Em outra aba, testar endpoint
curl -X POST https://api.nexusatemporal.com.br/api/users/USER_ID/resend-welcome-email \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Se desbloquear, verá no log:
# "Email sent: <message-id>"
```

---

## 🛠️ MELHORIAS IMPLEMENTADAS

### Tratamento de Erro Aprimorado
O sistema agora detecta e mostra mensagens específicas:

**ANTES**:
```json
{"success": false, "message": "Erro ao reenviar email"}
```

**DEPOIS**:
```json
{
  "success": false,
  "message": "Conta de email temporariamente bloqueada por atividade suspeita. Entre em contato com o administrador para desbloquear."
}
```

### Erros Detectados
1. **Bloqueio Zoho** (550 5.4.6) → Mensagem sobre desbloqueio
2. **Autenticação** (EAUTH) → Mensagem sobre credenciais
3. **Conexão** (ETIMEDOUT) → Mensagem para tentar mais tarde
4. **Servidor** (5xx) → Mensagem sobre servidor indisponível

---

## 📋 CHECKLIST PÓS-DESBLOQUEIO

Após desbloquear a conta Zoho:

- [ ] Testar envio de email no sistema
- [ ] Verificar se email chega na caixa de entrada
- [ ] Confirmar que não há mais erro 550 5.4.6 nos logs
- [ ] Testar criação de novo usuário + envio de email
- [ ] Documentar que conta foi desbloqueada

---

## 🚨 PREVENÇÃO DE FUTUROS BLOQUEIOS

### Boas Práticas
1. **Rate Limiting**: Não enviar mais de 50 emails/hora
2. **Validar Emails**: Verificar que destinatários existem
3. **Warming Up**: Aumentar volume gradualmente
4. **Evitar Spam**: Não enviar emails não solicitados
5. **SPF/DKIM**: Configurar autenticação de domínio

### Configuração SPF (Recomendado)
Adicionar registro TXT no DNS do domínio `nexusatemporal.com.br`:
```
v=spf1 include:zoho.com ~all
```

### Configuração DKIM (Recomendado)
No painel Zoho:
1. Mail Admin Console → Domains
2. Selecionar domínio
3. DKIM → Configurar
4. Adicionar registro TXT no DNS

---

## 📞 SUPORTE ZOHO

### Contatos
- **Help Center**: https://help.zoho.com/portal/en/home
- **Community**: https://help.zoho.com/portal/en/community/topic/mail
- **Email**: support@zoho.com

### Informações para Suporte
Se precisar contatar o Zoho:
- **Conta**: contato@nexusatemporal.com.br
- **Plano**: (verificar no painel)
- **Erro**: 550 5.4.6 Unusual sending activity detected
- **Data do Bloqueio**: 06/11/2025 ~22:48 UTC

---

## 🔗 LINKS ÚTEIS

- **Desbloquear**: https://mail.zoho.com/UnblockMe
- **Política de Uso**: https://www.zoho.com/mail/help/usage-policy.html
- **SMTP Settings**: https://www.zoho.com/mail/help/zoho-smtp.html
- **SPF Setup**: https://www.zoho.com/mail/help/adminconsole/spf-configuration.html
- **DKIM Setup**: https://www.zoho.com/mail/help/adminconsole/dkim-configuration.html

---

## 📊 STATUS ATUAL DO SMTP

### Configurações (Docker Service)
```bash
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false (STARTTLS)
SMTP_USER=contato@nexusatemporal.com.br
SMTP_PASSWORD=fBYXkRUBaNmQ
SMTP_FROM_NAME=Nexus Atemporal
SMTP_FROM_EMAIL=contato@nexusatemporal.com.br
```

### Verificar Configuração
```bash
docker service inspect nexus_backend --format '{{range .Spec.TaskTemplate.ContainerSpec.Env}}{{println .}}{{end}}' | grep SMTP
```

---

**✅ AÇÕES NECESSÁRIAS**:
1. Desbloquear conta em https://mail.zoho.com/UnblockMe
2. Aguardar 5-15 minutos
3. Testar novamente envio de email
4. Se persistir, contatar suporte Zoho

**📅 Próxima Revisão**: Após desbloqueio bem-sucedido
