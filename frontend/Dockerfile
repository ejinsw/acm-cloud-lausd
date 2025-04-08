# Use Node.js 20 as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Set environment variable to ignore build errors
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development

# Build the application (with --no-lint flag to skip linting during build)
RUN npm run build --no-lint

# Expose port 3000 for Next.js
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]
