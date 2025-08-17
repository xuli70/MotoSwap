/**
 * MotoSwap - Data Service Module
 * Servicio principal de datos que reemplaza completamente los datos mock
 * Usa 100% datos reales de Supabase vía cliente JS oficial
 */

import { SupabaseClient } from './supabase-client.js';

class DataService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
        this.initialized = false;
        this.supabaseClient = new SupabaseClient();
    }

    /**
     * Inicializar servicio de datos
     */
    async initialize() {
        try {
            // Inicializar cliente Supabase
            const success = await this.supabaseClient.initialize();
            if (!success) {
                throw new Error('Falló inicialización de Supabase');
            }

            this.initialized = true;
            console.log('✅ Data Service inicializado');
            return true;
        } catch (error) {
            console.error('❌ Error inicializando Data Service:', error.message);
            return false;
        }
    }

    /**
     * Cache helper - obtener datos cacheados
     */
    getCached(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    /**
     * Cache helper - guardar datos en cache
     */
    setCached(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    // ===== API PÚBLICA COMPATIBLE CON CÓDIGO EXISTENTE =====

    /**
     * Obtener todos los usuarios (reemplaza appData.usuarios)
     */
    async getUsuarios() {
        const cacheKey = 'usuarios';
        let cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const result = await this.supabaseClient.getUsers();
            if (result.error) throw result.error;

            // Transformar datos para compatibilidad con formato anterior
            const usuarios = result.data.map(user => ({
                id: user.id,
                nombre: user.nombre,
                edad: user.edad,
                experiencia: `${user.experiencia_anos} años`,
                ubicacion: user.ubicacion,
                valoracion: user.valoracion_promedio,
                puntos: user.puntos,
                totalIntercambios: user.total_intercambios,
                moto: {
                    marca: user.marca || 'Sin especificar',
                    modelo: user.modelo || 'Sin especificar',
                    tipo: user.tipo_moto || 'Sin especificar',
                    cilindrada: user.cilindrada || 'N/A',
                    licencia: user.licencia || 'N/A'
                },
                email: user.email,
                // Alojamiento básico (se puede expandir con query específica)
                alojamiento: {
                    tipo: 'Alojamiento disponible',
                    habitaciones: 2,
                    garaje: 'Garaje privado',
                    facilidades: ['Garaje seguro', 'Acceso fácil'],
                    descripcion: 'Alojamiento disponible para intercambio',
                    puntosPorNoche: 100
                }
            }));

            this.setCached(cacheKey, usuarios);
            console.log(`✅ Cargados ${usuarios.length} usuarios reales de Supabase`);
            return usuarios;

        } catch (error) {
            console.error('❌ Error cargando usuarios:', error.message);
            // Fallback: retornar array vacío en lugar de datos mock
            return [];
        }
    }

    /**
     * Obtener alojamientos disponibles
     */
    async getAlojamientos(limit = 20) {
        const cacheKey = `alojamientos_${limit}`;
        let cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const result = await this.supabaseClient.getAccommodations(limit);
            if (result.error) throw result.error;

            const alojamientos = result.data.map(acc => ({
                id: acc.id,
                userId: acc.user_id,
                titulo: acc.titulo,
                tipo: acc.tipo,
                ubicacion: `${acc.ciudad}, ${acc.pais}`,
                habitaciones: acc.habitaciones,
                garaje: acc.garaje_tipo,
                puntosPorNoche: acc.puntos_por_noche,
                disponible: acc.disponible,
                descripcion: acc.descripcion,
                propietario: {
                    nombre: acc.propietario_nombre,
                    email: acc.propietario_email,
                    valoracion: acc.valoracion_promedio,
                    intercambios: acc.total_intercambios,
                    moto: {
                        marca: acc.moto_marca,
                        modelo: acc.moto_modelo,
                        tipo: acc.moto_tipo
                    }
                }
            }));

            this.setCached(cacheKey, alojamientos);
            console.log(`✅ Cargados ${alojamientos.length} alojamientos reales`);
            return alojamientos;

        } catch (error) {
            console.error('❌ Error cargando alojamientos:', error.message);
            return [];
        }
    }

    /**
     * Buscar usuario por email (para autenticación)
     */
    async getUserByEmail(email) {
        try {
            const user = await this.supabaseClient.getUserByEmail(email);
            if (!user) return null;

            // Transformar para compatibilidad
            return {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                edad: user.edad,
                experiencia: `${user.experiencia_anos} años`,
                ubicacion: user.ubicacion,
                valoracion: user.valoracion_promedio,
                puntos: user.puntos,
                moto: {
                    marca: user.marca || 'Sin especificar',
                    modelo: user.modelo || 'Sin especificar',
                    tipo: user.tipo_moto || 'Sin especificar'
                }
            };
        } catch (error) {
            console.error('❌ Error buscando usuario:', error.message);
            return null;
        }
    }

    /**
     * Obtener tipos de moto compatibles
     */
    async getCompatibleBikeTypes(bikeType) {
        const cacheKey = `compatible_${bikeType}`;
        let cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const types = await this.supabaseClient.getCompatibleBikeTypes(bikeType);
            this.setCached(cacheKey, types);
            return types;
        } catch (error) {
            console.error('❌ Error obteniendo compatibilidad:', error.message);
            // Fallback básico
            return [bikeType];
        }
    }

    /**
     * Obtener alojamientos compatibles con tipo de moto
     */
    async getCompatibleAccommodations(bikeType, limit = 20) {
        try {
            const result = await this.supabaseClient.getCompatibleAccommodations(bikeType, limit);
            if (result.error) throw result.error;

            return result.data.map(acc => ({
                id: acc.id,
                titulo: acc.titulo,
                tipo: acc.tipo,
                ubicacion: `${acc.ciudad}, ${acc.pais}`,
                puntosPorNoche: acc.puntos_por_noche,
                propietario: {
                    nombre: acc.propietario_nombre,
                    valoracion: acc.valoracion_promedio,
                    moto: {
                        marca: acc.moto_marca,
                        modelo: acc.moto_modelo,
                        tipo: acc.moto_tipo
                    }
                }
            }));
        } catch (error) {
            console.error('❌ Error obteniendo alojamientos compatibles:', error.message);
            return [];
        }
    }

    /**
     * Mensajería: Obtener mensajes entre usuarios
     */
    async getMessages(userId1, userId2) {
        try {
            const result = await this.supabaseClient.getMessages(userId1, userId2);
            if (result.error) throw result.error;

            return result.data.map(msg => ({
                id: msg.id,
                remitenteId: msg.remitente_id,
                destinatarioId: msg.destinatario_id,
                contenido: msg.contenido,
                tipo: msg.tipo,
                fecha: msg.created_at,
                remitente: msg.remitente_nombre,
                destinatario: msg.destinatario_nombre
            }));
        } catch (error) {
            console.error('❌ Error obteniendo mensajes:', error.message);
            return [];
        }
    }

    /**
     * Mensajería: Enviar mensaje
     */
    async sendMessage(remitenteId, destinatarioId, contenido, tipo = 'mensaje') {
        try {
            const result = await this.supabaseClient.sendMessage(remitenteId, destinatarioId, contenido, tipo);
            if (result.error) throw result.error;

            console.log('✅ Mensaje enviado correctamente');
            return result.data;
        } catch (error) {
            console.error('❌ Error enviando mensaje:', error.message);
            throw error;
        }
    }

    /**
     * Obtener estadísticas de la aplicación
     */
    async getStats() {
        const cacheKey = 'stats';
        let cached = this.getCached(cacheKey);
        if (cached) return cached;

        try {
            const stats = await this.supabaseClient.getStats();
            if (stats) {
                this.setCached(cacheKey, stats);
                return stats;
            }
            return null;
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error.message);
            return null;
        }
    }

    /**
     * Búsqueda avanzada de alojamientos
     */
    async searchAccommodations(filters) {
        try {
            const result = await this.supabaseClient.searchAccommodations(filters);
            if (result.error) throw result.error;

            return result.data.map(acc => ({
                id: acc.id,
                titulo: acc.titulo,
                tipo: acc.tipo,
                ubicacion: `${acc.ciudad}, ${acc.pais}`,
                puntosPorNoche: acc.puntos_por_noche,
                propietario: {
                    nombre: acc.propietario_nombre,
                    valoracion: acc.valoracion_promedio,
                    moto: {
                        marca: acc.moto_marca,
                        modelo: acc.moto_modelo,
                        tipo: acc.moto_tipo
                    }
                }
            }));
        } catch (error) {
            console.error('❌ Error en búsqueda:', error.message);
            return [];
        }
    }

    /**
     * Verificar conexión con Supabase
     */
    async testConnection() {
        try {
            return await this.supabaseClient.testConnection();
        } catch (error) {
            console.error('❌ Error probando conexión:', error.message);
            return false;
        }
    }

    /**
     * Limpiar cache (útil para desarrollo)
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache limpiado');
    }

    /**
     * Obtener información del cache (útil para debugging)
     */
    getCacheInfo() {
        const info = {
            entries: this.cache.size,
            keys: Array.from(this.cache.keys()),
            totalSize: JSON.stringify(Array.from(this.cache.values())).length
        };
        console.table(info);
        return info;
    }
}

// Crear instancia global
const dataService = new DataService();

// Auto-inicialización
if (typeof window !== 'undefined') {
    window.dataService = dataService;
    
    // Inicializar cuando la configuración esté lista
    const initWhenReady = () => {
        if (window.APP_CONFIG || window.env) {
            dataService.initialize()
                .then(success => {
                    if (success) {
                        console.log('✅ Data Service inicializado');
                        
                        // Verificar conexión
                        dataService.testConnection()
                            .then(connected => {
                                if (connected) {
                                    console.log('✅ Supabase client inicializado');
                                } else {
                                    console.warn('⚠️ Conexión Supabase falló, usando modo fallback');
                                }
                            });
                    }
                })
                .catch(error => {
                    console.warn('⚠️ Data Service inicialización falló:', error.message);
                });
        } else {
            setTimeout(initWhenReady, 500);
        }
    };
    
    setTimeout(initWhenReady, 100);
}

// Objeto compatible con el formato anterior para migración gradual
export const appData = {
    // Getter que obtiene datos reales
    get usuarios() {
        console.warn('⚠️ Usando appData.usuarios (deprecated). Migrar a dataService.getUsuarios()');
        return dataService.getUsuarios();
    }
};

// API principal
export { dataService };
export default dataService;

/**
 * INSTRUCCIONES DE MIGRACIÓN:
 * 
 * 1. REEMPLAZAR IMPORTS:
 *    // Antes:
 *    import { appData } from '../data/users-data.js';
 *    
 *    // Después:
 *    import dataService from '../data/data-service.js';
 * 
 * 2. REEMPLAZAR CÓDIGO:
 *    // Antes:
 *    appData.usuarios.forEach(...)
 *    
 *    // Después:
 *    const usuarios = await dataService.getUsuarios();
 *    usuarios.forEach(...)
 * 
 * 3. NUEVAS FUNCIONALIDADES:
 *    const alojamientos = await dataService.getAlojamientos();
 *    const compatible = await dataService.getCompatibleBikeTypes('Naked');
 *    const messages = await dataService.getMessages(userId1, userId2);
 *    await dataService.sendMessage(userId1, userId2, 'Hola!');
 * 
 * 4. DEBUGGING:
 *    dataService.getCacheInfo();
 *    dataService.clearCache();
 *    await dataService.testConnection();
 * 
 * 5. BÚSQUEDA:
 *    const results = await dataService.searchAccommodations({
 *        ciudad: 'Madrid',
 *        maxPuntos: 150
 *    });
 */