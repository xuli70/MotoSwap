# 🚀 MotoSwap - Guía de Deployment con Coolify

Esta guía te permitirá desplegar MotoSwap en tu VPS usando Coolify de forma rápida y confiable.

## 📋 Requisitos Previos

- [x] VPS con Coolify instalado
- [x] Repositorio GitHub con el código de MotoSwap
- [x] Acceso a la interfaz web de Coolify

## 🏗️ Arquitectura de Deployment

```
GitHub Repository → Coolify → Docker Container → Caddy Server (Puerto 8080)
```

### Componentes:
- **Base**: Node.js 18 Alpine
- **Servidor Web**: Caddy (optimizado para SPA)
- **Puerto**: 8080 (requerido por Coolify)
- **Variables**: Inyección automática vía envsubst

---

## 🚀 Pasos para Deployment

### 1. Preparar el Repositorio

```bash
# 1. Asegurar que el repositorio está actualizado
git status
git add .
git commit -m "feat: add Coolify deployment configuration"
git push origin main

# 2. Verificar archivos necesarios están presentes:
ls -la Dockerfile config.js.template config.js.example
```

### 2. Configurar Proyecto en Coolify

#### A. Crear Nuevo Proyecto
1. Accede a tu panel de Coolify
2. Click en **"New Project"**
3. Selecciona **"From GitHub"**
4. Conecta tu repositorio de MotoSwap

#### B. Configuración del Proyecto
- **Repository**: `tu-usuario/MotoSwap`
- **Branch**: `main`
- **Build Pack**: `Dockerfile`
- **Port**: `8080` (automático)

### 3. Variables de Entorno (Opcional)

MotoSwap funciona sin variables de entorno específicas, pero puedes configurar:

#### Variables Básicas:
```bash
APP_NAME=MotoSwap
MOTOSWAP_ENV=production
```

#### Variables para Futuras Integraciones:
```bash
# Cuando integres Supabase
SUPABASE_URL=https://tuproyecto.supabase.co
SUPABASE_ANON_KEY=tu_clave_anonima

# Para autenticación futura
PASSWORD_USER=usuario_seguro_123
PASSWORD_ADMIN=admin_seguro_123
```

### 4. Deploy Automático

1. **Trigger Deploy**: Coolify detectará el push automáticamente
2. **Build Process**: Verifica logs en tiempo real
3. **Health Check**: Coolify verificará que la app responda
4. **URL Asignada**: Recibirás la URL final

---

## ✅ Verificación Post-Deploy

### 1. Build Exitoso
Verifica en los logs de Coolify:
```
✅ config.js generated successfully
🌐 Starting Caddy server on port 8080...
🚀 Starting MotoSwap on Coolify...
```

### 2. Funcionalidad de la App
- [ ] **Página principal** carga correctamente
- [ ] **Navegación** funciona (Dashboard, Perfil, Mensajes)
- [ ] **Registro/Login** modal funciona
- [ ] **Listados** se muestran correctamente
- [ ] **Filtros** funcionan
- [ ] **Mensajes** simulados funcionan
- [ ] **Responsive** en móvil

### 3. Performance
- [ ] Carga inicial < 3 segundos
- [ ] Sin errores en DevTools Console
- [ ] Recursos estáticos se cargan correctamente

---

## 🛠️ Desarrollo Local

### Configuración Inicial
```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/MotoSwap.git
cd MotoSwap

# 2. Configurar desarrollo local
cp config.js.example config.js
# Editar config.js si necesitas configuraciones específicas

# 3. Abrir en navegador
open index.html
# O usar servidor local: python -m http.server 8000
```

### Testing Local
```bash
# Verificar configuración
# Abrir DevTools → Console → buscar:
# "🏠 LOCAL DEVELOPMENT configuration loaded"

# Herramientas de desarrollo disponibles
MotoSwapDev.showConfig()        # Ver configuración actual
MotoSwapDev.toggleDebug()       # Activar/desactivar debug
MotoSwapDev.toggleFeature('MESSAGING')  # Toggle features
```

---

## 🔧 Troubleshooting

### Problema: Build Falla

**Síntomas**: Error durante el build en Coolify

**Soluciones**:
1. Verificar que Dockerfile está en el root del repositorio
2. Revisar logs de build para errores específicos
3. Verificar que todas las dependencias están disponibles

```bash
# Debug local del Dockerfile
docker build -t motoswap-test .
docker run -p 8080:8080 motoswap-test
```

### Problema: App No Carga

**Síntomas**: Coolify dice "unhealthy" o app no responde

**Soluciones**:
1. Verificar health check en logs
2. Confirmar puerto 8080 está configurado
3. Revisar configuración de Caddy

```bash
# Verificar en logs de Coolify
grep "Starting Caddy server" logs
grep "Health check" logs
```

### Problema: Configuración No Carga

**Síntomas**: Errores de configuración en console

**Soluciones**:
1. Verificar que config.js se genera correctamente
2. Revisar variables de entorno en Coolify
3. Confirmar sintaxis ${VARIABLE} en template

```bash
# Debug config generation
grep "config.js generated" logs
grep "validateMotoSwapConfig" logs
```

### Problema: Recursos Estáticos No Cargan

**Síntomas**: CSS/JS no carga, errores 404

**Soluciones**:
1. Verificar estructura de archivos en container
2. Revisar configuración de Caddy
3. Confirmar que files están copiados correctamente

---

## 🔒 Consideraciones de Seguridad

### Headers de Seguridad (Ya configurados)
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Type: text/html; charset=utf-8
```

### Variables Sensibles
- Nunca commitear `config.js` real
- Usar variables de entorno de Coolify para secretos
- Configurar .gitignore correctamente

### HTTPS
- Coolify maneja HTTPS automáticamente
- Certificados SSL gratuitos via Let's Encrypt

---

## 📊 Monitoreo y Métricas

### Logs en Coolify
- **Build logs**: Para debugging de deploy
- **Runtime logs**: Para errores de aplicación
- **Access logs**: Para tráfico y performance

### Métricas Importantes
- **Response time** < 500ms
- **Uptime** > 99%
- **Build time** < 2 minutos

---

## 🔄 Flujo de Desarrollo Recomendado

### Desarrollo → Testing → Deploy

```bash
# 1. Desarrollo local
cp config.js.example config.js
# Desarrollar features...
# Testing manual en navegador

# 2. Commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# 3. Deploy automático en Coolify
# Monitoring en tiempo real via logs

# 4. Testing en producción
# Verificar funcionalidades críticas
```

### Updates y Mantenimiento
- **Updates menores**: Push directo a main
- **Updates mayores**: Usar branches y PR
- **Rollback**: Usar commits hash en Coolify
- **Monitoring**: Verificar logs regularmente

---

## 📚 Recursos Adicionales

### Documentación
- [Coolify Docs](https://coolify.io/docs)
- [Docker Best Practices](https://docs.docker.com/develop/best-practices/)
- [Caddy Server](https://caddyserver.com/docs/)

### Soporte
- **Issues del proyecto**: Crear issues en GitHub
- **Coolify Support**: Documentación oficial
- **Community**: Discord/Forums de Coolify

---

## 🎯 Próximos Pasos

### Integraciones Futuras
1. **Supabase**: Base de datos y autenticación
2. **Email**: Notificaciones y comunicación
3. **Maps API**: Geolocalización avanzada
4. **Payment**: Sistema de pagos/puntos
5. **Mobile**: PWA o app nativa

### Configuración para Integraciones
- Actualizar `config.js.template` con nuevas variables
- Configurar variables en Coolify
- Testing de integraciones en local primero
- Deploy gradual de features

---

**🏍️ ¡MotoSwap listo para rodar en Coolify!**

*Para soporte o preguntas, crear issue en el repositorio GitHub.*