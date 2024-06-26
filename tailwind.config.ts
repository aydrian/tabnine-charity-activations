import type { Config } from "tailwindcss";

import defaultTheme from "tailwindcss/defaultTheme.js";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  darkMode: ["class"],
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "spin-slow": "spin 3s linear infinite"
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)"
      },
      colors: {
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        background: "hsl(var(--background))",
        border: "hsl(var(--border))",
        brand: {
          "action-blue": "#0055ff",
          "action-purple": "#b921f1",
          "bright-turquoise": "#1bf8ec",
          "dark-blue": "#0037a5",
          "deep-purple": "#190f33",
          "electric-purple": "#6933ff",
          focus: "#c7b3ff",
          "iridescent-blue": "#00fced",
          "light-blue": "#c2d5ff",
          "light-purple": "#f7d6ff",
          neutral: {
            "100": "#f5f7fa",
            "200": "#e7ecf3",
            "300": "#d6dbe7",
            "400": "#c0c6d9",
            "500": "#7e89a9",
            "600": "#475872",
            "700": "#394455",
            "800": "#242a35",
            "900": "#060c12"
          }
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        foreground: "hsl(var(--foreground))",
        input: "hsl(var(--input))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        ring: "hsl(var(--ring))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        tabnine: {
          blue: {
            100: "#edf2ff",
            200: "#cad5ee",
            300: "#5160a5",
            400: "#5160a5",
            500: "#172b86"
          },
          "bright-blue": "#1f46c1",
          "bright-red": "#ff2210",
          "deep-navy": "#131a3a",
          "dev-purple": "#9465ec",
          highlight: "#2ad5e7",
          neutral: {
            black: "#060813",
            "dark-navy": "#0c1025",
            "light-white": "#f0f5ff",
            "medium-grey": "#494c5b",
            white: "#ffffff"
          },
          red: {
            100: "#f7c6c2",
            200: "#ef8c84",
            300: "#e75347",
            400: "#df1a0a",
            500: "#a71307"
          }
        }
      },
      fontFamily: {
        inter: ["'Inter'", "sans-serif"],
        roboto: ["'Roboto'", "sans-serif"],
        "roboto-mono": ["'Roboto Mono'", "monospace"],
        sans: ["'Roboto'", ...defaultTheme.fontFamily.sans]
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        }
      }
    }
  }
} satisfies Config;
