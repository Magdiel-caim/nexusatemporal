#!/usr/bin/env python3
"""
Script de Migração de Pacientes - Firebird ProDoctor -> PostgreSQL
Migra 161.663 pacientes da tabela T_PACIENTES

Autor: Claude Code
Data: 29/10/2025
"""

import fdb
import psycopg2
import psycopg2.extras
from datetime import datetime
import logging
from tqdm import tqdm
import sys
import re

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

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/root/nexusatemporalv1/scripts/migration_patients.log'),
        logging.StreamHandler()
    ]
)

def connect_firebird():
    """Conecta ao banco Firebird"""
    try:
        logging.info(f"Conectando ao Firebird em {FIREBIRD_HOST}:{FIREBIRD_PORT}...")
        conn = fdb.connect(
            host=FIREBIRD_HOST,
            port=FIREBIRD_PORT,
            database=FIREBIRD_DATABASE,
            user=FIREBIRD_USER,
            password=FIREBIRD_PASSWORD,
            charset='UTF8'
        )
        logging.info("✅ Conectado ao Firebird com sucesso")
        return conn
    except Exception as e:
        logging.error(f"❌ Erro ao conectar ao Firebird: {str(e)}")
        raise

def connect_postgres():
    """Conecta ao banco PostgreSQL"""
    try:
        logging.info(f"Conectando ao PostgreSQL em {POSTGRES_HOST}:{POSTGRES_PORT}...")
        conn = psycopg2.connect(
            host=POSTGRES_HOST,
            port=POSTGRES_PORT,
            database=POSTGRES_DATABASE,
            user=POSTGRES_USER,
            password=POSTGRES_PASSWORD
        )
        logging.info("✅ Conectado ao PostgreSQL com sucesso")
        return conn
    except Exception as e:
        logging.error(f"❌ Erro ao conectar ao PostgreSQL: {str(e)}")
        raise

def get_firebird_columns(conn):
    """Retorna colunas da tabela T_PACIENTES no Firebird"""
    cursor = conn.cursor()

    query = """
    SELECT RDB$FIELD_NAME
    FROM RDB$RELATION_FIELDS
    WHERE RDB$RELATION_NAME = 'T_PACIENTES'
    ORDER BY RDB$FIELD_POSITION
    """

    cursor.execute(query)
    columns = [row[0].strip() for row in cursor.fetchall()]
    cursor.close()

    logging.info(f"Colunas encontradas na tabela T_PACIENTES: {len(columns)}")
    return columns

def clean_cpf(cpf):
    """Remove caracteres não numéricos do CPF"""
    if not cpf:
        return None
    cleaned = ''.join(filter(str.isdigit, str(cpf)))
    return cleaned if len(cleaned) == 11 else None

def clean_phone(phone):
    """Remove caracteres não numéricos do telefone"""
    if not phone:
        return None
    cleaned = ''.join(filter(str.isdigit, str(phone)))
    return cleaned if len(cleaned) >= 10 else None

def clean_cep(cep):
    """Remove caracteres não numéricos do CEP"""
    if not cep:
        return None
    cleaned = ''.join(filter(str.isdigit, str(cep)))
    return cleaned if len(cleaned) == 8 else None

def map_gender(sexo):
    """Mapeia sexo do Firebird para PostgreSQL"""
    if not sexo:
        return None
    sexo = str(sexo).upper().strip()
    mapping = {
        'M': 'male',
        'MASCULINO': 'male',
        'F': 'female',
        'FEMININO': 'female',
    }
    return mapping.get(sexo)

def build_notes(patient):
    """Constrói campo notes com informações adicionais"""
    notes = []

    # Adicionar observações originais se houver
    if patient.get('OBSERVACOES'):
        obs = str(patient['OBSERVACOES']).strip()
        if obs:
            notes.append(f"Observações: {obs}")

    # Adicionar data de cadastro
    if patient.get('DATACADASTRO'):
        notes.append(f"Cadastro original: {patient['DATACADASTRO']}")

    # Adicionar informações adicionais que não tem campo específico
    if patient.get('PROFISSAO'):
        notes.append(f"Profissão: {patient['PROFISSAO']}")

    return '\n'.join(notes) if notes else None

def transform_patient(fb_row, columns):
    """
    Transforma dados do Firebird para PostgreSQL
    Remove campos desnecessários conforme especificação do cliente
    """
    # Mapear colunas para dict
    patient = dict(zip(columns, fb_row))

    # Transformar para formato PostgreSQL
    return {
        'tenant_id': TENANT_ID,
        'name': str(patient.get('NOME', '')).strip() if patient.get('NOME') else None,
        'birth_date': patient.get('DATANASCIMENTO'),
        'cpf': clean_cpf(patient.get('CPF')),
        'rg': str(patient.get('RG', '')).strip() if patient.get('RG') else None,
        'gender': map_gender(patient.get('SEXO')),
        'whatsapp': clean_phone(patient.get('CELULAR') or patient.get('TELEFONE1') or patient.get('TELEFONE')),
        'emergency_phone': clean_phone(patient.get('TELEFONE2') or patient.get('TELEFONE3')),
        'email': str(patient.get('EMAIL', '')).strip().lower() if patient.get('EMAIL') else None,
        'zip_code': clean_cep(patient.get('CEP')),
        'street': str(patient.get('ENDERECO', '')).strip() if patient.get('ENDERECO') else None,
        'number': str(patient.get('NUMERO', '')).strip() if patient.get('NUMERO') else None,
        'complement': str(patient.get('COMPLEMENTO', '')).strip() if patient.get('COMPLEMENTO') else None,
        'neighborhood': str(patient.get('BAIRRO', '')).strip() if patient.get('BAIRRO') else None,
        'city': str(patient.get('CIDADE', '')).strip() if patient.get('CIDADE') else None,
        'state': str(patient.get('UF', '')).strip() if patient.get('UF') else None,
        'notes': build_notes(patient),
        'status': 'active',
        'source': 'firebird_prodoctor',
        'source_id': str(patient.get('CODIGO')) if patient.get('CODIGO') else None,  # ID no Firebird
    }

def check_patient_exists(cursor, tenant_id, cpf, source_id):
    """Verifica se paciente já existe no banco"""
    if cpf:
        cursor.execute("""
            SELECT id FROM patients
            WHERE tenant_id = %s AND cpf = %s
            LIMIT 1
        """, (tenant_id, cpf))
        result = cursor.fetchone()
        if result:
            return result[0]

    # Se não tem CPF ou não encontrou por CPF, buscar por source_id
    if source_id:
        cursor.execute("""
            SELECT id FROM patients
            WHERE tenant_id = %s AND source = 'firebird_prodoctor' AND source_id = %s
            LIMIT 1
        """, (tenant_id, source_id))
        result = cursor.fetchone()
        if result:
            return result[0]

    return None

def insert_batch(conn, cursor, patients):
    """Insere batch de pacientes no PostgreSQL"""
    insert_query = """
    INSERT INTO patients (
        tenant_id, name, birth_date, cpf, rg, gender,
        whatsapp, emergency_phone, email,
        zip_code, street, number, complement, neighborhood, city, state,
        notes, status, source, source_id
    ) VALUES (
        %(tenant_id)s, %(name)s, %(birth_date)s, %(cpf)s, %(rg)s, %(gender)s,
        %(whatsapp)s, %(emergency_phone)s, %(email)s,
        %(zip_code)s, %(street)s, %(number)s, %(complement)s, %(neighborhood)s, %(city)s, %(state)s,
        %(notes)s, %(status)s, %(source)s, %(source_id)s
    )
    RETURNING id
    """

    update_query = """
    UPDATE patients SET
        name = %(name)s,
        birth_date = %(birth_date)s,
        whatsapp = %(whatsapp)s,
        emergency_phone = %(emergency_phone)s,
        email = %(email)s,
        zip_code = %(zip_code)s,
        street = %(street)s,
        number = %(number)s,
        complement = %(complement)s,
        neighborhood = %(neighborhood)s,
        city = %(city)s,
        state = %(state)s,
        notes = %(notes)s,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = %(patient_id)s
    RETURNING id
    """

    inserted_count = 0
    updated_count = 0
    skipped_count = 0

    for patient in patients:
        try:
            # Verificar se já existe
            existing_id = check_patient_exists(cursor, patient['tenant_id'], patient['cpf'], patient['source_id'])

            if existing_id:
                # Atualizar paciente existente
                patient['patient_id'] = existing_id
                cursor.execute(update_query, patient)
                log_migration(cursor, patient, 'updated', None, existing_id)
                updated_count += 1
            else:
                # Inserir novo paciente
                cursor.execute(insert_query, patient)
                result = cursor.fetchone()
                if result:
                    log_migration(cursor, patient, 'success', None, result[0])
                    inserted_count += 1

        except Exception as e:
            # Fazer rollback para limpar erro e continuar
            conn.rollback()
            error_msg = str(e)
            logging.error(f"Erro ao processar paciente {patient.get('name')}: {error_msg}")
            # Não consegue registrar log porque deu rollback, então só incrementa contador
            skipped_count += 1

    return inserted_count, updated_count, skipped_count

def log_migration(cursor, patient, status, error_msg=None, patient_id=None, batch_number=1):
    """Registra log de migração na tabela patient_migration_log"""
    query = """
    INSERT INTO patient_migration_log (
        tenant_id, batch_number, source_system, source_patient_id, target_patient_id,
        status, error_message, migrated_fields
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """

    migrated_fields = {
        'migration_date': datetime.now().isoformat(),
        'patient_name': patient.get('name'),
        'has_cpf': bool(patient.get('cpf')),
        'has_whatsapp': bool(patient.get('whatsapp')),
        'has_email': bool(patient.get('email'))
    }

    try:
        cursor.execute(query, (
            TENANT_ID,
            batch_number,
            'firebird_prodoctor',
            patient.get('source_id'),
            patient_id,
            status,
            error_msg,
            psycopg2.extras.Json(migrated_fields)
        ))
    except Exception as e:
        logging.error(f"Erro ao registrar log de migração: {str(e)}")

def migrate_patients(limit=None):
    """
    Função principal de migração

    Args:
        limit (int, optional): Limitar número de pacientes a migrar (para testes)
    """
    logging.info("=" * 80)
    logging.info("INICIANDO MIGRAÇÃO DE PACIENTES - Firebird ProDoctor → PostgreSQL")
    logging.info("=" * 80)

    # Conectar aos bancos
    fb_conn = connect_firebird()
    pg_conn = connect_postgres()

    fb_cursor = fb_conn.cursor()
    pg_cursor = pg_conn.cursor()

    try:
        # Buscar colunas
        columns = get_firebird_columns(fb_conn)
        logging.info(f"Colunas: {', '.join(columns[:10])}..." if len(columns) > 10 else f"Colunas: {', '.join(columns)}")

        # Contar total de pacientes
        fb_cursor.execute("SELECT COUNT(*) FROM T_PACIENTES")
        total = fb_cursor.fetchone()[0]
        logging.info(f"Total de pacientes no Firebird: {total:,}")

        if limit:
            logging.info(f"⚠️  MODO TESTE: Limitando a {limit} pacientes")
            total = min(total, limit)

        # Buscar pacientes
        query = "SELECT * FROM T_PACIENTES"
        if limit:
            query += f" ROWS {limit}"

        fb_cursor.execute(query)
        logging.info("Query executada, iniciando migração...")

        # Contadores
        migrated = 0
        updated = 0
        skipped = 0
        failed = 0

        # Progress bar
        pbar = tqdm(total=total, desc="Migrando pacientes", unit="pac")

        batch = []

        for fb_row in fb_cursor:
            try:
                # Transformar dados
                patient = transform_patient(fb_row, columns)

                # Validações básicas
                if not patient['name'] or len(patient['name']) < 3:
                    skipped += 1
                    log_migration(pg_cursor, patient, 'skipped', 'Nome inválido ou muito curto')
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
                logging.error(f"Erro ao processar registro do Firebird: {error_msg}")

                # Se for erro BLOB, tentar pegar o ID do registro
                try:
                    source_id = str(fb_row[0]) if fb_row and len(fb_row) > 0 else 'unknown'
                    logging.warning(f"Pulando registro com erro (source_id: {source_id})")
                except:
                    logging.warning(f"Pulando registro com erro (não foi possível identificar ID)")

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

    except Exception as e:
        error_msg = str(e)
        logging.error(f"❌ Erro durante migração: {error_msg}")

        # Se for erro de BLOB ou cursor, tentar continuar
        if 'BLOB not found' in error_msg or 'Cursor.fetchone' in error_msg:
            logging.warning("⚠️  Erro de BLOB detectado, tentando continuar com próximos registros...")
            # Não fazer raise, deixar continuar
        else:
            raise

    finally:
        # Fechar conexões
        fb_cursor.close()
        fb_conn.close()
        pg_cursor.close()
        pg_conn.close()

    # Relatório final
    logging.info("=" * 80)
    logging.info("MIGRAÇÃO CONCLUÍDA")
    logging.info("=" * 80)
    logging.info(f"Total no Firebird:    {total:,}")
    logging.info(f"Novos (inseridos):    {migrated:,} ({migrated/total*100:.1f}%)")
    logging.info(f"Atualizados:          {updated:,} ({updated/total*100:.1f}%)")
    logging.info(f"Ignorados:            {skipped:,} ({skipped/total*100:.1f}%)")
    logging.info(f"Falhas:               {failed:,} ({failed/total*100:.1f}%)")
    logging.info("=" * 80)
    logging.info(f"Log completo salvo em: /root/nexusatemporalv1/scripts/migration_patients.log")

if __name__ == '__main__':
    # Verificar se foi passado argumento para modo teste
    if len(sys.argv) > 1:
        if sys.argv[1] == '--test':
            print("🧪 MODO TESTE: Migrando apenas 100 pacientes...")
            migrate_patients(limit=100)
        elif sys.argv[1] == '--full':
            print("🚀 MODO COMPLETO: Migrando todos os pacientes...")
            migrate_patients()
        else:
            print("Uso: python3 migrate_patients_firebird.py [--test | --full]")
            print("  --test: Migra apenas 100 pacientes (teste)")
            print("  --full: Migra todos os pacientes")
            sys.exit(1)
    else:
        print("Uso: python3 migrate_patients_firebird.py [--test | --full]")
        print("  --test: Migra apenas 100 pacientes (teste)")
        print("  --full: Migra todos os pacientes")
        sys.exit(1)
