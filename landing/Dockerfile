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
ENV NEXT_PUBLIC_API_URL=http://localhost:8080

# Build the application with more lenient settings
# RUN npm run build --no-lint || true

# Expose port 3000 for Next.js
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]
