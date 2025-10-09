# 🆘 TROUBLESHOOTING - NEXUS ATEMPORAL

## 📋 Registro de Problemas Críticos e Soluções

Este arquivo documenta problemas críticos enfrentados no sistema e como foram resolvidos.

---

## 🔴 PROBLEMA CRÍTICO #1: PERDA TOTAL DE DADOS APÓS DEPLOY

**Data:** 2025-10-08
**Severidade:** CRÍTICA 🚨
**Versão Afetada:** v29 → v30

### Descrição do Problema

Após deploy da versão v30 (módulo Chat/WhatsApp), houve perda total de acesso ao sistema:
- ❌ Banco de dados completamente vazio
- ❌ Todos os usuários perdidos
- ❌ Todos os leads perdidos
- ❌ Todos os pipelines perdidos
- ❌ Todas as atividades perdidas

**Sintoma relatado pelo usuário:**
> "perdi o acesso total ao meu sistema"

### Causa Raiz

O `docker-compose.yml` foi atualizado criando um **novo volume PostgreSQL vazio** ao invés de usar o volume existente com dados:

```yaml
# ❌ ERRADO - Cria volume novo e vazio
volumes:
  postgres_data:

# ✅ CORRETO - Usa volume externo com dados existentes
volumes:
  postgres_data:
    external: true
    name: nexusatemporal_postgres_data
```

### Solução Aplicada

#### 1️⃣ Identificar Volume Antigo com Dados

```bash
docker volume ls | grep postgres
```

**Resultado:** Volume `nexusatemporal_postgres_data` continha os dados

#### 2️⃣ Atualizar docker-compose.yml

**Arquivo:** `/root/nexusatemporal/docker-compose.yml`

```yaml
volumes:
  postgres_data:
    external: true
    name: nexusatemporal_postgres_data  # Volume com dados existentes
  redis_data:
  rabbitmq_data:
```

#### 3️⃣ Resolver Conflito de Senha PostgreSQL

O volume antigo tinha senha diferente da configurada. Solução:

```bash
# Criar container temporário com autenticação confiável
docker run --rm -v nexusatemporal_postgres_data:/var/lib/postgresql/data \
  -e POSTGRES_HOST_AUTH_METHOD=trust \
  -e POSTGRES_USER=nexus_admin \
  -d --name temp_postgres postgres:16-alpine

# Aguardar inicialização
sleep 5

# Resetar senha
docker exec temp_postgres psql -U nexus_admin -d postgres \
  -c "ALTER USER nexus_admin WITH PASSWORD '6uyJZdc0xsCe7ymief3x2Izi9QubcTYP';"

# Remover container temporário
docker stop temp_postgres
```

#### 4️⃣ Resolver Conflito de Múltiplos PostgreSQL

Descoberto que haviam **2 serviços PostgreSQL** rodando simultaneamente:
- `postgres_postgres` (antigo)
- `nexus_postgres` (novo)

```bash
# Verificar serviços
docker service ls | grep postgres

# Parar serviço conflitante
docker service scale postgres_postgres=0
```

#### 5️⃣ Redeploy com Volume Correto

```bash
docker stack rm nexus
sleep 10
docker stack deploy -c docker-compose.yml nexus
```

### Resultado

✅ **Sistema totalmente recuperado**
✅ Todos os usuários restaurados
✅ Todos os leads restaurados
✅ Todos os dados preservados

### Lição Aprendida

**SEMPRE fazer backup antes de deploy!**

Foi criado sistema automático de backup em `/root/nexusatemporal/scripts/`:
- `backup-database.sh` - Backup manual
- `pre-deploy.sh` - Verificações + backup obrigatório
- `deploy.sh` - Deploy seguro (aborta se backup falhar)

**Documentação:** Ver `/root/nexusatemporal/BACKUP.md`

---

## 🔴 PROBLEMA CRÍTICO #2: LOGIN TRAVANDO APÓS CORREÇÃO DO BANCO

**Data:** 2025-10-08
**Severidade:** CRÍTICA 🚨
**Versão Afetada:** v30

### Descrição do Problema

Após recuperar o banco de dados, o login parou de funcionar:
- ❌ Senha correta retornava "Invalid credentials"
- ❌ Resetar senha manualmente no banco não funcionava
- ❌ Senha voltava a mudar sozinha após tentativa de login
- ❌ Rate limiting bloqueava após múltiplas tentativas

**Sintomas relatados pelo usuário:**
> "erro ao fazer o login"
> "infelizmente não esta funcionando"
> "não agora nem a mensagem esta aparecendo"

### Causa Raiz

O hook `@BeforeUpdate()` no arquivo **user.entity.ts** estava **RE-HASHANDO a senha** toda vez que o usuário fazia login!

**Arquivo:** `/root/nexusatemporal/backend/src/modules/auth/user.entity.ts`

```typescript
// ❌ CÓDIGO COM BUG
@BeforeUpdate()
async hashPassword() {
  if (this.password && !this.password.startsWith('$2a$')) {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    this.password = await bcrypt.hash(this.password, rounds);
  }
}
```

**Por que acontecia:**
1. Usuário faz login com sucesso
2. Sistema atualiza `lastLoginAt` e `lastLoginIp` no banco
3. Isso triggera o hook `@BeforeUpdate()`
4. O hook verifica se senha começa com `$2a$`
5. Se a senha foi setada com `$2y$` ou outro formato → **RE-HASH!**
6. Próximo login: senha está diferente → FALHA!

### Solução Aplicada

Atualizar o hook para aceitar **todos os formatos válidos de bcrypt**:

**Arquivo:** `/root/nexusatemporal/backend/src/modules/auth/user.entity.ts:97-111`

```typescript
// ✅ CÓDIGO CORRIGIDO
@BeforeInsert()
@BeforeUpdate()
async hashPassword() {
  // Accept both $2a$ (bcryptjs) and $2y$ (bcrypt) formats
  const isAlreadyHashed = this.password && (
    this.password.startsWith('$2a$') ||
    this.password.startsWith('$2y$') ||
    this.password.startsWith('$2b$')
  );

  if (this.password && !isAlreadyHashed) {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    this.password = await bcrypt.hash(this.password, rounds);
  }
}
```

### Formatos de Bcrypt Aceitos

| Prefixo | Origem | Compatibilidade |
|---------|--------|-----------------|
| `$2a$` | bcryptjs (Node.js) | ✅ Usado pelo backend |
| `$2y$` | bcrypt (PHP/htpasswd) | ✅ Compatível |
| `$2b$` | bcrypt moderno | ✅ Compatível |

### Como Resetar Senha Corretamente

**NUNCA use htpasswd ou métodos externos!** Sempre use o próprio bcryptjs do backend:

```bash
# 1. Gerar hash usando bcryptjs do container
docker exec $(docker ps -q -f name=nexus_backend) node -e "
const bcrypt = require('bcryptjs');
bcrypt.hash('SUA_SENHA_AQUI', 12).then(hash => {
  console.log('HASH:', hash);
});
"

# 2. Atualizar no banco
docker exec $(docker ps -q -f name=nexus_postgres) \
  psql -U nexus_admin -d nexus_master \
  -c "UPDATE users SET password = 'HASH_GERADO_AQUI' WHERE email = 'email@exemplo.com';"

# 3. Testar login via API
curl -X POST "https://api.nexusatemporal.com.br/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"email@exemplo.com","password":"SUA_SENHA_AQUI"}' \
  -k -s | python3 -m json.tool
```

### Resolver Rate Limiting (Se Bloqueado)

Se após múltiplas tentativas aparecer "Too many authentication attempts":

```bash
# Limpar cache do Redis
docker exec $(docker ps -q -f name=nexus_redis) \
  redis-cli -a 86Bj2r94OyfxdVqklbvKNAiSVgYRJvUg FLUSHALL

# Reiniciar backend para limpar rate limit em memória
docker service update --force nexus_backend
```

### Resultado

✅ **Login funcionando perfeitamente**
✅ Senha não muda mais após login
✅ Todos os formatos bcrypt aceitos

**Credenciais atuais:**
- Email: teste@nexusatemporal.com.br
- Senha: 123456

---

## 📚 CHECKLIST DE DEPLOY SEGURO

Antes de QUALQUER deploy, **SEMPRE**:

- [ ] ✅ Executar `/root/nexusatemporal/scripts/deploy.sh` (faz backup automático)
- [ ] ✅ Verificar backup local em `/root/nexusatemporal/backups/`
- [ ] ✅ Verificar backup remoto no IDrive E2
- [ ] ✅ Confirmar que `docker-compose.yml` usa volumes externos
- [ ] ✅ Testar login após deploy
- [ ] ✅ Verificar logs: `docker service logs nexus_backend`

---

## 🔧 COMANDOS ÚTEIS DE DIAGNÓSTICO

### Verificar Volumes
```bash
docker volume ls | grep nexus
docker volume inspect nexusatemporal_postgres_data
```

### Verificar Serviços
```bash
docker service ls
docker service ps nexus_postgres
docker service logs nexus_backend --tail 50
```

### Verificar Banco de Dados
```bash
# Conectar ao PostgreSQL
docker exec -it $(docker ps -q -f name=nexus_postgres) psql -U nexus_admin -d nexus_master

# Listar usuários
SELECT id, email, name, role, status FROM users;

# Verificar hash da senha
SELECT email, substring(password, 1, 30) as password_hash FROM users WHERE email = 'teste@nexusatemporal.com.br';

# Verificar tamanho do banco
SELECT pg_size_pretty(pg_database_size('nexus_master'));
```

### Verificar Backups
```bash
# Backups locais
ls -lht /root/nexusatemporal/backups/ | head -10

# Backups no IDrive E2
AWS_ACCESS_KEY_ID="ZaIdY59FGaL8BdtRjZtL" \
AWS_SECRET_ACCESS_KEY="wrytdsWINH8tXbedBl4LaxmvSDGqnbsZCFQP6iyj" \
aws s3 ls s3://onenexus/backups/database/ \
  --endpoint-url https://c1k7.va.idrivee2-46.com \
  --no-verify-ssl
```

---

## 🆘 CONTATOS DE EMERGÊNCIA

Em caso de problemas críticos:

1. **Backup Automático:** `bash /root/nexusatemporal/scripts/backup-database.sh`
2. **Deploy Seguro:** `bash /root/nexusatemporal/scripts/deploy.sh`
3. **Documentação:** `/root/nexusatemporal/BACKUP.md`
4. **Logs:** `docker service logs nexus_backend --follow`

---

**Última atualização:** 2025-10-08
**Versão do sistema:** v30
**Status:** ✅ Todos os problemas resolvidos
