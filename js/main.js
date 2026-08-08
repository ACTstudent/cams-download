/**
 * CAMS Landing Page - Main Initialization
 * Entry point for all 3D interaction modules
 * Handles reduced motion guard and module coordination
 */

(() => {
  'use strict';

  // ============================================================
  // CONFIGURATION
  // ============================================================
  const CONFIG = {
    // Module enable/disable flags
    modules: {
      hero3D: true,
      cards3D: true,
      magnetic: true,
      scroll3D: true,
      touchAdapter: true,
      cursorGlow: true
    },
    
    // Performance
    maxFPS: 60,
    enableFPSMonitor: false,
    
    // Debug
    debug: false
  };

  // ============================================================
  // STATE
  // ============================================================
  let modulesLoaded = {};
  let reducedMotion = false;
  let initComplete = false;

  // ============================================================
  // REDUCED MOTION GUARD
  // ============================================================
  function checkReducedMotion() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = mediaQuery.matches;
    
    // Listen for changes
    mediaQuery.addEventListener('change', (e) => {
      reducedMotion = e.matches;
      if (reducedMotion) {
        disableAllMotion();
      } else {
        enableAllMotion();
      }
    });
    
    return reducedMotion;
  }

  function disableAllMotion() {
    document.body.classList.add('reduced-motion');
    console.log('[CAMS 3D] Reduced motion enabled - disabling all 3D animations');
  }

  function enableAllMotion() {
    document.body.classList.remove('reduced-motion');
    console.log('[CAMS 3D] Reduced motion disabled - enabling 3D animations');
    // Re-initialize modules that may have been disabled
    Object.keys(modulesLoaded).forEach(name => {
      if (modulesLoaded[name] && typeof modulesLoaded[name].reinit === 'function') {
        modulesLoaded[name].reinit();
      }
    });
  }

  // ============================================================
  // MODULE LOADER
  // ============================================================
  async function loadModule(name, src) {
    if (modulesLoaded[name]) {
      console.warn(`[CAMS 3D] Module ${name} already loaded`);
      return modulesLoaded[name];
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = src;
      script.onload = () => {
        console.log(`[CAMS 3D] Module loaded: ${name}`);
        // Module will self-register via window.CAMS3DModules
        const mod = window.CAMS3DModules?.[name];
        if (mod) {
          modulesLoaded[name] = mod;
          resolve(mod);
        } else {
          // Module might be IIFE-based, check for global init
          const initFn = window[`init${name.charAt(0).toUpperCase() + name.slice(1)}`];
          if (initFn) {
            const mod = initFn();
            modulesLoaded[name] = mod;
            resolve(mod);
          } else {
            // Assume IIFE runs immediately
            modulesLoaded[name] = { loaded: true };
            resolve({ loaded: true });
          }
        }
      };
      script.onerror = () => {
        console.error(`[CAMS 3D] Failed to load module: ${name}`);
        reject(new Error(`Failed to load ${name}`));
      };
      document.head.appendChild(script);
    });
  }

  // For IIFE modules, we'll load them as regular scripts
  async function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // ============================================================
  // FPS MONITOR (Dev only)
  // ============================================================
  let fpsMonitor = null;
  
  function initFPSMonitor() {
    if (!CONFIG.enableFPSMonitor) return;
    
    let frames = 0;
    let lastTime = performance.now();
    let fps = 60;
    
    const display = document.createElement('div');
    display.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: #0f0;
      padding: 8px 12px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(display);
    
    function updateFPS(now) {
      frames++;
      if (now - lastTime >= 1000) {
        fps = frames;
        frames = 0;
        lastTime = now;
        display.textContent = `FPS: ${fps}`;
        display.style.color = fps < 30 ? '#f00' : fps < 50 ? '#ff0' : '#0f0';
      }
      requestAnimationFrame(updateFPS);
    }
    
    requestAnimationFrame(updateFPS);
    fpsMonitor = display;
  }

  // ============================================================
  // MAIN INITIALIZATION
  // ============================================================
  async function init() {
    console.log('[CAMS 3D] Initializing...');
    
    // Check reduced motion
    checkReducedMotion();
    if (reducedMotion) {
      console.log('[CAMS 3D] Reduced motion preferred - skipping 3D modules');
      // Still load essential non-animation modules
      await loadEssentialModules();
      initComplete = true;
      return;
    }

    // Initialize FPS monitor if enabled
    if (CONFIG.enableFPSMonitor) {
      initFPSMonitor();
    }

    // Load all 3D modules
    await loadAllModules();
    
    // Initialize modules that need explicit init
    await initializeModules();
    
    initComplete = true;
    console.log('[CAMS 3D] Initialization complete');
    
    // Dispatch ready event
    window.dispatchEvent(new CustomEvent('cams3d:ready', {
      detail: { modules: Object.keys(modulesLoaded) }
    }));
  }

  async function loadEssentialModules() {
    // Load modules that don't require animations
    await loadScript('js/touch-adapter.js');
  }

  async function loadAllModules() {
    // Load all modules in parallel
    const moduleScripts = [
      'js/hero-3d.js',
      'js/cards-3d.js',
      'js/magnetic.js',
      'js/scroll-3d.js',
      'js/touch-adapter.js'
    ];
    
    await Promise.all(moduleScripts.map(loadScript));
    
    // Small delay to allow IIFE modules to execute
    await new Promise(r => setTimeout(r, 100));
  }

  async function initializeModules() {
    // Modules are IIFE-based and auto-initialize on load
    // This function is for any modules that need explicit init calls
    console.log('[CAMS 3D] All modules initialized');
  }

  // ============================================================
  // PUBLIC API
  // ============================================================
  window.CAMS3D = {
    CONFIG,
    modules: modulesLoaded,
    reducedMotion: () => reducedMotion,
    isReady: () => initComplete,
    reinit: async () => {
      if (initComplete) {
        await loadAllModules();
        await initializeModules();
      }
    },
    disable: disableAllMotion,
    enable: enableAllMotion
  };

  // ============================================================
  // START
  // ============================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();