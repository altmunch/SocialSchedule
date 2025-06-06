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
        background: 'hsl(210 15% 8%)',    // Premium Black Backdrop
        foreground: 'hsl(0 0% 95%)',      // Light text for readability

        primary: {
          DEFAULT: 'hsl(162 100% 50%)', // Vibrant Green
          foreground: 'hsl(162 100% 10%)', // Dark contrast text for green buttons/elements
        },

        secondary: {
          DEFAULT: 'hsl(270 100% 50%)', // Vibrant Purple
          foreground: 'hsl(0 0% 98%)',   // Light contrast text for purple buttons/elements
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
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
} satisfies Config;

export default config;
