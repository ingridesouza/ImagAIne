FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG VITE_API_BASE_URL="http://localhost:8000/api"
ARG VITE_APP_URL="http://localhost:5173"
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_APP_URL=${VITE_APP_URL}
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
