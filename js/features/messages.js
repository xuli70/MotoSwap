// MotoSwap - Messages Module
// Handles chat functionality and message display

import { getCurrentUser } from '../core/state.js';
import { appData } from '../data/users-data.js';

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

// Send a message
export function sendMessage() {
  const messageInput = document.getElementById('message-input');
  const messagesContainer = document.getElementById('messages-container');
  
  if (!messageInput || !messagesContainer) return;
  
  const messageText = messageInput.value.trim();
  if (!messageText) return;
  
  // Add sent message
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
  
  // Simulate response after delay
  setTimeout(() => {
    const responses = [
      '¡Hola! Sí, mi garaje tiene espacio de sobra para tu moto.',
      'Perfecto, ¿cuándo planeas venir?',
      'Claro, te puedo mostrar las rutas locales.',
      'Mi garaje tiene todas las herramientas que necesitas.',
      '¡Genial! Podemos coordinar el intercambio.'
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const receivedMessage = document.createElement('div');
    receivedMessage.className = 'message message--received';
    receivedMessage.innerHTML = `
      <div class="message__content">${randomResponse}</div>
      <div class="message__time">${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
    `;
    messagesContainer.appendChild(receivedMessage);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 1000 + Math.random() * 2000);
}

// Initialize sample messages
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
export function initializeMessages() {
  console.log('Initializing messages...');
  
  // Setup chat listeners
  setupChatListeners();
  
  // Load chat list
  loadChatList();
}

// Load chat list sidebar
function loadChatList() {
  const chatList = document.querySelector('.chat-list');
  if (!chatList) return;
  
  const currentUser = getCurrentUser();
  
  // Show sample chats with other users
  const sampleChats = appData.usuarios.slice(0, 5).filter(u => !currentUser || u.id !== currentUser.id);
  
  chatList.innerHTML = sampleChats.map(usuario => `
    <div class="chat-item" data-user-id="${usuario.id}">
      <div class="chat-item__avatar">${usuario.nombre.charAt(0)}</div>
      <div class="chat-item__info">
        <div class="chat-item__name">${usuario.nombre}</div>
        <div class="chat-item__preview">Último mensaje...</div>
      </div>
      <div class="chat-item__time">14:30</div>
    </div>
  `).join('');
  
  // Add click handlers to chat items
  const chatItems = chatList.querySelectorAll('.chat-item');
  chatItems.forEach(item => {
    item.addEventListener('click', function() {
      // Remove active from all
      chatItems.forEach(i => i.classList.remove('chat-item--active'));
      // Add active to clicked
      this.classList.add('chat-item--active');
      
      // Load conversation
      const userId = this.getAttribute('data-user-id');
      const usuario = appData.usuarios.find(u => u.id === parseInt(userId));
      if (usuario) {
        const chatHeader = document.querySelector('.chat-header h3');
        if (chatHeader) {
          chatHeader.textContent = usuario.nombre;
        }
        initializeSampleMessages();
      }
    });
  });
}