/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Kantumruy Pro', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'ui-monospace', 'monospace'],
        heading: ['Manrope', 'Kantumruy Pro', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "#195e58",
          soft: "#dbeee5",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "#102f32",
          line: "rgba(217, 239, 225, 0.14)",
          hover: "#183f43",
          active: "#163c3f",
          accent: "#1f786f",
        },
        fsm: {
          bg: "#f2f0e8",
          card: "#ffffff",
          surface: "#f7f8f2",
          muted: "#e7eee7",
          hover: "#e1e9e1",
          border: "#dfe7df",
          'border-subtle': "#e3e9e2",
          primary: "#1f786f",
          'primary-hover': "#195e58",
          'primary-soft': "#dbeee5",
          sidebar: "#102f32",
          'sidebar-active': "#163c3f",
          foreground: "#16292e",
          danger: "#c2543a",
          'danger-bg': "#f8dfd6",
          warning: "#a4801f",
          'warning-bg': "#f7edc9",
        },
        slate: {
          850: '#151e2e',
        },
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'xs': '0 1px 3px 0 rgb(0 0 0 / 0.05)',
        'panel': '0 1px 3px rgba(22, 41, 46, 0.04), 0 4px 12px rgba(22, 41, 46, 0.02)',
      },
      spacing: {
        '4.5': '1.125rem',
      },
    },
  },
  plugins: [],
};
