# Configuração DNS - Sistema de Automações

## Domínio: nexusatemporal.com.br

---

## Registros DNS Necessários

### 1. n8n Editor/UI

**Tipo**: A Record (ou CNAME)
**Nome**: `automacao`
**Valor**: IP do servidor (ou domínio principal)
**TTL**: 3600 (1 hora)

**Resultado**: `automacao.nexusatemporal.com.br` → Interface visual do n8n

---

### 2. n8n Webhooks

**Tipo**: A Record (ou CNAME)
**Nome**: `automahook`
**Valor**: IP do servidor (ou domínio principal)
**TTL**: 3600 (1 hora)

**Resultado**: `automahook.nexusatemporal.com.br` → Endpoint para webhooks

---

### 3. WhatsApp (Opcional)

**Status**: Waha já existe em `apiwts.nexusatemporal.com.br` ✅

**Se necessário domínio adicional**:
- **Tipo**: A Record (ou CNAME)
- **Nome**: `whats`
- **Valor**: IP do servidor
- **Resultado**: `whats.nexusatemporal.com.br`

---

## Exemplo de Configuração DNS

### Usando A Records (Recomendado)
```
Tipo    Nome        Valor              TTL
A       automacao   SEU_IP_SERVIDOR    3600
A       automahook  SEU_IP_SERVIDOR    3600
```

### Usando CNAMEs
```
Tipo    Nome        Valor                          TTL
CNAME   automacao   nexusatemporal.com.br         3600
CNAME   automahook  nexusatemporal.com.br         3600
```

---

## Verificação DNS

Após adicionar os registros, verifique com:

```bash
# Verificar Editor n8n
nslookup automacao.nexusatemporal.com.br
dig automacao.nexusatemporal.com.br

# Verificar Webhooks n8n
nslookup automahook.nexusatemporal.com.br
dig automahook.nexusatemporal.com.br

# Teste com curl (após propagação)
curl -k -I https://automacao.nexusatemporal.com.br
curl -k -I https://automahook.nexusatemporal.com.br
```

---

## Certificados SSL

✅ **Totalmente Automático**

O Traefik + Let's Encrypt irá:
1. Detectar automaticamente os novos subdomínios
2. Solicitar certificados SSL válidos
3. Configurar HTTPS automaticamente
4. Renovar certificados antes do vencimento

**Nenhuma ação manual necessária!**

---

## URLs Finais

| Serviço | URL | Função |
|---------|-----|--------|
| **n8n Editor** | https://automacao.nexusatemporal.com.br | Interface visual para criar workflows |
| **n8n Webhooks** | https://automahook.nexusatemporal.com.br | Receber webhooks de sistemas externos |
| **Waha API** | https://apiwts.nexusatemporal.com.br | WhatsApp API (já configurado) ✅ |

---

## Autenticação

### n8n
- **Tipo**: Basic Auth
- **Username**: admin
- **Password**: NexusN8n2025!Secure

### Waha
- **API Key**: ⏳ Aguardando token do usuário

---

## Status Atual

✅ Serviços deployados e rodando
✅ Traefik configurado com labels corretas
✅ Waha existente identificado
⏳ **Aguardando**: Configuração DNS para automacao e automahook

---

## Tempo de Propagação DNS

- **Mínimo**: 5-15 minutos
- **Normal**: 1-4 horas
- **Máximo**: até 48 horas (raro)

**Dica**: Use `dig +trace` para verificar a propagação em tempo real.

---

## Testes Locais (Antes do DNS)

Enquanto o DNS não propaga, teste localmente:

```bash
# Verificar serviço n8n
docker service logs nexus-automation_n8n --tail 50

# Verificar status
docker service ls | grep "n8n\|waha"

# Ver labels do Traefik
docker service inspect nexus-automation_n8n --format '{{json .Spec.Labels}}' | python3 -m json.tool
```

---

## Após Configuração DNS

1. ✅ Adicionar registros DNS
2. ⏳ Aguardar propagação (alguns minutos)
3. ⏳ Acessar https://automacao.nexusatemporal.com.br
4. ⏳ Login com admin / NexusN8n2025!Secure
5. ⏳ Criar primeiro workflow
6. ⏳ Testar webhook em automahook.*

---

## Suporte e Troubleshooting

### Erro: Site não carrega
- Verifique se DNS propagou: `nslookup automacao.nexusatemporal.com.br`
- Verifique serviço: `docker service ps nexus-automation_n8n`
- Veja logs: `docker service logs nexus-automation_n8n`

### Erro: Certificado SSL inválido
- Aguarde alguns minutos para Let's Encrypt gerar certificado
- Verifique logs do Traefik: `docker service logs nexus_traefik`

### Erro: 401 Unauthorized
- Verifique credenciais: admin / NexusN8n2025!Secure
- Confirme que Basic Auth está ativo no n8n
