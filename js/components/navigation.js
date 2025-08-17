// MotoSwap - Navigation Module
// Handles section navigation and mobile menu

import { setCurrentSection } from '../core/state.js';

// Show/hide sections
export function showSection(sectionName) {
  console.log('Showing section:', sectionName);
  
  // Hide all sections
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    section.classList.add('hidden');
  });
  
  // Show selected section
  const targetSection = document.getElementById(sectionName);
  if (targetSection) {
    targetSection.classList.remove('hidden');
    setCurrentSection(sectionName);
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Load content for specific sections
    if (sectionName === 'dashboard') {
      import('../features/dashboard.js').then(module => {
        module.loadListings();
      });
    } else if (sectionName === 'profile') {
      import('../features/profile.js').then(module => {
        module.loadUserProfile();
      });
    } else if (sectionName === 'messages') {
      import('../features/messages.js').then(module => {
        module.initializeSampleMessages();
      });
    }
  }
}

// Update active navigation link
export function updateActiveNavLink(activeLink) {
  // Remove active class from all links
  const navLinks = document.querySelectorAll('.nav__link');
  navLinks.forEach(link => {
    link.classList.remove('nav__link--active');
  });
  
  // Add active class to current link
  if (activeLink) {
    activeLink.classList.add('nav__link--active');
  }
}

// Toggle mobile menu
export function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.classList.toggle('hidden');
  }
}

// Initialize navigation
export function initializeNavigation() {
  console.log('Initializing navigation...');
  
  // Desktop navigation links
  const navLinks = document.querySelectorAll('.nav__link');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.getAttribute('href').substring(1);
      showSection(section);
      updateActiveNavLink(this);
    });
  });
  
  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', toggleMobileMenu);
  }
  
  // Mobile navigation links
  const mobileLinks = document.querySelectorAll('.mobile-nav__link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.getAttribute('href').substring(1);
      showSection(section);
      toggleMobileMenu(); // Close mobile menu after selection
    });
  });
}