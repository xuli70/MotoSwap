// MotoSwap - Main Application Entry Point
// Initializes all modules and starts the application

import { initializeState } from './core/state.js';
import { showSection, initializeNavigation } from './components/navigation.js';
import { initializeModals, showModal } from './components/modals.js';
import { initializeFilters } from './components/filters.js';
import { initializeAuth } from './features/auth.js';
import { initializeDashboard } from './features/dashboard.js';
import { initializeProfile } from './features/profile.js';
import { initializeMessages } from './features/messages.js';

// Initialize application
function initializeApp() {
  console.log('🏍️ MotoSwap Application Starting...');
  
  // Initialize core state
  initializeState();
  
  // Initialize all modules
  initializeNavigation();
  initializeModals();
  initializeFilters();
  initializeAuth();
  initializeDashboard();
  initializeProfile();
  initializeMessages();
  
  // Initialize event listeners
  initializeEventListeners();
  
  // Show home section by default
  showSection('home');
  
  console.log('✅ MotoSwap Application Ready!');
}

// Initialize event listeners
function initializeEventListeners() {
  console.log('Initializing event listeners...');
  
  // Register button (hero section)
  const registerBtn = document.getElementById('register-btn');
  if (registerBtn) {
    registerBtn.addEventListener('click', () => showModal('register'));
  }
  
  // Dashboard link for non-authenticated users
  const dashboardLink = document.querySelector('a[href="#dashboard"]');
  if (dashboardLink) {
    dashboardLink.addEventListener('click', function(e) {
      const userInfo = document.getElementById('user-info');
      if (!userInfo || userInfo.style.display === 'none') {
        e.preventDefault();
        showSection('dashboard');
        // Dashboard will handle loading listings
      }
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

// Export functions for global access (if needed)
window.MotoSwap = {
  showSection,
  showModal,
  initializeApp
};

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}