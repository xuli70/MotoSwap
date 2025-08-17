// MotoSwap - Filters Module
// Handles filtering functionality for listings

import { appData } from '../data/users-data.js';
import { getCompatibleBikeTypes } from '../utils/helpers.js';

// Apply filters to listings
export function applyFilters() {
  console.log('Applying filters...');
  
  const tipoFilter = document.getElementById('filter-tipo')?.value || '';
  const ubicacionFilter = (document.getElementById('filter-ubicacion')?.value || '').toLowerCase();
  const facilidadesFilter = document.getElementById('filter-facilidades')?.value || '';
  
  const listings = document.querySelectorAll('.listing-card');
  
  listings.forEach(listing => {
    const userId = parseInt(listing.getAttribute('data-user-id'));
    const usuario = appData.usuarios.find(u => u.id === userId);
    
    if (!usuario) return;
    
    let shouldShow = true;
    
    // Type filter
    if (tipoFilter && !getCompatibleBikeTypes(usuario.moto.tipo).includes(tipoFilter)) {
      shouldShow = false;
    }
    
    // Location filter
    if (ubicacionFilter && !usuario.ubicacion.toLowerCase().includes(ubicacionFilter)) {
      shouldShow = false;
    }
    
    // Facilities filter
    if (facilidadesFilter) {
      const facilityKeywords = {
        'garaje': ['garaje', 'cubierto', 'parking'],
        'herramientas': ['herramientas', 'mantenimiento', 'taller'],
        'camara': ['cámaras', 'seguridad', 'vigilancia'],
        'lavado': ['lavado', 'limpieza', 'zona']
      };
      
      const keywords = facilityKeywords[facilidadesFilter] || [facilidadesFilter];
      const hasFacility = usuario.alojamiento.facilidades.some(f => 
        keywords.some(keyword => f.toLowerCase().includes(keyword))
      );
      
      if (!hasFacility) {
        shouldShow = false;
      }
    }
    
    listing.style.display = shouldShow ? 'block' : 'none';
  });
}

// Initialize filter event listeners
export function initializeFilters() {
  console.log('Initializing filters...');
  
  // Filter change listeners
  const filterInputs = document.querySelectorAll('#filter-tipo, #filter-ubicacion, #filter-facilidades');
  filterInputs.forEach(input => {
    input.addEventListener('change', applyFilters);
  });
  
  // Location input with debounce
  const locationInput = document.getElementById('filter-ubicacion');
  if (locationInput) {
    let debounceTimer;
    locationInput.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(applyFilters, 300);
    });
  }
}