// MotoSwap - Authentication Module
// Handles user login, registration, and authentication state

import dataService from '../data/data-service.js';
import { setCurrentUser, getCurrentUser } from '../core/state.js';
import { showSection, updateActiveNavLink } from '../components/navigation.js';
import { hideModal } from '../components/modals.js';

// Demo login with real users from Supabase
export async function simulateLogin() {
  console.log('🔑 Iniciando sesión con usuario real...');
  
  try {
    // Obtener usuarios reales de Supabase
    const usuarios = await dataService.getUsuarios();
    
    if (usuarios.length === 0) {
      alert('❌ Error: No se encontraron usuarios en la base de datos.');
      return;
    }
    
    // Login con el primer usuario disponible
    const firstUser = usuarios[0];
    console.log(`✅ Login exitoso: ${firstUser.nombre}`);
    
    setCurrentUser(firstUser);
    updateUserInterface();
    showSection('dashboard');
    
    // Update nav link
    const dashboardLink = document.querySelector('a[href="#dashboard"]');
    if (dashboardLink) {
      updateActiveNavLink(dashboardLink);
    }
    
    // Mostrar mensaje de bienvenida
    alert(`🎉 ¡Bienvenido ${firstUser.nombre}! Has iniciado sesión con datos reales de Supabase.`);
    
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    alert('❌ Error iniciando sesión. Verificar conexión a Supabase.');
  }
}

// Handle registration form submission
export async function handleRegistration(e) {
  e.preventDefault();
  console.log('📝 Procesando registro con Supabase...');
  
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
  
  try {
    // Verificar si el email ya existe
    const existingUser = await dataService.getUserByEmail(formData.get('email'));
    if (existingUser) {
      alert('⚠️ El email ya está registrado. Por favor usa otro email.');
      return;
    }
    
    // Crear nuevo usuario (por ahora, simular con usuario existente)
    // En el futuro, aquí se crearía realmente en Supabase
    console.log('🏗️ Funcionalidad de registro real pendiente de implementar');
    console.log('🔄 Por ahora, usando login con usuario existente...');
    
    // Fallback: usar primer usuario disponible
    const usuarios = await dataService.getUsuarios();
    if (usuarios.length > 0) {
      const demoUser = usuarios[0];
      setCurrentUser(demoUser);
      updateUserInterface();
      hideModal('register');
      showSection('dashboard');
      
      // Update nav link
      const dashboardLink = document.querySelector('a[href="#dashboard"]');
      if (dashboardLink) {
        updateActiveNavLink(dashboardLink);
      }
      
      alert(`🎉 ¡Bienvenido! Por ahora usando usuario demo: ${demoUser.nombre}`);
    } else {
      throw new Error('No hay usuarios disponibles en la base de datos');
    }
    
  } catch (error) {
    console.error('❌ Error en registro:', error.message);
    alert('❌ Error en registro. Verificar conexión a Supabase.');
  }
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

// Autenticación por email
export async function loginWithEmail(email) {
  try {
    console.log(`🔍 Buscando usuario: ${email}`);
    
    const user = await dataService.getUserByEmail(email);
    if (user) {
      setCurrentUser(user);
      updateUserInterface();
      showSection('dashboard');
      
      // Update nav link
      const dashboardLink = document.querySelector('a[href="#dashboard"]');
      if (dashboardLink) {
        updateActiveNavLink(dashboardLink);
      }
      
      console.log(`✅ Login exitoso: ${user.nombre}`);
      return true;
    } else {
      console.warn(`⚠️ Usuario no encontrado: ${email}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    return false;
  }
}

// Logout
export function logout() {
  setCurrentUser(null);
  updateUserInterface();
  showSection('home');
  
  // Update nav link
  const homeLink = document.querySelector('a[href="#home"]');
  if (homeLink) {
    updateActiveNavLink(homeLink);
  }
  
  console.log('🚪 Sesión cerrada');
}

// Initialize authentication
export async function initializeAuth() {
  console.log('Initializing authentication...');
  
  // Asegurar que data service esté listo
  if (!dataService.initialized) {
    await dataService.initialize();
  }
  
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