// MotoSwap - Modal Management Module
// Handles modal display and interactions

// Show modal
export function showModal(modalName) {
  console.log('Showing modal:', modalName);
  const modal = document.getElementById(modalName + '-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
}

// Hide modal
export function hideModal(modalName) {
  console.log('Hiding modal:', modalName);
  const modal = document.getElementById(modalName + '-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scrolling
  }
}

// Initialize modal event listeners
export function initializeModals() {
  console.log('Initializing modals...');
  
  // Close buttons
  const closeButtons = document.querySelectorAll('.modal__close');
  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.modal');
      if (modal) {
        const modalName = modal.id.replace('-modal', '');
        hideModal(modalName);
      }
    });
  });
  
  // Close on overlay click
  const modalOverlays = document.querySelectorAll('.modal__overlay');
  modalOverlays.forEach(overlay => {
    overlay.addEventListener('click', function() {
      const modal = this.closest('.modal');
      if (modal) {
        const modalName = modal.id.replace('-modal', '');
        hideModal(modalName);
      }
    });
  });
  
  // Close on ESC key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const openModals = document.querySelectorAll('.modal:not(.hidden)');
      openModals.forEach(modal => {
        const modalName = modal.id.replace('-modal', '');
        hideModal(modalName);
      });
    }
  });
}