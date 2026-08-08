/**
 * CAMS Landing Page - Hero 3D Interaction System
 * Handles mouse parallax, 3D tilt, lighting shifts, and floating particles
 */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let isMouseInside = false;
  let animationId = null;
  let heroRect = null;
  let particles = [];
  
  const heroSection = document.querySelector('.hero');
  const heroDevice = document.querySelector('.hero-device');
  const heroText = document.querySelector('.hero-text');
  const deviceScreen = document.querySelector('.device-screen');
  const screenLed = document.querySelector('.screen-led');
  const screenCells = document.querySelectorAll('.screen-cell');
  const deviceVents = document.querySelector('.device-vents');
  const deviceLabel = document.querySelector('.device-label');
  const heroButtons = document.querySelector('.hero-buttons');
  
  const parallaxLayers = [
    { element: heroText, depth: 0.08, type: 'translate' },
    { element: heroDevice, depth: 0.15, type: 'tilt' },
    { element: deviceScreen, depth: 0.2, type: 'translate' },
    { element: screenLed, depth: 0.25, type: 'translate' },
    { element: deviceVents, depth: 0.3, type: 'translate' },
    { element: deviceLabel, depth: 0.2, type: 'translate' },
    { element: heroButtons, depth: 0.1, type: 'translate' }
  ];

  const particleConfig = {
    count: 15,
    minSize: 4,
    maxSize: 12,
    minSpeed: 0.02,
    maxSpeed: 0.08,
    colors: [
      'rgba(255, 71, 87, 0.15)',
      'rgba(255, 71, 87, 0.1)',
      'rgba(34, 197, 94, 0.1)',
      'rgba(255, 255, 255, 0.05)'
    ]
  };

  function init() {
    if (!heroSection || !heroDevice) return;
    createFloatingParticles();
    bindEvents();
    startAnimationLoop();
    updateHeroRect();
    window.addEventListener('resize', debounce(updateHeroRect, 100));
  }

  function createFloatingParticles() {
    const container = document.createElement('div');
    container.className = 'hero-particles';
    container.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
      border-radius: var(--radius-2xl);
    `;
    heroSection.insertBefore(container, heroSection.firstChild);
    for (let i = 0; i < particleConfig.count; i++) {
      const particle = document.createElement('div');
      const size = particleConfig.minSize + Math.random() * (particleConfig.maxSize - particleConfig.minSize);
      const color = particleConfig.colors[Math.floor(Math.random() * particleConfig.colors.length)];
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      const speedX = (Math.random() - 0.5) * (particleConfig.maxSpeed - particleConfig.minSpeed) + particleConfig.minSpeed;
      const speedY = (Math.random() - 0.5) * (particleConfig.maxSpeed - particleConfig.minSpeed) + particleConfig.minSpeed;
      const rotation = Math.random() * 360;
      const rotationSpeed = (Math.random() - 0.5) * 0.5;
      
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        left: ${startX}%;
        top: ${startY}%;
        transform: translate(-50%, -50%) rotate(${rotation}deg);
        will-change: transform;
        filter: blur(1px);
      `;
      container.appendChild(particle);
      particles.push({
        element: particle,
        x: startX,
        y: startY,
        vx: speedX,
        vy: speedY,
        rotation,
        rotationSpeed,
        size,
        containerWidth: 0,
        containerHeight: 0
      });
    }
  }

  function updateHeroRect() {
    heroRect = heroSection.getBoundingClientRect();
    particles.forEach(p => {
      p.containerWidth = heroRect.width;
      p.containerHeight = heroRect.height;
    });
  }

  function bindEvents() {
    heroSection.addEventListener('mousemove', onMouseMove);
    heroSection.addEventListener('mouseenter', onMouseEnter);
    heroSection.addEventListener('mouseleave', onMouseLeave);
    heroSection.addEventListener('touchmove', onTouchMove, { passive: true });
    heroSection.addEventListener('touchstart', onTouchStart, { passive: true });
    heroSection.addEventListener('touchend', onTouchEnd);
  }

  function onMouseMove(e) {
    if (!heroRect) return;
    mouseX = e.clientX - heroRect.left;
    mouseY = e.clientY - heroRect.top;
    targetX = (mouseX - heroRect.width / 2) / (heroRect.width / 2);
    targetY = (mouseY - heroRect.height / 2) / (heroRect.height / 2);
    targetX = Math.max(-1, Math.min(1, targetX));
    targetY = Math.max(-1, Math.min(1, targetY));
  }

  function onMouseEnter() { isMouseInside = true; }
  function onMouseLeave() { isMouseInside = false; targetX = 0; targetY = 0; }
  function onTouchMove(e) { const touch = e.touches[0]; onMouseMove({ clientX: touch.clientX, clientY: touch.clientY }); }
  function onTouchStart(e) { onMouseEnter(); const touch = e.touches[0]; onMouseMove({ clientX: touch.clientX, clientY: touch.clientY }); }
  function onTouchEnd() { onMouseLeave(); }

  function animate() {
    currentX += (targetX - currentX) * 0.1;
    currentY += (targetY - currentY) * 0.1;
    updateParallaxLayers();
    updateHeroTilt();
    updateParticles();
    updateLighting();
    animationId = requestAnimationFrame(animate);
  }

  function startAnimationLoop() { animate(); }

  function updateParallaxLayers() {
    parallaxLayers.forEach(layer => {
      if (!layer.element) return;
      const moveX = currentX * layer.depth * 30;
      const moveY = currentY * layer.depth * 30;
      if (layer.type === 'tilt') {
        layer.element.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      } else {
        layer.element.style.transform = `translate3d(${moveX}px, ${moveY}px, ${layer.depth * 50}px)`;
      }
    });
  }

  function updateHeroTilt() {
    if (!heroDevice) return;
    const tiltX = -currentY * 6;
    const tiltY = currentX * 6;
    heroDevice.style.transform = `
      perspective(1000px)
      rotateX(${tiltX}deg)
      rotateY(${tiltY}deg)
      translate3d(${currentX * 10}px, ${currentY * 10}px, 20px)
    `;
    const innerTiltX = -currentY * 3;
    const innerTiltY = currentX * 3;
    if (deviceScreen) {
      deviceScreen.style.transform = `
        perspective(800px)
        rotateX(${innerTiltX}deg)
        rotateY(${innerTiltY}deg)
        translateZ(10px)
      `;
    }
    screenCells.forEach((cell, index) => {
      const moveX = currentX * 5 * (1 + index * 0.1);
      const moveY = currentY * 5 * (1 + index * 0.1);
      cell.style.transform = `translate3d(${moveX}px, ${moveY}px, ${index * 2}px)`;
    });
  }

  function updateLighting() {
    if (!heroDevice) return;
    const lightX = 50 + currentX * 20;
    const lightY = 50 + currentY * 20;
    heroDevice.style.background = `
      radial-gradient(
        ellipse at ${lightX}% ${lightY}%,
        var(--muted) 0%,
        var(--bg) 50%,
        var(--muted) 100%
      )
    `;
    if (screenLed) {
      const glowX = 50 + currentX * 30;
      const glowY = 50 + currentY * 30;
      screenLed.style.boxShadow = `
        0 0 12px 2px rgba(255, 71, 87, 0.8),
        ${currentX * 20}px ${currentY * 20}px 20px rgba(255, 71, 87, 0.4)
      `;
    }
  }

  function updateParticles() {
    particles.forEach(p => {
      const mouseInfluenceX = -currentX * 15;
      const mouseInfluenceY = -currentY * 15;
      p.x += p.vx + mouseInfluenceX * 0.01;
      p.y += p.vy + mouseInfluenceY * 0.01;
      p.rotation += p.rotationSpeed;
      if (p.x < -10) p.x = 110;
      if (p.x > 110) p.x = -10;
      if (p.y < -10) p.y = 110;
      if (p.y > 110) p.y = -10;
      p.element.style.transform = `
        translate(-50%, -50%)
        translate(${p.x * p.containerWidth / 100}px, ${p.y * p.containerHeight / 100}px)
        rotate(${p.rotation}deg)
      `;
    });
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => { clearTimeout(timeout); func(...args); };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }

  window.addEventListener('beforeunload', () => { if (animationId) cancelAnimationFrame(animationId); });
})();