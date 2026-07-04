import type { Config } from "tailwindcss";

/**
 * TFA design tokens. The Financial Academy identity leans on a deep navy,
 * a teal accent, and a restrained gold for premium/executive emphasis.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef2f7",
          100: "#d6e0ec",
          200: "#aec2d8",
          300: "#7f9bbd",
          400: "#4f719b",
          500: "#2f5079",
          600: "#1f3a5c",
          700: "#152c48",
          800: "#0f2138",
          900: "#0b1728",
          950: "#070f1c",
        },
        teal: {
          50: "#e7f6f6",
          100: "#c2e9e9",
          400: "#2fa3a8",
          500: "#0e7c86",
          600: "#0b636c",
        },
        gold: {
          300: "#e2cd8f",
          400: "#d1b263",
          500: "#c9a24b",
          600: "#a9853a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,23,40,0.04), 0 4px 16px rgba(11,23,40,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
