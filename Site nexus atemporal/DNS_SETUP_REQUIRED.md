# ⚠️ CONFIGURAÇÃO DNS NECESSÁRIA

## Problema Identificado

O domínio **nexustemporal.com.br** não está resolvendo no DNS público.

### Diagnóstico Realizado

```bash
$ nslookup nexustemporal.com.br 8.8.8.8
Server can't find nexustemporal.com.br: NXDOMAIN
```

**Status**: O domínio não aponta para nenhum IP no momento.

---

## ✅ Solução: Configurar DNS

Você precisa configurar os registros DNS do domínio `nexustemporal.com.br` no seu provedor de domínios (Registro.br, GoDaddy, Hostgator, etc.).

### 1️⃣ Registros DNS Necessários

Adicione os seguintes registros **A** no painel de controle do seu domínio:

```
Tipo    Nome                          Valor         TTL
----    ----                          -----         ---
A       nexustemporal.com.br          72.60.5.29    3600
A       www.nexustemporal.com.br      72.60.5.29    3600
A       app.nexustemporal.com.br      72.60.5.29    3600
A       api.nexustemporal.com.br      72.60.5.29    3600
```

### 2️⃣ Como Configurar (Dependendo do Provedor)

#### Se estiver usando Registro.br:
1. Acesse: https://registro.br
2. Faça login com sua conta
3. Clique em "Meus Domínios"
4. Selecione `nexustemporal.com.br`
5. Vá em "DNS" → "Editar Zona"
6. Adicione os registros A acima
7. Salve as alterações

#### Se estiver usando Cloudflare:
1. Acesse: https://dash.cloudflare.com
2. Selecione o domínio `nexustemporal.com.br`
3. Vá em "DNS" → "Records"
4. Clique em "Add record"
5. Adicione cada registro A conforme a tabela acima
6. **IMPORTANTE**: Desative o proxy (ícone de nuvem cinza) para cada registro

#### Outros Provedores:
- GoDaddy, Hostgator, UOL Host, etc. têm painel similar
- Procure por "DNS Management" ou "Gerenciar DNS"
- Adicione os registros A conforme a tabela

---

## ⏱️ Tempo de Propagação

Após adicionar os registros DNS:
- **Mínimo**: 15-30 minutos
- **Máximo**: 24-48 horas (raro)
- **Típico**: 1-4 horas

### Como Verificar se Propagou

```bash
# Teste 1: Via Google DNS
nslookup nexustemporal.com.br 8.8.8.8

# Teste 2: Via Cloudflare DNS
nslookup nexustemporal.com.br 1.1.1.1

# Teste 3: Online
# Acesse: https://dnschecker.org
# Digite: nexustemporal.com.br
```

**Quando estiver OK**, você verá:
```
Server:		8.8.8.8
Address:	8.8.8.8#53

Name:	nexustemporal.com.br
Address: 72.60.5.29
```

---

## 🔧 Configurações do Servidor (Já Feitas)

✅ **Website rodando**: nexus-website_website
✅ **Traefik configurado**: Roteamento e SSL prontos
✅ **Let's Encrypt**: Vai gerar certificado automaticamente após DNS propagar
✅ **Redirect WWW**: www → domínio principal

### Traefik está esperando o DNS para:
- Gerar certificado SSL automaticamente
- Rotear tráfego HTTPS para o website
- Ativar redirect de www para domínio principal

---

## 🧪 Teste Temporário (Enquanto DNS não Propaga)

Você pode testar o site **agora mesmo** usando o IP diretamente:

### Opção 1: Via curl com Host header
```bash
curl -k -H "Host: nexustemporal.com.br" https://72.60.5.29
```

### Opção 2: Editar arquivo /etc/hosts (Linux/Mac)
```bash
# Adicione no arquivo /etc/hosts:
sudo nano /etc/hosts

# Adicione esta linha:
72.60.5.29    nexustemporal.com.br www.nexustemporal.com.br

# Salve e teste no navegador:
# https://nexustemporal.com.br
```

### Opção 3: Editar arquivo hosts (Windows)
```
1. Abra o Bloco de Notas como Administrador
2. Abra: C:\Windows\System32\drivers\etc\hosts
3. Adicione: 72.60.5.29    nexustemporal.com.br
4. Salve
5. Acesse: https://nexustemporal.com.br
```

⚠️ **Atenção**: Esta é apenas uma solução temporária para testes locais!

---

## 📋 Checklist Pós-DNS

Após o DNS propagar, verifique:

- [ ] `nexustemporal.com.br` resolve para 72.60.5.29
- [ ] `www.nexustemporal.com.br` resolve para 72.60.5.29
- [ ] Site acessível via HTTPS (https://nexustemporal.com.br)
- [ ] Certificado SSL válido (Let's Encrypt gerado automaticamente)
- [ ] Redirect de www funcionando (www → domínio principal)
- [ ] Site exibindo corretamente (landing page, planos, checkout)
- [ ] Dark/Light mode funcionando
- [ ] Todas as páginas acessíveis

---

## 🆘 Problemas Comuns

### "Este site não pode ser acessado"
❌ DNS ainda não propagou
✅ Aguarde mais tempo ou use teste temporário acima

### "Sua conexão não é particular" (SSL)
❌ Let's Encrypt ainda não gerou o certificado
✅ Aguarde alguns minutos após DNS propagar
✅ Verifique logs: `docker service logs traefik_traefik -f`

### "404 Page Not Found"
❌ Traefik não está roteando corretamente
✅ Verifique labels: `docker service inspect nexus-website_website`

### Site carrega mas não estilizado
❌ Build do Next.js pode ter falhado
✅ Verifique logs: `docker service logs nexus-website_website -f`

---

## 📞 Próximos Passos

1. **AGORA**: Configure DNS no seu provedor
2. **Após 1-4 horas**: Verifique se DNS propagou
3. **Teste o site**: https://nexustemporal.com.br
4. **Próxima fase**: Integração com backend para registro automático

---

## 🔍 Comandos de Monitoramento

```bash
# Ver status do serviço
docker service ps nexus-website_website

# Ver logs em tempo real
docker service logs nexus-website_website -f

# Ver logs do Traefik (para debug de SSL)
docker service logs traefik_traefik -f | grep nexustemporal

# Testar acesso local
curl -k -I https://72.60.5.29 -H "Host: nexustemporal.com.br"
```

---

**Status Atual do Deploy**: ✅ Website funcionando, aguardando apenas DNS
**IP do Servidor**: 72.60.5.29
**Data**: 2025-10-21
