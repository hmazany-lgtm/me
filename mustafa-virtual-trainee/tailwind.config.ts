import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // The Financial Academy inspired palette: deep teal-green + gold
        brand: {
          50: "#eefaf6",
          100: "#d3f1e6",
          200: "#a8e3cf",
          300: "#71ceb2",
          400: "#3fb392",
          500: "#1f9878",
          600: "#0f7a62",
          700: "#0c6252",
          800: "#0b4e43",
          900: "#0a4038",
          950: "#042521",
        },
        gold: {
          50: "#fbf7ec",
          100: "#f5eccf",
          200: "#ecd79c",
          300: "#e0bd63",
          400: "#d6a63c",
          500: "#c6902a",
          600: "#a97122",
          700: "#87531f",
          800: "#704320",
          900: "#60381f",
        },
        ink: {
          DEFAULT: "#0b1f1a",
          soft: "#38504a",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(4,37,33,0.04), 0 8px 24px rgba(4,37,33,0.06)",
        glow: "0 0 0 1px rgba(15,122,98,0.10), 0 20px 60px -20px rgba(15,122,98,0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
