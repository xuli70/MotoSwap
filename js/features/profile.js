// MotoSwap - Profile Module
// Handles user profile display and management

import { getCurrentUser } from '../core/state.js';
import { getFacilityIcon } from '../utils/helpers.js';
import { simulateLogin } from './auth.js';

// Load and display user profile
export function loadUserProfile() {
  console.log('Loading user profile...');
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    console.log('No current user, simulating login first...');
    simulateLogin();
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
  
  // Update accommodation facilities
  const facilities = document.querySelector('.facilities');
  if (facilities) {
    facilities.innerHTML = currentUser.alojamiento.facilidades
      .map(facilidad => `<span class="facility">${getFacilityIcon(facilidad)} ${facilidad}</span>`)
      .join('');
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
}

// Initialize profile
export function initializeProfile() {
  console.log('Initializing profile...');
  
  // Profile edit button (if exists)
  const editBtn = document.querySelector('.profile__edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', function() {
      alert('La edición de perfil estará disponible próximamente.');
    });
  }
}