# PLANO PARA PRÓXIMA SESSÃO - Deploy Frontend

## 🎯 OBJETIVO CLARO

**Fazer o deploy do frontend para que as alterações do Sprint 1 sejam visíveis ao usuário.**

Especificamente:
- ~~Descobrir como o frontend está sendo servido em produção~~ ✅ **DESCOBERTO!**
- Atualizar os arquivos do frontend servidos
- Validar que a mudança de validação de data na agenda está funcionando

## ⚡ INFORMAÇÕES CRÍTICAS DESCOBERTAS

### ✅ Arquitetura identificada:

**Serviço Frontend:**
- **Nome:** `nexus_frontend` (ID: g1wrn6oqonhw)
- **Imagem:** `nexus-frontend:latest`
- **Domínio:** `one.nexusatemporal.com.br` (via Traefik)
- **Porta:** 80 (servido por Nginx)
- **Última atualização:** 11 horas atrás (antes das mudanças)
- **Rede:** nexusatnet

**Dockerfile correto:**
- ✅ Use: `/root/nexusatemporalv1/frontend/Dockerfile.prod`
- ❌ Não use: `/root/nexusatemporalv1/frontend/Dockerfile` (dev mode)

**Processo de build:**
- Multi-stage build
- Stage 1: Build com Node.js (`npm run build`)
- Stage 2: Serve com Nginx
- Copia `dist/` para `/usr/share/nginx/html`

### 🎯 SOLUÇÃO RÁPIDA (COPY-PASTE):

```bash
# 1. Build da imagem (usando Dockerfile.prod)
cd /root/nexusatemporalv1/frontend
docker build -f Dockerfile.prod -t nexus-frontend:latest .

# 2. Update do serviço
docker service update --image nexus-frontend:latest nexus_frontend

# 3. Verificar convergência
docker service ps nexus_frontend

# 4. Aguardar (30-60 segundos)
sleep 60

# 5. Testar
curl -I https://one.nexusatemporal.com.br

# 6. Verificar logs
docker service logs nexus_frontend --tail 100
```

**Tempo estimado:** 5-10 minutos

---

## 🔍 INVESTIGAÇÃO NECESSÁRIA (ORDEM DE PRIORIDADE)

### 1. Descobrir arquitetura de deploy do frontend

#### a) Verificar serviços Docker existentes
```bash
# Listar todos os serviços
docker service ls

# Procurar por frontend
docker service ls | grep -i front

# Ver detalhes se existir
docker service inspect nexus_frontend --pretty
docker service ps nexus_frontend
```

**O que procurar:**
- Existe serviço `nexus_frontend`?
- Qual imagem está usando?
- Qual porta está exposta?
- Onde os arquivos estão montados?

#### b) Verificar containers em execução
```bash
# Listar containers
docker ps | grep -i nexus

# Verificar se há Nginx ou outro servidor web
docker ps | grep -i nginx
```

#### c) Verificar docker-compose ou stack
```bash
# Procurar docker-compose
find /root/nexusatemporalv1 -name "docker-compose*.yml" -o -name "stack*.yml"

# Se encontrar, ver conteúdo
cat /root/nexusatemporalv1/docker-compose.yml
```

#### d) Verificar estrutura de deployment
```bash
# Ver estrutura do projeto
ls -la /root/nexusatemporalv1/

# Verificar se há Dockerfile para frontend
ls -la /root/nexusatemporalv1/frontend/Dockerfile*

# Verificar configuração Nginx se houver
find /root/nexusatemporalv1 -name "nginx.conf" -o -name "*.nginx"
```

---

### 2. Entender onde frontend está sendo servido

#### Cenário A: Frontend em serviço Docker separado
```bash
# Verificar serviço
docker service inspect nexus_frontend

# Ver logs
docker service logs nexus_frontend --tail 100

# Ver onde está montado
docker service inspect nexus_frontend --format '{{json .Spec.TaskTemplate.ContainerSpec.Mounts}}'
```

#### Cenário B: Frontend servido pelo backend
```bash
# Verificar se backend serve static files
grep -r "express.static" /root/nexusatemporalv1/backend/src/

# Verificar main do backend
cat /root/nexusatemporalv1/backend/src/main.ts | grep -A 10 -B 10 static
```

#### Cenário C: Frontend em Nginx separado
```bash
# Verificar containers Nginx
docker ps | grep nginx

# Ver configuração Nginx
docker exec <nginx_container_id> cat /etc/nginx/nginx.conf
docker exec <nginx_container_id> cat /etc/nginx/conf.d/default.conf
```

#### Cenário D: Frontend em volume compartilhado
```bash
# Listar volumes Docker
docker volume ls | grep nexus

# Inspecionar volume
docker volume inspect <volume_name>

# Ver onde está montado
df -h | grep nexus
```

---

### 3. Verificar acessibilidade atual do frontend

```bash
# Testar endpoint local
curl -I http://localhost:3000
curl -I http://localhost:80
curl -I http://localhost:8080

# Ver portas em uso
netstat -tlnp | grep -E "3000|80|8080|5173"

# Se houver IP externo, testar
curl -I http://46.202.144.210
```

---

## 🛠️ CORREÇÕES SUGERIDAS

### Solução 1: Frontend tem serviço Docker próprio

**SE** encontrar serviço `nexus_frontend`:

```bash
# 1. Build da imagem frontend
cd /root/nexusatemporalv1/frontend
docker build -t nexus_frontend:latest .

# 2. Atualizar serviço
docker service update --image nexus_frontend:latest nexus_frontend

# 3. Verificar convergência
docker service ps nexus_frontend

# 4. Testar
curl -I http://localhost:<porta>
```

**SE NÃO EXISTIR** Dockerfile em frontend/:

```bash
# Criar Dockerfile para frontend
cat > /root/nexusatemporalv1/frontend/Dockerfile <<'EOF'
FROM nginx:alpine

# Copiar build do frontend
COPY dist/ /usr/share/nginx/html/

# Copiar configuração Nginx (se houver)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF
```

---

### Solução 2: Frontend servido via volume/mount

**SE** frontend estiver em volume compartilhado:

```bash
# 1. Encontrar onde está montado
docker service inspect nexus_frontend --format '{{json .Spec.TaskTemplate.ContainerSpec.Mounts}}' | jq

# 2. Copiar arquivos build para lá
cp -r /root/nexusatemporalv1/frontend/dist/* /caminho/do/volume/

# 3. Verificar permissões
chmod -R 755 /caminho/do/volume/
chown -R www-data:www-data /caminho/do/volume/  # Se for Nginx

# 4. Reiniciar serviço se necessário
docker service update --force nexus_frontend
```

---

### Solução 3: Frontend servido pelo backend (Express static)

**SE** backend serve arquivos estáticos:

```bash
# 1. Copiar dist para backend
cp -r /root/nexusatemporalv1/frontend/dist /root/nexusatemporalv1/backend/public

# 2. Rebuild backend
docker build -t nexus_backend:latest -f backend/Dockerfile .

# 3. Atualizar serviço
docker service update --image nexus_backend:latest nexus_backend

# 4. Testar
curl -I http://localhost:3001/
```

---

### Solução 4: Criar serviço frontend do zero

**SE NÃO HOUVER** serviço frontend:

```bash
# 1. Criar Dockerfile (ver Solução 1)

# 2. Build da imagem
cd /root/nexusatemporalv1/frontend
docker build -t nexus_frontend:latest .

# 3. Criar serviço
docker service create \
  --name nexus_frontend \
  --publish published=80,target=80 \
  --replicas 1 \
  nexus_frontend:latest

# 4. Verificar
docker service ls
docker service ps nexus_frontend
```

---

## ⚠️ PONTOS DE ATENÇÃO

### 1. Verificar ANTES de fazer mudanças

- [ ] **NÃO DELETAR** nenhum serviço sem backup
- [ ] **NÃO MODIFICAR** configurações de produção sem entender
- [ ] **FAZER BACKUP** de configurações existentes
- [ ] **DOCUMENTAR** o que encontrar

### 2. Ordem de verificação
1. ✅ PRIMEIRO: Entender arquitetura atual
2. ✅ SEGUNDO: Identificar onde frontend está
3. ✅ TERCEIRO: Planejar mudança
4. ✅ QUARTO: Executar deploy
5. ✅ QUINTO: Validar funcionamento

### 3. Não assumir nada
- Não assuma que frontend está em Docker
- Não assuma que há Nginx
- Não assuma estrutura específica
- **INVESTIGUE PRIMEIRO**

### 4. Cache do navegador
Mesmo após deploy, instruir usuário:
```
1. Abrir DevTools (F12)
2. Clicar direito em Reload
3. Selecionar "Empty Cache and Hard Reload"
OU
4. Ctrl + Shift + R (Windows/Linux)
5. Cmd + Shift + R (Mac)
```

### 5. Verificar Proxy/Reverse Proxy
Se houver Nginx como proxy reverso:
- Frontend pode estar em `/`
- Backend pode estar em `/api`
- Verificar configuração de proxy

---

## 📝 CHECKLIST DE RETOMADA

### Fase 1: Descoberta (30 min)
- [ ] Executar `docker service ls`
- [ ] Executar `docker ps | grep nexus`
- [ ] Procurar docker-compose.yml
- [ ] Procurar Dockerfile em frontend/
- [ ] Identificar portas em uso
- [ ] Testar endpoints HTTP
- [ ] Documentar arquitetura encontrada

### Fase 2: Análise (15 min)
- [ ] Determinar qual Solução aplicar (1, 2, 3 ou 4)
- [ ] Verificar se precisa criar Dockerfile
- [ ] Verificar se precisa configurar Nginx
- [ ] Planejar sequência de comandos

### Fase 3: Backup (10 min)
- [ ] Fazer backup de configurações atuais
- [ ] Anotar estado atual dos serviços
- [ ] Salvar logs atuais

### Fase 4: Execução (20 min)
- [ ] Executar solução escolhida
- [ ] Verificar logs durante deploy
- [ ] Aguardar convergência do serviço

### Fase 5: Validação (15 min)
- [ ] Testar endpoint HTTP
- [ ] Verificar se HTML está sendo servido
- [ ] Verificar se assets (JS/CSS) carregam
- [ ] **PEDIR USUÁRIO TESTAR** com hard refresh
- [ ] Verificar console do navegador por erros

### Fase 6: Documentação (10 min)
- [ ] Documentar solução aplicada
- [ ] Atualizar REGISTRO_SESSAO se necessário
- [ ] Criar git commit se houve mudanças

**Tempo total estimado:** 100 minutos (1h40min)

---

## 💾 COMANDOS ÚTEIS PARA DEBUG

### Verificar serviços e containers
```bash
# Listar serviços
docker service ls

# Ver detalhes de um serviço
docker service inspect <service_name> --pretty

# Ver réplicas e estado
docker service ps <service_name>

# Ver logs em tempo real
docker service logs -f <service_name>

# Ver logs recentes
docker service logs <service_name> --tail 100

# Ver containers rodando
docker ps -a

# Ver redes
docker network ls
```

### Verificar portas e conexões
```bash
# Ver portas em uso
netstat -tlnp

# Ver processos ouvindo em portas específicas
lsof -i :80
lsof -i :3000
lsof -i :8080

# Testar endpoints
curl -I http://localhost:80
curl http://localhost:80/index.html
```

### Verificar arquivos e volumes
```bash
# Listar volumes
docker volume ls

# Inspecionar volume
docker volume inspect <volume_name>

# Ver onde volume está montado
docker volume inspect <volume_name> | grep Mountpoint

# Listar conteúdo
ls -la /var/lib/docker/volumes/<volume_name>/_data/
```

### Debug Nginx (se aplicável)
```bash
# Testar configuração
docker exec <nginx_container> nginx -t

# Recarregar configuração
docker exec <nginx_container> nginx -s reload

# Ver configuração ativa
docker exec <nginx_container> cat /etc/nginx/nginx.conf

# Ver logs Nginx
docker logs <nginx_container> --tail 100
```

### Verificar build do frontend
```bash
# Ver se dist/ tem arquivos
ls -lah /root/nexusatemporalv1/frontend/dist/

# Ver tamanho do build
du -sh /root/nexusatemporalv1/frontend/dist/

# Ver index.html
cat /root/nexusatemporalv1/frontend/dist/index.html | head -20

# Verificar assets
ls -lah /root/nexusatemporalv1/frontend/dist/assets/
```

---

## 🔗 REFERÊNCIAS E LINKS ÚTEIS

### Documentação Docker
- Docker Swarm Services: https://docs.docker.com/engine/swarm/services/
- Docker Volumes: https://docs.docker.com/storage/volumes/
- Multi-stage builds: https://docs.docker.com/build/building/multi-stage/

### Nginx
- Serving static content: https://nginx.org/en/docs/beginners_guide.html
- Reverse proxy setup: https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/

### Vite (Frontend build tool)
- Build for production: https://vitejs.dev/guide/build.html
- Preview build locally: `npm run preview` (porta 4173)

### React + Docker
- https://blog.logrocket.com/dockerizing-react-app/
- https://mherman.org/blog/dockerizing-a-react-app/

---

## 🎯 OBJETIVO DA PRÓXIMA SESSÃO (RESUMO)

1. **Descobrir** como frontend está deployado atualmente
2. **Atualizar** arquivos do frontend em produção
3. **Validar** que usuário vê mudanças (validação de data na agenda)
4. **Documentar** processo de deploy para futuras sessões

**Critério de sucesso:**
- ✅ Usuário abre formulário de editar agendamento
- ✅ Usuário vê que não pode selecionar data no passado
- ✅ Campo de data tem atributo `min` definido
- ✅ Processo de deploy documentado

---

## 📊 ARQUIVOS AFETADOS NA SESSÃO ANTERIOR

### Frontend (1 arquivo):
- `frontend/src/pages/AgendaPage.tsx` - Linha 934 modificada

### Backend (8 arquivos):
- `backend/src/modules/financeiro/purchase-order.controller.ts`
- `backend/src/modules/financeiro/transaction.controller.ts`
- `backend/src/modules/financeiro/cash-flow.controller.ts`
- `backend/src/modules/financeiro/invoice.controller.ts`
- `backend/src/modules/chat/waha-session.controller.ts`
- `backend/src/modules/pacientes/controllers/patient.controller.ts`
- `backend/src/modules/leads/lead.controller.ts`
- `backend/src/modules/vendas/vendas.controller.ts`

### Build artifacts:
- `frontend/dist/*` - **GERADO MAS NÃO DEPLOYADO**
- Docker image: `nexus_backend:latest` (SHA: 529427cf3649) - **DEPLOYADO**

---

## 🚀 COMANDOS RÁPIDOS (COPY-PASTE)

### Descoberta inicial:
```bash
# Ver todos os serviços
docker service ls

# Ver containers
docker ps -a | grep nexus

# Ver estrutura do projeto
ls -la /root/nexusatemporalv1/

# Procurar docker-compose
find /root/nexusatemporalv1 -name "docker-compose*.yml"

# Ver portas em uso
netstat -tlnp | grep -E "80|3000|8080"
```

### Se encontrar nexus_frontend:
```bash
# Build frontend
cd /root/nexusatemporalv1/frontend
docker build -t nexus_frontend:latest .

# Deploy
docker service update --image nexus_frontend:latest nexus_frontend

# Verificar
docker service ps nexus_frontend
docker service logs nexus_frontend --tail 50
```

### Testar após deploy:
```bash
# Testar endpoint
curl -I http://localhost

# Ver HTML
curl http://localhost | head -50

# Ver se tem JavaScript correto
curl http://localhost/index.html | grep -o "AgendaPage"
```

---

## ⚡ MENSAGEM PARA O DESENVOLVEDOR

**BEM-VINDO DE VOLTA!**

Você está retomando uma sessão onde **TODO O CÓDIGO FOI CORRIGIDO**, mas o **FRONTEND NÃO FOI DEPLOYADO**.

**O que sabemos:**
- ✅ Backend funcionando (13 bugs de userId corrigidos)
- ✅ Frontend compilado (`npm run build` executado)
- ❌ Frontend NÃO está visível ao usuário

**Sua missão:**
1. Descobrir como frontend é servido
2. Atualizar arquivos em produção
3. Validar que funciona

**Não entre em pânico:** O código está correto. É apenas questão de deployment.

**Comece por aqui:**
```bash
docker service ls
```

Boa sorte! 🚀

---

**Criado em:** 06/11/2025 20:30
**Atualizado por:** Claude Code (Anthropic)
**Próxima ação:** Investigar arquitetura de deploy do frontend
