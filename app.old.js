// MotoSwap Application JavaScript

// Application Data
const appData = {
  usuarios: [
    {
      id: 1,
      nombre: "Carlos Rodríguez",
      edad: 35,
      experiencia: "10 años",
      moto: {
        marca: "BMW",
        modelo: "R1250GS Adventure", 
        tipo: "Adventure/Trail",
        cilindrada: "1254cc",
        licencia: "A"
      },
      ubicacion: "Madrid, España",
      alojamiento: {
        tipo: "Casa completa",
        habitaciones: 3,
        garaje: "Cubierto para 2 motos",
        facilidades: ["Anclajes suelo", "Herramientas básicas", "Cámaras seguridad", "Zona lavado motos"]
      },
      puntos: 150,
      valoracion: 4.8
    },
    {
      id: 2,
      nombre: "Ana Martínez",
      edad: 28,
      experiencia: "5 años",
      moto: {
        marca: "Ducati",
        modelo: "Panigale V4",
        tipo: "Deportiva",
        cilindrada: "1103cc", 
        licencia: "A"
      },
      ubicacion: "Barcelona, España",
      alojamiento: {
        tipo: "Apartamento",
        habitaciones: 2,
        garaje: "Subterráneo seguro",
        facilidades: ["Acceso fácil", "Herramientas mantenimiento", "Conexión eléctrica"]
      },
      puntos: 220,
      valoracion: 4.9
    },
    {
      id: 3,
      nombre: "Marco Bianchi",
      edad: 45,
      experiencia: "20 años",
      moto: {
        marca: "Indian",
        modelo: "Roadmaster",
        tipo: "Touring",
        cilindrada: "1811cc",
        licencia: "A"
      },
      ubicacion: "Roma, Italia", 
      alojamiento: {
        tipo: "Casa familiar",
        habitaciones: 4,
        garaje: "Amplio cubierto",
        facilidades: ["Espacio equipaje", "Conexiones eléctricas", "Zona carga", "Información rutas locales"]
      },
      puntos: 350,
      valoracion: 5.0
    },
    {
      id: 4,
      nombre: "Sophie Dubois",
      edad: 24,
      experiencia: "2 años",
      moto: {
        marca: "Yamaha",
        modelo: "MT-07",
        tipo: "Naked",
        cilindrada: "689cc",
        licencia: "A2"
      },
      ubicacion: "París, Francia",
      alojamiento: {
        tipo: "Estudio urbano",
        habitaciones: 1,
        garaje: "Parking compartido",
        facilidades: ["Ubicación central", "Transporte público", "Parking vigilado"]
      },
      puntos: 80,
      valoracion: 4.6
    },
    {
      id: 5,
      nombre: "Hans Mueller",
      edad: 52,
      experiencia: "25 años",
      moto: {
        marca: "Harley Davidson",
        modelo: "Street Glide",
        tipo: "Cruiser",
        cilindrada: "1746cc",
        licencia: "A"
      },
      ubicacion: "Munich, Alemania",
      alojamiento: {
        tipo: "Casa con taller",
        habitaciones: 3,
        garaje: "Taller equipado",
        facilidades: ["Herramientas completas", "Elevador moto", "Piezas repuesto", "Espacio amplio"]
      },
      puntos: 420,
      valoracion: 4.95
    }
  ]
};

// Current user state
let currentUser = null;
let currentSection = 'home';

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing app...');
  initializeEventListeners();
  showSection('home');
  initializeSampleMessages();
});

// Event Listeners
function initializeEventListeners() {
  console.log('Setting up event listeners...');
  
  // Mobile menu toggle
  const navToggle = document.getElementById('nav-toggle');
  if (navToggle) {
    navToggle.addEventListener('click', function(e) {
      e.preventDefault();
      toggleMobileMenu();
    });
  }
  
  // Navigation links
  const navLinks = document.querySelectorAll('.nav__link');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      if (href) {
        const section = href.substring(1);
        console.log('Navigating to:', section);
        showSection(section);
        updateActiveNavLink(this);
        
        // Close mobile menu if open
        const navMenu = document.getElementById('nav-menu');
        if (navMenu) {
          navMenu.classList.remove('show');
        }
      }
    });
  });

  // Authentication buttons
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      simulateLogin();
    });
  }
  
  const registerBtn = document.getElementById('register-btn');
  if (registerBtn) {
    registerBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showModal('register');
    });
  }
  
  const learnMoreBtn = document.getElementById('learn-more');
  if (learnMoreBtn) {
    learnMoreBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showSection('dashboard');
    });
  }

  // Modal close buttons
  const closeRegisterBtn = document.getElementById('close-register');
  if (closeRegisterBtn) {
    closeRegisterBtn.addEventListener('click', function(e) {
      e.preventDefault();
      hideModal('register');
    });
  }
  
  const closePropertyBtn = document.getElementById('close-property');
  if (closePropertyBtn) {
    closePropertyBtn.addEventListener('click', function(e) {
      e.preventDefault();
      hideModal('property');
    });
  }
  
  // Registration form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegistration);
  }
  
  // Filters
  const applyFiltersBtn = document.getElementById('apply-filters');
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', function(e) {
      e.preventDefault();
      applyFilters();
    });
  }
  
  // Close modals on overlay click and ESC key
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
      const modalId = e.target.id.replace('-modal', '');
      hideModal(modalId);
    }
  });
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      hideModal('register');
      hideModal('property');
    }
  });

  // Chat functionality
  setupChatListeners();
}

// Navigation functions
function showSection(sectionName) {
  console.log('Showing section:', sectionName);
  
  // Define all possible sections
  const allSections = ['home', 'dashboard', 'profile', 'messages'];
  
  // Hide all sections
  allSections.forEach(section => {
    const element = document.getElementById(section);
    if (element) {
      element.classList.add('hidden');
    }
  });
  
  // Show selected section
  const targetSection = document.getElementById(sectionName);
  if (targetSection) {
    targetSection.classList.remove('hidden');
    currentSection = sectionName;
    
    // Load section-specific content
    if (sectionName === 'dashboard') {
      setTimeout(loadListings, 100);
    } else if (sectionName === 'profile') {
      setTimeout(loadUserProfile, 100);
    }
  } else {
    console.error('Section not found:', sectionName);
  }
}

function updateActiveNavLink(activeLink) {
  const navLinks = document.querySelectorAll('.nav__link');
  navLinks.forEach(link => {
    link.classList.remove('active');
  });
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

function toggleMobileMenu() {
  const navMenu = document.getElementById('nav-menu');
  if (navMenu) {
    navMenu.classList.toggle('show');
  }
}

// Modal functions
function showModal(modalName) {
  console.log('Showing modal:', modalName);
  const modal = document.getElementById(modalName + '-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
}

function hideModal(modalName) {
  console.log('Hiding modal:', modalName);
  const modal = document.getElementById(modalName + '-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scrolling
  }
}

// Authentication functions
function simulateLogin() {
  console.log('Simulating login...');
  // Simulate successful login with first user
  currentUser = appData.usuarios[0];
  updateUserInterface();
  showSection('dashboard');
  
  // Update nav link
  const dashboardLink = document.querySelector('a[href="#dashboard"]');
  if (dashboardLink) {
    updateActiveNavLink(dashboardLink);
  }
}

function handleRegistration(e) {
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
  currentUser = newUser;
  
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

function updateUserInterface() {
  const loginBtn = document.getElementById('login-btn');
  const userInfo = document.getElementById('user-info');
  
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

// Dashboard functions
function loadListings() {
  console.log('Loading listings...');
  const listingsGrid = document.getElementById('listings-grid');
  if (!listingsGrid) {
    console.error('Listings grid not found');
    return;
  }
  
  listingsGrid.innerHTML = '';
  
  appData.usuarios.forEach(usuario => {
    if (currentUser && usuario.id === currentUser.id) return; // Don't show own listing
    
    const listingCard = createListingCard(usuario);
    listingsGrid.appendChild(listingCard);
  });
}

function createListingCard(usuario) {
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

function getCompatibleBikeTypes(userBikeType) {
  const compatibility = {
    'Adventure/Trail': ['Adventure', 'Touring', 'Naked'],
    'Touring': ['Touring', 'Adventure', 'Cruiser'],
    'Deportiva': ['Deportiva', 'Naked'],
    'Cruiser': ['Cruiser', 'Touring'],
    'Naked': ['Naked', 'Deportiva', 'Adventure'],
    'Scooter': ['Scooter', 'Naked']
  };
  
  return compatibility[userBikeType] || [userBikeType];
}

function getFacilityIcon(facility) {
  const icons = {
    'Anclajes suelo': '⚓',
    'Herramientas básicas': '🔧',
    'Cámaras seguridad': '📹',
    'Zona lavado motos': '🚿',
    'Acceso fácil': '🚪',
    'Herramientas mantenimiento': '🔧',
    'Conexión eléctrica': '🔌',
    'Espacio equipaje': '🧳',
    'Zona carga': '🔋',
    'Información rutas locales': '🗺️',
    'Ubicación central': '📍',
    'Transporte público': '🚇',
    'Parking vigilado': '👁️',
    'Herramientas completas': '🛠️',
    'Elevador moto': '🏗️',
    'Piezas repuesto': '⚙️',
    'Espacio amplio': '📏',
    'Parking seguro': '🔒',
    'WiFi gratuito': '📶'
  };
  
  return icons[facility] || '✨';
}

function getRandomPoints() {
  return Math.floor(Math.random() * 100) + 80; // 80-180 points
}

// Property details
function showPropertyDetails(usuario) {
  console.log('Showing property details for:', usuario.nombre);
  
  // Update modal content
  const elements = {
    'property-title': `${usuario.alojamiento.tipo} en ${usuario.ubicacion}`,
    'owner-name': usuario.nombre,
    'owner-rating': usuario.valoracion.toString(),
    'owner-moto': `${usuario.moto.marca} ${usuario.moto.modelo}`,
    'property-type': usuario.alojamiento.tipo,
    'property-rooms': usuario.alojamiento.habitaciones.toString(),
    'compatible-bikes': getCompatibleBikeTypes(usuario.moto.tipo).join(', '),
    'required-points': `${getRandomPoints()} puntos/noche`
  };
  
  Object.entries(elements).forEach(([id, text]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  });
  
  // Update facilities
  const securityFacilities = document.getElementById('security-facilities');
  if (securityFacilities) {
    securityFacilities.innerHTML = usuario.alojamiento.facilidades
      .map(facilidad => `<span class="facility-tag">${getFacilityIcon(facilidad)} ${facilidad}</span>`)
      .join('');
  }
  
  const additionalServices = document.getElementById('additional-services');
  if (additionalServices) {
    const services = ['Rutas locales recomendadas', 'Taller cercano especializado', 'Información meteorológica'];
    additionalServices.innerHTML = services
      .map(service => `<span class="facility-tag">🗺️ ${service}</span>`)
      .join('');
  }
  
  // Show stars
  const starsElement = document.querySelector('#property-modal .stars');
  if (starsElement) {
    const stars = '⭐'.repeat(Math.floor(usuario.valoracion));
    starsElement.textContent = stars;
  }
  
  // Update avatar
  const ownerAvatar = document.querySelector('#property-modal .owner-avatar');
  if (ownerAvatar) {
    ownerAvatar.textContent = usuario.nombre.charAt(0);
  }
  
  // Setup action buttons
  setupPropertyActionButtons(usuario);
  
  showModal('property');
}

function setupPropertyActionButtons(usuario) {
  const modal = document.getElementById('property-modal');
  if (!modal) return;
  
  const actionButtons = modal.querySelectorAll('.property-actions .btn');
  
  actionButtons.forEach(btn => {
    // Remove existing listeners
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
  });
  
  // Add new listeners
  const newActionButtons = modal.querySelectorAll('.property-actions .btn');
  
  if (newActionButtons[0]) {
    newActionButtons[0].addEventListener('click', function(e) {
      e.preventDefault();
      alert(`¡Solicitud de intercambio enviada a ${usuario.nombre}! Te notificaremos cuando responda.`);
      hideModal('property');
    });
  }
  
  if (newActionButtons[1]) {
    newActionButtons[1].addEventListener('click', function(e) {
      e.preventDefault();
      hideModal('property');
      showSection('messages');
      // Update nav
      const messagesLink = document.querySelector('a[href="#messages"]');
      if (messagesLink) {
        updateActiveNavLink(messagesLink);
      }
    });
  }
}

// Filters
function applyFilters() {
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

// Profile functions
function loadUserProfile() {
  console.log('Loading user profile...');
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
  
  // Update profile avatar
  const profileAvatar = document.querySelector('.profile__avatar');
  if (profileAvatar) {
    profileAvatar.textContent = currentUser.nombre.charAt(0);
  }
}

// Messages functions
function setupChatListeners() {
  const chatInput = document.querySelector('.chat-input .form-control');
  const chatSendBtn = document.querySelector('.chat-input .btn');
  
  if (chatInput && chatSendBtn) {
    chatSendBtn.addEventListener('click', function(e) {
      e.preventDefault();
      sendMessage();
    });
    
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  }
}

function sendMessage() {
  const input = document.querySelector('.chat-input .form-control');
  const messagesContainer = document.getElementById('chat-messages');
  
  if (!input || !messagesContainer || !input.value.trim()) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message message--sent';
  messageDiv.innerHTML = `
    <div class="message__content">${input.value}</div>
    <div class="message__time">${new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}</div>
  `;
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  input.value = '';
  
  // Simulate response after 2 seconds
  setTimeout(() => {
    const responses = [
      '¡Gracias por tu mensaje! Te responderé pronto con más detalles sobre el intercambio.',
      'Me parece perfecto. ¿Qué fechas tenías pensadas?',
      '¡Excelente! Mi casa está disponible esas fechas. ¿Tu moto necesita algún cuidado especial?',
      'Perfecto, podemos coordinar todos los detalles. ¿Tienes alguna pregunta sobre las facilidades?'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const responseDiv = document.createElement('div');
    responseDiv.className = 'message message--received';
    responseDiv.innerHTML = `
      <div class="message__content">${randomResponse}</div>
      <div class="message__time">${new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}</div>
    `;
    
    messagesContainer.appendChild(responseDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 1500);
}

// Initialize sample messages
function initializeSampleMessages() {
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;
  
  const sampleMessages = [
    {
      type: 'received',
      content: 'Hola Carlos! Vi tu casa en Madrid y me encantaría hacer un intercambio.',
      time: '14:30'
    },
    {
      type: 'received',
      content: 'Tengo una Ducati Panigale, ¿tu garaje tiene espacio suficiente?',
      time: '14:32'
    },
    {
      type: 'sent',
      content: '¡Hola Ana! Sí, perfecto. Mi garaje es cubierto y tiene anclajes para deportivas.',
      time: '14:45'
    }
  ];
  
  messagesContainer.innerHTML = sampleMessages.map(msg => `
    <div class="message message--${msg.type}">
      <div class="message__content">${msg.content}</div>
      <div class="message__time">${msg.time}</div>
    </div>
  `).join('');
}

// Export functions for potential external use
window.MotoSwap = {
  showSection,
  showModal,
  hideModal,
  currentUser: () => currentUser,
  appData
};