#!/bin/bash

# Status script for One Nexus Atemporal
# Usage: ./scripts/status.sh

STACK_NAME="nexus"

echo "📊 One Nexus Atemporal - Service Status"
echo "========================================"
echo ""

# Check if stack is running
if ! docker stack ps $STACK_NAME >/dev/null 2>&1; then
    echo "❌ Stack '$STACK_NAME' is not running!"
    echo "   Run: ./scripts/deploy.sh"
    exit 1
fi

# Show services
echo "🐳 Services:"
docker stack services $STACK_NAME
echo ""

# Show tasks
echo "📋 Tasks:"
docker stack ps $STACK_NAME --no-trunc
echo ""

# Health checks
echo "🏥 Health Status:"
echo ""

# Backend health
echo -n "Backend API: "
if curl -s -f http://localhost:3001/health >/dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy"
fi

# PostgreSQL health
echo -n "PostgreSQL:  "
if docker exec -it $(docker ps -q -f name=${STACK_NAME}_postgres) pg_isready >/dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy"
fi

# Redis health
echo -n "Redis:       "
if docker exec -it $(docker ps -q -f name=${STACK_NAME}_redis) redis-cli ping >/dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy"
fi

echo ""
echo "📝 View logs with:"
echo "   docker service logs -f ${STACK_NAME}_backend"
echo "   docker service logs -f ${STACK_NAME}_frontend"
