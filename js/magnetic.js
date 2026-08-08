/**
 * CAMS Landing Page - Magnetic Buttons & Navigation
 * Handles magnetic attraction for buttons, tab buttons, and nav links
 */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Configuration
  const config = {
    // Button magnets
    btnMagneticRadius: 80,
    btnMaxOffset: 8,
    btnSpringStiffness: 0.15,
    btnSpringDamping: 0.85,
    
    // Tab button magnets
    tabMagneticRadius: 100,
    tabMaxOffset: 6,
    tabSpringStiffness: 0.12,
    tabSpringDamping: 0.8,
    
    // Nav link magnets
    navMagneticRadius: 60,
    navMaxOffset: 4,
    navSpringStiffness: 0.1,
    navSpringDamping: 0.75,
    
    // General
    springStiffness: 0.15,
    springDamping: 0.85,
    transitionDuration: 150
  };

  // State
  const magnets = new Map(); // element -> { config, offsetX, offsetY, targetX, targetY }
  let mouseX = 0;
  let mouseY = 0;
  let animationId = null;

  // Initialize
  function init() {
    // Setup button magnets
    setupMagnets('.btn-primary', {
      radius: config.btnMagneticRadius,
      maxOffset: config.btnMaxOffset,
      stiffness: config.btnSpringStiffness,
      damping: config.btnSpringDamping,
      className: 'magnetic-btn'
    });

    setupMagnets('.btn-outline', {
      radius: config.btnMagneticRadius,
      maxOffset: config.btnMaxOffset,
      stiffness: config.btnSpringStiffness,
      damping: config.btnSpringDamping,
      className: 'magnetic-btn'
    });

    // Tab buttons
    setupMagnets('.tab-btn', {
      radius: config.tabMagneticRadius,
      maxOffset: config.tabMaxOffset,
      stiffness: config.tabSpringStiffness,
      damping: config.tabSpringDamping,
      className: 'magnetic'
    });

    // Nav links
    setupMagnets('.nav-link', {
      radius: config.navMagneticRadius,
      maxOffset: config.navMaxOffset,
      stiffness: config.navSpringStiffness,
      damping: config.navSpringDamping,
      className: 'magnetic'
    });

    // CTA card buttons
    setupMagnets('.cta-card .btn', {
      radius: config.btnMagneticRadius,
      maxOffset: config.btnMaxOffset,
      stiffness: config.btnSpringStiffness,
      damping: config.btnSpringDamping,
      className: 'magnetic-btn'
    });

    // Hero buttons
    setupMagnets('.hero-buttons .btn', {
      radius: config.btnMagneticRadius * 1.2,
      maxOffset: config.btnMaxOffset,
      stiffness: config.btnSpringStiffness,
      damping: config.btnSpringDamping,
      className: 'magnetic-btn'
    });

    // Global mouse tracking
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    // Touch support
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd);

    startAnimationLoop();
  }

  function setupMagnets(selector, magnetConfig) {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(el => {
      // Add magnetic class
      el.classList.add(magnetConfig.className);
      
      // Ensure transform-style for 3D
      el.style.transformStyle = 'preserve-3d';
      el.style.willChange = 'transform';
      
      // Store magnet state
      magnets.set(el, {
        element: el,
        config: magnetConfig,
        offsetX: 0,
        offsetY: 0,
        targetX: 0,
        targetY: 0,
        velocityX: 0,
        velocityY: 0,
        rect: null
      });
      
      // Update rect on hover
      el.addEventListener('mouseenter', () => updateRect(el));
      el.addEventListener('touchstart', () => updateRect(el), { passive: true });
    });
  }

  function updateRect(el) {
    const state = magnets.get(el);
    if (state) {
      state.rect = el.getBoundingClientRect();
    }
  }

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  function onMouseLeave() {
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
    // Gradually return to center
    setTimeout(() => {
      mouseX = window.innerWidth / 2;
      mouseY = window.innerHeight / 2;
    }, 200);
  }

  function animate() {
    magnets.forEach((state, el) => {
      if (!state.rect) {
        state.rect = el.getBoundingClientRect();
        return;
      }

      const { config } = state;
      const rect = state.rect;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate distance from mouse to element center
      const deltaX = mouseX - centerX;
      const deltaY = mouseY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Check if within magnetic radius
      if (distance < config.radius) {
        // Calculate attraction strength (falloff)
        const falloff = 1 - (distance / config.radius);
        const strength = falloff * falloff; // Quadratic falloff for natural feel

        // Calculate target offset
        state.targetX = (deltaX / config.radius) * config.maxOffset * strength;
        state.targetY = (deltaY / config.radius) * config.maxOffset * strength;
      } else {
        // Outside radius - return to center
        state.targetX = 0;
        state.targetY = 0;
      }

      // Spring physics for smooth motion
      const stiffness = config.stiffness;
      const damping = config.damping;

      // Calculate spring force
      const forceX = (state.targetX - state.offsetX) * stiffness;
      const forceY = (state.targetY - state.offsetY) * stiffness;

      // Update velocity with damping
      state.velocityX = (state.velocityX + forceX) * config.damping;
      state.velocityY = (state.velocityY + forceY) * config.damping;

      // Update position
      state.offsetX += state.velocityX;
      state.offsetY += state.velocityY;

      // Apply transform
      if (Math.abs(state.offsetX) > 0.01 || Math.abs(state.offsetY) > 0.01) {
        el.style.transform = `translate3d(${state.offsetX}px, ${state.offsetY}px, 0)`;
        el.style.transition = 'transform 0ms'; // No CSS transition, we handle it
      } else {
        // Snap back to zero when very close
        if (Math.abs(state.offsetX) < 0.1 && Math.abs(state.offsetY) < 0.1) {
          state.offsetX = 0;
          state.offsetY = 0;
          state.velocityX = 0;
          state.velocityY = 0;
          el.style.transform = '';
        }
      }

      // Apply magnetic-active class for visual feedback
      if (Math.abs(state.offsetX) > 0.5 || Math.abs(state.offsetY) > 0.5) {
        el.classList.add('magnetic-active');
      } else {
        el.classList.remove('magnetic-active');
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