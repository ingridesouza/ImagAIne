#!/bin/bash
set -x  # Ativa modo debug

# Função para log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Iniciar Nginx com configuração de debug
log "Iniciando Nginx..."
cp /app/docker/nginx-debug.conf /etc/nginx/nginx.conf
mkdir -p /var/log/nginx
nginx -t
service nginx start

# Mudar para o diretório do backend
cd /app/backend

# Verificar estrutura de diretórios
log "Verificando estrutura de diretórios..."
mkdir -p /app/backend/static
ls -la /app
ls -la /app/backend

# Coletar arquivos estáticos
log "Coletando arquivos estáticos..."
python manage.py collectstatic --noinput --verbosity 3

# Aplicar migrações do banco de dados
log "Aplicando migrações do banco de dados..."
python manage.py showmigrations
python manage.py migrate --noinput --verbosity 3

# Verificar conexão com o banco de dados
log "Verificando conexão com o banco de dados..."
python -c "
import os, django
django.setup()
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute('SELECT 1')
    print('Conexão com o banco de dados OK')
"

# Iniciar Gunicorn com logs detalhados
log "Iniciando Gunicorn..."
exec gunicorn imagAine.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --log-level debug \
    --log-file - \
    --access-logfile - \
    --error-logfile - \
    --capture-output \
    --enable-stdio-inheritance \
    --chdir /app/backend
