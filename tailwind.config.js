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
        brand: {
          50: '#eef8ff',
          100: '#d8eeff',
          200: '#b9e0ff',
          300: '#89cdff',
          400: '#52b1ff',
          500: '#2a8fff',
          600: '#146ef5',
          700: '#0e55e1',
          800: '#1245b6',
          900: '#153d8f',
          950: '#112657',
        },
        slate: {
          850: '#172033',
          950: '#0b0f19',
        },
        chalk: {
          white: '#f8fafc',
          yellow: '#fef08a',
          cyan: '#67e8f9',
          green: '#86efac',
          pink: '#f472b6',
          board: '#1e293b'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
        chalk: ['Caveat', 'Patrick Hand', 'cursive']
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(42, 143, 255, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(42, 143, 255, 0.8)' },
        },
        lipSync: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(1.4)' }
        },
        floatSubtle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' }
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite',
        'lip-sync': 'lipSync 0.25s infinite ease-in-out',
        'float-subtle': 'floatSubtle 4s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}
