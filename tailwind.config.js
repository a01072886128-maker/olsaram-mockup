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
