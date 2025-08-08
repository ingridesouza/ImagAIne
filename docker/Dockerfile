# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Python backend with Nginx
FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    NODE_ENV=production

WORKDIR /app

# Copy backend requirements and install
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install gunicorn && \
    pip install -r requirements.txt

# Copy backend code
COPY . .

# Copy frontend build from frontend-builder
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Copy Nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy startup script
COPY docker/startup.sh /app/docker/startup.sh
RUN chmod +x /app/docker/startup.sh

# Expose port 80 for Nginx
EXPOSE 80

# Start the application
CMD ["/app/docker/startup.sh"]
