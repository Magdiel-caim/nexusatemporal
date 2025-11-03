# Backend Dockerfile - Simplified for initial deploy
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for tsx)
RUN npm install

# Copy all backend source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3001

# Start in dev mode with tsx (TypeScript direct execution)
CMD ["npm", "run", "dev"]
