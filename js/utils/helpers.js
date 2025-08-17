// MotoSwap - Helper Functions
// Utility functions used across the application

// Get compatible bike types for matching
export function getCompatibleBikeTypes(userBikeType) {
  const compatibility = {
    'Adventure/Trail': ['Adventure', 'Touring', 'Naked'],
    'Touring': ['Touring', 'Adventure', 'Cruiser'],
    'Deportiva': ['Deportiva', 'Naked'],
    'Cruiser': ['Cruiser', 'Touring'],
    'Naked': ['Naked', 'Deportiva', 'Adventure'],
    'Scooter': ['Scooter', 'Naked']
  };
  
  return compatibility[userBikeType] || [userBikeType];
}

// Get icon for facility type
export function getFacilityIcon(facility) {
  const icons = {
    'Anclajes suelo': '⚓',
    'Herramientas básicas': '🔧',
    'Cámaras seguridad': '📹',
    'Zona lavado motos': '🚿',
    'Acceso fácil': '🚪',
    'Herramientas mantenimiento': '🔧',
    'Conexión eléctrica': '⚡',
    'Elevador moto': '⬆️',
    'Kit limpieza': '🧹',
    'Zona BBQ': '🍖',
    'Parking múltiple': '🏍️',
    'Taller equipado': '🛠️',
    'Zona lavado presión': '💦',
    'Aceites disponibles': '🛢️',
    'Vigilancia 24h': '👁️',
    'Ascensor directo': '🛗',
    'Cerca de tiendas moto': '🏪',
    'Cadenas seguridad': '🔗',
    'WiFi fibra': '📶',
    'Terraza': '🏞️',
    'Taller completo': '🛠️',
    'Elevador hidráulico': '⬆️',
    'Repuestos básicos': '🔩',
    'Ducha exterior': '🚿',
    'Patio interior cubierto': '🏠',
    'Cargador eléctrico': '🔌',
    'Kit herramientas': '🔧',
    'Guías rutas locales': '🗺️',
    'Anclajes pared': '⚓',
    'Compresor aire': '💨',
    'Zona almacenamiento equipación': '📦',
    'Trastero para equipación': '📦',
    'Cerca metro': '🚇',
    'Supermercado 24h': '🏪',
    'Cobertizo grande': '🏚️',
    'Plaza de garaje privada': '🅿️',
    'Parking comunitario seguro': '🅿️',
    'Doble garaje cerrado': '🏠',
    'Garaje individual cerrado': '🏠',
    'Parking subterráneo': '🅿️',
    'Parking seguro': '🅿️',
    'WiFi gratuito': '📶'
  };
  
  return icons[facility] || '✓';
}

// Generate random points for listings
export function getRandomPoints() {
  return 50 + Math.floor(Math.random() * 100);
}