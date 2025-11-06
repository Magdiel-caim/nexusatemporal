# 🚀 DEPLOY FRONTEND - GUIA RÁPIDO

## ⚡ SOLUÇÃO IMEDIATA (5 MINUTOS)

### Problema
✅ Código frontend corrigido
✅ Build executado (`npm run build`)
❌ **Frontend não deployado - usuário vê versão antiga**

### Solução

```bash
# 1. Build da nova imagem
cd /root/nexusatemporalv1/frontend
docker build -f Dockerfile.prod -t nexus-frontend:latest .

# 2. Deploy
docker service update --image nexus-frontend:latest nexus_frontend

# 3. Verificar (aguardar ~1 minuto)
docker service ps nexus_frontend

# 4. Confirmar (deve mostrar "Running")
docker service logs nexus_frontend --tail 50
```

### Validação

**Instruir usuário a:**
1. Abrir: https://one.nexusatemporal.com.br
2. Pressionar: **Ctrl + Shift + R** (Windows/Linux) ou **Cmd + Shift + R** (Mac)
3. Ir para: Módulo Agenda → Editar agendamento
4. Verificar: Campo de data NÃO permite selecionar datas passadas

### Se não funcionar

```bash
# Ver logs de erro
docker service logs nexus_frontend --tail 200

# Ver status do serviço
docker service ps nexus_frontend --no-trunc

# Forçar recreação
docker service update --force nexus_frontend
```

---

## 📋 Checklist Completo

- [ ] `cd /root/nexusatemporalv1/frontend`
- [ ] `docker build -f Dockerfile.prod -t nexus-frontend:latest .`
- [ ] Aguardar build (~2-3 min)
- [ ] `docker service update --image nexus-frontend:latest nexus_frontend`
- [ ] `docker service ps nexus_frontend` (verificar "Running")
- [ ] Aguardar convergência (~1 min)
- [ ] Pedir usuário testar com Ctrl+Shift+R
- [ ] ✅ Confirmar que validação de data funciona

---

## 🎯 Arquivos Afetados

**Frontend modificado:**
- `frontend/src/pages/AgendaPage.tsx:934` - Validação de data mínima

**Arquitetura de deploy:**
- Serviço: `nexus_frontend`
- Imagem: `nexus-frontend:latest`
- Dockerfile: `frontend/Dockerfile.prod` (multi-stage com Nginx)
- Domínio: https://one.nexusatemporal.com.br

---

**Criado:** 06/11/2025
**Contexto:** Sprint 1 - Correção de bugs
**Commit:** 2a438e0
