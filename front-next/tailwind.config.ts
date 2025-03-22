import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
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
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-dm-sans)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
        dm: ['var(--font-dm-sans)', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        'menu-arrow': 'hsl(var(--menu-arrow))',
        'menu-arrow-active': 'hsl(var(--menu-arrow-active))',
        'menu-foreground': 'hsl(var(--menu-foreground))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        solid: {
          1: '#030303',
          2: '#FFFFFF',
          3: '#ABC0B9',
          4: '#595959',
          5: '#AFAFAF',
          6: '#F1F1F1',
          7: '#131313',
        },
        glass: {
          1: '#E6E6E6',
          2: 'linear-gradient(135.63deg, #D9D9D9 1.08%, #737373 100%)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '25px',
        '3xl': '32px',
        '4xl': '35px',
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
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gradient-x": "gradient-x 10s ease infinite",
        "float": "float 6s ease-in-out infinite",
      },
      boxShadow: {
        card: "0px 4px 24px rgba(0, 0, 0, 0.06)",
        feature: "0px 88px 35px rgba(64, 64, 64, 0.01), 0px 49px 30px rgba(64, 64, 64, 0.05), 0px 22px 22px rgba(64, 64, 64, 0.09), 0px 5px 12px rgba(64, 64, 64, 0.1)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(224.07deg, rgba(172, 100, 247, 1) 0%, rgba(0, 83, 255, 1) 100%)",
        "gradient-dark": "linear-gradient(224.07deg, rgba(95, 86, 104, 1) 0%, rgba(28, 24, 33, 1) 100%)",
        "gradient-accent": "linear-gradient(90deg, rgba(255, 89, 17, 0.74) 0%, rgba(250, 1, 64, 0.74) 100%)",
        "radial-light": "radial-gradient(46.08% 46.08% at 54.41% 53.92%, #B7CEBC 0%, #A2B4B7 100%)",
      },
      
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
  ],
};
export default config;