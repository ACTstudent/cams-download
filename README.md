# CAMS Landing Page — Interactive 3D Neumorphism

> A modern, accessible, performant landing page for the **CAMS (Computer Account Management System)** built with **vanilla HTML/CSS/JS** featuring **interactive 3D neumorphism** — depth, parallax, magnetic interactions, and tactile physics.

---

## 🎯 Overview

This is the official landing/download page for **CAMS v2.5** — a LAN-based classroom management system. The page showcases the project's features, installation guide, and provides direct download links for the Server and Client installers.

**Design Philosophy**: Industrial Skeuomorphism meets Interactive 3D. Every element feels physical — cards lift, buttons magnetize, the hero tilts, scroll reveals depth.

---

## ✨ Features

### Interactive 3D System
| Feature | Description |
|---------|-------------|
| **Mouse Parallax** | Layered depth movement on hero (background → foreground) |
| **3D Tilt** | Cards & hero device tilt toward cursor (max 6–8°) |
| **Magnetic Buttons** | Primary CTAs attract cursor within radius |
| **3D Lift & Press** | Cards lift on hover, press inward on click |
| **Scroll Depth** | Hero recedes in Z, sections reveal with 3D entrance |
| **Floating Particles** | Ambient depth particles in hero background |
| **Magnetic Navigation** | Tab buttons & nav links subtly attract cursor |

### Accessibility & Performance
- ✅ `prefers-reduced-motion` — disables ALL 3D motion instantly
- ✅ `prefers-contrast: high` — enhanced shadows/colors
- ✅ Keyboard navigation with 3D focus rings
- ✅ Touch-friendly (44px min targets, tap/press states)
- ✅ GPU-accelerated transforms (`translate3d`, `will-change`)
- ✅ `IntersectionObserver` for scroll reveals (no scroll listeners for reveals)
- ✅ Passive scroll listeners, debounced resize
- ✅ No layout thrashing — only `transform`/`opacity` animated

### Responsive
- Desktop: Full 3D tilt, parallax, magnetic, hover lift
- Tablet: Reduced tilt, tap states, simplified parallax
- Mobile: Touch-optimized, hover→tap conversion, 44px targets, gyroscope-ready

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/ACTstudent/cams-download.git
cd cams-download

# Serve locally (any static server)
npx serve .
# or
python -m http.server 8000
# or
php -S localhost:8000
```

Open `http://localhost:8000` — no build step, no dependencies.

---

## 📁 Project Structure

```
cams-download/
├── index.html          # Main HTML (semantic, accessible, 3D-ready)
├── style.css           # Complete design system + 3D utilities
├── js/
│   ├── hero-3d.js      # Hero parallax, tilt, lighting, particles
│   ├── cards-3d.js     # Card tilt, magnetic icons, lift/press
│   ├── magnetic.js     # Button/nav/tab magnetic attraction
│   ├── scroll-3d.js    # Scroll parallax, reveal, nav elevation
│   ├── touch-adapter.js# Touch targets, tap/press, long-press
│   └── main.js         # Module coordination, reduced-motion guard
├── README.md           # This file
└── LICENSE             # MIT
```

---

## 🎨 Design System

### Colors (CSS Custom Properties)
```css
:root {
  --bg: #e0e5ec;           /* Chassis */
  --fg: #f0f2f5;           /* Panel */
  --muted: #d1d9e6;        /* Recessed */
  --text: #2d3436;         /* Primary text */
  --text-muted: #4a5568;   /* Secondary text */
  --accent: #ff4757;       /* Alert/Primary */
  --accent-dark: #d6303f;  /* Pressed */
  --accent-light: #ff6b75; /* Hover */
  --green: #22c55e;        /* Success/Online */
}
```

### Neumorphic Shadows
```css
--shadow-card:       8px  8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
--shadow-floating:  12px 12px 24px var(--shadow-dark), -12px -12px 24px var(--shadow-light);
--shadow-pressed:    inset 6px  6px 12px var(--shadow-dark), inset -6px -6px 12px var(--shadow-light);
--shadow-recessed:   inset 4px  4px  8px var(--shadow-dark), inset -4px -4px  8px var(--shadow-light);
--shadow-glow-red:   0 0 12px 2px rgba(255, 71, 87, 0.55);
```

### Typography
- **UI**: Inter (400–800)
- **Code/Labels**: JetBrains Mono (400/500/700)

---

## ⚙️ 3D Interaction Configuration

All behaviors tunable via CSS custom properties in `:root`:

```css
/* 3D Perspective & Depth */
--perspective: 1000px;
--max-tilt: 6deg;
--max-tilt-hero: 8deg;
--lift-distance: 8px;
--lift-distance-hero: 12px;
--magnetic-strength: 6px;
--magnetic-strength-btn: 8px;

/* Transitions */
--transition-smooth: 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
--transition-snappy: 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275);

/* Parallax Depth */
--parallax-depth-bg: 0.02;
--parallax-depth-mid: 0.08;
--parallax-depth-fg: 0.15;
--parallax-depth-hero: 0.25;

/* Magnetic */
--magnetic-radius: 120px;
--magnetic-radius-btn: 80px;
```

---

## 🧩 Utility Classes

### 3D Infrastructure
| Class | Purpose |
|-------|---------|
| `.perspective-wrapper` | Sets `perspective: 1000px`, `preserve-3d` |
| `.preserve-3d` | `transform-style: preserve-3d` |
| `.parallax-layer[data-depth="bg|mid|fg|hero"]` | Mouse parallax layers |
| `.tilt-3d` | 3D tilt on hover |
| `.lift-3d` | Lift + Z translate on hover |
| `.lift-3d-hero` | Hero-specific lift |
| `.magnetic` | Magnetic attraction |
| `.magnetic-btn` | Button magnetic |
| `.press-3d` | Press inset on active |
| `.reveal-3d` | Scroll reveal animation |

### Layer Z-Index
```css
--z-bg: 0;
--z-content: 10;
--z-floating: 20;
--z-ui: 50;
--z-cursor: 100;
--z-noise: 9999;
```

---

## ♿ Accessibility

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  /* Disables: parallax, tilt, lift, magnetic, float, scroll reveal, cursor glow */
  .parallax-layer, .tilt-3d, .lift-3d, .magnetic, .reveal-3d, .float-3d, .cursor-glow {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
}
```

### High Contrast
```css
@media (prefers-contrast: high) {
  /* Stronger shadows, higher contrast colors */
}
```

### Keyboard Navigation
- Visible focus rings with 3D lift: `:focus-visible`
- Tab order follows visual order
- Skip links not needed (simple structure)

### Touch Accessibility
- 44×44px minimum touch targets (WCAG 2.5.5)
- Tap → hover conversion
- Long-press → custom event + haptic feedback
- Touch-active press state

---

## ⚡ Performance

### Guidelines Followed
- **GPU-only animations**: `transform`, `opacity`, `filter` only
- **No layout thrashing**: `will-change` applied via JS only when needed
- **Passive listeners**: `{ passive: true }` on scroll/touch
- **Debounced resize**: 100ms debounce
- **IntersectionObserver**: For reveals (not scroll listeners)
- **RAF loops**: Single unified loop per module
- **`backface-visibility: hidden`**: Prevents flicker
- **`contain: layout style`**: On card containers (where supported)

### Metrics Target
| Metric | Target |
|--------|--------|
| FPS (desktop) | 60 |
| FPS (mobile 5yr) | ≥ 30 |
| JS Bundle (total) | ~15 KB (gzipped) |
| CSS Bundle | ~12 KB (gzipped) |
| LCP | < 1.5s |
| CLS | < 0.1 |

---

## 🛠️ Development

### Adding New Interactive Cards
```html
<div class="feature-card lift-3d tilt-3d reveal-3d magnetic">
  <div class="feature-icon magnetic">...</div>
  <h3>Title</h3>
  <p>Description</p>
</div>
```

### Adding Magnetic Buttons
```html
<button class="btn btn-primary magnetic-btn">Download</button>
```

### Custom Parallax Layer
```html
<div class="parallax-layer" data-depth="fg">
  <!-- Moves at 15% of mouse movement -->
</div>
```

### Scroll Reveal Stagger
```html
<div class="reveal-3d reveal-3d-delay-2">...</div>
<!-- Delays: 0, 1, 2, 3, 4, 5 (×80ms) -->
```

---

## 🌐 Browser Support

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14+ | Full support |
| Edge | 90+ | Full support |
| Mobile Safari | 14+ | Touch-optimized |
| Chrome Android | 90+ | Touch-optimized |

**Requires**: CSS Custom Properties, `IntersectionObserver`, `requestAnimationFrame`, ES6 modules

---

## 📦 Deployment

### Static Hosting (Recommended)
```bash
# Netlify
netlify deploy --prod --dir .

# Vercel
vercel --prod

# GitHub Pages
# Push to main branch → Settings → Pages → main branch
```

### Headers (Security/Performance)
```nginx
# Cache static assets
location ~* \.(css|js|svg|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

# Security headers
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header Referrer-Policy strict-origin-when-cross-origin;
```

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feat/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push branch: `git push origin feat/amazing-feature`
5. Open Pull Request

### Code Style
- Vanilla JS (ES2020+), no frameworks
- CSS custom properties for theming
- BEM-ish class naming
- Semantic HTML5
- Accessibility first

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🔗 Links

- **Live Site**: https://actstudent.github.io/cams-download/
- **CAMS Main Repo**: https://github.com/ACTstudent/RemoteAcessMonitoringSoftware4sale
- **Issue Tracker**: https://github.com/ACTstudent/cams-download/issues

---

## 🙏 Acknowledgments

- **Industrial Skeuomorphism** inspiration: Brutalist web design, Dieter Rams
- **3D Interaction** patterns: Apple, Stripe, Linear
- **Accessibility** guidance: WCAG 2.1 AA, Inclusive Components
- **Fonts**: Inter (Rasmus Andersson), JetBrains Mono (JetBrains)

---

*Built with precision for the CAMS project. Made for LAN classrooms everywhere.* 🖥️🎓
<!-- Trigger redeploy -->