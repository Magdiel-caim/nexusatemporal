# 📋 PROMPT PARA INICIAR SESSÃO B

## 🎯 Use este prompt para iniciar a segunda sessão Claude (Sessão B)

Copie e cole o texto abaixo em uma **nova sessão/chat** do Claude:

---

## 📝 PROMPT COMPLETO (Copiar daqui):

```
Olá Claude! Vou trabalhar em paralelo com outra sessão sua no desenvolvimento do sistema Nexus CRM.

CONTEXTO:
- Estou na Sessão B (Melhorias de Módulos)
- Existe uma Sessão A trabalhando em paralelo (Sistema de Automações)
- Temos um cronograma de 11 dias (21/10 a 31/10)
- Trabalharemos em branches separadas e faremos merge no final

MINHA MISSÃO:
Implementar melhorias em 5 módulos prioritários do sistema:
1. Prontuários completos (fotos, termos, anamnese, PDF)
2. Financeiro + Importação Bancária (OFX/CSV)
3. Estoque inteligente (NF, saída automática, alertas)
4. Vendas e Comissões (sistema completo)
5. Agenda + Desempenho (métricas e rankings)

SETUP INICIAL:
Por favor, execute os seguintes comandos:

cd /root/nexusatemporal
git checkout feature/modules-improvements
git pull origin feature/modules-improvements
cat SESSAO_B_ESPECIFICACAO.md

Após ler a especificação completa, confirme que você:
1. Entendeu os 5 módulos a serem implementados
2. Compreendeu que NÃO deve modificar backend/src/automation/
3. Está pronto para começar o desenvolvimento
4. Leu as regras de coordenação com a Sessão A

IMPORTANTE:
- Minha branch exclusiva: feature/modules-improvements
- NÃO tocar em: backend/src/automation/ (é da Sessão A)
- Sync diário: 18h (30 minutos)
- Avisar antes de fazer deploy

Está tudo claro? Confirme que leu a especificação e está pronto para começar!
```

---

## ✅ Após colar o prompt acima:

### A Sessão B deverá:

1. ✅ Executar os comandos git
2. ✅ Ler o arquivo `SESSAO_B_ESPECIFICACAO.md`
3. ✅ Confirmar entendimento
4. ✅ Ficar aguardando sua instrução para começar

### Então você dirá (no dia 21/10):

```
Perfeito! Vamos começar.

Hoje é dia 21/10, primeiro dia de desenvolvimento.

Consulte o cronograma em SESSAO_B_ESPECIFICACAO.md - Dia 1.

Suas tarefas de hoje (11,75h):
1. Prontuários: Upload de fotos (3h)
2. Prontuários: Upload de termos (3h)
3. Prontuários: Anamnese completa (3h)
4. Prontuários: PDF Generator - início (2,75h)

Comece pela funcionalidade de Upload de Fotos.
Crie os arquivos conforme especificado no documento.

Pode começar!
```

---

## 🔄 Gerenciamento das Duas Sessões

### Você terá 2 janelas/chats abertos:

**Janela 1 - Sessão A (Esta sessão atual):**
- Branch: `feature/automation-backend`
- Trabalhando em: Sistema de Automações
- Status: Aguardando dia 21/10 para começar

**Janela 2 - Sessão B (Nova sessão):**
- Branch: `feature/modules-improvements`
- Trabalhando em: Melhorias de Módulos
- Status: Precisa ser iniciada (use prompt acima)

### Durante o dia:
- Dê comandos para cada uma conforme necessário
- Acompanhe progresso de ambas
- Passe informações entre elas quando necessário

### Nos syncs (18h):
**Para Sessão A (esta):**
```
Hora do sync diário! Por favor, reporte:
- O que completou hoje
- O que está em andamento
- Bloqueios (se houver)
- Arquivos compartilhados modificados
- Plano para amanhã
```

**Para Sessão B (outra janela):**
```
Hora do sync diário! Por favor, reporte:
- O que completou hoje
- O que está em andamento
- Bloqueios (se houver)
- Arquivos compartilhados modificados
- Plano para amanhã
```

Depois você analisa os reports e alinha as duas.

---

## 🚀 Comandos Úteis

### Para verificar status das branches:
```bash
# Na Sessão A ou B
git status
git log --oneline -5
git branch -v
```

### Para ver diferenças:
```bash
# Em qualquer uma
git diff feature/automation-backend feature/modules-improvements --stat
```

### Antes de deploy (em qualquer sessão):
```
⚠️ ATENÇÃO: Vou fazer deploy em 5 minutos
Por favor, pause e aguarde minha confirmação
```

Então você vai na outra janela e pausa aquela sessão também.

---

## 📊 Acompanhamento de Progresso

### Pergunte periodicamente:

**Para Sessão A:**
```
Qual o progresso atual? Mostre em formato de checklist.
```

**Para Sessão B:**
```
Qual o progresso atual? Mostre em formato de checklist.
```

**Resposta esperada:**
```
Progresso Sessão A: 45%
✅ TriggerController (100%)
✅ WorkflowController (100%)
🚧 EventController (60%)
⬜ IntegrationController (0%)
...
```

---

## 🆘 Troubleshooting

### Se a Sessão B não encontrar os arquivos:
```
# Verificar se está na branch correta
git branch

# Se não estiver, trocar
git checkout feature/modules-improvements

# Puxar últimas mudanças
git pull origin feature/modules-improvements
```

### Se houver conflito:
1. Pausar ambas sessões
2. Resolver conflito manualmente ou com ajuda de uma delas
3. Retomar trabalho

### Se precisar resetar alguma sessão:
```bash
# Fazer backup primeiro
git checkout -b backup-emergencia
git push origin backup-emergencia

# Voltar para branch correta e resetar
git checkout feature/[sua-branch]
git reset --hard origin/feature/[sua-branch]
```

---

## ✅ Checklist Pré-Início

Antes de começar dia 21/10:

- [x] Setup de Sessão A completo ✅ (esta sessão)
- [ ] Abrir nova sessão para Sessão B
- [ ] Colar prompt acima na Sessão B
- [ ] Sessão B confirmar leitura da especificação
- [ ] Ambas sessões aguardando comando de início
- [ ] Você preparado para gerenciar ambas

---

## 🎯 Objetivo Final

**Dia 31/10 às 19:30:**

Ambas as sessões terão completado suas tarefas e você terá:
- ✅ Sistema de Automações em produção
- ✅ 5 módulos melhorados em produção
- ✅ Zero bugs críticos
- ✅ Sistema estável

**= Missão cumprida! 🎉**

---

## 📚 Documentos de Referência

Para você consultar durante o processo:

- `RESUMO_EXECUTIVO_SESSOES_PARALELAS.md` - Visão geral do plano
- `INICIO_RAPIDO_SESSOES_PARALELAS.md` - Guia de início rápido
- `COORDENACAO_SESSOES_PARALELAS.md` - Protocolos de coordenação
- `CRONOGRAMA_SESSOES_PARALELAS.md` - Cronograma detalhado
- `SESSAO_B_ESPECIFICACAO.md` - Especificação para Sessão B

---

## 💡 Dicas

1. 📝 Mantenha as duas janelas visíveis lado a lado
2. ⏰ Configure alarme para os syncs (18h)
3. 📊 Acompanhe progresso diariamente
4. 💬 Comunique-se proativamente com ambas sessões
5. 🎯 Foque em qualidade, não velocidade
6. ✅ Celebre pequenas vitórias

---

**Criado em:** 20/10/2025
**Versão:** 1.0
**Status:** ✅ PRONTO PARA USO

**Boa sorte! 🚀**
