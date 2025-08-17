/**
 * MotoSwap - Supabase Client Module
 * Cliente centralizado para conectar con Supabase usando MCP tools
 * Todas las operaciones de base de datos pasan por aquí
 */

class SupabaseClient {
    constructor() {
        this.initialized = false;
        this.config = null;
        this.mcpAvailable = false;
        
        // Verificar disponibilidad de MCP tools
        this.checkMCPAvailability();
    }

    /**
     * Verificar si las herramientas MCP están disponibles
     */
    checkMCPAvailability() {
        try {
            if (typeof mcp__supabase3_mcp__query === 'function') {
                this.mcpAvailable = true;
                console.log('✅ MCP Supabase tools disponibles');
            } else {
                console.warn('⚠️ MCP Supabase tools no disponibles, usando fallback');
            }
        } catch (error) {
            console.warn('⚠️ Error verificando MCP tools:', error.message);
        }
    }

    /**
     * Inicializar cliente con configuración
     */
    async initialize(config = null) {
        try {
            // Usar configuración proporcionada o global
            this.config = config || window.APP_CONFIG || window.env;
            
            if (!this.config) {
                throw new Error('Configuración no disponible');
            }

            // Validar configuración mínima
            if (!this.config.SUPABASE_URL || !this.config.SUPABASE_ANON_KEY) {
                throw new Error('SUPABASE_URL y SUPABASE_ANON_KEY son requeridos');
            }

            // Si MCP no está disponible, usar cliente JS de Supabase
            if (!this.mcpAvailable && window.supabase) {
                this.fallbackClient = window.supabase.createClient(
                    this.config.SUPABASE_URL,
                    this.config.SUPABASE_ANON_KEY
                );
                console.log('🔄 Usando cliente Supabase JS como fallback');
            }

            this.initialized = true;
            console.log('✅ Supabase client inicializado');
            return true;

        } catch (error) {
            console.error('❌ Error inicializando Supabase client:', error.message);
            return false;
        }
    }

    /**
     * Ejecutar query SQL usando MCP
     */
    async query(sql, params = [], limit = 100) {
        if (!this.initialized) {
            throw new Error('Cliente no inicializado. Llamar initialize() primero.');
        }

        try {
            // Usar MCP si está disponible
            if (this.mcpAvailable) {
                const result = await mcp__supabase3_mcp__query({
                    sql: sql,
                    params: params,
                    limit: limit
                });

                // Normalizar respuesta
                return {
                    data: result.rows || [],
                    count: result.rowCount || 0,
                    error: null
                };
            }

            // Fallback: no podemos ejecutar SQL arbitrario con cliente JS
            throw new Error('SQL directo no soportado sin MCP tools');

        } catch (error) {
            console.error('❌ Error en query:', error.message);
            return {
                data: null,
                count: 0,
                error: error
            };
        }
    }

    /**
     * Obtener información de tablas
     */
    async listTables(options = {}) {
        try {
            if (this.mcpAvailable) {
                return await mcp__supabase3_mcp__list_tables(options);
            }
            throw new Error('listTables requiere MCP tools');
        } catch (error) {
            console.error('❌ Error listando tablas:', error.message);
            return [];
        }
    }

    // ===== MÉTODOS ESPECÍFICOS PARA MOTOSWAP =====

    /**
     * Usuarios: Obtener todos los usuarios
     */
    async getUsers(limit = 50) {
        const sql = `
            SELECT u.*, m.marca, m.modelo, m.tipo as tipo_moto, m.cilindrada, m.licencia
            FROM users u
            LEFT JOIN motorcycles m ON u.id = m.user_id
            WHERE u.estado = 'activo'
            ORDER BY u.nombre
            LIMIT $1
        `;
        return await this.query(sql, [limit]);
    }

    /**
     * Usuarios: Buscar por email
     */
    async getUserByEmail(email) {
        const sql = `
            SELECT u.*, m.marca, m.modelo, m.tipo as tipo_moto, m.cilindrada, m.licencia
            FROM users u
            LEFT JOIN motorcycles m ON u.id = m.user_id
            WHERE u.email = $1 AND u.estado = 'activo'
            LIMIT 1
        `;
        const result = await this.query(sql, [email]);
        return result.data && result.data.length > 0 ? result.data[0] : null;
    }

    /**
     * Alojamientos: Obtener todos con información del propietario
     */
    async getAccommodations(limit = 50) {
        const sql = `
            SELECT 
                a.*,
                u.nombre as propietario_nombre,
                u.email as propietario_email,
                u.valoracion_promedio,
                u.total_intercambios,
                m.marca as moto_marca,
                m.modelo as moto_modelo,
                m.tipo as moto_tipo
            FROM accommodations a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN motorcycles m ON u.id = m.user_id
            WHERE a.disponible = true AND u.estado = 'activo'
            ORDER BY a.created_at DESC
            LIMIT $1
        `;
        return await this.query(sql, [limit]);
    }

    /**
     * Alojamientos: Obtener por ID con facilidades
     */
    async getAccommodationById(accommodationId) {
        const sql = `
            SELECT 
                a.*,
                u.nombre as propietario_nombre,
                u.email as propietario_email,
                u.valoracion_promedio,
                u.total_intercambios,
                m.marca as moto_marca,
                m.modelo as moto_modelo,
                m.tipo as moto_tipo
            FROM accommodations a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN motorcycles m ON u.id = m.user_id
            WHERE a.id = $1
            LIMIT 1
        `;
        const result = await this.query(sql, [accommodationId]);
        
        if (result.data && result.data.length > 0) {
            const accommodation = result.data[0];
            
            // Obtener facilidades
            const facilities = await this.getAccommodationFacilities(accommodationId);
            accommodation.facilidades = facilities.data || [];
            
            return accommodation;
        }
        
        return null;
    }

    /**
     * Facilidades: Obtener por alojamiento
     */
    async getAccommodationFacilities(accommodationId) {
        const sql = `
            SELECT nombre, categoria, icono, descripcion
            FROM accommodation_facilities
            WHERE accommodation_id = $1
            ORDER BY categoria, nombre
        `;
        return await this.query(sql, [accommodationId]);
    }

    /**
     * Compatibilidad: Obtener tipos compatibles con un tipo de moto
     */
    async getCompatibleBikeTypes(bikeType) {
        const sql = `
            SELECT DISTINCT tipo_compatible
            FROM motorcycle_compatibility
            WHERE tipo_origen = $1
            ORDER BY tipo_compatible
        `;
        const result = await this.query(sql, [bikeType]);
        return result.data ? result.data.map(row => row.tipo_compatible) : [];
    }

    /**
     * Alojamientos: Obtener compatibles con tipo de moto
     */
    async getCompatibleAccommodations(userBikeType, limit = 20) {
        const sql = `
            SELECT DISTINCT
                a.*,
                u.nombre as propietario_nombre,
                u.valoracion_promedio,
                m.marca as moto_marca,
                m.modelo as moto_modelo,
                m.tipo as moto_tipo
            FROM accommodations a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN motorcycles m ON u.id = m.user_id
            JOIN motorcycle_compatibility mc ON m.tipo = mc.tipo_compatible
            WHERE mc.tipo_origen = $1 
                AND a.disponible = true 
                AND u.estado = 'activo'
            ORDER BY u.valoracion_promedio DESC, a.puntos_por_noche ASC
            LIMIT $2
        `;
        return await this.query(sql, [userBikeType, limit]);
    }

    /**
     * Mensajes: Obtener conversación entre dos usuarios
     */
    async getMessages(userId1, userId2, limit = 50) {
        const sql = `
            SELECT 
                m.*,
                u1.nombre as remitente_nombre,
                u2.nombre as destinatario_nombre
            FROM messages m
            JOIN users u1 ON m.remitente_id = u1.id
            JOIN users u2 ON m.destinatario_id = u2.id
            WHERE (m.remitente_id = $1 AND m.destinatario_id = $2)
               OR (m.remitente_id = $2 AND m.destinatario_id = $1)
            ORDER BY m.created_at ASC
            LIMIT $3
        `;
        return await this.query(sql, [userId1, userId2, limit]);
    }

    /**
     * Mensajes: Enviar nuevo mensaje
     */
    async sendMessage(remitenteId, destinatarioId, contenido, tipo = 'mensaje') {
        const sql = `
            INSERT INTO messages (remitente_id, destinatario_id, contenido, tipo)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        return await this.query(sql, [remitenteId, destinatarioId, contenido, tipo]);
    }

    /**
     * Intercambios: Obtener por usuario
     */
    async getExchangesByUser(userId, limit = 20) {
        const sql = `
            SELECT 
                e.*,
                u1.nombre as solicitante_nombre,
                u2.nombre as anfitrion_nombre,
                a.titulo as alojamiento_titulo
            FROM exchanges e
            JOIN users u1 ON e.solicitante_id = u1.id
            JOIN users u2 ON e.anfitrion_id = u2.id
            JOIN accommodations a ON e.accommodation_id = a.id
            WHERE e.solicitante_id = $1 OR e.anfitrion_id = $1
            ORDER BY e.created_at DESC
            LIMIT $2
        `;
        return await this.query(sql, [userId, limit]);
    }

    /**
     * Reviews: Obtener por usuario
     */
    async getReviewsByUser(userId, limit = 20) {
        const sql = `
            SELECT 
                r.*,
                u1.nombre as revisor_nombre,
                u2.nombre as valorado_nombre
            FROM reviews r
            JOIN users u1 ON r.revisor_id = u1.id
            JOIN users u2 ON r.valorado_id = u2.id
            WHERE r.valorado_id = $1
            ORDER BY r.created_at DESC
            LIMIT $2
        `;
        return await this.query(sql, [userId, limit]);
    }

    /**
     * Estadísticas: Obtener resumen general
     */
    async getStats() {
        const sql = `
            SELECT 
                (SELECT COUNT(*) FROM users WHERE estado = 'activo') as total_usuarios,
                (SELECT COUNT(*) FROM accommodations WHERE disponible = true) as total_alojamientos,
                (SELECT COUNT(*) FROM exchanges) as total_intercambios,
                (SELECT COUNT(*) FROM messages) as total_mensajes,
                (SELECT COUNT(*) FROM reviews) as total_reviews,
                (SELECT AVG(valoracion_promedio) FROM users WHERE estado = 'activo') as valoracion_promedio
        `;
        const result = await this.query(sql);
        return result.data && result.data.length > 0 ? result.data[0] : null;
    }

    /**
     * Búsqueda: Buscar alojamientos por criterios
     */
    async searchAccommodations(filters = {}) {
        let sql = `
            SELECT 
                a.*,
                u.nombre as propietario_nombre,
                u.valoracion_promedio,
                m.marca as moto_marca,
                m.modelo as moto_modelo,
                m.tipo as moto_tipo
            FROM accommodations a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN motorcycles m ON u.id = m.user_id
            WHERE a.disponible = true AND u.estado = 'activo'
        `;
        
        const params = [];
        let paramCount = 0;
        
        // Filtros dinámicos
        if (filters.ciudad) {
            paramCount++;
            sql += ` AND LOWER(a.ciudad) LIKE LOWER($${paramCount})`;
            params.push(`%${filters.ciudad}%`);
        }
        
        if (filters.pais) {
            paramCount++;
            sql += ` AND LOWER(a.pais) LIKE LOWER($${paramCount})`;
            params.push(`%${filters.pais}%`);
        }
        
        if (filters.maxPuntos) {
            paramCount++;
            sql += ` AND a.puntos_por_noche <= $${paramCount}`;
            params.push(filters.maxPuntos);
        }
        
        if (filters.tipoAlojamiento) {
            paramCount++;
            sql += ` AND LOWER(a.tipo) LIKE LOWER($${paramCount})`;
            params.push(`%${filters.tipoAlojamiento}%`);
        }
        
        sql += ` ORDER BY u.valoracion_promedio DESC, a.puntos_por_noche ASC`;
        sql += ` LIMIT ${filters.limit || 20}`;
        
        return await this.query(sql, params);
    }
}

// Crear instancia global
window.supabaseClient = new SupabaseClient();

// Auto-inicialización cuando la configuración esté disponible
if (typeof window !== 'undefined') {
    // Esperar a que la configuración esté lista
    const initWhenReady = () => {
        if (window.APP_CONFIG || window.env) {
            window.supabaseClient.initialize()
                .then(success => {
                    if (success) {
                        console.log('🗄️ Supabase client auto-inicializado');
                    }
                })
                .catch(error => {
                    console.warn('⚠️ Auto-inicialización falló:', error.message);
                });
        } else {
            // Reintentar en 1 segundo
            setTimeout(initWhenReady, 1000);
        }
    };
    
    // Iniciar verificación
    setTimeout(initWhenReady, 100);
}

// Exportar para uso en módulos
export { SupabaseClient };
export default window.supabaseClient;

/**
 * INSTRUCCIONES DE USO:
 * 
 * 1. IMPORTAR EN MÓDULOS:
 *    import supabaseClient from '../data/supabase-client.js';
 * 
 * 2. USAR EN SCRIPTS:
 *    const users = await window.supabaseClient.getUsers();
 *    const accommodations = await window.supabaseClient.getAccommodations();
 * 
 * 3. BÚSQUEDAS:
 *    const results = await window.supabaseClient.searchAccommodations({
 *        ciudad: 'Madrid',
 *        maxPuntos: 150
 *    });
 * 
 * 4. MENSAJERÍA:
 *    await window.supabaseClient.sendMessage(userId1, userId2, 'Hola!');
 *    const messages = await window.supabaseClient.getMessages(userId1, userId2);
 * 
 * 5. COMPATIBILIDAD:
 *    const compatible = await window.supabaseClient.getCompatibleBikeTypes('Adventure/Trail');
 *    const accommodations = await window.supabaseClient.getCompatibleAccommodations('Naked');
 * 
 * 6. ESTADÍSTICAS:
 *    const stats = await window.supabaseClient.getStats();
 */