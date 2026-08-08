/**
 * CAMS Landing Page - Touch & Mobile Adaptation
 * Handles touch-friendly interactions, disables hover-only effects on touch devices,
 * and provides progressive enhancement for mobile
 */

(() => {
  'use strict';

  // Detect touch capability
  const isTouchDevice = ('ontouchstart' in window) || 
                        navigator.maxTouchPoints > 0 || 
                        navigator.msMaxTouchPoints > 0;
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Configuration
  const config = {
    // Touch target minimum size (WCAG 2.5.5)
    minTouchTarget: 44,
    
    // Tap delay for touch
    tapDelay: 150,
    
    // Long press threshold
    longPressDelay: 500,
    
    // Swipe threshold
    swipeThreshold: 50,
    
    // Disable hover effects on touch
    disableHoverOnTouch: true
  };

  // State
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let activeTouchElement = null;
  let longPressTimer = null;
  
  // Initialize
  function init() {
    if (!isTouchDevice) return;
    
    // Add touch device class to body
    document.body.classList.add('touch-device');
    
    // Disable hover-only effects
    if (config.disableHoverOnTouch) {
      disableHoverEffects();
    }
    
    // Enhance touch targets
    enhanceTouchTargets();
    
    // Bind touch events
    bindTouchEvents();
    
    // Handle orientation change
    window.addEventListener('orientationchange', onOrientationChange);
    
    // Handle viewport resize
    window.addEventListener('resize', debounce(onResize, 100));
  }

  // Disable CSS hover effects on touch devices
  function disableHoverEffects() {
    const style = document.createElement('style');
    style.id = 'touch-hover-overrides';
    style.textContent = `
      /* Disable hover transforms on touch devices */
      .touch-device .tilt-3d:hover,
      .touch-device .lift-3d:hover,
      .touch-device .lift-3d-hero:hover,
      .touch-device .feature-card:hover,
      .touch-device .cta-card:hover,
      .touch-device .step:hover,
      .touch-device .faq-card:hover,
      .touch-device .credentials-card:hover,
      .touch-device .btn:hover,
      .touch-device .tab-btn:hover,
      .touch-device .nav-link:hover {
        transform: none !important;
        box-shadow: var(--shadow-card) !important;
      }
      
      /* Keep active/pressed states */
      .touch-device .tilt-3d:active,
      .touch-device .lift-3d:active,
      .touch-device .btn:active,
      .touch-device .feature-card:active,
      .touch-device .cta-card:active {
        transform: translateY(2px) scale(0.99) !important;
        box-shadow: var(--shadow-pressed) !important;
      }
      
      /* Disable magnetic attraction on touch */
      .touch-device .magnetic,
      .touch-device .magnetic-btn {
        transition: transform 100ms ease-out !important;
      }
      
      /* Reduce parallax on touch */
      .touch-device .parallax-layer {
        transition: none !important;
      }
      
      /* Disable cursor glow */
      .touch-device .cursor-glow {
        display: none !important;
      }
      
      /* Disable floating animations */
      .touch-device .float-3d,
      .touch-device .float-3d-slow,
      .touch-device .float-3d-fast {
        animation: none !important;
      }
      
      /* Disable magnetic attraction visual */
      .touch-device .magnetic-active {
        transform: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Ensure all interactive elements meet minimum touch target size
  function enhanceTouchTargets() {
    const interactiveSelectors = [
      '.btn',
      '.tab-btn',
      '.nav-link',
      '.feature-card',
      '.cta-card',
      '.step',
      '.faq-card',
      '.credential-row',
      '.credential-card',
      'a[href]',
      'button',
      'input',
      'select'
    ];
    const elements = document.querySelectorAll(interactiveSelectors.join(', '));
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width >= config.minTouchTarget && rect.height >= config.minTouchTarget) {
        return;
      }
      const currentPadding = window.getComputedStyle(el).padding;
      const paddingValues = currentPadding.split(' ').map(v => parseFloat(v) || 0);
      const neededWidth = Math.max(0, config.minTouchTarget - rect.width);
      const neededHeight = Math.max(0, config.minTouchTarget - rect.height);
      el.style.padding = `
        ${paddingValues[0] + neededHeight / 2}px
        ${paddingValues[1] + neededWidth / 2}px
        ${paddingValues[2] + neededHeight / 2}px
        ${paddingValues[3] + neededWidth / 2}px
      `;
    });
  }

  // Bind touch events for better interaction
  function bindTouchEvents() {
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchcancel', onTouchCancel);
  }

  function onTouchStart(e) {
    const target = e.target.closest(
      '.btn, .tab-btn, .nav-link, .feature-card, .cta-card, .step, .faq-card, .credential-card, a[href]'
    );
    if (!target) return;
    activeTouchElement = target;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
    target.classList.add('touch-active');
    longPressTimer = setTimeout(() => {
      if (activeTouchElement === target) {
        triggerLongPress(target, e);
      }
    }, config.longPressDelay);
  }

  function onTouchMove(e) {
    if (!activeTouchElement) return;
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = Math.abs(touchX - touchStartX);
    const deltaY = Math.abs(touchY - touchStartY);
    if (deltaX > config.swipeThreshold || deltaY > config.swipeThreshold) {
      clearTimeout(longPressTimer);
    }
  }

  function onTouchEnd(e) {
    if (!activeTouchElement) return;
    clearTimeout(longPressTimer);
    const touchDuration = Date.now() - touchStartTime;
    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchStartX);
    const deltaY = Math.abs(touch.clientY - touchStartY);
    activeTouchElement.classList.remove('touch-active');
    if (touchDuration < config.tapDelay && deltaX < config.swipeThreshold && deltaY < config.swipeThreshold) {
      if (!activeTouchElement.matches('a[href]')) {
        activeTouchElement.click();
      }
    }
    activeTouchElement = null;
  }

  function onTouchCancel(e) {
    if (activeTouchElement) {
      clearTimeout(longPressTimer);
      activeTouchElement.classList.remove('touch-active');
      activeTouchElement = null;
    }
  }

  function triggerLongPress(element, originalEvent) {
    const longPressEvent = new CustomEvent('longpress', {
      bubbles: true,
      cancelable: true,
      detail: { originalEvent }
    });
    element.dispatchEvent(longPressEvent);
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function onOrientationChange() {
    setTimeout(() => {
      enhanceTouchTargets();
    }, 100);
  }

  function onResize() {
    enhanceTouchTargets();
  }

  function addTouchActiveStyles() {
    const style = document.createElement('style');
    style.id = 'touch-active-styles';
    style.textContent = `
      .touch-active {
        transform: scale(0.98) !important;
        box-shadow: var(--shadow-pressed) !important;
        transition: transform 50ms, box-shadow 50ms !important;
      }
      .touch-device :focus-visible {
        outline: 3px solid var(--accent-text) !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 3px var(--accent-text), var(--shadow-floating) !important;
      }
    `;
    if (!document.getElementById('touch-active-styles')) {
      document.head.appendChild(style);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { init(); addTouchActiveStyles(); });
  } else {
    init();
    addTouchActiveStyles();
  }
})();