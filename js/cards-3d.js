/**
 * CAMS Landing Page - Card 3D Interaction System
 * Handles 3D tilt, magnetic icons, lift effects on feature cards, CTA cards, steps, FAQ cards
 */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Configuration
  const config = {
    maxTilt: 6, // degrees
    maxTiltIcon: 10,
    liftDistance: 8,
    liftDistanceZ: 20,
    transitionDuration: 400,
    magneticRadius: 100,
    iconMagneticStrength: 15,
    springStiffness: 0.15,
    springDamping: 0.85
  };

  // Card selectors
  const cardSelectors = [
    '.feature-card',
    '.cta-card',
    '.step',
    '.faq-card',
    .credentials-card
  ];

  // State
  const cards = new Map(); // element -> { rect, state, animationId }
  let mouseX = 0;
  let mouseY = 0;
  let animationId = null;

  // Initialize
  function init() {
    const allCards = document.querySelectorAll(cardSelectors.join(', '));
    
    allCards.forEach(card => {
      setupCard(card);
    });

    // Global mouse tracking
    document.addEventListener('mousemove', onGlobalMouseMove);
    document.addEventListener('mouseleave', onGlobalMouseLeave);
    
    // Touch support
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd);

    startAnimationLoop();
  }

  // Setup individual card
  function setupCard(card) {
    // Add required classes
    card.classList.add('tilt-3d', 'lift-3d', 'preserve-3d');
    
    // Find icon element
    const icon = card.querySelector('.feature-icon, .cta-icon, .step-number');
    
    // Store card state
    cards.set(card, {
      element: card,
      icon: icon,
      rect: null,
      tiltX: 0,
      tiltY: 0,
      targetTiltX: 0,
      targetTiltY: 0,
      iconOffsetX: 0,
      iconOffsetY: 0,
      targetIconOffsetX: 0,
      targetIconOffsetY: 0,
      isHovered: false,
      isPressed: false,
      animationId: null
    });

    // Bind card-specific events
    card.addEventListener('mouseenter', () => onCardEnter(card));
    card.addEventListener('mouseleave', () => onCardLeave(card));
    card.addEventListener('mousedown', () => onCardPress(card));
    card.addEventListener('mouseup', () => onCardRelease(card));
    card.addEventListener('click', (e) => onCardClick(card, e));

    // Touch events
    card.addEventListener('touchstart', (e) => {
      onCardEnter(card);
      onCardPress(card);
    }, { passive: true });
    
    card.addEventListener('touchend', (e) => {
      onCardRelease(card);
      onCardLeave(card);
    });
  }

  // Global mouse tracking
  function onGlobalMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  function onGlobalMouseLeave() {
    mouseX = window.innerWidth / 2;
    mouseY = window.innerHeight / 2;
  }

  function onTouchMove(e) {
    const touch = e.touches[0];
    mouseX = touch.clientX;
    mouseY = touch.clientY;
  }

  function onTouchStart(e) {
    const touch = e.touches[0];
    mouseX = touch.clientX;
    mouseY = touch.clientY;
  }

  function onTouchEnd() {
    // Reset to center after touch
    setTimeout(() => {
      mouseX = window.innerWidth / 2;
      mouseY = window.innerHeight / 2;
    }, 300);
  }

  // Card event handlers
  function onCardEnter(card) {
    const state = cards.get(card);
    if (!state) return;
    state.isHovered = true;
    updateCardRect(card);
  }

  function onCardLeave(card) {
    const state = cards.get(card);
    if (!state) return;
    state.isHovered = false;
    state.targetTiltX = 0;
    state.targetTiltY = 0;
    state.targetIconOffsetX = 0;
    state.targetIconOffsetY = 0;
  }

  function onCardPress(card) {
    const state = cards.get(card);
    if (!state) return;
    state.isPressed = true;
  }

  function onCardRelease(card) {
    const state = cards.get(card);
    if (!state) return;
    state.isPressed = false;
  }

  function onCardClick(card, e) {
    const state = cards.get(card);
    if (!state) return;
    // Add click ripple effect
    createRipple(card, e.clientX, e.clientY);
  }

  function updateCardRect(card) {
    const rect = card.getBoundingClientRect();
    const state = cards.get(card);
    if (state) {
      state.rect = rect;
    }
  }

  // Calculate tilt based on mouse position relative to card center
  function calculateTilt(card, state) {
    if (!state.rect || state.isPressed) return { x: 0, y: 0 };
    
    const rect = state.rect;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from center (-1 to 1)
    const deltaX = (mouseX - centerX) / (rect.width / 2);
    const deltaY = (mouseY - centerY) / (rect.height / 2);
    
    // Clamp to [-1, 1]
    const clampedX = Math.max(-1, Math.min(1, deltaX));
    const clampedY = Math.max(-1, Math.min(1, deltaY));
    
    // Only apply tilt if mouse is within magnetic radius
    const distance = Math.sqrt(
      Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
    );
    
    if (distance > config.magneticRadius + Math.max(rect.width, rect.height) / 2) {
      return { x: 0, y: 0 };
    }
    
    // Apply easing for natural feel
    const easedX = easeOutCubic(clampedX);
    const easedY = easeOutCubic(clampedY);
    
    return {
      x: easedY * config.maxTilt, // Invert Y for natural tilt
      y: easedX * config.maxTilt
    };
  }

  // Calculate icon magnetic offset
  function calculateIconOffset(card, state) {
    if (!state.rect || !state.icon) return { x: 0, y: 0 };
    
    const rect = state.rect;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (mouseX - centerX) / (rect.width / 2);
    const deltaY = (mouseY - centerY) / (rect.height / 2);
    
    const clampedX = Math.max(-1, Math.min(1, deltaX));
    const clampedY = Math.max(-1, Math.min(1, deltaY));
    
    return {
      x: clampedX * config.iconMagneticStrength,
      y: clampedY * config.iconMagneticStrength
    };
  }

  // Spring physics for smooth interpolation
  function springInterpolate(current, target, stiffness = config.springStiffness, damping = config.springDamping) {
    const velocity = (target - current) * stiffness;
    return current + velocity * damping;
  }

  // Easing function
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // Create ripple effect on click
  function createRipple(card, clientX, clientY) {
    const rect = card.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 71, 87, 0.3);
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 10;
    `;
    
    card.appendChild(ripple);
    
    // Animate ripple
    const maxRadius = Math.max(rect.width, rect.height) * 1.5;
    ripple.animate([
      { width: '0', height: '0', opacity: 0.4 },
      { width: `${maxRadius}px`, height: `${maxRadius}px`, opacity: 0 }
    ], {
      duration: 500,
      easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }).onfinish = () => ripple.remove();
  }

  // Main animation loop
  function animate() {
    cards.forEach((state, card) => {
      if (!state.rect) {
        updateCardRect(card);
        return;
      }
      
      // Calculate target tilt
      const tilt = calculateTilt(card, state);
      state.targetTiltX = tilt.x;
      state.targetTiltY = tilt.y;
      
      // Spring interpolation for tilt
      state.tiltX = springInterpolate(state.tiltX, state.targetTiltX);
      state.tiltY = springInterpolate(state.tiltY, state.targetTiltY);
      
      // Calculate icon offset
      if (state.icon) {
        const iconOffset = calculateIconOffset(card, state);
        state.targetIconOffsetX = iconOffset.x;
        state.targetIconOffsetY = iconOffset.y;
        
        state.iconOffsetX = springInterpolate(state.iconOffsetX, state.targetIconOffsetX);
        state.iconOffsetY = springInterpolate(state.iconOffsetY, state.targetIconOffsetY);
        
        // Apply icon transform
        state.icon.style.transform = `
          translate3d(${state.iconOffsetX}px, ${state.iconOffsetY}px, 20px)
          rotateX(${-state.tiltX * 0.5}deg)
          rotateY(${state.tiltY * 0.5}deg)
        `;
      }
      
      // Apply card transform
      let transform = '';
      
      if (state.isHovered && !state.isPressed) {
        // Lift and tilt
        transform = `
          perspective(1000px)
          translate3d(0, ${-config.liftDistance}px, ${config.liftDistanceZ}px)
          rotateX(${state.tiltX}deg)
          rotateY(${state.tiltY}deg)
        `;
      } else if (state.isPressed) {
        // Press down
        transform = `
          perspective(1000px)
          translate3d(0, ${config.pressDepth}px, 0)
          scale(0.99)
        `;
      } else {
        // Reset
        transform = `
          perspective(1000px)
          translate3d(0, 0, 0)
          rotateX(0deg)
          rotateY(0deg)
        `;
      }
      
      card.style.transform = transform;
      card.style.transition = state.isPressed ? 'transform 50ms, box-shadow 50ms' : 
        `transform ${config.transitionDuration}ms cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow ${config.transitionDuration}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
      
      // Update box shadow based on state
      if (state.isHovered && !state.isPressed) {
        card.style.boxShadow = 'var(--shadow-floating), 0 20px 40px rgba(0,0,0,0.1)';
      } else if (state.isPressed) {
        card.style.boxShadow = 'var(--shadow-pressed)';
      } else {
        card.style.boxShadow = 'var(--shadow-card)';
      }
    });
    
    animationId = requestAnimationFrame(animate);
  }

  function startAnimationLoop() {
    animate();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Cleanup
  window.addEventListener('beforeunload', () => {
    if (animationId) cancelAnimationFrame(animationId);
  });
})();