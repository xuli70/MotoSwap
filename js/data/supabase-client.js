/**
 * MotoSwap - Supabase Client Module
 * Cliente centralizado para conectar con Supabase usando el cliente JS oficial
 * Todas las operaciones de base de datos pasan por aquí
 */

class SupabaseClient {
    constructor() {
        this.initialized = false;
        this.config = null;
        this.client = null;
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

            // Crear cliente Supabase usando el SDK oficial
            if (window.supabase) {
                this.client = window.supabase.createClient(
                    this.config.SUPABASE_URL,
                    this.config.SUPABASE_ANON_KEY
                );
                console.log('✅ Supabase client inicializado');
            } else {
                throw new Error('Supabase SDK no encontrado. Incluir @supabase/supabase-js');
            }

            this.initialized = true;
            return true;

        } catch (error) {
            console.error('❌ Error inicializando Supabase client:', error.message);
            return false;
        }
    }

    /**
     * Verificar conexión
     */
    async testConnection() {
        if (!this.client) {
            throw new Error('Cliente no inicializado');
        }

        try {
            // Intentar una query simple para verificar conectividad
            const { data, error } = await this.client
                .from('users')
                .select('count')
                .limit(1);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('❌ Error conectando con Supabase:', error.message);
            return false;
        }
    }

    // ===== MÉTODOS ESPECÍFICOS PARA MOTOSWAP =====

    /**
     * Usuarios: Obtener todos los usuarios
     */
    async getUsers(limit = 50) {
        if (!this.client) throw new Error('Cliente no inicializado');

        try {
            const { data, error } = await this.client
                .from('users')
                .select(`
                    *,
                    motorcycles (
                        marca,
                        modelo,
                        tipo,
                        cilindrada,
                        licencia
                    )
                `)
                .eq('estado', 'activo')
                .order('nombre')
                .limit(limit);

            if (error) throw error;

            // Transformar datos para compatibilidad
            return {
                data: data.map(user => {
                    const motoTipo = user.motorcycles?.[0]?.tipo || null;
                    // Mapear a un tipo válido si no es especificado
                    const tipoMotoValido = motoTipo && motoTipo !== 'Sin especificar' ? motoTipo : 'Naked';
                    
                    return {
                        ...user,
                        tipo_moto: tipoMotoValido,
                        tipo_moto_original: motoTipo, // Mantener el original para mostrar en UI
                        marca: user.motorcycles?.[0]?.marca || 'Sin especificar',
                        modelo: user.motorcycles?.[0]?.modelo || 'Sin especificar',
                        cilindrada: user.motorcycles?.[0]?.cilindrada || 'N/A',
                        licencia: user.motorcycles?.[0]?.licencia || 'N/A'
                    };
                }),
                error: null
            };
        } catch (error) {
            console.error('❌ Error obteniendo usuarios:', error.message);
            return { data: [], error };
        }
    }

    /**
     * Usuarios: Buscar por email
     */
    async getUserByEmail(email) {
        if (!this.client) throw new Error('Cliente no inicializado');

        try {
            const { data, error } = await this.client
                .from('users')
                .select(`
                    *,
                    motorcycles (
                        marca,
                        modelo,
                        tipo,
                        cilindrada,
                        licencia
                    )
                `)
                .eq('email', email)
                .eq('estado', 'activo')
                .single();

            if (error) throw error;

            // Transformar para compatibilidad
            const motoTipo = data.motorcycles?.[0]?.tipo || null;
            const tipoMotoValido = motoTipo && motoTipo !== 'Sin especificar' ? motoTipo : 'Naked';
            
            const user = {
                ...data,
                tipo_moto: tipoMotoValido,
                tipo_moto_original: motoTipo, // Mantener el original para mostrar en UI
                marca: data.motorcycles?.[0]?.marca || 'Sin especificar',
                modelo: data.motorcycles?.[0]?.modelo || 'Sin especificar',
                cilindrada: data.motorcycles?.[0]?.cilindrada || 'N/A',
                licencia: data.motorcycles?.[0]?.licencia || 'N/A'
            };

            return user;
        } catch (error) {
            console.error('❌ Error buscando usuario por email:', error.message);
            return null;
        }
    }

    /**
     * Alojamientos: Obtener todos con información del propietario
     */
    async getAccommodations(limit = 50) {
        if (!this.client) throw new Error('Cliente no inicializado');

        try {
            const { data, error } = await this.client
                .from('accommodations')
                .select(`
                    *,
                    users!inner (
                        id,
                        nombre,
                        email,
                        valoracion_promedio,
                        total_intercambios,
                        motorcycles (
                            marca,
                            modelo,
                            tipo
                        )
                    )
                `)
                .eq('disponible', true)
                .eq('users.estado', 'activo')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            // Transformar datos para compatibilidad
            const accommodations = data.map(acc => {
                const motoTipo = acc.users.motorcycles?.[0]?.tipo || null;
                const tipoMotoValido = motoTipo && motoTipo !== 'Sin especificar' ? motoTipo : 'Naked';
                
                return {
                    ...acc,
                    propietario_nombre: acc.users.nombre,
                    propietario_email: acc.users.email,
                    valoracion_promedio: acc.users.valoracion_promedio,
                    total_intercambios: acc.users.total_intercambios,
                    moto_marca: acc.users.motorcycles?.[0]?.marca || 'Sin especificar',
                    moto_modelo: acc.users.motorcycles?.[0]?.modelo || 'Sin especificar',
                    moto_tipo: tipoMotoValido,
                    moto_tipo_original: motoTipo
                };
            });

            return { data: accommodations, error: null };
        } catch (error) {
            console.error('❌ Error obteniendo alojamientos:', error.message);
            return { data: [], error };
        }
    }

    /**
     * Alojamientos: Obtener por ID con facilidades
     */
    async getAccommodationById(accommodationId) {
        if (!this.client) throw new Error('Cliente no inicializado');

        try {
            const { data, error } = await this.client
                .from('accommodations')
                .select(`
                    *,
                    users!inner (
                        nombre,
                        email,
                        valoracion_promedio,
                        total_intercambios,
                        motorcycles (
                            marca,
                            modelo,
                            tipo
                        )
                    )
                `)
                .eq('id', accommodationId)
                .single();

            if (error) throw error;

            // Obtener facilidades
            const facilities = await this.getAccommodationFacilities(accommodationId);

            // Transformar datos
            const accommodation = {
                ...data,
                propietario_nombre: data.users.nombre,
                propietario_email: data.users.email,
                valoracion_promedio: data.users.valoracion_promedio,
                total_intercambios: data.users.total_intercambios,
                moto_marca: data.users.motorcycles?.[0]?.marca || 'Sin especificar',
                moto_modelo: data.users.motorcycles?.[0]?.modelo || 'Sin especificar',
                moto_tipo: data.users.motorcycles?.[0]?.tipo || 'Sin especificar',
                facilidades: facilities.data || []
            };

            return accommodation;
        } catch (error) {
            console.error('❌ Error obteniendo alojamiento por ID:', error.message);
            return null;
        }
    }

    /**
     * Facilidades: Obtener por alojamiento
     */
    async getAccommodationFacilities(accommodationId) {
        if (!this.client) throw new Error('Cliente no inicializado');

        try {
            const { data, error } = await this.client
                .from('accommodation_facilities')
                .select('nombre, categoria, icono, descripcion')
                .eq('accommodation_id', accommodationId)
                .order('categoria')
                .order('nombre');

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('❌ Error obteniendo facilidades:', error.message);
            return { data: [], error };
        }
    }

    /**
     * Compatibilidad: Obtener tipos compatibles con un tipo de moto
     */
    async getCompatibleBikeTypes(bikeType) {
        if (!this.client) throw new Error('Cliente no inicializado');

        // Validar que el tipo de moto es válido antes de consultar
        const validBikeTypes = [
            'Adventure/Trail',
            'Touring', 
            'Deportiva',
            'Cruiser',
            'Naked',
            'Scooter'
        ];

        // Si el tipo no es válido, usar fallback directamente
        if (!bikeType || bikeType === 'Sin especificar' || !validBikeTypes.includes(bikeType)) {
            console.log(`⚠️ Tipo de moto inválido o no especificado: "${bikeType}", usando fallback`);
            return this.getCompatibilityFallback(bikeType);
        }

        try {
            const { data, error } = await this.client
                .from('motorcycle_compatibility')
                .select('tipo_compatible')
                .eq('tipo_origen', bikeType)
                .order('tipo_compatible');

            if (error) throw error;
            return data.map(row => row.tipo_compatible);
        } catch (error) {
            console.error('❌ Error obteniendo compatibilidad:', error.message);
            // Fallback básico con lógica hardcodeada
            return this.getCompatibilityFallback(bikeType);
        }
    }

    /**
     * Fallback para compatibilidad de motos (lógica hardcodeada)
     */
    getCompatibilityFallback(bikeType) {
        const compatibility = {
            'Adventure/Trail': ['Adventure/Trail', 'Touring', 'Naked'],
            'Touring': ['Touring', 'Adventure/Trail', 'Cruiser'],
            'Deportiva': ['Deportiva', 'Naked'],
            'Cruiser': ['Cruiser', 'Touring'],
            'Naked': ['Naked', 'Deportiva', 'Adventure/Trail'],
            'Scooter': ['Scooter', 'Naked']
        };
        
        // Para valores no válidos o "Sin especificar", mostrar todos los tipos
        if (!bikeType || bikeType === 'Sin especificar' || !compatibility[bikeType]) {
            console.log(`ℹ️ Usando compatibilidad universal para tipo: "${bikeType}"`);
            return ['Adventure/Trail', 'Touring', 'Deportiva', 'Cruiser', 'Naked', 'Scooter'];
        }
        
        return compatibility[bikeType];
    }

    /**
     * Alojamientos: Obtener compatibles con tipo de moto
     */
    async getCompatibleAccommodations(userBikeType, limit = 20) {
        // Primero obtener tipos compatibles
        const compatibleTypes = await this.getCompatibleBikeTypes(userBikeType);
        
        if (!this.client) throw new Error('Cliente no inicializado');

        try {
            const { data, error } = await this.client
                .from('accommodations')
                .select(`
                    *,
                    users!inner (
                        nombre,
                        valoracion_promedio,
                        motorcycles!inner (
                            marca,
                            modelo,
                            tipo
                        )
                    )
                `)
                .eq('disponible', true)
                .eq('users.estado', 'activo')
                .in('users.motorcycles.tipo', compatibleTypes)
                .order('users.valoracion_promedio', { ascending: false })
                .order('puntos_por_noche', { ascending: true })
                .limit(limit);

            if (error) throw error;

            // Transformar datos
            const accommodations = data.map(acc => ({
                ...acc,
                propietario_nombre: acc.users.nombre,
                valoracion_promedio: acc.users.valoracion_promedio,
                moto_marca: acc.users.motorcycles?.[0]?.marca || 'Sin especificar',
                moto_modelo: acc.users.motorcycles?.[0]?.modelo || 'Sin especificar',
                moto_tipo: acc.users.motorcycles?.[0]?.tipo || 'Sin especificar'
            }));

            return { data: accommodations, error: null };
        } catch (error) {
            console.error('❌ Error obteniendo alojamientos compatibles:', error.message);
            return { data: [], error };
        }
    }

    /**
     * Mensajes: Obtener conversación entre dos usuarios
     */
    async getMessages(userId1, userId2, limit = 50) {
        if (!this.client) throw new Error('Cliente no inicializado');

        try {
            const { data, error } = await this.client
                .from('messages')
                .select(`
                    *,
                    sender:users!messages_remitente_id_fkey(nombre),
                    recipient:users!messages_destinatario_id_fkey(nombre)
                `)
                .or(`and(remitente_id.eq.${userId1},destinatario_id.eq.${userId2}),and(remitente_id.eq.${userId2},destinatario_id.eq.${userId1})`)
                .order('created_at', { ascending: true })
                .limit(limit);

            if (error) throw error;

            // Transformar datos
            const messages = data.map(msg => ({
                ...msg,
                remitente_nombre: msg.sender?.nombre || 'Desconocido',
                destinatario_nombre: msg.recipient?.nombre || 'Desconocido'
            }));

            return { data: messages, error: null };
        } catch (error) {
            console.error('❌ Error obteniendo mensajes:', error.message);
            return { data: [], error };
        }
    }

    /**
     * Mensajes: Enviar nuevo mensaje
     */
    async sendMessage(remitenteId, destinatarioId, contenido, tipo = 'mensaje') {
        if (!this.client) throw new Error('Cliente no inicializado');

        try {
            const { data, error } = await this.client
                .from('messages')
                .insert([{
                    remitente_id: remitenteId,
                    destinatario_id: destinatarioId,
                    contenido: contenido,
                    tipo: tipo
                }])
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('❌ Error enviando mensaje:', error.message);
            return { data: null, error };
        }
    }

    /**
     * Estadísticas: Obtener resumen general
     */
    async getStats() {
        if (!this.client) throw new Error('Cliente no inicializado');

        try {
            // Obtener estadísticas usando múltiples queries
            const [usersResult, accommodationsResult, exchangesResult, messagesResult, reviewsResult] = await Promise.all([
                this.client.from('users').select('*', { count: 'exact', head: true }).eq('estado', 'activo'),
                this.client.from('accommodations').select('*', { count: 'exact', head: true }).eq('disponible', true),
                this.client.from('exchanges').select('*', { count: 'exact', head: true }),
                this.client.from('messages').select('*', { count: 'exact', head: true }),
                this.client.from('reviews').select('*', { count: 'exact', head: true })
            ]);

            // Calcular promedio de valoraciones
            const { data: avgData } = await this.client
                .from('users')
                .select('valoracion_promedio')
                .eq('estado', 'activo')
                .not('valoracion_promedio', 'is', null);

            const avgRating = avgData.length > 0 
                ? avgData.reduce((sum, user) => sum + user.valoracion_promedio, 0) / avgData.length 
                : 0;

            const stats = {
                total_usuarios: usersResult.count || 0,
                total_alojamientos: accommodationsResult.count || 0,
                total_intercambios: exchangesResult.count || 0,
                total_mensajes: messagesResult.count || 0,
                total_reviews: reviewsResult.count || 0,
                valoracion_promedio: avgRating
            };

            return stats;
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error.message);
            return null;
        }
    }

    /**
     * Búsqueda: Buscar alojamientos por criterios
     */
    async searchAccommodations(filters = {}) {
        if (!this.client) throw new Error('Cliente no inicializado');

        try {
            let query = this.client
                .from('accommodations')
                .select(`
                    *,
                    users!inner (
                        nombre,
                        valoracion_promedio,
                        motorcycles (
                            marca,
                            modelo,
                            tipo
                        )
                    )
                `)
                .eq('disponible', true)
                .eq('users.estado', 'activo');

            // Aplicar filtros dinámicamente
            if (filters.ciudad) {
                query = query.ilike('ciudad', `%${filters.ciudad}%`);
            }
            
            if (filters.pais) {
                query = query.ilike('pais', `%${filters.pais}%`);
            }
            
            if (filters.maxPuntos) {
                query = query.lte('puntos_por_noche', filters.maxPuntos);
            }
            
            if (filters.tipoAlojamiento) {
                query = query.ilike('tipo', `%${filters.tipoAlojamiento}%`);
            }

            const { data, error } = await query
                .order('users.valoracion_promedio', { ascending: false })
                .order('puntos_por_noche', { ascending: true })
                .limit(filters.limit || 20);

            if (error) throw error;

            // Transformar datos
            const accommodations = data.map(acc => ({
                ...acc,
                propietario_nombre: acc.users.nombre,
                valoracion_promedio: acc.users.valoracion_promedio,
                moto_marca: acc.users.motorcycles?.[0]?.marca || 'Sin especificar',
                moto_modelo: acc.users.motorcycles?.[0]?.modelo || 'Sin especificar',
                moto_tipo: acc.users.motorcycles?.[0]?.tipo || 'Sin especificar'
            }));

            return { data: accommodations, error: null };
        } catch (error) {
            console.error('❌ Error en búsqueda:', error.message);
            return { data: [], error };
        }
    }
}

// No crear instancia global automáticamente para evitar conflictos
// La instancia se creará en data-service.js

// Exportar para uso en módulos
export { SupabaseClient };

/**
 * INSTRUCCIONES DE USO:
 * 
 * 1. IMPORTAR EN MÓDULOS:
 *    import { SupabaseClient } from './supabase-client.js';
 *    const client = new SupabaseClient();
 *    await client.initialize();
 * 
 * 2. VERIFICAR CONEXIÓN:
 *    const connected = await client.testConnection();
 * 
 * 3. OPERACIONES CRUD:
 *    const users = await client.getUsers();
 *    const accommodations = await client.getAccommodations();
 *    const stats = await client.getStats();
 * 
 * 4. BÚSQUEDAS:
 *    const results = await client.searchAccommodations({
 *        ciudad: 'Madrid',
 *        maxPuntos: 150
 *    });
 * 
 * 5. MENSAJERÍA:
 *    await client.sendMessage(userId1, userId2, 'Hola!');
 *    const messages = await client.getMessages(userId1, userId2);
 * 
 * 6. COMPATIBILIDAD:
 *    const compatible = await client.getCompatibleBikeTypes('Adventure/Trail');
 *    const accommodations = await client.getCompatibleAccommodations('Naked');
 */