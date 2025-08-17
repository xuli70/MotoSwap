// MotoSwap - Global State Management
// Manages application state including current user and section

let currentUser = null;
let currentSection = 'home';

// User state management
export function getCurrentUser() {
  return currentUser;
}

export function setCurrentUser(user) {
  currentUser = user;
  console.log('User state updated:', user ? user.nombre : 'logged out');
}

// Section state management
export function getCurrentSection() {
  return currentSection;
}

export function setCurrentSection(section) {
  currentSection = section;
  console.log('Current section:', section);
}

// Initialize state
export function initializeState() {
  console.log('State initialized');
  currentUser = null;
  currentSection = 'home';
}