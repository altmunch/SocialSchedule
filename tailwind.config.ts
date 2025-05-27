import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Core Brand Colors
        'blitz': {
          blue: 'hsl(214, 100%, 50%)',
          purple: 'hsl(270, 100%, 50%)',
          yellow: 'hsl(51, 100%, 50%)',
          teal: 'hsl(180, 100%, 50%)',
          red: 'hsl(0, 100%, 50%)',
        },
        // Storm Gray Scale
        'storm': {
          DEFAULT: 'hsl(210, 25%, 12%)',
          light: 'hsl(210, 20%, 18%)',
          dark: 'hsl(210, 30%, 8%)',
        },
        // Lightning White Scale
        'lightning': {
          DEFAULT: 'hsl(0, 0%, 98%)',
          dim: 'hsl(0, 0%, 80%)',
        },
        // Theme colors mapped to CSS variables - using direct HSL values for better performance
        border: {
          DEFAULT: 'hsl(210 20% 18% / 0.5)',
        },
        borderColor: {
          DEFAULT: 'hsl(210 20% 18% / 0.5)',
        },
        input: 'hsl(210 20% 18% / 0.8)',
        ring: 'hsl(214 100% 50%)',
        background: 'hsl(210 25% 12%)',
        foreground: 'hsl(0 0% 98%)',
        primary: {
          DEFAULT: 'hsl(214 100% 50%)',
          foreground: 'hsl(0 0% 98%)',
        },
        secondary: {
          DEFAULT: 'hsl(270 100% 50%)',
          foreground: 'hsl(0 0% 98%)',
        },
        destructive: {
          DEFAULT: 'hsl(0 84% 60%)',
          foreground: 'hsl(0 0% 98%)',
        },
        muted: {
          DEFAULT: 'hsl(210 20% 18%)',
          foreground: 'hsl(0 0% 80%)',
        },
        accent: {
          DEFAULT: 'hsl(180 100% 50%)',
          foreground: 'hsl(0 0% 98%)',
        },
        popover: {
          DEFAULT: 'hsl(210 20% 18%)',
          foreground: 'hsl(0 0% 98%)',
        },
        card: {
          DEFAULT: 'hsl(210 20% 18%)',
          foreground: 'hsl(0 0% 98%)',
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
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
} satisfies Config;

export default config;
