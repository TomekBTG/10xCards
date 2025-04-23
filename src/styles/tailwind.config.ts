import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "./src/components/**/*.{ts,tsx}",
    "./src/layouts/**/*.{ts,tsx,astro}",
    "./src/pages/**/*.{ts,tsx,astro}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    animate, // jeśli używasz animacji Shadcn
  ],
  darkMode: "class", // wymagane przez shadcn
};

export default config;
