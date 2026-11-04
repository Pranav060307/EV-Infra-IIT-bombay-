/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ChargeAtlas Official Professional GIS Palette
        navy: {
          950: '#0d1821', // Deepest background
          900: '#172B3A', // Deep Navy: Navigation, headings, primary structure
          850: '#1c3447', // Card surface dark
          800: '#223e54', // Elevated dark
          700: '#2c4e69', // Subtle highlight dark
        },
        slate: {
          header: '#34495E', // Slate Blue: secondary structure
        },
        warm: {
          canvas: '#F5F4F0', // Warm Off-White: Light mode page canvas
          surface: '#FFFFFF', // Clean White: Cards, panels
        },
        soft: {
          grey: '#E5E7E8', // Soft Grey: Light mode borders
        },
        muted: {
          grey: '#7A858C', // Muted Grey: Secondary labels, disabled elements
        },
        accent: {
          teal: '#3F7775',  // Muted Teal: Selected controls, interactive actions
          green: '#52765B', // Forest Green: Verified conditions, compliant benchmark
          amber: '#C18A42', // Warm Amber: Warnings, moderate gaps, buffer reach
          red: '#B65D55',   // Muted Red: Critical gaps, deficit >1km, errors
        },
        gap: {
          sufficient: '#52765B', // Forest Green
          moderate: '#C18A42',   // Warm Amber
          critical: '#B65D55',   // Muted Red
          nodata: '#7A858C'      // Muted Grey
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
