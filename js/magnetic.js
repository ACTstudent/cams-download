/**
 * CAMS Landing Page - Magnetic Buttons & Navigation
 * Handles magnetic attraction for buttons, tab buttons, and nav links
 */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const config = {
    btnMagneticRadius: 80,
    btnMaxOffset: 8,
    btnSpringStiffness: 0.15,
    btnSpringDamping: 0.85,
    tabMagneticRadius: 100,
    tabMaxOffset: 6,
    tabSpringStiffness: 0.12,
    tabSpringDamping: 0.8,
    navMagneticRadius: 60,
    navMaxOffset: 4,
    navSpringStiffness: 0.1,
    navSpringDamping: 0.75,
    springStiffness: 0.15,
    springDamping: 0.85,
    transitionDuration: 150
  };

  const magnets = new Map();
  let mouseX = 0;
  let mouseY = 0;
  let animationId = null;

  function init() {
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
    setupMagnets('.tab-btn', {
      radius: config.tabMagneticRadius,
      maxOffset: config.tabMaxOffset,
      stiffness: config.tabSpringStiffness,
      damping: config.tabSpringDamping,
      className: 'magnetic'
    });
    setupMagnets('.nav-link', {
      radius: config.navMagneticRadius,
      maxOffset: config.navMaxOffset,
      stiffness: config.navSpringStiffness,
      damping: config.navSpringDamping,
      className: 'magnetic'
    });
    setupMagnets('.cta-card .btn', {
      radius: config.btnMagneticRadius,
      maxOffset: config.btnMaxOffset,
      stiffness: config.btnSpringStiffness,
      damping: config.btnSpringDamping,
      className: 'magnetic-btn'
    });
    setupMagnets('.hero-buttons .btn', {
      radius: config.btnMagneticRadius * 1.2,
      maxOffset: config.btnMaxOffset,
      stiffness: config.btnSpringStiffness,
      damping: config.btnSpringDamping,
      className: 'magnetic-btn'
    });
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
    startAnimationLoop();
  }

  function setupMagnets(selector, magnetConfig) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.classList.add(magnetConfig.className);
      el.style.transformStyle = 'preserve-3d';
      el.style.willChange = 'transform';
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
      el.addEventListener('mouseenter', () => updateRect(el));
      el.addEventListener('touchstart', () => updateRect(el), { passive: true });
    });
  }

  function updateRect(el) {
    const state = magnets.get(el);
    if (state) state.rect = el.getBoundingClientRect();
  }

  function onMouseMove(e) { mouseX = e.clientX; mouseY = e.clientY; }
  function onMouseLeave() { mouseX = window.innerWidth / 2; mouseY = window.innerHeight / 2; }
  function onTouchMove(e) { const touch = e.touches[0]; mouseX = touch.clientX; mouseY = touch.clientY; }
  function onTouchStart(e) { const touch = e.touches[0]; mouseX = touch.clientX; mouseY = touch.clientY; }
  function onTouchEnd() { setTimeout(() => { mouseX = window.innerWidth / 2; mouseY = window.innerHeight / 2; }, 200); }

  function animate() {
    magnets.forEach((state, el) => {
      if (!state.rect) { state.rect = el.getBoundingClientRect(); return; }
      const { config } = state;
      const rect = state.rect;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = mouseX - centerX;
      const deltaY = mouseY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance < config.radius) {
        const falloff = 1 - (distance / config.radius);
        const strength = falloff * falloff;
        state.targetX = (deltaX / config.radius) * config.maxOffset * strength;
        state.targetY = (deltaY / config.radius) * config.maxOffset * strength;
      } else {
        state.targetX = 0;
        state.targetY = 0;
      }
      const stiffness = config.stiffness;
      const damping = config.damping;
      const forceX = (state.targetX - state.offsetX) * stiffness;
      const forceY = (state.targetY - state.offsetY) * stiffness;
      state.velocityX = (state.velocityX + forceX) * config.damping;
      state.velocityY = (state.velocityY + forceY) * config.damping;
      state.offsetX += state.velocityX;
      state.offsetY += state.velocityY;
      if (Math.abs(state.offsetX) > 0.01 || Math.abs(state.offsetY) > 0.01) {
        el.style.transform = `translate3d(${state.offsetX}px, ${state.offsetY}px, 0)`;
        el.style.transition = 'transform 0ms';
      } else {
        if (Math.abs(state.offsetX) < 0.1 && Math.abs(state.offsetY) < 0.1) {
          state.offsetX = 0; state.offsetY = 0; state.velocityX = 0; state.velocityY = 0; el.style.transform = '';
        }
      }
      if (Math.abs(state.offsetX) > 0.5 || Math.abs(state.offsetY) > 0.5) {
        el.classList.add('magnetic-active');
      } else {
        el.classList.remove('magnetic-active');
      }
    });
    animationId = requestAnimationFrame(animate);
  }

  function startAnimationLoop() { animate(); }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
  window.addEventListener('beforeunload', () => { if (animationId) cancelAnimationFrame(animationId); });
})();