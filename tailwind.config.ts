import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Palette - Trust & Community
        primary: {
          DEFAULT: "#2563EB",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        // Secondary - Success/Positive
        secondary: {
          DEFAULT: "#22C55E",
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
        },
        // Accent - Warm Highlight
        accent: {
          DEFAULT: "#F59E0B",
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
        },
        // Neutrals
        background: "#F9FAFB",
        card: "#FFFFFF",
        border: "#E5E7EB",
        text: {
          primary: "#111827",
          secondary: "#6B7280",
          tertiary: "#9CA3AF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      // Improved Typography Scale
      fontSize: {
        // Display sizes for hero/landing
        "display-lg": ["3.5rem", { lineHeight: "1.1", fontWeight: "700", letterSpacing: "-0.02em" }], // 56px
        "display": ["3rem", { lineHeight: "1.15", fontWeight: "700", letterSpacing: "-0.02em" }],      // 48px
        "display-sm": ["2.5rem", { lineHeight: "1.2", fontWeight: "700", letterSpacing: "-0.01em" }],  // 40px
        
        // Headings
        "h1": ["2rem", { lineHeight: "1.25", fontWeight: "600" }],      // 32px
        "h2": ["1.5rem", { lineHeight: "1.33", fontWeight: "600" }],    // 24px
        "h3": ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }],    // 20px
        "h4": ["1.125rem", { lineHeight: "1.5", fontWeight: "600" }],   // 18px
        
        // Body
        "lg": ["1.125rem", { lineHeight: "1.75", fontWeight: "400" }],  // 18px
        "base": ["1rem", { lineHeight: "1.5", fontWeight: "400" }],     // 16px
        "sm": ["0.875rem", { lineHeight: "1.43", fontWeight: "400" }],  // 14px
        "xs": ["0.75rem", { lineHeight: "1.33", fontWeight: "400" }],   // 12px
        
        // Legacy support
        "body": ["1rem", { lineHeight: "1.5", fontWeight: "400" }],
        "body-sm": ["0.875rem", { lineHeight: "1.43", fontWeight: "400" }],
        "caption": ["0.75rem", { lineHeight: "1.33", fontWeight: "400" }],
      },
      // 8px-based spacing scale
      spacing: {
        "0.5": "0.125rem",  // 2px
        "1": "0.25rem",     // 4px
        "1.5": "0.375rem",  // 6px
        "2": "0.5rem",      // 8px
        "3": "0.75rem",     // 12px
        "4": "1rem",        // 16px
        "5": "1.25rem",     // 20px
        "6": "1.5rem",      // 24px
        "7": "1.75rem",     // 28px
        "8": "2rem",        // 32px
        "10": "2.5rem",     // 40px
        "12": "3rem",       // 48px
        "14": "3.5rem",     // 56px
        "16": "4rem",       // 64px
        "20": "5rem",       // 80px
        "24": "6rem",       // 96px
        "32": "8rem",       // 128px
      },
      borderRadius: {
        "none": "0",
        "sm": "0.25rem",    // 4px
        "DEFAULT": "0.5rem", // 8px
        "md": "0.5rem",     // 8px
        "lg": "0.75rem",    // 12px
        "xl": "1rem",       // 16px
        "2xl": "1.25rem",   // 20px
        "3xl": "1.5rem",    // 24px
        "full": "9999px",
      },
      boxShadow: {
        // Elevation System
        "xs": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "sm": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "DEFAULT": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        "inner": "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
        
        // Semantic shadows
        "card": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "elevated": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        "glass": "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
      },
      // Animation & Transitions
      transitionDuration: {
        "fast": "150ms",
        "base": "200ms",
        "slow": "300ms",
        "slower": "500ms",
      },
      transitionTimingFunction: {
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      // Z-index scale
      zIndex: {
        "0": "0",
        "10": "10",
        "20": "20",
        "30": "30",
        "40": "40",
        "50": "50",
        "dropdown": "1000",
        "sticky": "1020",
        "fixed": "1030",
        "modal-backdrop": "1040",
        "modal": "1050",
        "popover": "1060",
        "tooltip": "1070",
      },
      // Minimum touch target sizes
      minHeight: {
        "touch": "44px",
      },
      minWidth: {
        "touch": "44px",
      },
    },
  },
  plugins: [],
};

export default config;
