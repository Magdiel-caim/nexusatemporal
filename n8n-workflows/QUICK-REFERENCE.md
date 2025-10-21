# Quick Reference - Implementação Mídias S3

## 📋 Credenciais S3 (Copiar e Colar)

```
Name: IDrive S3 - Nexus
Access Key ID: ZaIdY59FGaL8BdtRjZtL
Secret Access Key: wrytdsWINH8tXbedBl4LaxmvSDGqnbsZCFQP6iyj
Region: us-east-1
Custom Endpoints: ✅ Yes
S3 Endpoint: https://c1k7.va.idrivee2-46.com
Force Path Style: ✅ Yes
```

## 🔗 Links Importantes

- **N8N**: https://workflow.nexusatemporal.com
- **Frontend**: https://painel.nexusatemporal.com.br
- **S3 Bucket**: backupsistemaonenexus

## 📂 Arquivo para Importar

```
/root/nexusatemporal/n8n-workflows/n8n_workflow_2_receber_mensagens_COM_S3.json
```

## ✅ Checklist de Implementação

```
[ ] 1. Criar credencial "IDrive S3 - Nexus" no N8N
[ ] 2. Testar conexão da credencial
[ ] 3. Desativar workflow antigo "WAHA - Receber Mensagens"
[ ] 4. Importar n8n_workflow_2_receber_mensagens_COM_S3.json
[ ] 5. Abrir workflow importado
[ ] 6. Nó "Upload para S3 IDrive" → Selecionar credencial
[ ] 7. Salvar workflow
[ ] 8. Ativar workflow (toggle ON)
[ ] 9. Enviar imagem teste via WhatsApp
[ ] 10. Verificar no frontend se aparece
[ ] 11. Executar: /root/nexusatemporal/scripts/verificar-midias-s3.sh
[ ] 12. Deletar workflow antigo
```

## 🔧 Comandos Úteis

### Verificar S3
```bash
/root/nexusatemporal/scripts/verificar-midias-s3.sh
```

### Listar arquivos no S3
```bash
AWS_ACCESS_KEY_ID="ZaIdY59FGaL8BdtRjZtL" \
AWS_SECRET_ACCESS_KEY="wrytdsWINH8tXbedBl4LaxmvSDGqnbsZCFQP6iyj" \
aws s3 ls s3://backupsistemaonenexus/whatsapp/ \
  --endpoint-url https://c1k7.va.idrivee2-46.com \
  --no-verify-ssl \
  --recursive \
  --human-readable
```

### Logs do Backend
```bash
docker service logs nexus_backend --tail 50
```

### Restart Backend (se necessário)
```bash
docker service update --force nexus_backend
```

## 🆘 Problemas Comuns

| Erro | Solução |
|------|---------|
| Credential not found | Criar credencial "IDrive S3 - Nexus" exatamente com esse nome |
| Access Denied S3 | Verificar Access Key, Secret Key, Endpoint |
| Workflow não executa | Verificar se está Active (toggle verde) |
| Imagem não aparece | N8N → Executions → Ver último erro |
| Backend offline | `docker service ls \| grep backend` → 0/1 = problema |

## 📞 Próximo Passo

➡️ Abrir: `/root/nexusatemporal/n8n-workflows/GUIA-IMPLEMENTACAO-S3.md`

Este arquivo tem o passo a passo COMPLETO e detalhado!
