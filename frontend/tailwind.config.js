/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#dc2626", // rojo principal
        background: "#ffffff",
        foreground: "#171717",
        muted: "#737373",
        border: "#e5e5e5",
        card: "#fafafa",
      },
      borderRadius: {
        xl: "1rem",
        '2xl': "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
};