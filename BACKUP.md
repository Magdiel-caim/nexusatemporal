# 🔒 SISTEMA DE BACKUP AUTOMÁTICO - NEXUS ATEMPORAL

## 📋 Visão Geral

Sistema de backup automático do banco de dados PostgreSQL com upload para IDrive E2 (S3 compatible).

**IMPORTANTE:** 🚨 **SEMPRE execute backup antes de qualquer deploy!**

---

## 📁 Estrutura de Arquivos

```
/root/nexusatemporal/
├── backups/                    # Backups locais (mantidos por 7 dias)
│   └── nexus_backup_YYYYMMDD_HHMMSS.sql.gz
├── scripts/
│   ├── backup-database.sh      # Script de backup manual
│   ├── pre-deploy.sh           # Verificações pré-deploy (inclui backup)
│   └── deploy.sh               # Deploy completo com backup automático
```

---

## 🚀 Como Usar

### 1. Backup Manual

Para fazer backup manualmente a qualquer momento:

```bash
bash /root/nexusatemporal/scripts/backup-database.sh
```

**O que acontece:**
1. ✅ Cria backup do PostgreSQL (nexus_master)
2. ✅ Compacta com gzip
3. ✅ Salva localmente em `/root/nexusatemporal/backups/`
4. ☁️ Envia para IDrive E2 (se AWS CLI instalado)
5. 🗑️ Remove backups locais com +7 dias

### 2. Deploy Seguro (Com Backup Automático)

**SEMPRE use este comando para deploy:**

```bash
bash /root/nexusatemporal/scripts/deploy.sh
```

**Fluxo do deploy:**
1. 🔒 **Faz backup automático do banco** (obrigatório)
2. 🔍 Verifica serviços críticos
3. 🔨 Builda imagens Docker
4. 🚢 Faz deploy no Docker Swarm
5. ✅ Verifica status dos serviços

**Se o backup falhar, o deploy é ABORTADO automaticamente!**

### 3. Pré-Deploy (Apenas Verificações)

Para rodar apenas verificações sem fazer deploy:

```bash
bash /root/nexusatemporal/scripts/pre-deploy.sh
```

---

## ☁️ Configuração IDrive E2

### Credenciais Configuradas:

- **Endpoint:** https://o0m5.va.idrivee2-26.com
- **Bucket:** backupsistemaonenexus
- **Pasta:** backups/database/
- **Access Key:** qFzk5gw00zfSRvj5BQwm
- **Secret Key:** bIxbc653Y9SYXIaPWqxa4SDXR85ehHQQGf0x8wL8

### Instalar AWS CLI (Necessário para Upload):

```bash
# Ubuntu/Debian
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### Testar Conexão com IDrive E2:

```bash
AWS_ACCESS_KEY_ID="qFzk5gw00zfSRvj5BQwm" \
AWS_SECRET_ACCESS_KEY="bIxbc653Y9SYXIaPWqxa4SDXR85ehHQQGf0x8wL8" \
aws s3 ls s3://backupsistemaonenexus/backups/database/ \
  --endpoint-url https://o0m5.va.idrivee2-26.com \
  --no-verify-ssl
```

**Status:** ✅ **FUNCIONANDO** - Backups sendo enviados automaticamente!

---

## 🔄 Restaurar Backup

### Restaurar do Backup Local:

```bash
# 1. Listar backups disponíveis
ls -lh /root/nexusatemporal/backups/

# 2. Descompactar backup desejado
gunzip /root/nexusatemporal/backups/nexus_backup_YYYYMMDD_HHMMSS.sql.gz

# 3. Restaurar no PostgreSQL
docker exec -i $(docker ps -q -f name=nexus_postgres) \
  psql -U nexus_admin -d nexus_master < \
  /root/nexusatemporal/backups/nexus_backup_YYYYMMDD_HHMMSS.sql
```

### Restaurar do IDrive E2:

```bash
# 1. Listar backups disponíveis no IDrive E2
AWS_ACCESS_KEY_ID="qFzk5gw00zfSRvj5BQwm" \
AWS_SECRET_ACCESS_KEY="bIxbc653Y9SYXIaPWqxa4SDXR85ehHQQGf0x8wL8" \
aws s3 ls s3://backupsistemaonenexus/backups/database/ \
  --endpoint-url https://o0m5.va.idrivee2-26.com \
  --no-verify-ssl

# 2. Baixar backup do IDrive E2
AWS_ACCESS_KEY_ID="qFzk5gw00zfSRvj5BQwm" \
AWS_SECRET_ACCESS_KEY="bIxbc653Y9SYXIaPWqxa4SDXR85ehHQQGf0x8wL8" \
aws s3 cp s3://backupsistemaonenexus/backups/database/nexus_backup_YYYYMMDD_HHMMSS.sql.gz \
  /root/nexusatemporal/backups/ \
  --endpoint-url https://o0m5.va.idrivee2-26.com \
  --no-verify-ssl

# 3. Descompactar e restaurar (mesmos comandos acima)
```

---

## 📊 Monitoramento

### Ver Backups Locais:

```bash
ls -lht /root/nexusatemporal/backups/ | head -10
```

### Ver Últimos Backups (com tamanho):

```bash
du -h /root/nexusatemporal/backups/* | tail -10
```

### Espaço em Disco:

```bash
df -h /root/nexusatemporal/backups/
```

---

## ⚙️ Configurações

### Credenciais do PostgreSQL:

```bash
DB_USER="nexus_admin"
DB_NAME="nexus_master"
DB_PASSWORD="6uyJZdc0xsCe7ymief3x2Izi9QubcTYP"
```

### Retenção de Backups:

- **Backups Locais:** 7 dias (removidos automaticamente)
- **Backups IDrive E2:** Configurar lifecycle policy no bucket

---

## 🔐 Segurança

1. ✅ Scripts com permissões executáveis apenas para root
2. ✅ Backups compactados com gzip
3. ✅ Credenciais armazenadas nos scripts (proteger permissões)
4. ✅ Conexão com IDrive E2 via HTTPS
5. ⚠️ **NÃO compartilhar credenciais S3 publicamente**

---

## 📝 Checklist de Deploy

Antes de QUALQUER deploy, certifique-se:

- [ ] Backup foi executado com sucesso
- [ ] Backup local está em `/root/nexusatemporal/backups/`
- [ ] (Opcional) Backup foi enviado para IDrive E2
- [ ] PostgreSQL está rodando
- [ ] Você tem pelo menos 1 backup recente (< 24h)

---

## 🆘 Troubleshooting

### Erro: "Container do PostgreSQL não encontrado"
```bash
docker ps | grep nexus_postgres
# Se não aparecer, inicie: docker service scale nexus_postgres=1
```

### Erro: "aws: command not found"
```bash
# Instalar AWS CLI (ver seção "Instalar AWS CLI" acima)
```

### Erro: "Permission denied"
```bash
chmod +x /root/nexusatemporal/scripts/*.sh
```

### Backup muito grande
```bash
# Verificar tamanho do banco
docker exec $(docker ps -q -f name=nexus_postgres) \
  psql -U nexus_admin -d nexus_master -c \
  "SELECT pg_size_pretty(pg_database_size('nexus_master'));"
```

---

## 📞 Suporte

Em caso de problemas:
1. Verificar logs: `tail -f /root/nexusatemporal/backups/backup.log`
2. Verificar espaço em disco: `df -h`
3. Verificar status do PostgreSQL: `docker service logs nexus_postgres`

---

**Última atualização:** 2025-10-08
**Versão:** v30
