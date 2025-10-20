#!/bin/bash
# Cleanup Deleted Users - Cron Script
# Executes daily cleanup of users deleted more than 30 days ago

# Set working directory
cd /root/nexusatemporal/backend

# Log file
LOG_FILE="/var/log/nexus-cleanup-users.log"

# Add timestamp to log
echo "====================================" >> "$LOG_FILE"
echo "Cleanup started at: $(date)" >> "$LOG_FILE"
echo "====================================" >> "$LOG_FILE"

# Execute cleanup script inside Docker container using tsx
docker exec $(docker ps -q -f name=nexus_backend) npx tsx src/scripts/cleanup-deleted-users.ts >> "$LOG_FILE" 2>&1

# Log completion
echo "Cleanup finished at: $(date)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Keep only last 1000 lines of log
tail -n 1000 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"

exit 0
