# Use Node.js 20 as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install serverless globally
RUN npm install -g serverless@3.40.0

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose port 3001 for serverless-offline
EXPOSE 3001

# Start serverless-offline
CMD ["npm", "run", "dev"]