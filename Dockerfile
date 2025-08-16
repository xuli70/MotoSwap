# =================================
# DOCKERFILE - MOTOSWAP COOLIFY DEPLOYMENT
# Optimized for Coolify deployment platform
# =================================
FROM node:18-alpine

# Project metadata
LABEL maintainer="sebastian"
LABEL description="MotoSwap - Motorcycle house exchange platform"
LABEL version="1.0.0"

# Configure UTF-8 for special characters (ñ, acentos, etc.)
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV LANGUAGE=C.UTF-8

# Environment variables (will be overridden by Coolify)
# Currently minimal setup - can be expanded for future Supabase integration
ENV MOTOSWAP_ENV="production"
ENV APP_NAME="MotoSwap"

# Optional future variables (ready for Supabase integration)
ENV SUPABASE_URL=""
ENV SUPABASE_ANON_KEY=""

WORKDIR /app

# Install required tools
# - caddy: fast and reliable web server
# - wget: for health checks
# - gettext: includes envsubst for environment variable injection
RUN apk add --no-cache caddy wget gettext

# Copy all project files
COPY . .

# Script to generate config.js from environment variables
# This converts config.js.template to config.js with real values
RUN echo '#!/bin/sh' > /app/generate-config.sh && \
    echo 'echo "🔧 Generating config.js for MotoSwap..."' >> /app/generate-config.sh && \
    echo 'if [ -f /app/config.js.template ]; then' >> /app/generate-config.sh && \
    echo '    envsubst < /app/config.js.template > /app/config.js' >> /app/generate-config.sh && \
    echo '    echo "✅ config.js generated successfully"' >> /app/generate-config.sh && \
    echo 'else' >> /app/generate-config.sh && \
    echo '    echo "ℹ️ No config.js.template found, using static configuration"' >> /app/generate-config.sh && \
    echo 'fi' >> /app/generate-config.sh && \
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

# Startup script that executes everything in correct order
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "🚀 Starting MotoSwap on Coolify..."' >> /app/start.sh && \
    echo 'echo "📋 Environment: ${MOTOSWAP_ENV}"' >> /app/start.sh && \
    echo 'echo "🏷️ App: ${APP_NAME}"' >> /app/start.sh && \
    echo '/app/generate-config.sh' >> /app/start.sh && \
    echo 'echo "🌐 Starting Caddy server on port 8080..."' >> /app/start.sh && \
    echo 'exec caddy run --config /app/Caddyfile --adapter caddyfile' >> /app/start.sh && \
    chmod +x /app/start.sh

# Start command
CMD ["/app/start.sh"]

# =================================
# DEPLOYMENT INSTRUCTIONS:
#
# 1. Push this repository to GitHub
# 2. In Coolify:
#    - Connect your GitHub repository
#    - Set environment variables if needed
#    - Deploy automatically
# 3. App will be available on assigned Coolify URL
#
# Current setup works with static MotoSwap app
# Future: Add Supabase variables when backend is integrated
# =================================