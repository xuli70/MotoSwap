// MotoSwap - Global State Management
// Manages application state including current user and section
// Now with real data persistence and validation

let currentUser = null;
let currentSection = 'home';
let appState = {
  initialized: false,
  dataServiceReady: false,
  supabaseConnected: false,
  userStats: null,
  lastActivity: null
};

// User state management
export function getCurrentUser() {
  return currentUser;
}

export function setCurrentUser(user) {
  // Validar usuario
  if (user && !user.id) {
    console.error('❌ Usuario inválido: falta ID');
    return false;
  }
  
  currentUser = user;
  appState.lastActivity = new Date();
  
  if (user) {
    console.log(`👤 Usuario establecido: ${user.nombre} (ID: ${user.id})`);
    
    // Guardar en localStorage para persistencia
    try {
      localStorage.setItem('motoswap_current_user', JSON.stringify({
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('⚠️ No se pudo guardar usuario en localStorage:', error.message);
    }
    
    // Cargar estadísticas del usuario (async)
    loadUserStats(user);
  } else {
    console.log('🚪 Usuario deslogueado');
    
    // Limpiar localStorage
    try {
      localStorage.removeItem('motoswap_current_user');
    } catch (error) {
      console.warn('⚠️ Error limpiando localStorage:', error.message);
    }
    
    appState.userStats = null;
  }
  
  return true;
}

// Section state management
export function getCurrentSection() {
  return currentSection;
}

export function setCurrentSection(section) {
  currentSection = section;
  console.log('Current section:', section);
}

// Cargar estadísticas del usuario
async function loadUserStats(user) {
  try {
    // Verificar que dataService esté disponible
    if (typeof window !== 'undefined' && window.dataService && window.dataService.initialized) {
      console.log('📊 Cargando estadísticas de usuario...');
      
      const stats = await window.dataService.getStats();
      if (stats) {
        appState.userStats = {
          totalUsers: stats.total_usuarios,
          totalAccommodations: stats.total_alojamientos,
          totalExchanges: stats.total_intercambios,
          avgRating: stats.valoracion_promedio,
          loadedAt: new Date()
        };
        
        console.log('✅ Estadísticas cargadas:', appState.userStats);
      }
    }
  } catch (error) {
    console.warn('⚠️ Error cargando estadísticas:', error.message);
  }
}

// Restaurar usuario desde localStorage
export function restoreUserFromStorage() {
  try {
    const stored = localStorage.getItem('motoswap_current_user');
    if (stored) {
      const userData = JSON.parse(stored);
      
      // Verificar que no sea muy antiguo (24 horas)
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas
      if (Date.now() - userData.timestamp < maxAge) {
        console.log(`🔄 Restaurando usuario desde localStorage: ${userData.nombre}`);
        
        // Crear objeto usuario básico
        const user = {
          id: userData.id,
          nombre: userData.nombre,
          email: userData.email
        };
        
        // Intentar cargar datos completos del usuario
        if (typeof window !== 'undefined' && window.dataService) {
          window.dataService.getUserByEmail(userData.email)
            .then(fullUser => {
              if (fullUser) {
                setCurrentUser(fullUser);
                console.log('✅ Datos completos del usuario cargados');
              }
            })
            .catch(error => {
              console.warn('⚠️ Error cargando datos completos:', error.message);
            });
        }
        
        return user;
      } else {
        console.log('⏰ Sesión expirada, limpiando localStorage');
        localStorage.removeItem('motoswap_current_user');
      }
    }
  } catch (error) {
    console.warn('⚠️ Error restaurando usuario:', error.message);
    localStorage.removeItem('motoswap_current_user');
  }
  
  return null;
}

// Obtener estado de la aplicación
export function getAppState() {
  return {
    ...appState,
    currentUser: currentUser ? {
      id: currentUser.id,
      nombre: currentUser.nombre,
      email: currentUser.email
    } : null,
    currentSection
  };
}

// Actualizar estado de servicios
export function updateServiceStatus(service, status) {
  if (appState.hasOwnProperty(service)) {
    appState[service] = status;
    console.log(`🔄 Estado de ${service}:`, status);
  }
}

// Verificar si el usuario está activo
export function isUserActive() {
  if (!currentUser || !appState.lastActivity) return false;
  
  const inactiveTime = Date.now() - appState.lastActivity.getTime();
  const maxInactiveTime = 30 * 60 * 1000; // 30 minutos
  
  return inactiveTime < maxInactiveTime;
}

// Actualizar actividad del usuario
export function updateUserActivity() {
  if (currentUser) {
    appState.lastActivity = new Date();
  }
}

// Initialize state
export function initializeState() {
  console.log('🛠️ Inicializando estado de la aplicación...');
  
  // Reset state
  currentUser = null;
  currentSection = 'home';
  appState.initialized = false;
  appState.dataServiceReady = false;
  appState.supabaseConnected = false;
  appState.userStats = null;
  appState.lastActivity = null;
  
  // Intentar restaurar usuario
  const restoredUser = restoreUserFromStorage();
  if (restoredUser) {
    // No usar setCurrentUser para evitar bucle
    currentUser = restoredUser;
  }
  
  // Configurar limpieza automática de inactividad
  if (typeof window !== 'undefined') {
    // Limpiar sesión si inactivo por mucho tiempo
    setInterval(() => {
      if (currentUser && !isUserActive()) {
        console.log('⏰ Sesión expirada por inactividad');
        setCurrentUser(null);
      }
    }, 5 * 60 * 1000); // Verificar cada 5 minutos
    
    // Actualizar actividad en eventos del usuario
    ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
      document.addEventListener(event, updateUserActivity, { passive: true });
    });
  }
  
  appState.initialized = true;
  console.log('✅ Estado inicializado correctamente');
}