# 🚨 Traefik Troubleshooting - Erros Comuns

**Data:** Outubro de 2025
**Status:** Documentação Ativa

---

## 🔴 ERRO CRÍTICO: Bad Gateway 502 - Porta Incorreta

### Sintoma
```bash
# Ao acessar o frontend
https://one.nexusatemporal.com.br
# Retorna: 502 Bad Gateway
```

### Causa Raiz
Traefik configurado para encaminhar requisições para porta **80**, mas o Vite dev server roda na porta **3000**.

```yaml
# ❌ CONFIGURAÇÃO INCORRETA
traefik.http.services.nexusfrontend.loadbalancer.server.port: "80"

# Vite dev server sempre roda na porta 3000 por padrão!
# Resultado: Traefik tenta conectar na porta 80 → Nada responde → 502
```

### Solução
```bash
# Atualizar label do serviço para porta correta
docker service update --label-add \
  traefik.http.services.nexusfrontend.loadbalancer.server.port=3000 \
  nexus_frontend

# Verificar se aplicou
docker service inspect nexus_frontend | grep -A 5 Labels

# Deve mostrar:
# "traefik.http.services.nexusfrontend.loadbalancer.server.port": "3000"
```

### Verificação
```bash
# 1. Verificar logs do Traefik
docker service logs traefik --tail 50

# 2. Verificar logs do frontend
docker service logs nexus_frontend --tail 50

# 3. Testar acesso
curl -I https://one.nexusatemporal.com.br
# Deve retornar: HTTP/2 200
```

### Prevenção
**SEMPRE verificar** a porta correta ao configurar novos serviços:

| Serviço | Porta Correta |
|---------|---------------|
| `nexus_frontend` (Vite dev) | **3000** |
| `nexus_backend` (Node/Express) | **3001** |
| `chatwoot` | **3000** |
| `traefik` dashboard | **8080** |

---

## ⚠️ ERRO: Mixed Content (HTTPS/HTTP)

### Sintoma
```
Mixed Content: The page at 'https://one.nexusatemporal.com.br' was loaded over HTTPS,
but requested an insecure XMLHttpRequest endpoint 'http://...'
```

### Causa
Frontend em HTTPS tentando chamar API em HTTP.

### Solução
```bash
# NUNCA definir VITE_API_URL com http://
# ❌ ERRADO
VITE_API_URL=http://nexus_backend:3001

# ✅ CORRETO - Usar HTTPS ou deixar vazio (usa padrão do código)
docker service update --env-rm VITE_API_URL nexus_frontend

# O código já tem o padrão correto:
# const API_URL = 'https://api.nexusatemporal.com.br/api';
```

---

## ⚠️ ERRO: Duplicação de Caminho (/api/api/)

### Sintoma
```bash
# Requisições com caminho duplicado
GET /api/api/marketing/waha/sessions → 404
POST /api/api/marketing/ai-assistant/generate-copy → 404
```

### Causa
Variável `VITE_API_URL` contendo `/api` no final, combinada com código que já adiciona `/api`.

```typescript
// ❌ PROBLEMA
VITE_API_URL=https://api.nexusatemporal.com.br/api

// No código:
const API_URL = import.meta.env.VITE_API_URL || 'https://api.nexusatemporal.com.br/api';
axios.get(`${API_URL}/marketing/...`) // → /api/marketing/...

// Mas Traefik já adiciona /api → Resultado: /api/api/marketing/...
```

### Solução
```bash
# Remover variável e usar padrão do código
docker service update --env-rm VITE_API_URL nexus_frontend

# Nunca definir VITE_API_URL com /api no final
```

---

## 🔍 Comandos Úteis de Debug

### Verificar Labels Traefik
```bash
# Frontend
docker service inspect nexus_frontend --format '{{json .Spec.Labels}}' | jq

# Backend
docker service inspect nexus_backend --format '{{json .Spec.Labels}}' | jq
```

### Verificar Variáveis de Ambiente
```bash
# Frontend
docker service inspect nexus_frontend --format '{{json .Spec.TaskTemplate.ContainerSpec.Env}}' | jq

# Backend
docker service inspect nexus_backend --format '{{json .Spec.TaskTemplate.ContainerSpec.Env}}' | jq
```

### Verificar Status dos Serviços
```bash
# Ver todos os serviços
docker service ls

# Ver réplicas e status
docker service ps nexus_frontend --no-trunc
docker service ps nexus_backend --no-trunc

# Ver logs em tempo real
docker service logs -f nexus_frontend
docker service logs -f nexus_backend
```

### Testar Conectividade
```bash
# Testar HTTPS
curl -I https://one.nexusatemporal.com.br

# Testar API
curl -I https://api.nexusatemporal.com.br/api/health

# Ver headers completos
curl -v https://one.nexusatemporal.com.br 2>&1 | grep -A 20 "HTTP"
```

---

## 📋 Checklist Pré-Deploy

Antes de fazer deploy de mudanças no Traefik ou frontend:

- [ ] Verificar porta correta do serviço (3000 para Vite, 3001 para backend)
- [ ] Remover `VITE_API_URL` se não for necessário (usar padrão do código)
- [ ] Verificar se todos os URLs são HTTPS (nunca HTTP)
- [ ] Testar build localmente antes do deploy
- [ ] Fazer rolling update (não restart completo)
- [ ] Verificar logs após deploy
- [ ] Testar acesso via curl/navegador

---

## 🎯 Boas Práticas

### Docker Swarm
```bash
# ✅ Sempre usar rolling updates
docker service update --image nova-imagem:tag nome-servico

# ❌ Evitar restart completo (causa downtime)
docker service update --force nome-servico
```

### Variáveis de Ambiente
```bash
# ✅ Usar valores padrão no código quando possível
const API_URL = import.meta.env.VITE_API_URL || 'https://api.nexusatemporal.com.br/api';

# ✅ Sobrescrever apenas quando necessário
docker service update --env-add CUSTOM_VAR=value servico

# ✅ Remover variáveis desnecessárias
docker service update --env-rm UNUSED_VAR servico
```

### Traefik Labels
```bash
# ✅ Sempre especificar porta correta
traefik.http.services.SERVICO.loadbalancer.server.port=PORTA_CORRETA

# ✅ Usar HTTPS para tudo
traefik.http.routers.SERVICO.entrypoints=websecure
traefik.http.routers.SERVICO.tls.certresolver=letsencrypt

# ✅ Adicionar middlewares de segurança
traefik.http.middlewares.security-headers.headers.sslredirect=true
```

---

## 📚 Histórico de Erros

| Data | Versão | Erro | Solução | Documentado Por |
|------|--------|------|---------|-----------------|
| 23/10/2025 | v120.2 | Bad Gateway 502 | Porta 80→3000 | Sessão C v120.4 |
| 23/10/2025 | v120.4 | Mixed Content | Remover VITE_API_URL HTTP | Sessão C v120.4 |
| 23/10/2025 | v120.4 | /api/api duplication | Remover VITE_API_URL | Sessão C v120.4 |

---

## 🆘 Links de Referência

- [Documentação Traefik](https://doc.traefik.io/traefik/)
- [Traefik + Docker Swarm](https://doc.traefik.io/traefik/providers/docker/)
- [Let's Encrypt + Traefik](https://doc.traefik.io/traefik/https/acme/)
- [Vite Configuration](https://vitejs.dev/config/)

---

**IMPORTANTE:** Este documento deve ser consultado SEMPRE que houver problemas de conectividade, erros 502, ou mudanças na configuração do Traefik.

**Última Atualização:** 23 de Outubro de 2025 - Sessão C v120.4
