import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef2fb",
          100: "#d6e0f5",
          400: "#3E5FA8",
          600: "#1E3A8A",
          700: "#152a63",
          900: "#0d1a3f",
        },
        amber: {
          100: "#fef3d6",
          400: "#F5B300",
          600: "#c98f00",
        },
        danger: {
          50: "#fdecea",
          400: "#e05a4e",
          600: "#c53d30",
        },
        ok: {
          50: "#e8f5ec",
          400: "#2f9e5b",
          600: "#1f7a44",
        },
        canvas: "#F6F7FB",
        ink: "#1C2333",
        line: "#E2E6F0",
      },
      fontFamily: {
        sans: ["Pretendard", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "14px",
      },
    },
  },
  plugins: [],
};
export default config;
