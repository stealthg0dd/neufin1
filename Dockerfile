# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy project files and build
COPY . .

# Create a .env file with backend URL for the frontend 
RUN echo "VITE_BACKEND_URL=${BACKEND_URL:-https://neufin-backend-abcdef123-uc.a.run.app}" > .env

# Build the application
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create a health check endpoint for Cloud Run
RUN mkdir -p /usr/share/nginx/html/health && \
    echo '{"status":"ok"}' > /usr/share/nginx/html/health/index.html

# Cloud Run needs a script to read the PORT env var and start nginx
RUN echo '#!/bin/sh \n\
sed -i "s/listen 80/listen $PORT/g" /etc/nginx/conf.d/default.conf \n\
echo "Starting Nginx on port $PORT" \n\
nginx -g "daemon off;"' > /start.sh && chmod +x /start.sh

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start NGINX with the dynamic port setting
CMD ["/start.sh"]