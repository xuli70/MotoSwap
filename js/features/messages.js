// MotoSwap - Messages Module
// Handles chat functionality and message display

import { getCurrentUser } from '../core/state.js';
import dataService from '../data/data-service.js';

// Setup chat event listeners
export function setupChatListeners() {
  console.log('Setting up chat listeners...');
  
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  
  if (messageInput && sendButton) {
    sendButton.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
}

// Send a message (real persistence)
export async function sendMessage() {
  const messageInput = document.getElementById('message-input');
  const messagesContainer = document.getElementById('messages-container');
  
  if (!messageInput || !messagesContainer) return;
  
  const messageText = messageInput.value.trim();
  if (!messageText) return;
  
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('❌ Por favor inicia sesión para enviar mensajes.');
    return;
  }
  
  // Get current chat recipient
  const activeChat = document.querySelector('.chat-item--active');
  if (!activeChat) {
    alert('❌ Selecciona un usuario para enviar mensajes.');
    return;
  }
  
  const recipientId = activeChat.getAttribute('data-user-id');
  
  try {
    // Add sent message to UI immediately
    const sentMessage = document.createElement('div');
    sentMessage.className = 'message message--sent';
    sentMessage.innerHTML = `
      <div class="message__content">${messageText}</div>
      <div class="message__time">${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
    `;
    messagesContainer.appendChild(sentMessage);
    
    // Clear input
    messageInput.value = '';
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Save to Supabase
    console.log('💾 Guardando mensaje en Supabase...');
    await dataService.sendMessage(currentUser.id, recipientId, messageText, 'mensaje');
    console.log('✅ Mensaje guardado exitosamente');
    
    // Simulate response after delay (para demo)
    setTimeout(async () => {
      const responses = [
        '¡Hola! Sí, mi garaje tiene espacio de sobra para tu moto.',
        'Perfecto, ¿cuándo planeas venir?',
        'Claro, te puedo mostrar las rutas locales.',
        'Mi garaje tiene todas las herramientas que necesitas.',
        '¡Genial! Podemos coordinar el intercambio.'
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Save simulated response to Supabase
      try {
        await dataService.sendMessage(recipientId, currentUser.id, randomResponse, 'respuesta_auto');
        
        const receivedMessage = document.createElement('div');
        receivedMessage.className = 'message message--received';
        receivedMessage.innerHTML = `
          <div class="message__content">${randomResponse}</div>
          <div class="message__time">${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
        `;
        messagesContainer.appendChild(receivedMessage);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        console.log('✅ Respuesta automática guardada');
      } catch (error) {
        console.warn('⚠️ Error guardando respuesta automática:', error.message);
      }
    }, 1000 + Math.random() * 2000);
    
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error.message);
    alert('❌ Error enviando mensaje. Verificar conexión.');
    
    // Remove message from UI if failed to save
    if (sentMessage && sentMessage.parentNode) {
      sentMessage.parentNode.removeChild(sentMessage);
    }
  }
}

// Load real messages from Supabase
export async function loadConversation(userId1, userId2) {
  console.log(`💬 Cargando conversación real entre usuarios ${userId1} y ${userId2}...`);
  
  const messagesContainer = document.getElementById('messages-container');
  if (!messagesContainer) return;
  
  try {
    // Mostrar loading
    messagesContainer.innerHTML = '<div class="loading">🔄 Cargando mensajes...</div>';
    
    // Obtener mensajes reales de Supabase
    const messages = await dataService.getMessages(userId1, userId2);
    
    if (messages.length === 0) {
      messagesContainer.innerHTML = '<div class="no-messages">💭 No hay mensajes aún. ¡Envía el primero!</div>';
      return;
    }
    
    // Mostrar mensajes reales
    messagesContainer.innerHTML = messages.map(msg => {
      const isFromCurrentUser = msg.remitenteId === userId1;
      const messageType = isFromCurrentUser ? 'sent' : 'received';
      const time = new Date(msg.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      
      return `
        <div class="message message--${messageType}">
          <div class="message__content">${msg.contenido}</div>
          <div class="message__time">${time}</div>
        </div>
      `;
    }).join('');
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    console.log(`✅ Cargados ${messages.length} mensajes reales`);
    
  } catch (error) {
    console.error('❌ Error cargando conversación:', error.message);
    messagesContainer.innerHTML = '<div class="error">❌ Error cargando mensajes.</div>';
  }
}

// Initialize sample messages (fallback)
export function initializeSampleMessages() {
  console.log('Initializing sample messages...');
  
  const messagesContainer = document.getElementById('messages-container');
  if (!messagesContainer) return;
  
  const sampleMessages = [
    {
      type: 'received',
      content: '¡Hola! Vi tu perfil y me interesa hacer un intercambio.',
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

// Initialize messages
export async function initializeMessages() {
  console.log('Initializing messages...');
  
  // Asegurar que data service esté listo
  if (!dataService.initialized) {
    await dataService.initialize();
  }
  
  // Setup chat listeners
  setupChatListeners();
  
  // Load chat list
  await loadChatList();
}

// Load chat list sidebar with real users
async function loadChatList() {
  const chatList = document.querySelector('.chat-list');
  if (!chatList) return;
  
  const currentUser = getCurrentUser();
  if (!currentUser) {
    chatList.innerHTML = '<div class="no-user">❌ Inicia sesión para ver chats</div>';
    return;
  }
  
  try {
    // Mostrar loading
    chatList.innerHTML = '<div class="loading">🔄 Cargando usuarios...</div>';
    
    // Obtener usuarios reales de Supabase
    const usuarios = await dataService.getUsuarios();
    
    // Filtrar usuario actual
    const otherUsers = usuarios.filter(u => u.id !== currentUser.id).slice(0, 8);
    
    if (otherUsers.length === 0) {
      chatList.innerHTML = '<div class="no-users">⚠️ No hay otros usuarios disponibles</div>';
      return;
    }
    
    // Mostrar lista de usuarios reales
    chatList.innerHTML = otherUsers.map(usuario => `
      <div class="chat-item" data-user-id="${usuario.id}">
        <div class="chat-item__avatar">${usuario.nombre.charAt(0)}</div>
        <div class="chat-item__info">
          <div class="chat-item__name">${usuario.nombre}</div>
          <div class="chat-item__preview">${usuario.ubicacion}</div>
        </div>
        <div class="chat-item__moto">🏍️ ${usuario.moto.tipo}</div>
      </div>
    `).join('');
    
    console.log(`✅ Cargados ${otherUsers.length} usuarios para chat`);
    
    // Add click handlers to chat items
    const chatItems = chatList.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
      item.addEventListener('click', async function() {
        // Remove active from all
        chatItems.forEach(i => i.classList.remove('chat-item--active'));
        // Add active to clicked
        this.classList.add('chat-item--active');
        
        // Load real conversation
        const userId = this.getAttribute('data-user-id');
        const usuario = otherUsers.find(u => u.id === userId);
        if (usuario) {
          const chatHeader = document.querySelector('.chat-header h3');
          if (chatHeader) {
            chatHeader.textContent = `${usuario.nombre} - ${usuario.moto.marca} ${usuario.moto.modelo}`;
          }
          
          // Cargar conversación real
          await loadConversation(currentUser.id, userId);
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Error cargando lista de chat:', error.message);
    chatList.innerHTML = '<div class="error">❌ Error cargando usuarios</div>';
  }
}