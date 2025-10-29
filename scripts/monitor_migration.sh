#!/bin/bash
#
# Monitor de Migração - Notifica quando completar
#

TARGET_TOTAL=161663
TENANT_ID="c0000000-0000-0000-0000-000000000000"
LOG_FILE="/tmp/migration_monitor.log"

echo "=====================================" | tee -a $LOG_FILE
echo "Monitoramento iniciado: $(date)" | tee -a $LOG_FILE
echo "Meta: $TARGET_TOTAL pacientes" | tee -a $LOG_FILE
echo "=====================================" | tee -a $LOG_FILE

while true; do
    # Verificar total atual
    CURRENT=$(PGPASSWORD='NexusPacientes2024Secure' psql -h 72.60.139.52 -U nexus_pacientes_user -d nexus_pacientes -t -c "SELECT COUNT(*) FROM patients WHERE tenant_id = '$TENANT_ID';" 2>/dev/null | tr -d ' ')

    if [ ! -z "$CURRENT" ]; then
        PERCENTAGE=$(echo "scale=2; ($CURRENT * 100) / $TARGET_TOTAL" | bc)
        REMAINING=$(($TARGET_TOTAL - $CURRENT))

        echo "[$(date '+%H:%M:%S')] Progresso: $CURRENT / $TARGET_TOTAL ($PERCENTAGE%) - Faltam: $REMAINING" | tee -a $LOG_FILE

        # Verificar se completou
        if [ "$CURRENT" -ge "$TARGET_TOTAL" ]; then
            echo "" | tee -a $LOG_FILE
            echo "=====================================" | tee -a $LOG_FILE
            echo "🎉 MIGRAÇÃO CONCLUÍDA!" | tee -a $LOG_FILE
            echo "=====================================" | tee -a $LOG_FILE
            echo "Total migrado: $CURRENT pacientes" | tee -a $LOG_FILE
            echo "Concluído em: $(date)" | tee -a $LOG_FILE
            echo "=====================================" | tee -a $LOG_FILE

            # Estatísticas finais
            PGPASSWORD='NexusPacientes2024Secure' psql -h 72.60.139.52 -U nexus_pacientes_user -d nexus_pacientes -c "
                SELECT
                    COUNT(*) as total_migrados,
                    COUNT(DISTINCT cpf) FILTER (WHERE cpf IS NOT NULL) as pacientes_com_cpf,
                    COUNT(*) FILTER (WHERE whatsapp IS NOT NULL) as pacientes_com_whatsapp,
                    COUNT(*) FILTER (WHERE email IS NOT NULL) as pacientes_com_email,
                    COUNT(*) FILTER (WHERE status = 'active') as ativos,
                    COUNT(*) FILTER (WHERE status = 'inactive') as inativos
                FROM patients
                WHERE tenant_id = '$TENANT_ID';
            " | tee -a $LOG_FILE

            break
        fi
    fi

    # Aguardar 5 minutos
    sleep 300
done
