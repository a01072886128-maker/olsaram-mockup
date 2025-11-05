/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 주색상
        'primary-green': '#10B981',
        'primary-purple': '#8B5CF6',

        // Phase 2 (KT 스타일) 색상
        'kt-blue': '#0066CC',
        'kt-blue-dark': '#0052A3',
        'kt-blue-light': '#4D94E6',
        'kt-warning': '#F59E0B',
        'kt-danger': '#EF4444',

        // 보조색상
        'light-green': '#34D399',
        'light-purple': '#A78BFA',
        'dark-green': '#059669',
        'dark-purple': '#7C3AED',

        // 중립색
        'bg-main': '#F9FAFB',
        'card-bg': '#FFFFFF',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'border-color': '#E5E7EB',
      },
    },
  },
  plugins: [],
}
