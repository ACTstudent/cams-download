/**
 * CAMS Landing Page - Scroll-Based Depth & Reveal
 * Handles scroll parallax, 3D reveal animations, and nav elevation
 */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const config = {
    heroParallaxSpeed: 0.3,
    heroMaxTranslateZ: -100,
    heroFadeStart: 0.1,
    heroFadeEnd: 0.8,
    revealThreshold: 0.15,
    revealRootMargin: '0px 0px -10% 0px',
    staggerDelay: 80,
    maxStagger: 500,
    navElevationThreshold: 50,
    navElevationMax: 20,
    sectionParallaxSpeed: 0.1,
    sectionMaxTranslateZ: 50,
    decorativeFloatSpeed: 0.05,
    decorativeMaxTranslate: 30
  };

  let scrollY = 0;
  let lastScrollY = 0;
  let ticking = false;
  let animationId = null;

  let heroSection = null;
  let heroDevice = null;
  let heroText = null;
  let nav = null;
  let sections = [];
  let revealElements = [];
  let decorativeElements = [];

  function init() {
    heroSection = document.querySelector('.hero');
    heroDevice = document.querySelector('.hero-device');
    heroText = document.querySelector('.hero-text');
    nav = document.querySelector('.nav');
    sections = document.querySelectorAll('.section');
    revealElements = Array.from(document.querySelectorAll(
      '.feature-card, .cta-card, .step, .faq-card, .credentials-card, .step, .tabs-container'
    ));
    decorativeElements = Array.from(document.querySelectorAll(
      '.hero-device, .feature-card, .cta-card, .step, .feature-icon, .cta-icon, .step-number'
    ));
    if (!heroSection) return;
    window.addEventListener('scroll', onScroll, { passive: true });
    setupRevealObserver();
    startAnimationLoop();
    onScroll();
  }

  function onScroll() {
    scrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  }

  function updateScrollEffects() {
    ticking = false;
    updateHeroParallax();
    updateNavElevation();
    updateSectionParallax();
    updateDecorativeParallax();
    lastScrollY = scrollY;
  }

  function updateHeroParallax() {
    if (!heroSection || !heroDevice || !heroText) return;
    const heroRect = heroSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const heroBottom = heroRect.bottom;
    const heroTop = heroRect.top;
    const heroHeight = heroRect.height;
    let progress = 0;
    if (heroBottom > 0 && heroTop < viewportHeight) {
      progress = Math.max(0, Math.min(1, (viewportHeight - heroTop) / (heroHeight + viewportHeight)));
    } else if (heroTop >= viewportHeight) {
      progress = 1;
    }
    const translateZ = progress * config.heroMaxTranslateZ;
    const translateY = progress * 30;
    if (heroDevice) {
      heroDevice.style.transform = `
        perspective(1000px)
        translate3d(0, ${translateY}px, ${translateZ}px)
      `;
    }
    const textOpacity = 1 - progress * 0.3;
    if (heroText) {
      heroText.style.opacity = textOpacity;
      heroText.style.transform = `translate3d(0, ${progress * -20}px, ${progress * 50}px)`;
    }
    const heroButtons = document.querySelector('.hero-buttons');
    if (heroButtons) {
      heroButtons.style.opacity = 1 - progress * 0.5;
    }
  }

  function updateNavElevation() {
    if (!nav) return;
    if (scrollY > config.navElevationThreshold) {
      const elevation = Math.min(
        config.navElevationMax,
        (scrollY - config.navElevationThreshold) * 0.2
      );
      nav.style.boxShadow = `
        var(--shadow-recessed),
        0 ${elevation}px ${elevation * 2}px rgba(0,0,0,${0.05 + elevation * 0.002})
      `;
      nav.style.transform = `translateZ(${elevation}px)`;
    } else {
      nav.style.boxShadow = 'var(--shadow-recessed)';
      nav.style.transform = 'translateZ(0)';
    }
  }

  function updateSectionParallax() {
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      if (rect.bottom > 0 && rect.top < viewportHeight) {
        const progress = Math.max(0, Math.min(1,
          (viewportHeight - rect.top) / (rect.height + viewportHeight)
        ));
        const cards = section.querySelectorAll('.feature-card, .cta-card, .step, .faq-card');
        cards.forEach((card, index) => {
          const stagger = index * 0.02;
          const translateZ = progress * config.sectionMaxTranslateZ * (1 + stagger);
          const translateY = progress * 15 * (1 + stagger);
          if (!card.matches(':hover')) {
            card.style.transform = `
              perspective(1000px)
              translate3d(0, ${translateY}px, ${translateZ}px)
            `;
          }
        });
      }
    });
  }

  function updateDecorativeParallax() {
    decorativeElements.forEach((el, index) => {
      if (el.matches(':hover') || el.closest(':hover')) return;
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      if (rect.bottom > 0 && rect.top < viewportHeight) {
        const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
        const staggerFactor = 1 + (index % 3) * 0.1;
        const translateX = Math.sin(scrollY * config.decorativeFloatSpeed + index) * 
          config.decorativeMaxTranslate * staggerFactor * progress;
        const translateY = Math.cos(scrollY * config.decorativeFloatSpeed + index) * 
          config.decorativeMaxTranslate * 0.5 * staggerFactor * progress;
        const translateZ = progress * 20 * staggerFactor;
        el.style.transform = `
          perspective(1000px)
          translate3d(${translateX}px, ${translateY}px, ${translateZ}px)
          rotateY(${Math.sin(scrollY * 0.001 + index) * 2}deg)
          rotateX(${Math.cos(scrollY * 0.001 + index) * 1}deg)
        `;
      }
    });
  }

  function setupRevealObserver() {
    const observerOptions = {
      threshold: config.revealThreshold,
      rootMargin: config.revealRootMargin
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = Math.min(index * config.staggerDelay, config.maxStagger);
          setTimeout(() => {
            el.classList.add('reveal-3d');
            el.style.animationDelay = '0ms';
          }, delay);
          observer.unobserve(el);
        }
      });
    }, observerOptions);
    revealElements.forEach(el => {
      el.classList.add('reveal-3d');
      observer.observe(el);
    });
  }

  function staggerReveal(gridSelector, cardSelector, baseDelay = 100) {
    const grid = document.querySelector(gridSelector);
    if (!grid) return;
    const cards = grid.querySelectorAll(cardSelector);
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * config.staggerDelay}ms`;
    });
  }

  function initStaggerReveals() {
    staggerReveal('.feature-grid', '.feature-card');
    staggerReveal('.cta-grid', '.cta-card');
    staggerReveal('.steps-grid', '.step');
    staggerReveal('.faq-grid', '.faq-card');
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.pushState(null, null, targetId);
        }
      });
    });
  }

  function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--accent), var(--accent-light));
      z-index: 1000;
      transform-origin: left;
      transform: scaleX(0);
      pointer-events: none;
    `;
    document.body.appendChild(progressBar);
    window.addEventListener('scroll', () => {
      const scrollPercent = scrollY / (document.body.scrollHeight - window.innerHeight);
      progressBar.style.transform = `scaleX(${scrollPercent})`;
    }, { passive: true });
  }

  function startAnimationLoop() {
    initStaggerReveals();
    initSmoothScroll();
    function animate() { animationId = requestAnimationFrame(animate); }
    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { init(); createScrollProgress(); });
  } else { init(); createScrollProgress(); }

  window.addEventListener('beforeunload', () => { if (animationId) cancelAnimationFrame(animationId); });
})();