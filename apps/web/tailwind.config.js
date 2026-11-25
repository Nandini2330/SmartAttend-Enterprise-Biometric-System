/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'selector',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        royal: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8', // True Royal Blue
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        navy: {
          950: '#060B18',
          900: '#0B132B',
          850: '#101C3D',
          800: '#172A52',
          700: '#1F3C65',
        },
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#3B82F6',
          600: '#2563EB', // Royal Blue
          700: '#1D4ED8',
          800: '#1E40AF',
        },
        surface: {
          ground: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#64748B'
        },
        attendance: {
          present: '#10B981',
          presentBg: '#ECFDF5',
          late: '#F59E0B',
          lateBg: '#FFFBEB',
          absent: '#EF4444',
          absentBg: '#FEF2F2',
          leave: '#6366F1',
          leaveBg: '#EEF2FF'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 4px 6px -2px rgba(15, 23, 42, 0.02)',
        'elevated': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)',
      }
    },
  },
  plugins: [],
}
