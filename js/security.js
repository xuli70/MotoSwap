/**
 * MotoSwap Security Module
 * Protección anti-F12 y enmascarado automático de datos sensibles
 * Compatible con Coolify + Supabase
 */

(function() {
    'use strict';

    // Lista de patrones sensibles que deben ser enmascarados
    const SENSITIVE_PATTERNS = [
        /eyJ[A-Za-z0-9_-]{10,}/g,  // JWT tokens
        /sb-[a-zA-Z0-9-]{20,}/g,   // Supabase keys
        /pk_[a-zA-Z0-9]{20,}/g,    // API keys públicas
        /sk_[a-zA-Z0-9]{20,}/g,    // API keys secretas
        /AKIA[A-Z0-9]{16}/g,       // AWS keys
        /[a-f0-9]{32}/g,           // MD5 hashes
        /[a-f0-9]{40}/g,           // SHA1 hashes
        /password['":\s]*['"]\w+['"]/gi,  // Passwords
        /token['":\s]*['"]\w+['"]/gi      // Tokens
    ];

    // Función para enmascarar datos sensibles
    function maskSensitiveData(str) {
        if (typeof str !== 'string') return str;
        
        let masked = str;
        SENSITIVE_PATTERNS.forEach(pattern => {
            masked = masked.replace(pattern, (match) => {
                const len = match.length;
                if (len <= 8) return '***';
                const show = Math.min(4, Math.floor(len / 4));
                return match.substring(0, show) + '...[MASKED]';
            });
        });
        
        return masked;
    }

    // Interceptar console.log para enmascarar automáticamente
    const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info,
        debug: console.debug
    };

    function createSecureLogger(originalMethod) {
        return function(...args) {
            const maskedArgs = args.map(arg => {
                if (typeof arg === 'string') {
                    return maskSensitiveData(arg);
                } else if (typeof arg === 'object' && arg !== null) {
                    try {
                        const str = JSON.stringify(arg, null, 2);
                        const masked = maskSensitiveData(str);
                        return JSON.parse(masked);
                    } catch (e) {
                        return arg;
                    }
                }
                return arg;
            });
            
            originalMethod.apply(console, maskedArgs);
        };
    }

    // Reemplazar métodos de console
    console.log = createSecureLogger(originalConsole.log);
    console.warn = createSecureLogger(originalConsole.warn);
    console.error = createSecureLogger(originalConsole.error);
    console.info = createSecureLogger(originalConsole.info);
    console.debug = createSecureLogger(originalConsole.debug);

    // Protección contra Developer Tools
    const antiDebug = {
        devtools: false,
        
        detect: function() {
            const start = new Date();
            // Técnica de detección basada en tiempo
            debugger;
            const end = new Date();
            
            if (end - start > 100) {
                this.devtools = true;
                this.handleDetection();
            }
        },

        handleDetection: function() {
            if (typeof window !== 'undefined') {
                // Limpiar datos sensibles del localStorage
                this.cleanSensitiveStorage();
                
                // Mostrar advertencia amigable
                console.warn('🛡️ Developer Tools detectado. Por seguridad, algunos datos han sido enmascarados.');
                
                // Opcional: redireccionar o mostrar mensaje
                if (window.APP_CONFIG && window.APP_CONFIG.SECURITY_STRICT) {
                    alert('Por motivos de seguridad, esta aplicación no permite el uso de Developer Tools.');
                    window.location.reload();
                }
            }
        },

        cleanSensitiveStorage: function() {
            try {
                // Limpiar localStorage de datos sensibles
                const sensitiveKeys = ['token', 'auth', 'credentials', 'session'];
                sensitiveKeys.forEach(key => {
                    Object.keys(localStorage).forEach(storageKey => {
                        if (storageKey.toLowerCase().includes(key)) {
                            localStorage.removeItem(storageKey);
                        }
                    });
                });

                // También limpiar sessionStorage
                sensitiveKeys.forEach(key => {
                    Object.keys(sessionStorage).forEach(storageKey => {
                        if (storageKey.toLowerCase().includes(key)) {
                            sessionStorage.removeItem(storageKey);
                        }
                    });
                });
            } catch (e) {
                console.warn('No se pudo limpiar storage:', e.message);
            }
        }
    };

    // Monitoreo periódico (menos agresivo para UX)
    if (typeof window !== 'undefined') {
        setInterval(() => {
            try {
                antiDebug.detect();
            } catch (e) {
                // Silenciar errores para no afectar UX
            }
        }, 5000); // Cada 5 segundos
    }

    // Proteger contra context menu (click derecho)
    if (typeof document !== 'undefined') {
        document.addEventListener('contextmenu', function(e) {
            if (window.APP_CONFIG && window.APP_CONFIG.SECURITY_DISABLE_CONTEXT) {
                e.preventDefault();
                console.info('🛡️ Click derecho deshabilitado por seguridad');
            }
        });

        // Proteger contra teclas de desarrollo
        document.addEventListener('keydown', function(e) {
            // F12, Ctrl+Shift+I, Ctrl+U, Ctrl+Shift+C
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C')) ||
                (e.ctrlKey && e.key === 'u')) {
                
                if (window.APP_CONFIG && window.APP_CONFIG.SECURITY_DISABLE_DEVKEYS) {
                    e.preventDefault();
                    console.warn('🛡️ Tecla de desarrollo bloqueada por seguridad');
                }
            }
        });
    }

    // API pública del módulo de seguridad
    window.MotoSwapSecurity = {
        version: '1.0.0',
        
        // Función para enmascarar manualmente
        mask: maskSensitiveData,
        
        // Función para limpiar datos
        cleanStorage: function() {
            antiDebug.cleanSensitiveStorage();
        },
        
        // Estado de seguridad
        status: function() {
            console.log('🛡️ MotoSwap Security Status:', {
                devtoolsDetected: antiDebug.devtools,
                consoleProtected: true,
                storageProtected: true,
                version: this.version
            });
        },
        
        // Configurar nivel de seguridad
        configure: function(options = {}) {
            if (window.APP_CONFIG) {
                window.APP_CONFIG.SECURITY_STRICT = options.strict || false;
                window.APP_CONFIG.SECURITY_DISABLE_CONTEXT = options.disableContext || false;
                window.APP_CONFIG.SECURITY_DISABLE_DEVKEYS = options.disableDevKeys || false;
            }
            console.log('🛡️ Configuración de seguridad actualizada');
        }
    };

    // Log de inicialización
    console.log('🛡️ MotoSwap Security initialized');
    console.log('   ✅ Console protection: ACTIVE');
    console.log('   ✅ Data masking: ACTIVE');
    console.log('   ✅ DevTools monitoring: ACTIVE');
    
    // Auto-configuración basada en entorno
    if (typeof window !== 'undefined' && window.APP_CONFIG) {
        // En producción, ser más estricto
        if (window.APP_CONFIG.SUPABASE_URL && !window.APP_CONFIG.DEVELOPMENT) {
            window.MotoSwapSecurity.configure({
                strict: false,  // No ser demasiado agresivo para UX
                disableContext: false,
                disableDevKeys: false
            });
        }
    }

})();

/**
 * INSTRUCCIONES DE USO:
 * 
 * 1. INCLUIR EN index.html:
 *    <script src="js/security.js"></script>
 * 
 * 2. USAR EN CÓDIGO:
 *    window.MotoSwapSecurity.mask("sensitive-data");
 *    window.MotoSwapSecurity.status();
 * 
 * 3. CONFIGURAR SEGURIDAD:
 *    window.MotoSwapSecurity.configure({
 *        strict: true,
 *        disableContext: true,
 *        disableDevKeys: true
 *    });
 * 
 * 4. FEATURES:
 *    - Enmascarado automático en console.log
 *    - Detección de Developer Tools
 *    - Limpieza automática de storage sensible
 *    - Protección contra teclas de desarrollo
 *    - API pública para control manual
 */