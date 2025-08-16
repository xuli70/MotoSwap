# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MotoSwap is a motorcycle-focused house exchange platform built as a single-page application (SPA) with vanilla JavaScript, HTML, and CSS. The application allows motorcyclists to exchange accommodations with other riders, featuring specialized matching based on bike compatibility and garage facilities.

## Architecture

### Core Structure
- **Frontend-only application**: Pure vanilla JavaScript with no build process or package manager
- **Single-page application**: All sections rendered dynamically using JavaScript, hidden/shown with CSS classes
- **No backend**: Uses mock data and local state management
- **Responsive design**: Mobile-first approach with comprehensive breakpoints

### Key Files
- `index.html` - Main HTML structure with all sections and modals
- `app.js` - Complete application logic, data management, and event handling
- `style.css` - Comprehensive styling with CSS custom properties and design system

### Application State
- `currentUser` - Stores logged-in user information
- `currentSection` - Tracks active navigation section
- `appData.usuarios` - Array containing all user/property data

## Application Sections

### Navigation System
- **Home** (`#home`) - Landing page with hero section and feature cards
- **Dashboard** (`#dashboard`) - Property listings with filtering capabilities
- **Profile** (`#profile`) - User profile and property information
- **Messages** (`#messages`) - Chat interface for user communication

### Core Features
1. **User Registration/Authentication** - Modal-based forms with validation
2. **Property Listings** - Grid-based layout with motorcycle compatibility matching
3. **Filtering System** - Filter by bike type, location, and facilities
4. **Messaging System** - Real-time-style chat with simulated responses
5. **Property Details** - Modal overlay with comprehensive property information

## Development Workflow

### Running the Application
- Open `index.html` directly in a browser (no server required)
- For development, use a local server: `python -m http.server 8000` or similar

### Testing
- Manual testing in browser required (no automated test framework)
- Test across different screen sizes using browser developer tools
- Verify all modals, navigation, and interactive features

### Code Conventions
- **JavaScript**: ES6+ features, functional programming patterns
- **CSS**: CSS custom properties (CSS variables) extensively used
- **HTML**: Semantic markup with accessibility considerations
- **Naming**: BEM-style CSS classes, descriptive JavaScript function names

## Motorcycle Compatibility System

The application includes a specialized matching system based on motorcycle types:
- **Adventure/Trail** bikes match with Adventure, Touring, Naked
- **Touring** bikes match with Touring, Adventure, Cruiser  
- **Deportiva** (Sport) bikes match with Deportiva, Naked
- **Cruiser** bikes match with Cruiser, Touring
- **Naked** bikes match with Naked, Deportiva, Adventure
- **Scooter** bikes match with Scooter, Naked

## Styling System

### Design Tokens
- Comprehensive CSS custom property system with light/dark mode support
- Color tokens, typography scales, spacing system, and component patterns
- Responsive breakpoints: 640px, 768px, 1024px, 1280px

### Key Components
- Button system with variants (primary, secondary, outline)
- Form controls with consistent styling
- Card components for content containers
- Modal system for overlays
- Status indicators and badges

## Key Functions Reference

### Navigation
- `showSection(sectionName)` - Main navigation function
- `updateActiveNavLink(activeLink)` - Updates navigation state
- `toggleMobileMenu()` - Mobile menu toggle

### Authentication
- `simulateLogin()` - Demo login with first user
- `handleRegistration(e)` - Process new user registration
- `updateUserInterface()` - Update UI based on auth state

### Data Management
- `loadListings()` - Populate property listings
- `createListingCard(usuario)` - Generate listing card HTML
- `getCompatibleBikeTypes(userBikeType)` - Get compatible bike types

### Filtering
- `applyFilters()` - Apply user-selected filters to listings

### Messaging
- `sendMessage()` - Send chat message with simulated response
- `initializeSampleMessages()` - Load sample conversation

## Notable Implementation Details

- **Mock Data**: All user data stored in `appData.usuarios` array
- **State Management**: Simple global variables for application state
- **Event Handling**: Comprehensive event listener setup in `initializeEventListeners()`
- **Modal System**: Reusable modal functions with overlay click handling
- **Responsive Images**: Placeholder images with dynamic text generation
- **Simulated Interactions**: Chat responses and user interactions use setTimeout for realism

## Accessibility Features
- Focus management for modals and interactive elements
- Keyboard navigation support (ESC key, Enter key)
- Semantic HTML structure
- Screen reader considerations with proper labeling

## Session Management
- **TODO.md**: Track project status and pending tasks
- **Handoff_Summary.md**: Document session objectives and progress for continuity
- Regular updates to project files ensure smooth handoffs between coding sessions