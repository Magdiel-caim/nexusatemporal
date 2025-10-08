#!/bin/bash

# Deploy script for One Nexus Atemporal
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
STACK_NAME="nexus"

echo "🚀 Deploying One Nexus Atemporal to $ENVIRONMENT..."

# Check if Docker Swarm is initialized
if ! docker info | grep -q "Swarm: active"; then
    echo "⚠️  Docker Swarm is not initialized. Initializing..."
    docker swarm init
fi

# Check if network exists
if ! docker network inspect nexusatnet >/dev/null 2>&1; then
    echo "📡 Creating nexusatnet network..."
    docker network create --driver overlay nexusatnet
fi

# Load environment variables
if [ -f .env ]; then
    echo "✅ Loading environment variables..."
    source .env
else
    echo "❌ .env file not found!"
    exit 1
fi

# Create necessary directories
mkdir -p docker/traefik/letsencrypt
chmod 600 docker/traefik/letsencrypt

# Deploy the stack
echo "🐳 Deploying Docker Stack..."
docker stack deploy -c docker-compose.yml $STACK_NAME

echo "⏳ Waiting for services to start..."
sleep 10

# Show service status
echo "📊 Service Status:"
docker stack services $STACK_NAME

echo "✅ Deployment complete!"
echo ""
echo "📍 Access your application at:"
echo "   Frontend: https://${FRONTEND_DOMAIN}"
echo "   Backend:  https://${BACKEND_DOMAIN}"
echo ""
echo "📝 To view logs:"
echo "   docker service logs -f ${STACK_NAME}_backend"
echo "   docker service logs -f ${STACK_NAME}_frontend"
