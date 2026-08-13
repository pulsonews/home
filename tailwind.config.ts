import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1F3A",
        alert: "#D62839",
        paper: "#F6F5F1",
        charcoal: "#1C1C1E",
        gold: "#C9962C",
        line: "#D8D3C7"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        ui: ["var(--font-ui)"]
      }
    }
  },
  plugins: []
};
export default config;
