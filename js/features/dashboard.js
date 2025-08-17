// MotoSwap - Dashboard Module
// Handles property listings and property details

import dataService from '../data/data-service.js';
import { getCurrentUser } from '../core/state.js';
import { getFacilityIcon } from '../utils/helpers.js';
import { showModal } from '../components/modals.js';

// Load and display listings
export async function loadListings() {
  console.log('Loading listings...');
  const listingsGrid = document.getElementById('listings-grid');
  if (!listingsGrid) {
    console.error('Listings grid not found');
    return;
  }
  
  // Mostrar loading
  listingsGrid.innerHTML = '<div class="loading">🔄 Cargando alojamientos reales...</div>';
  
  try {
    // Obtener datos reales de Supabase
    const usuarios = await dataService.getUsuarios();
    const currentUser = getCurrentUser();
    
    // Limpiar loading
    listingsGrid.innerHTML = '';
    
    if (usuarios.length === 0) {
      listingsGrid.innerHTML = '<div class="no-data">⚠️ No se pudieron cargar los alojamientos</div>';
      return;
    }
    
    // Filtrar usuario actual si está logueado
    const otherUsers = usuarios.filter(usuario => 
      !currentUser || usuario.id !== currentUser.id
    );
    
    console.log(`✅ Mostrando ${otherUsers.length} alojamientos reales`);
    
    otherUsers.forEach(usuario => {
      const listingCard = createListingCard(usuario);
      listingsGrid.appendChild(listingCard);
    });
    
  } catch (error) {
    console.error('❌ Error cargando listings:', error.message);
    listingsGrid.innerHTML = '<div class="error">❌ Error cargando alojamientos. Verificar conexión a Supabase.</div>';
  }
}

// Create a listing card element
export function createListingCard(usuario) {
  const card = document.createElement('div');
  card.className = 'listing-card';
  card.setAttribute('data-user-id', usuario.id);
  
  // Generate stars based on rating
  const stars = '⭐'.repeat(Math.floor(usuario.valoracion));
  
  // Get compatible bike types (will be loaded async)
  let compatibleTypes = [usuario.moto.tipo]; // Default fallback
  
  card.innerHTML = `
    <div class="listing-image">🏠</div>
    <div class="listing-content">
      <div class="listing-header">
        <div class="listing-avatar">${usuario.nombre.charAt(0)}</div>
        <div class="listing-owner">
          <h3>${usuario.nombre}</h3>
          <p>${usuario.moto.marca} ${usuario.moto.modelo}</p>
        </div>
      </div>
      <h2 class="listing-title">${usuario.alojamiento.tipo}</h2>
      <p class="listing-location">📍 ${usuario.ubicacion}</p>
      <div class="bike-compatibility" data-bike-type="${usuario.moto.tipo}">
        <span class="compatibility-tag">${usuario.moto.tipo}</span>
      </div>
      <div class="listing-facilities">
        ${usuario.alojamiento.facilidades.slice(0, 3).map(facilidad => 
          `<span class="facility-icon">${getFacilityIcon(facilidad)} ${facilidad}</span>`
        ).join('')}
      </div>
      <div class="listing-footer">
        <div class="listing-rating">
          <span class="stars">${stars}</span>
          <span>${usuario.valoracion}</span>
        </div>
        <div class="listing-points">${usuario.alojamiento.puntosPorNoche || 100} pts/noche</div>
      </div>
    </div>
  `;
  
  // Load compatible bike types asynchronously
  dataService.getCompatibleBikeTypes(usuario.moto.tipo)
    .then(types => {
      const compatibilityDiv = card.querySelector('.bike-compatibility');
      if (compatibilityDiv && types.length > 0) {
        compatibilityDiv.innerHTML = types.map(type => 
          `<span class="compatibility-tag">${type}</span>`
        ).join('');
      }
    })
    .catch(error => {
      console.warn('⚠️ Error cargando compatibilidad:', error.message);
    });
  
  // Add click event to show property details
  card.addEventListener('click', function() {
    showPropertyDetails(usuario);
  });
  
  return card;
}

// Show property details modal
export function showPropertyDetails(usuario) {
  console.log('Showing property details for:', usuario.nombre);
  
  // Update modal content
  const modal = document.getElementById('property-modal');
  if (!modal) return;
  
  // Update owner info
  const ownerName = modal.querySelector('.property-owner h3');
  if (ownerName) ownerName.textContent = usuario.nombre;
  
  const ownerBike = modal.querySelector('.property-owner p');
  if (ownerBike) ownerBike.textContent = `${usuario.moto.marca} ${usuario.moto.modelo}`;
  
  // Update property info
  const propertyTitle = modal.querySelector('.property-modal__content > h2');
  if (propertyTitle) propertyTitle.textContent = usuario.alojamiento.tipo;
  
  const propertyLocation = modal.querySelector('.property-location');
  if (propertyLocation) propertyLocation.textContent = `📍 ${usuario.ubicacion}`;
  
  // Update facilities
  const facilitiesContainer = modal.querySelector('.property-facilities');
  if (facilitiesContainer) {
    facilitiesContainer.innerHTML = usuario.alojamiento.facilidades
      .map(facilidad => `
        <span class="facility-tag">
          ${getFacilityIcon(facilidad)} ${facilidad}
        </span>
      `).join('');
  }
  
  // Update bike compatibility (async)
  const compatibilityContainer = modal.querySelector('.property-compatibility');
  if (compatibilityContainer) {
    compatibilityContainer.innerHTML = `
      <h3>Motos Compatibles</h3>
      <div class="compatibility-list">
        <span class="loading">🔄 Cargando compatibilidad...</span>
      </div>
    `;
    
    dataService.getCompatibleBikeTypes(usuario.moto.tipo)
      .then(compatibleTypes => {
        const listDiv = compatibilityContainer.querySelector('.compatibility-list');
        if (listDiv && compatibleTypes.length > 0) {
          listDiv.innerHTML = compatibleTypes.map(type => 
            `<span class="compatibility-tag">${type}</span>`
          ).join('');
        }
      })
      .catch(error => {
        console.warn('⚠️ Error cargando compatibilidad:', error.message);
        const listDiv = compatibilityContainer.querySelector('.compatibility-list');
        if (listDiv) {
          listDiv.innerHTML = `<span class="compatibility-tag">${usuario.moto.tipo}</span>`;
        }
      });
  }
  
  // Update garage info
  const garageInfo = modal.querySelector('.property-details p');
  if (garageInfo) {
    garageInfo.innerHTML = `
      <strong>Garaje:</strong> ${usuario.alojamiento.garaje}<br>
      <strong>Habitaciones:</strong> ${usuario.alojamiento.habitaciones}<br>
      <strong>Valoración:</strong> ${'⭐'.repeat(Math.floor(usuario.valoracion))} ${usuario.valoracion}
    `;
  }
  
  // Setup action buttons
  setupPropertyActionButtons(usuario, modal);
  
  // Show modal
  showModal('property');
}

// Setup property action buttons
function setupPropertyActionButtons(usuario, modal) {
  const currentUser = getCurrentUser();
  const requestBtn = modal.querySelector('.btn--primary');
  const messageBtn = modal.querySelector('.btn--outline');
  
  if (requestBtn) {
    requestBtn.onclick = function() {
      if (!currentUser) {
        alert('Por favor inicia sesión para solicitar un intercambio.');
        return;
      }
      alert(`Solicitud enviada a ${usuario.nombre}. Te contactará pronto.`);
    };
  }
  
  if (messageBtn) {
    messageBtn.onclick = function() {
      if (!currentUser) {
        alert('Por favor inicia sesión para enviar mensajes.');
        return;
      }
      // Switch to messages section
      import('../components/navigation.js').then(module => {
        module.showSection('messages');
        import('../components/modals.js').then(modalModule => {
          modalModule.hideModal('property');
        });
      });
    };
  }
}

// Initialize dashboard
export async function initializeDashboard() {
  console.log('Initializing dashboard...');
  
  // Asegurar que el data service esté listo
  if (!dataService.initialized) {
    await dataService.initialize();
  }
  
  // Load listings when dashboard is first shown
  const dashboardSection = document.getElementById('dashboard');
  if (dashboardSection && !dashboardSection.classList.contains('hidden')) {
    await loadListings();
  }
}