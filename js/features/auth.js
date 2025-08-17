// MotoSwap - Authentication Module
// Handles user login, registration, and authentication state

import { appData } from '../data/users-data.js';
import { setCurrentUser, getCurrentUser } from '../core/state.js';
import { showSection, updateActiveNavLink } from '../components/navigation.js';
import { hideModal } from '../components/modals.js';

// Simulate login with demo user
export function simulateLogin() {
  console.log('Simulating login...');
  // Simulate successful login with first user
  setCurrentUser(appData.usuarios[0]);
  updateUserInterface();
  showSection('dashboard');
  
  // Update nav link
  const dashboardLink = document.querySelector('a[href="#dashboard"]');
  if (dashboardLink) {
    updateActiveNavLink(dashboardLink);
  }
}

// Handle registration form submission
export function handleRegistration(e) {
  e.preventDefault();
  console.log('Handling registration...');
  
  const formData = new FormData(e.target);
  
  // Validate required fields
  const requiredFields = ['nombre', 'email', 'edad', 'experiencia', 'marca', 'modelo', 'tipo', 'licencia', 'cilindrada', 'ubicacion'];
  let isValid = true;
  
  for (const field of requiredFields) {
    if (!formData.get(field)) {
      isValid = false;
      break;
    }
  }
  
  if (!isValid) {
    alert('Por favor completa todos los campos obligatorios.');
    return;
  }
  
  // Create new user object
  const newUser = {
    id: appData.usuarios.length + 1,
    nombre: formData.get('nombre'),
    edad: parseInt(formData.get('edad')),
    experiencia: formData.get('experiencia') + ' años',
    moto: {
      marca: formData.get('marca'),
      modelo: formData.get('modelo'),
      tipo: formData.get('tipo'),
      cilindrada: formData.get('cilindrada'),
      licencia: formData.get('licencia')
    },
    ubicacion: formData.get('ubicacion'),
    alojamiento: {
      tipo: "Casa completa",
      habitaciones: 2,
      garaje: "Garaje seguro",
      facilidades: ["Parking seguro", "Herramientas básicas", "WiFi gratuito"]
    },
    puntos: 100, // Starting points
    valoracion: 4.5
  };
  
  // Add to users array
  appData.usuarios.push(newUser);
  
  // Set as current user
  setCurrentUser(newUser);
  
  // Update interface
  updateUserInterface();
  hideModal('register');
  showSection('dashboard');
  
  // Update nav link
  const dashboardLink = document.querySelector('a[href="#dashboard"]');
  if (dashboardLink) {
    updateActiveNavLink(dashboardLink);
  }
  
  // Show success message
  alert('¡Registro exitoso! Bienvenido a MotoSwap.');
}

// Update UI based on authentication state
export function updateUserInterface() {
  const loginBtn = document.getElementById('login-btn');
  const userInfo = document.getElementById('user-info');
  const currentUser = getCurrentUser();
  
  if (currentUser) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (userInfo) {
      userInfo.style.display = 'flex';
      
      // Update points display
      const pointsElement = userInfo.querySelector('.nav__points');
      if (pointsElement) {
        pointsElement.textContent = `${currentUser.puntos} pts`;
      }
    }
  } else {
    if (loginBtn) loginBtn.style.display = 'block';
    if (userInfo) userInfo.style.display = 'none';
  }
}

// Initialize authentication
export function initializeAuth() {
  console.log('Initializing authentication...');
  
  // Login button click
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', simulateLogin);
  }
  
  // Registration form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegistration);
  }
  
  // Update UI on load
  updateUserInterface();
}