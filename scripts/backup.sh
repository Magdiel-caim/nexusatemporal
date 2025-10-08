#!/bin/bash

# Backup script for One Nexus Atemporal
# Usage: ./scripts/backup.sh

set -e

STACK_NAME="nexus"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="nexus_backup_${TIMESTAMP}.tar.gz"

echo "💾 Starting backup process..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo "❌ .env file not found!"
    exit 1
fi

# Backup PostgreSQL
echo "📦 Backing up PostgreSQL..."
docker exec $(docker ps -q -f name=${STACK_NAME}_postgres) pg_dumpall -U ${DB_USERNAME} > $BACKUP_DIR/postgres_${TIMESTAMP}.sql

# Backup Redis
echo "📦 Backing up Redis..."
docker exec $(docker ps -q -f name=${STACK_NAME}_redis) redis-cli --pass ${REDIS_PASSWORD} SAVE
docker cp $(docker ps -q -f name=${STACK_NAME}_redis):/data/dump.rdb $BACKUP_DIR/redis_${TIMESTAMP}.rdb

# Backup environment file
cp .env $BACKUP_DIR/env_${TIMESTAMP}

# Create compressed archive
echo "🗜️  Compressing backup..."
tar -czf $BACKUP_DIR/$BACKUP_FILE -C $BACKUP_DIR \
    postgres_${TIMESTAMP}.sql \
    redis_${TIMESTAMP}.rdb \
    env_${TIMESTAMP}

# Clean up individual files
rm $BACKUP_DIR/postgres_${TIMESTAMP}.sql
rm $BACKUP_DIR/redis_${TIMESTAMP}.rdb
rm $BACKUP_DIR/env_${TIMESTAMP}

echo "✅ Backup completed: $BACKUP_DIR/$BACKUP_FILE"
echo "📏 Size: $(du -h $BACKUP_DIR/$BACKUP_FILE | cut -f1)"

# Optional: Upload to iDrive E2 (S3)
if [ "$ENABLE_S3_BACKUP" = "true" ]; then
    echo "☁️  Uploading to iDrive E2..."
    # TODO: Implement S3 upload using AWS CLI or similar
fi

echo "✅ Backup process complete!"
