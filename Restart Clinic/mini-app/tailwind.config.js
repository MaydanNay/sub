/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        clinic: {
          primary: "#0F766E",
          accent: "#14B8A6",
          dark: "#134E4A",
          warn: "#F59E0B",
          gold: "#EAB308",
        },
      },
    },
  },
  plugins: [],
};
