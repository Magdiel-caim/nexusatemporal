#!/usr/bin/env python3
"""
Migração otimizada - Busca apenas IDs não migrados e os processa diretamente
Evita erro BLOB ao iterar cursor completo
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
BATCH_SIZE = 500  # Reduzido para menos memória

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/tmp/migrate_remaining.log'),
        logging.StreamHandler()
    ]
)

# Importar funções
import sys
sys.path.insert(0, '/root/nexusatemporalv1/scripts')
from migrate_patients_firebird import (
    connect_firebird, connect_postgres, get_firebird_columns,
    transform_patient, insert_batch
)

def get_all_firebird_ids(fb_conn):
    """Busca todos os IDs do Firebird"""
    cursor = fb_conn.cursor()
    cursor.execute("SELECT CODIGO FROM T_PACIENTES ORDER BY CODIGO")
    ids = [str(row[0]) for row in cursor.fetchall()]
    cursor.close()
    logging.info(f"Total de IDs no Firebird: {len(ids):,}")
    return ids

def get_migrated_ids(pg_cursor, tenant_id):
    """Busca IDs já migrados"""
    query = """
    SELECT source_id FROM patients
    WHERE tenant_id = %s AND source = 'firebird_prodoctor' AND source_id IS NOT NULL
    """
    pg_cursor.execute(query, (tenant_id,))
    migrated = set(row[0] for row in pg_cursor.fetchall())
    logging.info(f"Total de IDs já migrados: {len(migrated):,}")
    return migrated

def fetch_patient_by_id(fb_conn, columns, patient_id):
    """Busca um paciente específico por ID"""
    cursor = fb_conn.cursor()
    try:
        query = f"SELECT * FROM T_PACIENTES WHERE CODIGO = ?"
        cursor.execute(query, (int(patient_id),))
        row = cursor.fetchone()
        cursor.close()
        return row
    except Exception as e:
        cursor.close()
        error_msg = str(e)
        if 'BLOB not found' in error_msg:
            logging.warning(f"⚠️  BLOB error no paciente {patient_id} - pulando")
            return None
        else:
            raise

def migrate_remaining():
    """Migra apenas os IDs faltantes"""
    logging.info("="*80)
    logging.info("MIGRAÇÃO OTIMIZADA - Buscando IDs faltantes")
    logging.info("="*80)

    # Conectar
    fb_conn = connect_firebird()
    pg_conn = connect_postgres()
    pg_cursor = pg_conn.cursor()

    try:
        # 1. Buscar todos os IDs do Firebird
        logging.info("Buscando IDs do Firebird...")
        all_ids = get_all_firebird_ids(fb_conn)

        # 2. Buscar IDs já migrados
        logging.info("Buscando IDs já migrados...")
        migrated_ids = get_migrated_ids(pg_cursor, TENANT_ID)

        # 3. Calcular diferença
        remaining_ids = [id for id in all_ids if id not in migrated_ids]
        logging.info(f"IDs faltantes: {len(remaining_ids):,}")

        if not remaining_ids:
            logging.info("✅ Nenhum ID faltante! Migração completa.")
            return

        # 4. Buscar colunas
        columns = get_firebird_columns(fb_conn)

        # 5. Processar cada ID
        migrated = 0
        updated = 0
        skipped = 0
        failed = 0

        pbar = tqdm(total=len(remaining_ids), desc="Migrando pacientes", unit="pac")
        batch = []

        for patient_id in remaining_ids:
            try:
                # Buscar dados do paciente
                fb_row = fetch_patient_by_id(fb_conn, columns, patient_id)

                if not fb_row:
                    # BLOB error ou não encontrado
                    failed += 1
                    pbar.update(1)
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
                logging.error(f"Erro ao processar ID {patient_id}: {error_msg}")
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

        # Relatório final
        logging.info("="*80)
        logging.info("MIGRAÇÃO CONCLUÍDA")
        logging.info("="*80)
        logging.info(f"Novos inseridos:  {migrated:,}")
        logging.info(f"Atualizados:      {updated:,}")
        logging.info(f"Ignorados:        {skipped:,}")
        logging.info(f"Falhas:           {failed:,}")
        logging.info("="*80)

    finally:
        fb_conn.close()
        pg_cursor.close()
        pg_conn.close()

if __name__ == '__main__':
    migrate_remaining()
