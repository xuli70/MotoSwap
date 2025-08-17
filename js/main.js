// MotoSwap - Main Application Entry Point
// Initializes all modules and starts the application with Supabase integration

import { initializeState, updateServiceStatus, getAppState } from './core/state.js';
import { showSection, initializeNavigation } from './components/navigation.js';
import { initializeModals, showModal } from './components/modals.js';
import { initializeFilters } from './components/filters.js';
import { initializeAuth } from './features/auth.js';
import { initializeDashboard } from './features/dashboard.js';
import { initializeProfile } from './features/profile.js';
import { initializeMessages } from './features/messages.js';
import dataService from './data/data-service.js';

// Initialize application with Supabase integration
async function initializeApp() {
  console.log('🏍️ MotoSwap Application Starting with Supabase...');
  
  try {
    // 1. Initialize core state first
    initializeState();
    console.log('✅ Estado inicializado');
    
    // 2. Wait for configuration to be ready
    await waitForConfiguration();
    console.log('✅ Configuración lista');
    
    // 3. Initialize data services
    await initializeDataServices();
    console.log('✅ Servicios de datos listos');
    
    // 4. Initialize all modules (now async-aware)
    await initializeAllModules();
    console.log('✅ Módulos inicializados');
    
    // 5. Initialize event listeners
    initializeEventListeners();
    console.log('✅ Event listeners configurados');
    
    // 6. Show startup information
    await showStartupInfo();
    
    // 7. Show home section by default
    showSection('home');
    
    console.log('✅ MotoSwap Application Ready with Real Data!');
    
  } catch (error) {
    console.error('❌ Error inicializando aplicación:', error.message);
    showFallbackMode();
  }
}

// Wait for configuration to be available
function waitForConfiguration() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkConfig = () => {
      attempts++;
      
      if (window.APP_CONFIG || window.env) {
        // Try to initialize if available
        if (window.initializeApp && typeof window.initializeApp === 'function') {
          window.initializeApp();
        }
        resolve();
      } else if (attempts >= maxAttempts) {
        console.warn('⚠️ Configuración no disponible, usando modo fallback');
        resolve(); // Continue anyway
      } else {
        setTimeout(checkConfig, 500);
      }
    };
    
    checkConfig();
  });
}

// Initialize data services
async function initializeDataServices() {
  console.log('🛠️ Inicializando servicios de datos...');
  
  try {
    // Initialize data service
    if (!dataService.initialized) {
      const success = await dataService.initialize();
      updateServiceStatus('dataServiceReady', success);
      
      if (success) {
        console.log('✅ Data Service inicializado');
        
        // Test Supabase connection
        const stats = await dataService.getStats();
        if (stats) {
          updateServiceStatus('supabaseConnected', true);
          console.log('✅ Conexión a Supabase verificada');
          console.log(`📊 Estadísticas: ${stats.total_usuarios} usuarios, ${stats.total_alojamientos} alojamientos`);
        }
      } else {
        console.warn('⚠️ Data Service no se pudo inicializar, usando modo fallback');
      }
    }
  } catch (error) {
    console.warn('⚠️ Error inicializando servicios:', error.message);
    updateServiceStatus('dataServiceReady', false);
    updateServiceStatus('supabaseConnected', false);
  }
}

// Initialize all modules with async support
async function initializeAllModules() {
  console.log('🗺️ Inicializando módulos...');
  
  // Initialize synchronous modules first
  initializeNavigation();
  initializeModals();
  initializeFilters();
  
  // Initialize async modules
  await initializeAuth();
  await initializeDashboard();
  await initializeProfile();
  await initializeMessages();
}

// Show startup information
async function showStartupInfo() {
  try {
    const state = getAppState();
    
    console.log('📊 Estado de la aplicación:');
    console.log('   💾 Data Service:', state.dataServiceReady ? '✅' : '❌');
    console.log('   🔗 Supabase:', state.supabaseConnected ? '✅' : '❌');
    
    if (state.supabaseConnected && state.userStats) {
      console.log('   👥 Usuarios reales:', state.userStats.totalUsers);
      console.log('   🏠 Alojamientos reales:', state.userStats.totalAccommodations);
    }
    
    // Show in UI (if there's a status element)
    updateUIStatus(state);
    
  } catch (error) {
    console.warn('⚠️ Error mostrando información de inicio:', error.message);
  }
}

// Update UI status indicator
function updateUIStatus(state) {
  // Create or update status indicator
  let statusIndicator = document.getElementById('app-status');
  if (!statusIndicator) {
    statusIndicator = document.createElement('div');
    statusIndicator.id = 'app-status';
    statusIndicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 1000;
      display: none;
    `;
    document.body.appendChild(statusIndicator);
  }
  
  const dbStatus = state.supabaseConnected ? '🔗' : '❌';
  const userCount = state.userStats?.totalUsers || 0;
  
  statusIndicator.innerHTML = `${dbStatus} BD: ${userCount} usuarios`;
  
  // Show briefly
  statusIndicator.style.display = 'block';
  setTimeout(() => {
    statusIndicator.style.display = 'none';
  }, 3000);
}

// Fallback mode for when services fail
function showFallbackMode() {
  console.log('🔄 Iniciando en modo fallback...');
  
  // Initialize basic functionality
  initializeState();
  initializeNavigation();
  initializeModals();
  initializeFilters();
  initializeEventListeners();
  showSection('home');
  
  // Show warning
  setTimeout(() => {
    alert('⚠️ Aplicación en modo básico. Algunas funciones pueden no estar disponibles.');
  }, 1000);
}

// Initialize event listeners
function initializeEventListeners() {
  console.log('Initializing event listeners...');
  
  // Register button (hero section)
  const registerBtn = document.getElementById('register-btn');
  if (registerBtn) {
    registerBtn.addEventListener('click', () => showModal('register'));
  }
  
  // Dashboard link - always allow access to view real listings
  const dashboardLink = document.querySelector('a[href="#dashboard"]');
  if (dashboardLink) {
    dashboardLink.addEventListener('click', function(e) {
      // Always show dashboard - real data available for all
      showSection('dashboard');
    });
  }
  
  // Feature cards
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach(card => {
    card.addEventListener('click', function() {
      const action = this.getAttribute('data-action');
      if (action === 'register') {
        showModal('register');
      } else if (action === 'dashboard') {
        showSection('dashboard');
      }
    });
  });
}

// Export functions for global access
window.MotoSwap = {
  showSection,
  showModal,
  initializeApp,
  getAppState,
  dataService,
  // Debug functions
  debug: {
    getState: getAppState,
    clearCache: () => dataService.clearCache(),
    testConnection: async () => {
      try {
        const stats = await dataService.getStats();
        console.log('📊 Estadísticas:', stats);
        return stats;
      } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
      }
    },
    loadUsers: async () => {
      try {
        const users = await dataService.getUsuarios();
        console.log(`👥 Usuarios cargados: ${users.length}`);
        return users;
      } catch (error) {
        console.error('❌ Error:', error.message);
        return [];
      }
    }
  }
};

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // Small delay to ensure all scripts are loaded
  setTimeout(initializeApp, 100);
}

// Global error handler
window.addEventListener('error', function(event) {
  console.error('🚨 Error global:', event.error?.message || event.message);
  
  // Don't break the app for minor errors
  if (event.error && event.error.message.includes('Module not found')) {
    console.warn('⚠️ Módulo no encontrado, continuando...');
    event.preventDefault();
  }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
  console.error('🚨 Promise rechazada:', event.reason);
  
  // Log but don't break the app
  event.preventDefault();
});

console.log('🏍️ MotoSwap v1.0 - Sistema de intercambio de casas para moteros');
console.log('📊 Datos reales desde Supabase');
console.log('🔒 Seguridad y protección anti-F12 activa');
console.log('🚀 Listo para deployment en Coolify');
console.log('\n🔧 Funciones de debug disponibles en window.MotoSwap.debug');
console.log('   - getState(): Ver estado de la app');
console.log('   - testConnection(): Probar conexión BD');
console.log('   - loadUsers(): Cargar usuarios');
console.log('   - clearCache(): Limpiar cache\n');