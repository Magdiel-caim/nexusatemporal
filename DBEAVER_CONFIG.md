# 🗄️ CONFIGURAÇÃO DBEAVER - NEXUS ATEMPORAL

## 📋 Informações de Conexão

### Credenciais PostgreSQL:
```
Host/Server: 72.60.5.29
Porta: 5432
Database: nexus_master
Username: nexus_admin
Password: 6uyJZdc0xsCe7ymief3x2Izi9QubcTYP
```

---

## 🚀 Como Configurar no DBeaver

### Passo 1: Abrir DBeaver
1. Abra o DBeaver na sua máquina
2. Clique em **"Banco de Dados"** → **"Nova Conexão"** (ou clique no ícone de plug com +)

### Passo 2: Selecionar PostgreSQL
1. Na janela "Conectar ao banco de dados", procure por **PostgreSQL**
2. Clique em **PostgreSQL** e depois em **"Próximo"**

### Passo 3: Configurar Conexão
Preencha os campos com as seguintes informações:

#### Aba "Main" (Principal):
```
┌─────────────────────────────────────────┐
│ Host:         72.60.5.29                │
│ Porta:        5432                      │
│ Database:     nexus_master              │
│ Username:     nexus_admin               │
│ Password:     6uyJZdc0xsCe7ymief3x2Izi9QubcTYP │
└─────────────────────────────────────────┘
```

- **Marque a opção:** ☑️ "Salvar senha localmente" (opcional, mas recomendado)

#### Aba "PostgreSQL" (Opcional):
- Deixe as configurações padrão

#### Aba "SSH" (NÃO NECESSÁRIO):
- Não precisa configurar SSH, a porta já está exposta publicamente

### Passo 4: Testar Conexão
1. Clique no botão **"Testar Conexão"** (Test Connection)
2. Se for a primeira vez conectando a um PostgreSQL:
   - O DBeaver irá **baixar os drivers automaticamente**
   - Clique em **"Download"** quando solicitado
   - Aguarde o download dos drivers PostgreSQL

3. **Resultado esperado:**
   ```
   ✅ Connected
   Server: PostgreSQL 16.x
   Driver: PostgreSQL JDBC Driver
   ```

### Passo 5: Finalizar
1. Se o teste passou, clique em **"Concluir"** ou **"Finish"**
2. A conexão será criada e você verá:
   - **nexus_master** na árvore de conexões à esquerda
   - Expanda para ver: **Schemas → public → Tables**

---

## 🗂️ Estrutura do Banco de Dados

Ao conectar, você terá acesso às seguintes tabelas principais:

### Tabelas do Sistema:
- `users` - Usuários do sistema
- `leads` - Leads/Clientes
- `procedures` - Procedimentos/Serviços
- `pipelines` - Funis de vendas
- `pipeline_stages` - Etapas dos funis
- `chat_messages` - Mensagens WhatsApp
- `activities` - Atividades/Tarefas
- `contacts` - Contatos

### Para visualizar as tabelas:
1. Expanda a conexão "nexus_master"
2. Expanda "Schemas"
3. Expanda "public"
4. Expanda "Tables"
5. Clique com botão direito em qualquer tabela → "Ver Dados" (View Data)

---

## 🔍 Queries Úteis

### Ver total de leads:
```sql
SELECT COUNT(*) as total_leads FROM leads;
```

### Ver leads por pipeline:
```sql
SELECT p.name as pipeline, COUNT(l.id) as total_leads
FROM leads l
JOIN pipelines p ON l.pipeline_id = p.id
GROUP BY p.name
ORDER BY total_leads DESC;
```

### Ver últimas mensagens WhatsApp:
```sql
SELECT
    phone_number,
    direction,
    content,
    created_at
FROM chat_messages
ORDER BY created_at DESC
LIMIT 20;
```

### Ver usuários do sistema:
```sql
SELECT id, email, role, created_at
FROM users
ORDER BY created_at DESC;
```

---

## ⚠️ IMPORTANTE - Segurança

### ✅ Boas Práticas:
1. **NÃO compartilhe as credenciais** do banco de dados
2. **Use apenas para consultas** quando estiver aprendendo
3. **SEMPRE faça backup antes** de alterar dados (já configurado automaticamente)
4. **Evite executar comandos `DELETE` ou `DROP`** sem ter certeza absoluta

### 🔐 Recomendações:
- Para **consultas (SELECT)**: Totalmente seguro
- Para **alterações (UPDATE)**: Use com cuidado, SEMPRE adicione `WHERE`
- Para **exclusões (DELETE)**: **MUITO CUIDADO**, sempre use `WHERE` e teste com `SELECT` antes

### Exemplo seguro de UPDATE:
```sql
-- ❌ ERRADO (atualiza TODOS os registros):
UPDATE leads SET status = 'active';

-- ✅ CORRETO (atualiza apenas um registro específico):
UPDATE leads SET status = 'active' WHERE id = '123-abc-456';

-- 💡 MELHOR PRÁTICA: Sempre teste com SELECT antes:
SELECT * FROM leads WHERE id = '123-abc-456';  -- Verifica ANTES
UPDATE leads SET status = 'active' WHERE id = '123-abc-456';  -- Atualiza
```

---

## 🔧 Troubleshooting

### Erro: "Connection refused" ou "Timeout"
**Causa:** Firewall bloqueando porta 5432
**Solução:**
```bash
# No servidor, execute:
sudo ufw allow 5432/tcp
sudo ufw reload
```

### Erro: "password authentication failed"
**Causa:** Senha incorreta
**Solução:**
- Verifique se copiou a senha correta (sem espaços extras):
  ```
  6uyJZdc0xsCe7ymief3x2Izi9QubcTYP
  ```

### Erro: "database 'nexus_master' does not exist"
**Causa:** Conectou ao banco errado
**Solução:**
- Certifique-se de que o campo "Database" está preenchido com: `nexus_master`

### Erro: "Driver not found"
**Causa:** Drivers PostgreSQL não instalados
**Solução:**
- Ao testar conexão, clique em "Download" quando o DBeaver solicitar
- Aguarde o download completar e teste novamente

---

## 📊 Configurações Adicionais (Opcional)

### Configurar Auto-Commit OFF (Recomendado para segurança):
1. Clique com botão direito na conexão → **"Editar Conexão"**
2. Vá em **"Connection"** → **"Initialization"**
3. Marque: ☑️ **"Auto-commit"** = **OFF**
4. Isso exige que você execute `COMMIT;` manualmente após alterações

### Configurar Limite de Resultados:
1. **DBeaver** → **Preferências** → **Editors** → **Data Editor**
2. **"Result Set Max Rows"**: 1000 (ou outro valor)
3. Isso evita travar ao abrir tabelas muito grandes

---

## 📞 Suporte

### Informações do Servidor:
- **IP Público:** 72.60.5.29
- **Versão PostgreSQL:** 16.x (Alpine)
- **Docker Service:** nexus_postgres
- **Stack:** nexus

### Comandos Úteis (no servidor):
```bash
# Ver logs do PostgreSQL
docker service logs nexus_postgres --tail 50

# Ver status do serviço
docker service ps nexus_postgres

# Verificar porta exposta
netstat -tuln | grep 5432

# Acessar psql direto (no servidor)
docker exec -it $(docker ps -q -f name=nexus_postgres) psql -U nexus_admin -d nexus_master
```

---

**Última atualização:** 2025-10-10
**Versão:** v31

**✅ STATUS: PORTA 5432 EXPOSTA E FUNCIONANDO!**
