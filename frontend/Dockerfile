# Estágio de build
FROM node:18-alpine as build

# Define o diretório de trabalho
WORKDIR /app

# Instala as ferramentas necessárias para build
RUN apk add --no-cache python3 make g++

# Copia os arquivos de configuração do projeto
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm ci --omit=dev

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

# Copia a configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o script de inicialização
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expõe a porta 80
EXPOSE 80

# Define o comando de entrada
ENTRYPOINT ["/docker-entrypoint.sh"]

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]
