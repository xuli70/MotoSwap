// MotoSwap - Dashboard Module
// Handles property listings and property details

import { appData } from '../data/users-data.js';
import { getCurrentUser } from '../core/state.js';
import { getCompatibleBikeTypes, getFacilityIcon, getRandomPoints } from '../utils/helpers.js';
import { showModal } from '../components/modals.js';

// Load and display listings
export function loadListings() {
  console.log('Loading listings...');
  const listingsGrid = document.getElementById('listings-grid');
  if (!listingsGrid) {
    console.error('Listings grid not found');
    return;
  }
  
  listingsGrid.innerHTML = '';
  const currentUser = getCurrentUser();
  
  appData.usuarios.forEach(usuario => {
    if (currentUser && usuario.id === currentUser.id) return; // Don't show own listing
    
    const listingCard = createListingCard(usuario);
    listingsGrid.appendChild(listingCard);
  });
}

// Create a listing card element
export function createListingCard(usuario) {
  const card = document.createElement('div');
  card.className = 'listing-card';
  card.setAttribute('data-user-id', usuario.id);
  
  // Generate stars based on rating
  const stars = '⭐'.repeat(Math.floor(usuario.valoracion));
  
  // Get compatible bike types
  const compatibleTypes = getCompatibleBikeTypes(usuario.moto.tipo);
  
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
      <div class="bike-compatibility">
        ${compatibleTypes.map(type => `<span class="compatibility-tag">${type}</span>`).join('')}
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
        <div class="listing-points">${getRandomPoints()} pts/noche</div>
      </div>
    </div>
  `;
  
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
  
  // Update bike compatibility
  const compatibilityContainer = modal.querySelector('.property-compatibility');
  if (compatibilityContainer) {
    const compatibleTypes = getCompatibleBikeTypes(usuario.moto.tipo);
    compatibilityContainer.innerHTML = `
      <h3>Motos Compatibles</h3>
      <div class="compatibility-list">
        ${compatibleTypes.map(type => `<span class="compatibility-tag">${type}</span>`).join('')}
      </div>
    `;
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
  setupPropertyActionButtons(usuario);
  
  // Show modal
  showModal('property');
}

// Setup property action buttons
function setupPropertyActionButtons(usuario) {
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
export function initializeDashboard() {
  console.log('Initializing dashboard...');
  
  // Load listings when dashboard is first shown
  const dashboardSection = document.getElementById('dashboard');
  if (dashboardSection && !dashboardSection.classList.contains('hidden')) {
    loadListings();
  }
}