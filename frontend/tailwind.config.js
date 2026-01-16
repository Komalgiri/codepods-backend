/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background Colors
        background: {
          DEFAULT: '#0D1117',     // Deep Background
          surface: '#161B22',     // Surface/Card Gray
          border: '#30363D',      // Border/Stroke
        },
        // Primary Action
        primary: {
          DEFAULT: '#58A69A',     // Electric Blue
          dark: '#3D8B80',        // Darker shade for hover states
        },
        // AI Feature Gradient (used in components with bg-gradient-to-r from-ai-start to-ai-end)
        ai: {
          start: '#8A63D2',       // Purple
          end: '#569AFF',         // Indigo
        },
        // Status Colors
        success: '#238636',       // GitHub Green
        warning: '#D29922',       // Warning/Urgent
        // Text Colors
        text: {
          primary: '#E6EDF3',     // Primary Text
          secondary: '#8B949E',   // Secondary Text
        },
      },
      // Custom Gradients
      backgroundImage: {
        'ai-gradient': 'linear-gradient(90deg, #8A63D2 0%, #569AFF 100%)',
      },
      // Box Shadow
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')({
      strategy: 'class', // Use class strategy for better control
    }),
  ],
  darkMode: 'class', // Using class-based dark mode
}