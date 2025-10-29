#!/usr/bin/env python3
"""
Continua migração de onde parou - versão otimizada
Busca apenas os registros que ainda não foram migrados
"""

import fdb
import psycopg2
import psycopg2.extras
from datetime import datetime
import logging
from tqdm import tqdm

# Configurações
FIREBIRD_HOST = '192.168.100.20'
FIREBIRD_PORT = 3050
FIREBIRD_DATABASE = r'C:\ProDoctor11\Dados\PRODOCTORSQL.FDB'
FIREBIRD_USER = 'sysdba'
FIREBIRD_PASSWORD = 'masterkey'

POSTGRES_HOST = '72.60.139.52'
POSTGRES_PORT = 5432
POSTGRES_DATABASE = 'nexus_pacientes'
POSTGRES_USER = 'nexus_pacientes_user'
POSTGRES_PASSWORD = 'NexusPacientes2024Secure'

TENANT_ID = 'c0000000-0000-0000-0000-000000000000'
BATCH_SIZE = 1000

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/root/nexusatemporalv1/scripts/continue_migration.log'),
        logging.StreamHandler()
    ]
)

# Importar funções do script original
import sys
sys.path.insert(0, '/root/nexusatemporalv1/scripts')
from migrate_patients_firebird import (
    connect_firebird, connect_postgres, get_firebird_columns,
    transform_patient, insert_batch, clean_cpf
)

def get_migrated_ids(pg_cursor, tenant_id):
    """Busca IDs já migrados"""
    logging.info("Buscando IDs já migrados...")
    query = """
    SELECT source_id
    FROM patients
    WHERE tenant_id = %s AND source = 'firebird_prodoctor' AND source_id IS NOT NULL
    """
    pg_cursor.execute(query, (tenant_id,))
    migrated = set(row[0] for row in pg_cursor.fetchall())
    logging.info(f"Encontrados {len(migrated)} pacientes já migrados")
    return migrated

def continue_migration():
    """Continua migração dos registros faltantes"""
    logging.info("="*80)
    logging.info("CONTINUANDO MIGRAÇÃO - Apenas registros não migrados")
    logging.info("="*80)

    # Conectar
    fb_conn = connect_firebird()
    pg_conn = connect_postgres()
    fb_cursor = fb_conn.cursor()
    pg_cursor = pg_conn.cursor()

    try:
        # Buscar IDs já migrados
        migrated_ids = get_migrated_ids(pg_cursor, TENANT_ID)

        # Buscar colunas
        columns = get_firebird_columns(fb_conn)

        # Contar total
        fb_cursor.execute("SELECT COUNT(*) FROM T_PACIENTES")
        total = fb_cursor.fetchone()[0]
        to_migrate = total - len(migrated_ids)

        logging.info(f"Total no Firebird: {total:,}")
        logging.info(f"Já migrados: {len(migrated_ids):,}")
        logging.info(f"Faltam migrar: {to_migrate:,}")

        # Buscar todos os registros
        fb_cursor.execute("SELECT * FROM T_PACIENTES")

        # Contadores
        migrated = 0
        updated = 0
        skipped = 0
        failed = 0

        pbar = tqdm(total=to_migrate, desc="Migrando faltantes", unit="pac")
        batch = []

        for fb_row in fb_cursor:
            try:
                # Pegar o ID
                source_id = str(fb_row[0]) if fb_row and len(fb_row) > 0 else None

                # Pular se já foi migrado
                if source_id and source_id in migrated_ids:
                    continue

                # Transformar dados
                patient = transform_patient(fb_row, columns)

                # Validações básicas
                if not patient['name'] or len(patient['name']) < 3:
                    skipped += 1
                    pbar.update(1)
                    continue

                # Adicionar ao batch
                batch.append(patient)

                # Inserir quando atingir o tamanho do batch
                if len(batch) >= BATCH_SIZE:
                    ins, upd, skip = insert_batch(pg_conn, pg_cursor, batch)
                    pg_conn.commit()
                    migrated += ins
                    updated += upd
                    failed += skip
                    batch = []
                    pbar.update(BATCH_SIZE)

            except Exception as e:
                failed += 1
                error_msg = str(e)
                logging.error(f"Erro ao processar registro {source_id}: {error_msg}")
                pbar.update(1)
                continue

        # Inserir batch restante
        if batch:
            ins, upd, skip = insert_batch(pg_conn, pg_cursor, batch)
            pg_conn.commit()
            migrated += ins
            updated += upd
            failed += skip
            pbar.update(len(batch))

        pbar.close()

    finally:
        fb_cursor.close()
        fb_conn.close()
        pg_cursor.close()
        pg_conn.close()

    # Relatório final
    logging.info("="*80)
    logging.info("MIGRAÇÃO CONTINUADA CONCLUÍDA")
    logging.info("="*80)
    logging.info(f"Novos inseridos:  {migrated:,}")
    logging.info(f"Atualizados:      {updated:,}")
    logging.info(f"Ignorados:        {skipped:,}")
    logging.info(f"Falhas:           {failed:,}")
    logging.info("="*80)

if __name__ == '__main__':
    continue_migration()
