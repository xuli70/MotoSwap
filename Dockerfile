# =================================
# DOCKERFILE TEMPLATE - COOLIFY OPTIMIZED
# Para aplicaciones web con Supabase + MCP
# Puerto 8080, UTF-8, Variables de entorno
# =================================
FROM node:18-alpine

# Metadatos del proyecto
LABEL maintainer="sebastian"
LABEL description="MotoSwap - Intercambio de casas para moteros con Supabase"
LABEL version="1.0.0"

# Configure UTF-8 for special characters (ñ, acentos, etc.)
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV LANGUAGE=C.UTF-8

# Variables de entorno por defecto (sobrescritas por Coolify)
# OBLIGATORIAS - Tu aplicación no funcionará sin estas
ENV SUPABASE_URL=""
ENV SUPABASE_ANON_KEY=""
ENV PASSWORD_USER="usuario123"
ENV PASSWORD_ADMIN="admin123"

# OPCIONALES - Solo si tu app las usa
ENV OPENAI_API_KEY=""
ENV AI_MODEL="gpt-4o-mini"

WORKDIR /app

# Install required tools
# - caddy: fast and reliable web server
# - wget: for health checks
# - gettext: includes envsubst for environment variable injection
RUN apk add --no-cache caddy wget gettext

# Copy all project files
COPY . .

# Script para generar config.js desde variables de entorno
# Esto convierte config.js.template en config.js con valores reales
RUN echo '#!/bin/sh' > /app/generate-config.sh && \
    echo 'echo "🔧 Generando config.js con variables de entorno de Coolify..."' >> /app/generate-config.sh && \
    echo 'envsubst < /app/config.js.template > /app/config.js' >> /app/generate-config.sh && \
    echo 'echo "✅ config.js generado exitosamente"' >> /app/generate-config.sh && \
    echo 'echo "🔍 Verificando configuración:"' >> /app/generate-config.sh && \
    echo 'grep -o "SUPABASE_URL.*" /app/config.js | head -1' >> /app/generate-config.sh && \
    chmod +x /app/generate-config.sh

# Create Caddyfile for web server
# CRITICAL: Port 8080 is MANDATORY for Coolify
RUN echo -e ":${PORT:-8080} {\n\
    root * /app\n\
    file_server\n\
    try_files {path} /index.html\n\
    encode gzip\n\
    header Content-Type text/html; charset=utf-8\n\
    header X-Content-Type-Options nosniff\n\
    header X-Frame-Options DENY\n\
    header Cache-Control \"public, max-age=86400\"\n\
    log {\n\
        output stdout\n\
        format console\n\
    }\n\
}" > /app/Caddyfile

# Port 8080 MANDATORY for Coolify
EXPOSE 8080

# Health check so Coolify knows if the app is working
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Script de inicio que ejecuta todo en orden correcto
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "🚀 Iniciando aplicación con Coolify + Supabase + MCP..."' >> /app/start.sh && \
    echo 'echo "📋 Variables de entorno recibidas:"' >> /app/start.sh && \
    echo 'echo "   SUPABASE_URL: ${SUPABASE_URL}"' >> /app/start.sh && \
    echo 'echo "   PASSWORD_USER: [CONFIGURADO]"' >> /app/start.sh && \
    echo 'echo "   PASSWORD_ADMIN: [CONFIGURADO]"' >> /app/start.sh && \
    echo '/app/generate-config.sh' >> /app/start.sh && \
    echo 'echo "🌐 Iniciando servidor Caddy en puerto 8080..."' >> /app/start.sh && \
    echo 'exec caddy run --config /app/Caddyfile --adapter caddyfile' >> /app/start.sh && \
    chmod +x /app/start.sh

# Start command
CMD ["/app/start.sh"]

# =================================
# INSTRUCCIONES DE USO:
#
# 1. Configurar variables en Coolify:
#    - SUPABASE_URL: URL de tu proyecto Supabase
#    - SUPABASE_ANON_KEY: Clave anónima de Supabase
#    - PASSWORD_USER: Contraseña usuarios
#    - PASSWORD_ADMIN: Contraseña admin
#
# 2. Deploy en Coolify:
#    - Push a GitHub
#    - Variables se inyectan automáticamente
#    - App disponible en URL asignada
#
# 3. Verificar:
#    - Logs: "config.js generado exitosamente"
#    - App carga sin errores
#    - Conexión Supabase funcional
# =================================