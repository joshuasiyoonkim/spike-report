import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark editorial palette
        ink: {
          950: "#0a0c0f", // page background
          900: "#0e1116", // raised background
          850: "#12161c",
          800: "#171c24", // cards / surfaces
          700: "#1f2630", // borders / hover
          600: "#2a323d",
        },
        accent: {
          DEFAULT: "#27dabd",
          soft: "#7af0dc",
          deep: "#11a892",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      maxWidth: {
        content: "72rem",
        prose: "44rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        ticker: "ticker 45s linear infinite",
      },
    },
  },
  plugins: [typography],
};

export default config;
