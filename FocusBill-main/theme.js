// FocusBill - Theme Configuration System (with Typography Upgrades)
// =================================================================
// Drop-in replacement that adds heading font, font loading helpers, and
// dashboard-friendly numeric features.

const Theme = {
  // Color Palette - Custom Brand Colors
  colors: {
    light: {
      /* Brand Primary Palette */
      primary: '#001A6E',          // Deep Navy Blue
      primaryDark: '#00143d',      // Darker Navy
      primaryLight: '#17F8AD',     // Light Teal
      primaryPale: '#E6F9FA',      // Very Light Teal

      /* Accent / Secondary */
      secondary: '#17F8AD',        // Bright Teal/Cyan
      accent: '#17F8AD',           // Bright Teal

      /* Alerts / Status */
      warning: '#FFA500',
      danger: '#FF4444',
      success: '#17F8AD',          // Use secondary for success
      error: '#FF4444',
      info: '#001A6E',             // Use primary for info

      /* Grays */
      gray50: '#F9FAFB',
      gray100: '#F3F4F6',
      gray200: '#E5E7EB',
      gray300: '#D1D5DB',
      gray400: '#9CA3AF',
      gray500: '#6B7280',
      gray600: '#4B5563',
      gray700: '#374151',
      gray800: '#1F2937',
      gray900: '#111827',

      /* Background & Text */
      background: '#FFFFFF',       // Pure white
      backgroundAlt: '#F9FAFB',    // Very light gray
      textPrimary: '#000000',      // Black
      textSecondary: '#4B5563',    // Dark gray
      textMuted: '#9CA3AF',        // Medium gray
      textInverse: '#FFFFFF',      // White for dark backgrounds
      border: '#E5E7EB',
      borderLight: '#F3F4F6'
    },
    dark: {
      /* Brand Primary Palette */
      primary: '#001A6E',          // Bright Teal (reversed)
      primaryDark: '#0ED89A',      // Darker Teal
      primaryLight: '#4DFAC3',     // Light Teal
      primaryPale: '#4DFAC3',      // Deep Navy (reversed)

      /* Accent / Secondary */
      secondary: '#17F8AD',        // Bright Teal
      accent: '#17F8AD',           // Bright Teal

      /* Alerts / Status */
      warning: '#FFA500',
      danger: '#FF4444',
      success: '#17F8AD',
      error: '#FF4444',
      info: '#17F8AD',

      /* Grays (inverted) */
      gray50: '#1F2937',
      gray100: '#374151',
      gray200: '#4B5563',
      gray300: '#6B7280',
      gray400: '#9CA3AF',
      gray500: '#D1D5DB',
      gray600: '#E5E7EB',
      gray700: '#F3F4F6',
      gray800: '#F9FAFB',
      gray900: '#FFFFFF',

      /* Background & Text */
      background: '#111827',       // Dark navy
      backgroundAlt: '#1F2937',    // Slightly lighter
      textPrimary: '#FFFFFF',      // White
      textSecondary: '#D1D5DB',    // Light gray
      textMuted: '#9CA3AF',        // Medium gray
      textInverse: '#000000',      // Black for light backgrounds
      border: '#374151',
      borderLight: '#4B5563'
    },

    /* Mode Variants */
    freelancer: {
      primary: '#17F8AD',
      gradient: 'linear-gradient(135deg, #001A6E 0%, #17F8AD 100%)',
      icon: '💼'
    },
    student: {
      primary: '#17F8AD',
      gradient: 'linear-gradient(135deg, #001A6E 0%, #17F8AD 100%)',
      icon: '📚'
    }
  },

  // Typography (enhanced)
  typography: {
    fontFamily: {
      // Inter for UI/body; Poppins for headings
      sans:
        '"InterVariable", Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
      heading:
        '"PoppinsVariable", Poppins, "InterVariable", Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono:
        'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", "Courier New", monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    },
    // Dashboard-friendly numeric features
    features: {
      numeric: 'tabular-nums slashed-zero',
      base: '"liga" 1, "calt" 1, "kern" 1'
    }
  },

  // Spacing / Radius / Shadows / Transitions / Z-Index / Components (unchanged)
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem'
  },

  borderRadius: {
    none: '0',
    sm: '0.25rem',
    base: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px'
  },

  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px rgba(59, 130, 246, 0.3)'
  },

  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    all: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'
  },

  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060
  },

  components: {
    button: {
      height: { sm: '2rem', base: '2.5rem', lg: '3rem' },
      padding: { sm: '0.5rem 1rem', base: '0.75rem 1.5rem', lg: '1rem 2rem' }
    },
    input: {
      height: { sm: '2rem', base: '2.5rem', lg: '3rem' },
      padding: { sm: '0.5rem 0.75rem', base: '0.75rem 1rem', lg: '1rem 1.25rem' }
    },
    card: {
      padding: '1.5rem',
      borderRadius: '1rem',
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    }
  },

  // === New: Lightweight font loader ===
  /**
   * Load fonts into the document.
   * @param {Object} opts
   * @param {'local'|'google'|null} opts.mode - 'local' (MV3 safe), 'google' (remote), or null to skip.
   * @param {string} [opts.basePath='assets/fonts'] - path for local .woff2 files.
   * @param {boolean} [opts.injectBaseCSS=true] - also inject base CSS rules (body/headings).
   */
  loadFonts(opts = {}) {
    const { mode = 'local', basePath = 'assets/fonts', injectBaseCSS = true } = opts;
    if (typeof document === 'undefined') return;

    const style = document.createElement('style');
    style.setAttribute('data-focusbill-fonts', 'true');

    if (mode === 'google') {
      // Note: remote fonts may be blocked by MV3 CSP; local is recommended.
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap';
      document.head.appendChild(link);
      // Keep stacks as defined; Google serves Inter/Poppins if allowed.
    } else if (mode === 'local') {
  style.textContent = `
  /* Inter */
  @font-face{
    font-family:"InterVariable";
    src:url("${basePath}/Inter_18pt-Regular.ttf") format("truetype");
    font-weight:400; font-style:normal; font-display:swap;
  }
  @font-face{
    font-family:"InterVariable";
    src:url("${basePath}/Inter_24pt-Bold.ttf") format("truetype");
    font-weight:700; font-style:normal; font-display:swap;
  }
  @font-face{
    font-family:"InterVariable";
    src:url("${basePath}/Inter_18pt-Black.ttf") format("truetype");
    font-weight:900; font-style:normal; font-display:swap;
  }

  /* Poppins */
  @font-face{
    font-family:"PoppinsVariable";
    src:url("${basePath}/Poppins-Regular.ttf") format("truetype");
    font-weight:400; font-style:normal; font-display:swap;
  }
  @font-face{
    font-family:"PoppinsVariable";
    src:url("${basePath}/Poppins-Medium.ttf") format("truetype");
    font-weight:500; font-style:normal; font-display:swap;
  }
  @font-face{
    font-family:"PoppinsVariable";
    src:url("${basePath}/Poppins-Bold.ttf") format("truetype");
    font-weight:700; font-style:normal; font-display:swap;
  }
  `;
  document.head.appendChild(style);
}


    if (injectBaseCSS) this.mountBaseCSS();
  },

  // === New: Mount small base CSS so your UI instantly benefits from fonts ===
  mountBaseCSS() {
    if (typeof document === 'undefined') return;
    if (document.querySelector('style[data-focusbill-base]')) return;

    const base = document.createElement('style');
    base.setAttribute('data-focusbill-base', 'true');
    base.textContent = `
/* FocusBill Base Typography */
:root{
  --font-sans: ${this.typography.fontFamily.sans};
  --font-heading: ${this.typography.fontFamily.heading};
  --font-mono: ${this.typography.fontFamily.mono};
}
html{-webkit-text-size-adjust:100%}
body{
  margin:0;
  font-family:var(--font-sans);
  font-feature-settings:${this.typography.features.base};
  font-variant-numeric:${this.typography.features.numeric};
  text-rendering:optimizeLegibility;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
}
h1,h2,h3,h4,h5,h6,.h-heading,.page-title,.sidebar-title,.card-title{
  font-family:var(--font-heading);
  letter-spacing:.01em;
}
.stat-value,.entity-stat-value,.streak-number,.data-table td,.data-table th{
  font-variant-numeric:${this.typography.features.numeric};
}
`;
    document.head.appendChild(base);
  },

  // Apply theme to document (extended to include heading font var)
  apply(theme = 'light') {
    const root = document.documentElement;
    const colorScheme = this.colors[theme] || this.colors.light;

    // Apply theme attribute
    root.setAttribute('data-theme', theme);

    // Colors
    Object.entries(colorScheme).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--color-${key}`, value);
      }
    });

    // Typography
    root.style.setProperty('--font-sans', this.typography.fontFamily.sans);
    root.style.setProperty('--font-heading', this.typography.fontFamily.heading);
    root.style.setProperty('--font-mono', this.typography.fontFamily.mono);

    // Spacing
    Object.entries(this.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Border radius
    Object.entries(this.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });

    // Shadows
    Object.entries(this.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    // Transitions
    Object.entries(this.transitions).forEach(([key, value]) => {
      root.style.setProperty(`--transition-${key}`, value);
    });

    // Ensure base CSS is present
    this.mountBaseCSS();

    // Save theme preference
    localStorage.setItem('focusbill-theme', theme);
  },

  // Get current theme
  getCurrentTheme() {
    return localStorage.getItem('focusbill-theme') || 'light';
  },

  // Toggle theme
  toggleTheme() {
    const current = this.getCurrentTheme();
    const next = current === 'light' ? 'dark' : 'light';
    this.apply(next);
    return next;
  },

  // Mode handling (unchanged)
  applyMode(mode) {
    const root = document.documentElement;
    const modeColors = this.colors[mode] || this.colors.freelancer;

    root.style.setProperty('--color-mode-primary', modeColors.primary);
    root.style.setProperty('--color-mode-gradient', modeColors.gradient);
    localStorage.setItem('focusbill-mode', mode);
  },

  getCurrentMode() {
    return localStorage.getItem('focusbill-mode') || 'freelancer';
  },

  // CSS variable generator (extended with heading/mono)
  getCSSVariables() {
    let css = ':root {\n';

    Object.entries(this.colors).forEach(([key, value]) => {
      if (typeof value === 'string') css += `  --color-${key}: ${value};\n`;
    });

    Object.entries(this.spacing).forEach(([key, value]) => {
      css += `  --spacing-${key}: ${value};\n`;
    });

    Object.entries(this.borderRadius).forEach(([key, value]) => {
      css += `  --radius-${key}: ${value};\n`;
    });

    Object.entries(this.shadows).forEach(([key, value]) => {
      css += `  --shadow-${key}: ${value};\n`;
    });

    Object.entries(this.transitions).forEach(([key, value]) => {
      css += `  --transition-${key}: ${value};\n`;
    });

    css += `  --font-sans: ${this.typography.fontFamily.sans};\n`;
    css += `  --font-heading: ${this.typography.fontFamily.heading};\n`;
    css += `  --font-mono: ${this.typography.fontFamily.mono};\n`;

    css += '}\n';
    return css;
  }
};

// Export
if (typeof window !== 'undefined') window.Theme = Theme;
if (typeof module !== 'undefined' && module.exports) module.exports = Theme;
