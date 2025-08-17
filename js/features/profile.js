// MotoSwap - Profile Module
// Handles user profile display and management

import { getCurrentUser } from '../core/state.js';
import { getFacilityIcon } from '../utils/helpers.js';
import { simulateLogin } from './auth.js';
import dataService from '../data/data-service.js';

// Load and display user profile
export async function loadUserProfile() {
  console.log('🏠 Loading user profile with real data...');
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    console.log('No current user, simulating login first...');
    await simulateLogin();
    return;
  }
  
  // Update profile information
  const elements = {
    'profile-name': currentUser.nombre,
    'profile-location': currentUser.ubicacion,
    'moto-info': `${currentUser.moto.marca} ${currentUser.moto.modelo}`
  };
  
  Object.entries(elements).forEach(([id, text]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  });
  
  // Update badges
  const badges = document.querySelector('.profile__badges');
  if (badges) {
    badges.innerHTML = `
      <span class="badge badge--success">Verificado</span>
      <span class="badge badge--info">${currentUser.experiencia} experiencia</span>
    `;
  }
  
  // Update moto specs
  const specs = document.querySelector('.moto-card__specs');
  if (specs) {
    specs.innerHTML = `
      <span class="spec">${currentUser.moto.tipo}</span>
      <span class="spec">${currentUser.moto.cilindrada}</span>
      <span class="spec">Licencia ${currentUser.moto.licencia}</span>
    `;
  }
  
  // Update accommodation facilities (load real facilities if available)
  const facilities = document.querySelector('.facilities');
  if (facilities) {
    // Mostrar loading mientras se cargan facilidades reales
    facilities.innerHTML = '<span class="loading">🔄 Cargando facilidades...</span>';
    
    try {
      // Intentar obtener facilidades reales del alojamiento
      const alojamientos = await dataService.getAlojamientos(1);
      const userAccommodation = alojamientos.find(a => a.propietario?.email === currentUser.email);
      
      if (userAccommodation && userAccommodation.facilidades && userAccommodation.facilidades.length > 0) {
        // Usar facilidades reales de Supabase
        facilities.innerHTML = userAccommodation.facilidades
          .map(facilidad => {
            const nombre = facilidad.nombre || facilidad;
            const icono = facilidad.icono || getFacilityIcon(nombre);
            return `<span class="facility">${icono} ${nombre}</span>`;
          })
          .join('');
      } else {
        // Fallback a facilidades del perfil
        facilities.innerHTML = currentUser.alojamiento.facilidades
          .map(facilidad => `<span class="facility">${getFacilityIcon(facilidad)} ${facilidad}</span>`)
          .join('');
      }
    } catch (error) {
      console.warn('⚠️ Error cargando facilidades reales:', error.message);
      // Fallback a facilidades del perfil
      facilities.innerHTML = currentUser.alojamiento.facilidades
        .map(facilidad => `<span class="facility">${getFacilityIcon(facilidad)} ${facilidad}</span>`)
        .join('');
    }
  }
  
  // Update points and rating
  const pointsElement = document.querySelector('.profile__points');
  if (pointsElement) {
    pointsElement.textContent = `${currentUser.puntos} puntos disponibles`;
  }
  
  const ratingElement = document.querySelector('.profile__rating');
  if (ratingElement) {
    ratingElement.textContent = `${'⭐'.repeat(Math.floor(currentUser.valoracion))} ${currentUser.valoracion}`;
  }
  
  // Cargar estadísticas reales del usuario
  await loadUserStats(currentUser);
}

// Cargar estadísticas reales del usuario
async function loadUserStats(user) {
  try {
    console.log('📊 Cargando estadísticas reales...');
    
    // Obtener estadísticas generales
    const stats = await dataService.getStats();
    
    // Obtener intercambios del usuario
    const exchanges = await dataService.query(
      'SELECT COUNT(*) as total FROM exchanges WHERE solicitante_id = $1 OR anfitrion_id = $1',
      [user.id]
    );
    
    // Obtener reviews del usuario
    const reviews = await dataService.query(
      'SELECT COUNT(*) as total, AVG(puntuacion) as promedio FROM reviews WHERE valorado_id = $1',
      [user.id]
    );
    
    // Obtener mensajes del usuario
    const messages = await dataService.query(
      'SELECT COUNT(*) as total FROM messages WHERE remitente_id = $1 OR destinatario_id = $1',
      [user.id]
    );
    
    // Actualizar estadísticas en la UI
    updateStatsDisplay({
      totalUsers: stats?.total_usuarios || 0,
      userExchanges: exchanges.data?.[0]?.total || 0,
      userReviews: reviews.data?.[0]?.total || 0,
      userRating: reviews.data?.[0]?.promedio || user.valoracion,
      userMessages: messages.data?.[0]?.total || 0
    });
    
  } catch (error) {
    console.warn('⚠️ Error cargando estadísticas:', error.message);
  }
}

// Actualizar display de estadísticas
function updateStatsDisplay(stats) {
  // Crear o actualizar sección de estadísticas
  let statsSection = document.querySelector('.profile__stats');
  if (!statsSection) {
    // Crear sección si no existe
    const profileContent = document.querySelector('.profile__content');
    if (profileContent) {
      statsSection = document.createElement('div');
      statsSection.className = 'profile__stats';
      profileContent.appendChild(statsSection);
    }
  }
  
  if (statsSection) {
    statsSection.innerHTML = `
      <h3>📊 Estadísticas Reales</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-number">${stats.userExchanges}</span>
          <span class="stat-label">Intercambios</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${stats.userReviews}</span>
          <span class="stat-label">Reviews</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${stats.userMessages}</span>
          <span class="stat-label">Mensajes</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${stats.totalUsers}</span>
          <span class="stat-label">Total Usuarios</span>
        </div>
      </div>
    `;
  }
}

// Initialize profile
export async function initializeProfile() {
  console.log('Initializing profile...');
  
  // Asegurar que data service esté listo
  if (!dataService.initialized) {
    await dataService.initialize();
  }
  
  // Profile edit button (if exists)
  const editBtn = document.querySelector('.profile__edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', function() {
      alert('La edición de perfil estará disponible próximamente.');
    });
  }
  
  // View exchanges button
  const exchangesBtn = document.querySelector('.view-exchanges-btn');
  if (exchangesBtn) {
    exchangesBtn.addEventListener('click', async function() {
      const currentUser = getCurrentUser();
      if (currentUser) {
        await showUserExchanges(currentUser);
      }
    });
  }
}

// Mostrar intercambios del usuario
async function showUserExchanges(user) {
  try {
    console.log('🔄 Cargando intercambios del usuario...');
    
    const result = await dataService.query(
      `SELECT e.*, u1.nombre as solicitante_nombre, u2.nombre as anfitrion_nombre, 
       a.titulo as alojamiento_titulo
       FROM exchanges e
       JOIN users u1 ON e.solicitante_id = u1.id
       JOIN users u2 ON e.anfitrion_id = u2.id
       JOIN accommodations a ON e.accommodation_id = a.id
       WHERE e.solicitante_id = $1 OR e.anfitrion_id = $1
       ORDER BY e.created_at DESC`,
      [user.id]
    );
    
    if (result.data && result.data.length > 0) {
      const exchangesList = result.data.map(ex => 
        `• ${ex.alojamiento_titulo} - ${ex.estado} (${new Date(ex.created_at).toLocaleDateString()})`
      ).join('\n');
      
      alert(`🔄 Intercambios de ${user.nombre}:\n\n${exchangesList}`);
    } else {
      alert(`ℹ️ ${user.nombre} no tiene intercambios registrados aún.`);
    }
    
  } catch (error) {
    console.error('❌ Error cargando intercambios:', error.message);
    alert('❌ Error cargando intercambios.');
  }
}