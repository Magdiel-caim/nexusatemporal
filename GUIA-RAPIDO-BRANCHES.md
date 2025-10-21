# Guia Rápido - Trabalho com Branches

## Status Atual
```
✓ Branch criada: feature/chat-improvements (para outra sessão)
✓ Branch criada: feature/leads-procedures-config (esta sessão - ativa)
✓ Você está em: feature/leads-procedures-config
```

---

## Comandos Rápidos

### Ver em qual branch você está
```bash
git branch
```

### Trocar de branch
```bash
# Para trabalhar no Chat (outra sessão)
git checkout feature/chat-improvements

# Para trabalhar em Leads/Config (esta sessão)
git checkout feature/leads-procedures-config

# Voltar para main
git checkout main
```

### Ver o que foi modificado
```bash
git status
```

### Fazer commit das suas mudanças
```bash
# 1. Adicionar arquivos da SUA área
git add backend/src/modules/leads/
git add backend/src/modules/config/
git add backend/src/modules/auth/

# 2. Commit com mensagem descritiva
git commit -m "feat: melhorias em leads e configurações"

# 3. Push para o servidor (se quiser backup)
git push origin feature/leads-procedures-config
```

---

## Workflow Completo

### 1. Trabalhar na sua branch
```bash
# Já está aqui!
git checkout feature/leads-procedures-config

# Fazer suas modificações...
# Testar...

# Commit frequente
git add [seus-arquivos]
git commit -m "feat: descrição"
```

### 2. Quando a outra sessão terminar
```bash
# Na outra aba/sessão (Chat)
git checkout feature/chat-improvements
git add [arquivos-do-chat]
git commit -m "feat: melhorias no chat"
```

### 3. Merge final (quando AMBAS terminarem)
```bash
# Voltar para main
git checkout main

# Merge da primeira feature
git merge feature/chat-improvements

# Merge da segunda feature
git merge feature/leads-procedures-config

# Se houver conflitos, resolver e depois:
git add [arquivos-resolvidos]
git commit -m "merge: integração das features"

# Push final
git push origin main
```

---

## Dicas de Segurança

### Antes de fazer merge
```bash
# Garantir que está tudo commitado
git status

# Ver diferenças entre branches
git diff main..feature/leads-procedures-config
git diff main..feature/chat-improvements
```

### Se der conflito no merge
```bash
# Ver quais arquivos têm conflito
git status

# Editar os arquivos e resolver manualmente
# Procurar por <<<<<<< HEAD

# Depois de resolver
git add [arquivo-resolvido]
git commit -m "merge: resolve conflicts"
```

### Backup antes de merge
```bash
# Criar tag de backup
git tag backup-pre-merge
git push origin backup-pre-merge

# Se der problema, voltar
git reset --hard backup-pre-merge
```

---

## Mapeamento Sessão → Branch

| Sessão | Branch | Foco |
|--------|--------|------|
| **Outra aba** | `feature/chat-improvements` | Chat, WhatsApp, Mídias S3 |
| **Esta aba** | `feature/leads-procedures-config` | Leads, Pipelines, Config, Auth |

---

## Checklist Antes de Merge

- [ ] Todas as mudanças commitadas em ambas as branches
- [ ] Build funcionando em cada branch (`npm run build`)
- [ ] Testes passando (se houver)
- [ ] Backup criado (`git tag backup-pre-merge`)
- [ ] Resolver conflitos (se houver)
- [ ] Testar sistema completo após merge

---

## Consulta Rápida

```bash
# Onde estou?
git branch

# O que mudei?
git status

# Trocar de contexto
git checkout [branch-name]

# Commit rápido
git add . && git commit -m "mensagem"

# Ver todas as branches
git branch -a
```
