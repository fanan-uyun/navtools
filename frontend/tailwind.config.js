/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 粗野主义主色调 - 黄黑
        brutal: {
          yellow: '#FFD700',
          black: '#0a0a0a',
          gray: '#2a2a2a',
          white: '#ffffff',
        },
        // 主题色
        theme: {
          // 经典粗野主义 (黄黑)
          brutalism: {
            primary: '#FFD700',
            secondary: '#0a0a0a',
            accent: '#FF6B00',
            bg: '#ffffff',
            text: '#0a0a0a',
          },
          // 现代深色
          dark: {
            primary: '#6366f1',
            secondary: '#1e1e2e',
            accent: '#8b5cf6',
            bg: '#0f0f1a',
            text: '#e2e8f0',
          },
          // 极简白色
          minimal: {
            primary: '#171717',
            secondary: '#f5f5f5',
            accent: '#525252',
            bg: '#ffffff',
            text: '#171717',
          },
          // 赛博朋克
          cyberpunk: {
            primary: '#00ff41',
            secondary: '#0d0221',
            accent: '#ff0080',
            bg: '#09090b',
            text: '#00ff41',
          },
          // 自然绿色
          nature: {
            primary: '#22c55e',
            secondary: '#f0fdf4',
            accent: '#16a34a',
            bg: '#ffffff',
            text: '#14532d',
          },
          // 海洋蓝色
          ocean: {
            primary: '#0ea5e9',
            secondary: '#f0f9ff',
            accent: '#0284c7',
            bg: '#ffffff',
            text: '#0c4a6e',
          },
          // 日落橙色
          sunset: {
            primary: '#f97316',
            secondary: '#fff7ed',
            accent: '#ea580c',
            bg: '#ffffff',
            text: '#9a3412',
          },
          // 樱花粉色
          sakura: {
            primary: '#ec4899',
            secondary: '#fdf2f8',
            accent: '#db2777',
            bg: '#ffffff',
            text: '#9d174d',
          },
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #0a0a0a',
        'brutal-hover': '6px 6px 0px 0px #0a0a0a',
        'brutal-sm': '2px 2px 0px 0px #0a0a0a',
        'brutal-lg': '8px 8px 0px 0px #0a0a0a',
        'inner-brutal': 'inset 2px 2px 0px 0px #0a0a0a',
      },
      borderRadius: {
        'brutal': '0px',
      },
      animation: {
        'grid-flow': 'gridFlow 20s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        gridFlow: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '50px 50px' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
