import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      colors: {
        navy: {
          900: "#0D1B2A",
          700: "#1B3A5C",
          500: "#2A5580",
          300: "#4A7FA8",
          100: "#C7DCF0",
        },
        amber: {
          DEFAULT: "#F5A623",
          hover:   "#E09415",
          light:   "#FEF3DC",
        },
        cream: {
          DEFAULT: "#FDF6EC",
          dark:    "#F5EADA",
        },
        sky: {
          accent: "#E8F4F8",
        },
        sage: {
          accent: "#F0F7EE",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.35s ease forwards",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;