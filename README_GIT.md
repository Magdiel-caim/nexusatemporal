# Guia de Configuração Git e GitHub

## Status Atual

✅ Repositório Git inicializado
✅ Branch principal: `main`
✅ .gitignore configurado
✅ .gitattributes configurado (LFS pronto)
✅ Arquivos sensíveis ignorados (.env)
✅ Changelog criado
✅ Documentação de deploy criada

## Próximos Passos

### 1. Revisar Arquivos

Verifique se todos os arquivos que serão commitados são necessários:

```bash
git status
```

**Arquivo para verificar**:
- `prompt/Captura de tela 2025-10-08 140117.png` (116K) - Manter ou remover?

Se quiser remover:
```bash
rm "prompt/Captura de tela 2025-10-08 140117.png"
```

### 2. Primeiro Commit

```bash
# Adicionar todos os arquivos
git add .

# Verificar o que será commitado
git status

# Fazer o primeiro commit
git commit -m "Initial commit: Nexus Atemporal v28

Sistema completo de CRM com:
- Dashboard com KPIs e métricas
- Gestão de Leads com Kanban drag & drop
- Sistema de filtros avançado
- 5 modos de visualização
- Rastreamento de alterações
- Sistema de atividades
- Pipeline customizado
- Integração completa com backend

Stack:
- Frontend: React 18 + TypeScript + Vite
- Backend: Node.js + NestJS
- Database: PostgreSQL 16
- Cache: Redis 7
- Queue: RabbitMQ 3
- Proxy: Traefik v2.10
- Container: Docker + Docker Compose

Versão: v28
"
```

### 3. Criar Repositório no GitHub

**Opção A - Via GitHub CLI**:
```bash
# Instalar GitHub CLI se não tiver
apt install gh -y

# Fazer login
gh auth login

# Criar repositório
gh repo create nexusatemporal --private --source=. --remote=origin --push
```

**Opção B - Manual**:
1. Acesse https://github.com/new
2. Nome do repositório: `nexusatemporal`
3. Descrição: "Sistema CRM completo para clínicas de estética"
4. Privado: ✅
5. NÃO inicialize com README (já temos)
6. Clique em "Create repository"

Depois conectar:
```bash
# Adicionar remote (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/nexusatemporal.git

# Verificar
git remote -v

# Push inicial
git push -u origin main
```

### 4. Configurar Git LFS (Opcional mas Recomendado)

Para arquivos grandes (PDFs, imagens):

```bash
# Instalar Git LFS
apt install git-lfs -y

# Inicializar no repositório
git lfs install

# Verificar tracking (já configurado via .gitattributes)
git lfs track

# Migrar arquivos existentes
git lfs migrate import --include="*.pdf,*.png,*.jpg"

# Commit das alterações do LFS
git add .gitattributes
git commit -m "Configure Git LFS for large files"

# Push
git push
```

### 5. Proteger Branch Main

No GitHub:
1. Settings → Branches
2. Add rule
3. Branch name pattern: `main`
4. Protect matching branches:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Include administrators

### 6. Configurar GitHub Actions (CI/CD)

Criar arquivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /root/nexusatemporal
            git pull origin main
            docker compose build
            docker compose up -d
```

Configurar secrets no GitHub:
- Settings → Secrets and variables → Actions
- Add: `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`

## Workflow de Desenvolvimento

### Branches

```bash
# Criar branch para nova feature
git checkout -b feature/nome-da-feature

# Trabalhar na feature...
git add .
git commit -m "feat: descrição da feature"

# Push da branch
git push -u origin feature/nome-da-feature

# Criar Pull Request no GitHub
# Após aprovação, merge para main
```

### Convenção de Commits

Use commits semânticos:

```bash
feat: Nova funcionalidade
fix: Correção de bug
docs: Documentação
style: Formatação de código
refactor: Refatoração
perf: Melhoria de performance
test: Testes
chore: Tarefas gerais
```

Exemplos:
```bash
git commit -m "feat: adiciona filtro de busca por procedimento"
git commit -m "fix: corrige abertura de modal ao arrastar card"
git commit -m "docs: atualiza CHANGELOG com versão v28"
git commit -m "chore: atualiza versão do frontend para v29"
```

### Tags de Versão

```bash
# Criar tag
git tag -a v28 -m "Versão 28: Fix drag & drop"

# Push da tag
git push origin v28

# Listar tags
git tag -l

# Ver detalhes de uma tag
git show v28
```

## Backup Secundário

### GitHub como Backup Principal
- Commits regulares
- Tags de versão
- Branches de desenvolvimento

### Backup Local Adicional

```bash
# Criar bundle (backup completo do repo)
git bundle create nexus-backup-$(date +%Y%m%d).bundle --all

# Restaurar de bundle
git clone nexus-backup-20251008.bundle nexusatemporal-restored
```

### Backup Remoto Adicional (GitLab/Bitbucket)

```bash
# Adicionar remote secundário
git remote add gitlab https://gitlab.com/usuario/nexusatemporal.git

# Push para múltiplos remotes
git push origin main
git push gitlab main
```

## Arquivos Importantes

### Sempre Commitar
- ✅ Código fonte (`frontend/`, `backend/`)
- ✅ Configurações Docker (`docker-compose*.yml`, `Dockerfile`)
- ✅ Documentação (`*.md`, `prompt/*.pdf`)
- ✅ Scripts (`scripts/`)
- ✅ Exemplo de .env (`.env.example`)

### NUNCA Commitar
- ❌ Variáveis de ambiente reais (`.env`)
- ❌ node_modules
- ❌ Build artifacts (`dist/`, `build/`)
- ❌ Logs (`*.log`)
- ❌ Dados sensíveis (senhas, chaves API)
- ❌ Arquivos de IDE (`.vscode/`, `.idea/`)
- ❌ Backups de banco de dados

## Verificação de Segurança

Antes de cada push:

```bash
# Verificar se não há secrets expostos
git diff

# Usar ferramenta de detecção de secrets
# Instalar: pip install detect-secrets
detect-secrets scan > .secrets.baseline

# Verificar histórico
git log --all --full-history --source -- .env
```

## Estatísticas

```bash
# Ver tamanho do repositório
git count-objects -vH

# Ver contribuições
git shortlog -sn

# Ver histórico visual
git log --graph --oneline --all
```

## Limpeza

```bash
# Limpar branches mergeadas
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d

# Limpar refs antigas
git gc --aggressive --prune=now

# Ver o que ocupando espaço
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | sort -k3 -n | tail -20
```

## Comandos Úteis

```bash
# Status resumido
git status -s

# Histórico resumido
git log --oneline -10

# Ver diferenças
git diff
git diff --cached  # Staged changes

# Desfazer último commit (mantém alterações)
git reset --soft HEAD~1

# Desfazer alterações não commitadas
git restore arquivo.txt
git restore .

# Ver quem alterou cada linha
git blame frontend/src/App.tsx

# Buscar no histórico
git log --all --grep="filtro"
git log -S "DraggableLeadCard"
```

---

## Checklist Pré-Push

- [ ] Código testado localmente
- [ ] Build funcionando
- [ ] Sem secrets no código
- [ ] CHANGELOG atualizado
- [ ] Versão incrementada (se aplicável)
- [ ] Commit message descritivo
- [ ] Branch atualizada com main

## Recursos

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com)
- [Git LFS](https://git-lfs.github.com/)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Criado em**: 2025-10-08
**Versão atual**: v28
