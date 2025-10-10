# 📦 GitHub Releases - Guia Completo

Este documento explica como gerenciar releases no GitHub para o projeto Nexus Atemporal.

---

## 🎯 Releases Criadas

Até a data **2025-10-10**, as seguintes releases foram criadas:

| Versão | Título | Status | Data | Link |
|--------|--------|--------|------|------|
| v31.2 | WhatsApp Envio de Mensagens - FUNCIONANDO 100% ✅ | **Latest** | 2025-10-10 | [v31.2](https://github.com/Magdiel-caim/nexusatemporal/releases/tag/v31.2) |
| v31.1 | Melhorias UX WhatsApp - Nomes Amigáveis, Desconectar e Reconectar | - | 2025-10-10 | [v31.1](https://github.com/Magdiel-caim/nexusatemporal/releases/tag/v31.1) |
| v30.3 | Integração WhatsApp via N8N + WAHA - QR Code Funcionando | - | 2025-10-10 | [v30.3](https://github.com/Magdiel-caim/nexusatemporal/releases/tag/v30.3) |
| v30 | Chat/WhatsApp + Correções Críticas + Sistema de Backup | - | 2025-10-10 | [v30](https://github.com/Magdiel-caim/nexusatemporal/releases/tag/v30) |
| v29 | Branding Visual Completo | - | 2025-10-08 | [v29](https://github.com/Magdiel-caim/nexusatemporal/releases/tag/v29) |

---

## 📋 Como Criar uma Release

### Pré-requisitos

1. ✅ Código commitado no Git
2. ✅ Tag criada (`git tag -a vX.X -m "mensagem"`)
3. ✅ Tag enviada para GitHub (`git push origin vX.X`)
4. ✅ GitHub CLI instalado (`gh`)

### Passo a Passo

#### 1. Criar Tag Local

```bash
# Criar tag anotada
git tag -a v31.2 -m "v31.2: Descrição curta da versão"

# Verificar tag criada
git tag --sort=-v:refname | head -5
```

#### 2. Enviar Tag para GitHub

```bash
# Enviar tag específica
git push origin v31.2

# OU enviar todas as tags
git push origin --tags
```

#### 3. Criar Release no GitHub

```bash
gh release create v31.2 \
  --title "v31.2: Título da Release" \
  --notes "Descrição detalhada da release em Markdown"
```

**Exemplo com arquivo de notas:**

```bash
gh release create v31.2 \
  --title "v31.2: WhatsApp Funcionando" \
  --notes-file RELEASE_NOTES_v31.2.md
```

#### 4. Marcar como Latest

```bash
gh release edit v31.2 --latest
```

---

## 📝 Template de Notas de Release

Use este template ao criar releases:

```markdown
## 🎯 [Título Principal da Funcionalidade]

**Status:** ✅ [Status final - Ex: FUNCIONANDO 100%]

### ✨ Funcionalidades Implementadas

#### 1. [Nome da Feature 1] ✅
- ✅ Descrição item 1
- ✅ Descrição item 2
- ✅ Descrição item 3

#### 2. [Nome da Feature 2] ✅
- ✅ Descrição...

### 🐛 Problemas Resolvidos

#### ❌ Problema 1: [Nome do Problema]
**Causa:** [Explicação da causa]
**Solução:** [Como foi resolvido]

#### ❌ Problema 2: [Nome do Problema]
**Causa:** [Explicação]
**Solução:** [Solução aplicada]

### 📁 Arquivos Principais

**Backend:**
- `caminho/arquivo1.ts` (descrição)
- `caminho/arquivo2.ts` (descrição)

**Frontend:**
- `caminho/arquivo1.tsx` (descrição)

### 📦 Deploy

- **Backend:** `nome_imagem:tag`
- **Frontend:** `nome_imagem:tag`

### ✅ Validação

- ✅ Item testado 1
- ✅ Item testado 2
- ✅ Item testado 3

---

**Data:** YYYY-MM-DD
**Commit:** [hash do commit]

🤖 Generated with Claude Code
```

---

## 🔧 Comandos Úteis

### Listar Releases

```bash
# Listar últimas 10 releases
gh release list --limit 10

# Ver todas as releases
gh release list
```

### Ver Detalhes de uma Release

```bash
gh release view v31.2
```

### Editar Release

```bash
# Editar título
gh release edit v31.2 --title "Novo Título"

# Editar notas
gh release edit v31.2 --notes "Novas notas"

# Marcar como latest
gh release edit v31.2 --latest

# Marcar como pre-release
gh release edit v31.2 --prerelease
```

### Deletar Release (CUIDADO!)

```bash
# Deletar release (mantém a tag)
gh release delete v31.2

# Deletar release e tag
gh release delete v31.2 --yes
git push origin :refs/tags/v31.2  # Deletar tag no remoto
git tag -d v31.2                   # Deletar tag local
```

### Adicionar Assets a uma Release

```bash
# Adicionar arquivo à release
gh release upload v31.2 backup.sql

# Adicionar múltiplos arquivos
gh release upload v31.2 backup.sql docs.pdf changelog.md
```

---

## 🎯 Boas Práticas

### 1. Versionamento Semântico

Use o formato `vMAJOR.MINOR.PATCH`:

- **MAJOR (v2.0.0):** Mudanças incompatíveis com versões anteriores
- **MINOR (v1.1.0):** Novas funcionalidades compatíveis
- **PATCH (v1.0.1):** Correções de bugs

**Exemplos do projeto:**
- `v31.2` → Minor version 31, patch 2
- `v30.3` → Minor version 30, patch 3

### 2. Documentação Completa

Cada release deve incluir:

- ✅ Título descritivo
- ✅ Resumo executivo (1-2 linhas)
- ✅ Lista de funcionalidades implementadas
- ✅ Problemas corrigidos
- ✅ Arquivos modificados principais
- ✅ Informações de deploy
- ✅ Como testar/validar

### 3. Tags Consistentes

```bash
# ✅ BOM - Formato consistente
v31.2
v31.1
v30.3

# ❌ RUIM - Formatos inconsistentes
v31.2
version-31-1
release_30.3
```

### 4. Marcar Latest

Sempre marque a versão mais recente como "Latest":

```bash
gh release edit v31.2 --latest
```

### 5. Pre-releases para Testes

Use pre-releases para versões em teste:

```bash
gh release create v32.0-beta \
  --title "v32.0-beta: Nova Feature em Teste" \
  --notes "Versão beta para testes..." \
  --prerelease
```

---

## 📊 Workflow Recomendado

### Para Cada Nova Versão:

1. **Desenvolver e Testar**
   ```bash
   # Fazer mudanças no código
   # Testar localmente
   # Atualizar CHANGELOG.md
   ```

2. **Commit e Tag**
   ```bash
   git add .
   git commit -m "v31.2: Descrição das mudanças"
   git tag -a v31.2 -m "v31.2: WhatsApp Envio Funcionando"
   ```

3. **Push**
   ```bash
   git push origin main
   git push origin v31.2
   ```

4. **Criar Release**
   ```bash
   gh release create v31.2 \
     --title "v31.2: WhatsApp Envio de Mensagens" \
     --notes-file RELEASE_NOTES.md \
     --latest
   ```

5. **Backup (Opcional)**
   ```bash
   # Fazer backup do banco de dados
   # Upload para S3
   ```

6. **Verificar**
   ```bash
   gh release list
   # Verificar no GitHub web
   ```

---

## 🔗 Links Úteis

- **Repositório:** https://github.com/Magdiel-caim/nexusatemporal
- **Releases:** https://github.com/Magdiel-caim/nexusatemporal/releases
- **Docs GitHub CLI:** https://cli.github.com/manual/gh_release
- **Versionamento Semântico:** https://semver.org/

---

## ❓ FAQ

### Como ver qual release está em produção?

```bash
# Ver última release
gh release list --limit 1

# Ver releases marcadas como Latest
gh release list | grep Latest
```

### Como reverter para uma versão anterior?

```bash
# Fazer checkout da tag
git checkout v30.3

# Ou criar branch a partir da tag
git checkout -b hotfix-v30.3 v30.3

# Deploy da versão antiga
docker service update nexus_backend --image nexus_backend:v30.3
```

### Como deletar uma release sem deletar a tag?

```bash
# Deletar apenas a release
gh release delete v31.2

# Tag permanece no Git
git tag  # v31.2 ainda aparece
```

### Como renomear uma release?

```bash
# Não é possível renomear diretamente
# Solução: Editar o título
gh release edit v31.2 --title "Novo Título"
```

---

## 📝 Histórico deste Documento

- **2025-10-10:** Criação inicial do documento
- **Versões documentadas:** v29, v30, v30.3, v31.1, v31.2

---

**Última atualização:** 2025-10-10
**Mantido por:** Claude Code + Magdiel Caim
