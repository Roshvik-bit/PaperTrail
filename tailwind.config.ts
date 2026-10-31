import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Exact reference color system
        bg: {
          primary: '#F7F6F2',
          surface: '#FDFCF9',
          'surface-alt': '#FAF8F3',
          muted: '#EFECE5',
          dark: '#252622',
        },
        ink: {
          primary: '#252622',
          secondary: '#777873',
          muted: '#9D9E99',
          light: '#FDFCF9',
        },
        terracotta: {
          DEFAULT: '#B96645',
          light: '#F3E8E2',
          dark: '#934E32',
        },
        olive: {
          DEFAULT: '#858B70',
          light: '#EDF0E7',
          dark: '#686E55',
        },
        edge: {
          DEFAULT: '#E3E1D9',
          light: '#EFECE5',
          dark: '#CCC8BC',
        },
        // Prompt specification tokens
        paper: {
          bg: '#F7F6F2',
          surface: '#FDFCF9',
          'surface-alt': '#FAF8F3',
          ink: '#252622',
          muted: '#777873',
          'muted-light': '#9D9E99',
          border: '#E3E1D9',
          'border-strong': '#CCC8BC',
          accent: '#B96645',
          'accent-soft': '#F3E8E2',
          data: '#858B70',
          'data-soft': '#EDF0E7',
        },
        // Component-level aliases for backward compatibility with existing views
        background: '#F7F6F2',
        surface: {
          DEFAULT: '#FDFCF9',
          elevated: '#FAF8F3',
          subtle: '#EFECE5',
        },
        border: {
          DEFAULT: '#E3E1D9',
          subtle: '#EFECE5',
          highlight: '#CCC8BC',
        },
        content: {
          primary: '#252622',
          secondary: '#777873',
          muted: '#9D9E99',
        },
        accent: {
          DEFAULT: '#B96645',
          hover: '#934E32',
          muted: '#F3E8E2',
        },
        secondary: {
          DEFAULT: '#858B70',
          hover: '#686E55',
          muted: '#EDF0E7',
        },
        evidence: {
          supports: '#858B70',
          challenges: '#B96645',
          contradicts: '#B96645',
          qualifies: '#777873',
          extends: '#252622',
          replicates: '#858B70',
        },
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace', 'sans-serif'],
        editorial: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'paper': '0 1px 3px rgba(37, 38, 34, 0.04), 0 10px 25px -5px rgba(37, 38, 34, 0.05)',
        'paper-lg': '0 20px 40px -15px rgba(37, 38, 34, 0.08)',
        'paper-subtle': '0 1px 2px rgba(37, 38, 34, 0.03)',
      },
    },
  },
  plugins: [],
};

export default config;
