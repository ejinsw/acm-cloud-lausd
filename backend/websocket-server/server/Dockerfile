# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy source code and node_modules
COPY --from=builder /app/index.js ./
COPY --from=builder /app/daxSTORE.js ./
COPY --from=builder /app/node_modules ./node_modules

# Expose the WebSocket port (will be overridden by environment variable)
EXPOSE 9999

# Set environment variables
ENV NODE_ENV=production
ENV PORT=9999

# Start the server
CMD ["node", "index.js"]
