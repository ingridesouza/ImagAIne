#!/bin/sh
set -e

# Substitui variáveis de ambiente nos arquivos JavaScript
if [ "$API_BASE_URL" != "" ]; then
    echo "Configurando API_BASE_URL para $API_BASE_URL"
    find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|http://localhost:8000|$API_BASE_URL|g" {} \;
fi

# Inicia o Nginx
exec "$@"
