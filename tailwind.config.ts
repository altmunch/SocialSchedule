import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // ClipsCommerce Theme Colors
        background: 'hsl(0 0% 10%)', // Charcoal background #1a1a1a
        foreground: 'hsl(0 0% 95%)',      // Light text for readability

        // Brand palette
        charcoal: {
          DEFAULT: '#1a1a1a',
          50: '#2d2d2d',
          100: '#1a1a1a',
        },
        mint: {
          DEFAULT: '#00e5a0',
          foreground: '#002b1e',
        },
        lavender: {
          DEFAULT: '#b794f6',
          foreground: '#3f2b6f',
        },
        coral: {
          DEFAULT: '#ff6b6b',
          foreground: '#3f0b0b',
        },
        info: {
          DEFAULT: '#4fd1c7',
          foreground: '#083d3b',
        },

        primary: {
          DEFAULT: '#00e5a0',
          foreground: '#002b1e',
        },
        secondary: {
          DEFAULT: '#b794f6',
          foreground: '#1a1a1a',
        },
        
        accent: {
          DEFAULT: 'hsl(162 100% 50%)', // Using Primary Green as main accent
          foreground: 'hsl(162 100% 10%)', // Dark contrast text for accent
        },

        card: {
          DEFAULT: 'hsl(210 15% 12%)',    // Darker card/component background
          foreground: 'hsl(0 0% 95%)',   // Light text on cards
        },
        popover: {
          DEFAULT: 'hsl(210 15% 12%)', // Consistent with card background
          foreground: 'hsl(0 0% 95%)', // Consistent with card text
        },

        muted: {
          DEFAULT: 'hsl(210 15% 25%)',    // For less emphasized elements or backgrounds
          foreground: 'hsl(0 0% 60%)',   // For less emphasized text
        },

        border: 'hsl(210 15% 20%)',       // Subtle border color
        input: 'hsl(210 15% 15%)',        // Background for input fields
        ring: 'hsl(162 100% 50%)',        // Focus ring, using Primary Green for visibility

        destructive: {
          DEFAULT: 'hsl(0 84% 60%)',    // Standard destructive red
          foreground: 'hsl(0 0% 98%)',   // Light text on destructive elements
        },

        // Preserving 'blitz' colors for now, review if still needed.
        'blitz': {
          blue: 'hsl(214, 100%, 50%)',
          purple: 'hsl(270, 100%, 50%)', // Note: This is now secondary.DEFAULT
          yellow: 'hsl(51, 100%, 50%)',
          teal: 'hsl(180, 100%, 50%)',
          red: 'hsl(0, 100%, 50%)',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addComponents }: { addComponents: (components: Record<string, any>) => void }) {
      addComponents({
        '.bg-brand-gradient': {
          background: 'linear-gradient(135deg, #00e5a0 0%, #b794f6 100%)',
        },
        '.text-brand-gradient': {
          background: 'linear-gradient(135deg, #00e5a0 0%, #b794f6 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        },
      });
    },
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
} satisfies Config;

export default config;
