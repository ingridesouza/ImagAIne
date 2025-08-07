# Estágio de build
FROM node:18-alpine AS build

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas o package.json primeiro (mais eficiente para cache do Docker)
COPY package.json ./

# Instala as dependências incluindo as de desenvolvimento (precisamos do Vite)
RUN npm install

# Copia o restante dos arquivos
COPY . .

# Constrói a aplicação para produção
RUN npm run build

# Estágio de produção
FROM nginx:alpine

# Instala o bash para scripts de inicialização
RUN apk add --no-cache bash

# Copia os arquivos construídos do estágio de build
COPY --from=build /app/dist /usr/share/nginx/html

# Copia a configuração simplificada do Nginx
COPY nginx-simple.conf /etc/nginx/conf.d/default.conf

# Copia o script de inicialização
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expõe a porta 80
EXPOSE 80

# Define o comando de entrada
ENTRYPOINT ["/docker-entrypoint.sh"]

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]
