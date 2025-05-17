# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy project files and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run needs a script to read the PORT env var and start nginx
RUN echo '#!/bin/sh \n\
sed -i "s/listen 80/listen $PORT/g" /etc/nginx/conf.d/default.conf \n\
nginx -g "daemon off;"' > /start.sh && chmod +x /start.sh

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start NGINX with the dynamic port setting
CMD ["/start.sh"]